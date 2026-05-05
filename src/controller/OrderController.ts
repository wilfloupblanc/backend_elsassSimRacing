import { Controller, Delete, Get, isAuthenticated, Post, Put, QueryBuilder, Route } from "@lyra-js/core"
import { randomBytes } from "crypto"
import nodemailer from "nodemailer"
import QRCode from "qrcode"

import { Booking } from "@entity/Booking"
import { UserOrder } from "@entity/UserOrder"
import { CartInterface } from "@repository/CartRepository"

@Route({ path: "/order" })
export class OrderController extends Controller {
  @Get({ path: "/all", middlewares: [isAuthenticated] })
  async list() {
    try {
      const query = new QueryBuilder()
        .selectFrom("userorder", ["id", "number", "amount", "created_at"])
        .where("related_user_id", "=", this.req.user.id)
        .orderBy("created_at", "DESC")
      const [orders] = await query.execute()
      this.res.status(200).json({ message: "Order list fetched successfully", orders })
    } catch (error) {
      this.next(error)
    }
  }

  @Get({ path: "/last", middlewares: [isAuthenticated] })
  async last() {
    try {
      const userId = this.req.user.id
      const orders = await this.orderRepository.findLastOrderWithDetails(userId)
      const order = orders[0]
      if (!order) return this.res.status(404).json({ message: "Order not found" })
      this.res.status(200).json({ message: "Order fetched successfully", orders })
    } catch (error) {
      this.next(error)
    }
  }

  @Get({ path: "/:order", resolve: { order: UserOrder }, middlewares: [isAuthenticated] })
  async read(order: UserOrder) {
    try {
      if (!order) return this.res.status(404).json({ message: "Order not found" })
      this.res.status(200).json({ message: "Order fetched successfully", order })
    } catch (error) {
      this.next(error)
    }
  }

  @Post({ path: "/", middlewares: [isAuthenticated] })
  async create() {
    try {
      const data = this.req.body
      const order = await this.orderRepository.save(data)
      this.res.status(201).json({ message: "Order created successfully", order })
    } catch (error) {
      this.next(error)
    }
  }

  @Post({ path: "/checkout", middlewares: [isAuthenticated] })
  async checkout() {
    try {
      const cart = await this.cartRepository.findOneBy({ user_id: this.req.user.id })
      const { availability_id, session_id, pilots, event_id, event_price, event_title, pilots_count } = this.req.body
      const sessions = session_id ? await this.sessionRepository.find(session_id) : null
      const user = await this.userRepository.find(this.req.user.id)
      const sessionPrice = sessions ? (user.is_member ? sessions.price_member : sessions.price_normal) : 0

      const cartLineItems = cart
        ? (await this.cartRepository.findUserCartItems(cart.id)).map((item: CartInterface) => ({
          price_data: {
            currency: "eur",
            product_data: { name: `Ticket ${item.duration_minutes} minutes` },
            unit_amount: item.price_normal * 100
          },
          quantity: item.quantity
        }))
        : []

      const reservationLineItem = sessions
        ? [
          {
            price_data: {
              currency: "eur",
              product_data: { name: `Réservation simulateur - ${sessions.duration_minutes} minutes` },
              unit_amount: sessionPrice * 100
            },
            quantity: pilots
          }
        ]
        : []

      const eventLineItem = event_id
        ? [
          {
            price_data: {
              currency: "eur",
              product_data: { name: `Inscription événement - ${event_title}` },
              unit_amount: Math.round(event_price * 100)
            },
            quantity: 1
          }
        ]
        : []

      const lineItems = [...cartLineItems, ...reservationLineItem, ...eventLineItem]

      const session = await this.stripeService.instance.checkout.sessions.create({
        mode: "payment",
        line_items: lineItems,
        success_url: `${process.env.CLIENT_APP_URL}/order/success`,
        cancel_url: `${process.env.CLIENT_APP_URL}/order/cancel`,
        metadata: {
          user_id: this.req.user.id,
          session_id: session_id ?? null,
          pilots: pilots ?? null,
          availability_id: availability_id ?? null,
          event_id: event_id ?? null,
          pilots_count: pilots_count ?? null
        }
      })

      this.res.status(200).json({ url: session.url })
    } catch (error) {
      this.next(error)
    }
  }

  @Post({ path: "/webhook", parserType: "raw" })
  async webhook() {
    try {
      const signature = this.req.headers["stripe-signature"]
      const event = this.stripeService.instance.webhooks.constructEvent(
        this.req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )

      type SubscriptionPlan = "STARTER" | "PLUS" | "ULTRA"

      const PLAN_FREE_SESSIONS: Record<SubscriptionPlan, number> = {
        STARTER: 2,
        PLUS: 4,
        ULTRA: 8
      }

      const generateFreeSessionQRs = async (subId: number, plan: SubscriptionPlan) => {
        const qrBuffers: { buffer: Buffer; index: number }[] = []
        for (let i = 0; i < PLAN_FREE_SESSIONS[plan]; i++) {
          const qrToken = randomBytes(32).toString("hex")
          await this.freeSessionTokenRepository.save({
            sub_id: subId,
            qr_token: qrToken,
            is_used: false
          })
          const buffer = await QRCode.toBuffer(qrToken, { width: 300, margin: 2 })
          qrBuffers.push({ buffer, index: i + 1 })
        }
        return qrBuffers
      }

      if (event.type === "checkout.session.completed") {
        const stripeSession = event.data.object
        const userId = stripeSession.metadata.user_id
        const availability_id = Number(stripeSession.metadata.availability_id)
        const session_id = Number(stripeSession.metadata.session_id)
        const pilots = Number(stripeSession.metadata.pilots)
        const amount = stripeSession.amount_total / 100
        const stripeCharge = stripeSession.payment_intent
        const orderNumber = Date.now()
        const createdAt = new Date()

        // 1. Créer l'order
        await this.orderRepository.save({
          related_user_id: userId,
          amount,
          created_at: createdAt,
          number: orderNumber
        })
        const savedOrder = await this.orderRepository.findOneBy({ number: orderNumber })

        // 2. Créer le payment
        await this.paymentsRepository.save({
          amount,
          number: Date.now(),
          related_user_id: userId,
          order_id: savedOrder.id,
          stripe_charge_id: stripeCharge,
          status: "completed",
          created_at: createdAt
        })

        // 3. Créer le booking + orderdetail réservation
        let session = null
        let availability = null

        if (availability_id && session_id) {
          availability = await this.availabilityRepository.find(availability_id)
          session = await this.sessionRepository.find(session_id)
          const start = new Date(`1970-01-01T${availability.start_time}`)
          start.setMinutes(start.getMinutes() + session.duration_minutes)
          const end_time = start.toTimeString().split(" ")[0]
          const availableSimulator = await this.bookingRepository.findAvailableSimulator(
            availability.date,
            availability.start_time,
            end_time
          )

          const booking = new Booking()
          booking.availability_id = availability_id
          booking.session_id = session_id
          booking.gift_voucher_id = null
          booking.start_time = availability.start_time as string
          booking.end_time = end_time as string
          booking.date = availability.date
          booking.simulator_id = availableSimulator
          booking.user_id = Number(userId)
          booking.price_paid = session.price_normal
          booking.is_free_session = false

          await this.bookingRepository.save(booking)
          const savedBooking = await this.bookingRepository.findOneBy({
            availability_id: availability_id,
            user_id: Number(userId)
          })

          savedBooking.status = "confirmed"
          await this.bookingRepository.save(savedBooking)

          availability.slots_remaining = availability.slots_remaining - 1
          await this.availabilityRepository.save(availability)

          await this.orderDetailsRepository.save({
            price_each: session.price_normal,
            session_id: session_id,
            booking_id: savedBooking.id,
            quantity: pilots,
            order_id: savedOrder.id,
            gift_voucher_id: null
          })
        }

        // 4. Gérer l'inscription événement
        const event_id = stripeSession.metadata.event_id
        const pilots_count = Number(stripeSession.metadata.pilots_count)

        if (event_id) {
          const eventBooking = new Booking()
          eventBooking.date = new Date()
          eventBooking.start_time = "00:00:00"
          eventBooking.end_time = "00:00:00"
          eventBooking.pilots = pilots_count
          eventBooking.price_paid = amount
          eventBooking.is_free_session = false
          eventBooking.status = "confirmed"
          eventBooking.user_id = Number(userId)
          eventBooking.availability_id = null
          eventBooking.simulator_id = null
          eventBooking.session_id = null
          eventBooking.gift_voucher_id = null
          eventBooking.event_id = Number(event_id)

          await this.bookingRepository.save(eventBooking)

          const savedEventBooking = await this.bookingRepository.findOneBy({
            event_id: Number(event_id),
            user_id: Number(userId)
          })

          await this.orderDetailsRepository.save({
            price_each: amount,
            session_id: null,
            booking_id: savedEventBooking.id,
            quantity: pilots_count,
            order_id: savedOrder.id,
            gift_voucher_id: null
          })
        }

        // 5. Traiter le panier + orderdetails + gift_vouchers
        const cart = await this.cartRepository.findOneBy({ user_id: userId })
        if (cart) {
          const items = await this.cartRepository.findUserCartItems(cart.id)
          for (const item of items) {
            const query = new QueryBuilder().selectFrom("cartitemrecipient", ["*"]).where("cart_item_id", "=", item.id)
            const [recipients] = await query.execute()

            let firstGiftVoucherId = null
            for (const recipient of recipients as unknown[]) {
              const r = recipient as { firstname: string; lastname: string; email: string }
              const qrCode = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
              await this.giftVoucherRepository.save({
                recipient_name: `${r.firstname} ${r.lastname}`,
                recipient_email: r.email,
                qr_code: qrCode,
                status: "valid",
                amount_paid: item.price_normal,
                purchaser_user_id: Number(userId),
                session_id: item.session_id,
                stripe_payment_intent_id: stripeCharge
              })
              const savedGv = await this.giftVoucherRepository.findOneBy({ qr_code: qrCode })
              if (!firstGiftVoucherId) firstGiftVoucherId = savedGv.id
            }

            await this.orderDetailsRepository.save({
              price_each: item.price_normal,
              session_id: item.session_id,
              quantity: item.quantity,
              order_id: savedOrder.id,
              gift_voucher_id: firstGiftVoucherId
            })
          }

          for (const item of items) {
            const recipientQuery = new QueryBuilder()
              .selectFrom("cartitemrecipient", ["id"])
              .where("cart_item_id", "=", item.id)
            const [recipientRows] = await recipientQuery.execute()
            for (const row of recipientRows as unknown[]) {
              const r = row as { id: number }
              await this.cartItemRecipientRepository.delete(r.id)
            }
            await this.cartItemsRepository.delete(item.id)
          }
          await this.cartRepository.delete(cart.id)
        }

        // 6. Envoyer les mails
        const user = await this.userRepository.find(Number(userId))

        const transporter = nodemailer.createTransport({
          host: process.env.MAILER_HOST,
          port: Number(process.env.MAILER_PORT),
          secure: false,
          auth: {
            user: process.env.MAILER_USER,
            pass: process.env.MAILER_PASS
          }
        })

        if (availability_id && session_id) {
          const dateFormatted = new Date(availability.date).toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
          })

          await transporter.sendMail({
            from: process.env.MAILER_SENDER,
            to: process.env.MAILER_SENDER,
            subject: `Nouvelle commande N°${orderNumber} - Elsass SimRacing`,
            html: `
              <html><body>
                <p>Commande N°: ${orderNumber}</p>
                <p>Passée le: ${createdAt}</p>
                <p>Client: ${user.firstname} ${user.lastname} (${user.email})</p>
                <p>Réservation: ${session?.duration_minutes} minutes - ${pilots} pilote(s)</p>
                <p>Date: ${dateFormatted}</p>
                <p>Heure de début: ${availability?.start_time}</p>
                <p>Montant: ${amount} €</p>
              </body></html>
            `
          })

          await transporter.sendMail({
            from: process.env.MAILER_SENDER,
            to: user.email,
            subject: `Confirmation de réservation N°${orderNumber} – Elsass SimRacing`,
            html: `
              <html>
                <body style="margin: 0; padding: 0; background-color: #0a0a14; font-family: Arial, sans-serif; color: #ffffff;">
                  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <div style="text-align: center; margin-bottom: 32px;">
                      <h1 style="color: #245E97; font-size: 28px; margin: 0;">ELSASS SIMRACING</h1>
                      <p style="color: #aaaaaa; margin: 8px 0 0;">Confirmation de réservation</p>
                    </div>
                    <div style="background-color: #1a1a2a; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
                      <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 24px;">Bonjour ${user.firstname} ${user.lastname},</h2>
                      <p style="color: #cccccc; line-height: 1.6; margin: 0 0 24px;">Votre réservation a bien été confirmée. Voici le récapitulatif de votre session :</p>
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid #2a2a3a;">
                          <td style="padding: 12px 0; color: #aaaaaa;">Numéro de commande</td>
                          <td style="padding: 12px 0; color: #ffffff; text-align: right; font-weight: bold;">N°${orderNumber}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #2a2a3a;">
                          <td style="padding: 12px 0; color: #aaaaaa;">Date</td>
                          <td style="padding: 12px 0; color: #ffffff; text-align: right;">${dateFormatted}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #2a2a3a;">
                          <td style="padding: 12px 0; color: #aaaaaa;">Heure de début</td>
                          <td style="padding: 12px 0; color: #ffffff; text-align: right;">${availability.start_time}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #2a2a3a;">
                          <td style="padding: 12px 0; color: #aaaaaa;">Durée</td>
                          <td style="padding: 12px 0; color: #ffffff; text-align: right;">${session?.duration_minutes} minutes</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #2a2a3a;">
                          <td style="padding: 12px 0; color: #aaaaaa;">Nombre de pilotes</td>
                          <td style="padding: 12px 0; color: #ffffff; text-align: right;">${pilots}</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; color: #aaaaaa;">Montant payé</td>
                          <td style="padding: 12px 0; color: #245E97; text-align: right; font-weight: bold; font-size: 18px;">${amount.toFixed(2)} €</td>
                        </tr>
                      </table>
                    </div>
                    <div style="background-color: #1a1a2a; border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #245E97;">
                      <h3 style="color: #ffffff; font-size: 15px; margin: 0 0 12px;">Conditions d'annulation</h3>
                      <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 0;">
                        Toute annulation ou modification doit être effectuée au moins <strong style="color: #ffffff;">1h avant</strong>
                        le début de la session. Passé ce délai, aucun remboursement ne sera accordé.
                      </p>
                    </div>
                    <div style="background-color: #1a1a2a; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                      <h3 style="color: #ffffff; font-size: 15px; margin: 0 0 12px;">Nous contacter</h3>
                      <p style="color: #cccccc; font-size: 14px; margin: 0;">
                        📍 11 rue des dominicains, 67500 Haguenau<br>
                        📞 <a href="tel:+33640583619" style="color: #245E97;">0640583619</a><br>
                        ✉️ elsass.simracing@gmail.com
                      </p>
                    </div>
                    <div style="text-align: center;">
                      <p style="color: #555555; font-size: 12px; margin: 0;">
                        En effectuant cette réservation, vous avez accepté nos
                        <a href="${process.env.CLIENT_APP_URL}/cgv" style="color: #245E97;">CGV</a>
                        et notre <a href="${process.env.CLIENT_APP_URL}/politique-confidentialite" style="color: #245E97;">politique de confidentialité</a>.
                      </p>
                    </div>
                  </div>
                </body>
              </html>
            `
          })
        }

        this.res.status(200).json({ received: true })
      } else if (event.type === "customer.subscription.created") {
        const stripeSubscription = event.data.object
        const customerId = stripeSubscription.customer

        const checkoutSessions = await this.stripeService.instance.checkout.sessions.list({
          subscription: stripeSubscription.id,
          limit: 1
        })
        const checkoutSession = checkoutSessions.data[0]
        const plan = (checkoutSession?.metadata?.plan ?? "STARTER") as SubscriptionPlan

        const planData = await this.planRepository.findOneBy({ plan })
        if (!planData) return this.res.status(404).json({ message: "Plan not found" })

        const user = await this.userRepository.findOneBy({ stripe_customer_id: customerId })
        if (!user) return this.res.status(404).json({ message: "User not found" })

        // Vérifier si l'utilisateur avait un abonnement annulé dans les 30 derniers jours
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const recentCancelledSubscription = await this.subscriptionRepository.findOneBy({
          user_id: user.id,
          status: "cancelled"
        })

        const skipFreeSessionGeneration =
          recentCancelledSubscription &&
          new Date(recentCancelledSubscription.current_period_end) > thirtyDaysAgo

        user.is_member = true
        await this.userRepository.save(user)

        await this.subscriptionRepository.save({
          stripe_subscription_id: stripeSubscription.id,
          plan,
          price: planData.price,
          status: "active",
          free_sessions_remaining: skipFreeSessionGeneration ? 0 : PLAN_FREE_SESSIONS[plan],
          current_period_start: new Date(stripeSubscription.items.data[0].current_period_start * 1000),
          current_period_end: new Date(stripeSubscription.items.data[0].current_period_end * 1000),
          user_id: user.id
        })

        const savedSubscription = await this.subscriptionRepository.findOneBy({
          stripe_subscription_id: stripeSubscription.id
        })

        const qrBuffers = skipFreeSessionGeneration
          ? []
          : await generateFreeSessionQRs(savedSubscription.id, plan)

        const transporter = nodemailer.createTransport({
          host: process.env.MAILER_HOST,
          port: Number(process.env.MAILER_PORT),
          secure: false,
          auth: {
            user: process.env.MAILER_USER,
            pass: process.env.MAILER_PASS
          }
        })

        await transporter.sendMail({
          from: process.env.MAILER_SENDER,
          to: user.email,
          subject: `Votre abonnement Elsass SimRacing – Vos sessions gratuites`,
          attachments: qrBuffers.map((qr) => ({
            filename: `session-gratuite-${qr.index}.png`,
            content: qr.buffer,
            contentType: "image/png"
          })),
          html: `
            <html>
              <body style="margin: 0; padding: 0; background-color: #0a0a14; font-family: Arial, sans-serif; color: #ffffff;">
                <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                  <div style="text-align: center; margin-bottom: 32px;">
                    <h1 style="color: #245E97; font-size: 28px; margin: 0;">ELSASS SIMRACING</h1>
                    <p style="color: #aaaaaa; margin: 8px 0 0;">Votre abonnement ${plan}</p>
                  </div>
                  <div style="background-color: #1a1a2a; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
                    <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 16px;">Bonjour ${user.firstname} ${user.lastname},</h2>
                    <p style="color: #cccccc; line-height: 1.6; margin: 0 0 24px;">
                      ${skipFreeSessionGeneration
            ? `Bienvenue ! Votre abonnement a bien été activé. Vos sessions gratuites seront disponibles à partir du prochain cycle de facturation.`
            : `Bienvenue ! Vous trouverez en pièces jointes vos ${PLAN_FREE_SESSIONS[plan]} QR codes de sessions gratuites. Chaque QR code est nominatif et à usage unique – présentez-en un à l'accueil pour chaque session gratuite.`
          }
                    </p>
                  </div>
                  <div style="background-color: #1a1a2a; border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #245E97;">
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr style="border-bottom: 1px solid #2a2a3a;">
                        <td style="padding: 10px 0; color: #aaaaaa;">Plan</td>
                        <td style="padding: 10px 0; color: #ffffff; text-align: right; font-weight: bold;">${plan}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #aaaaaa;">Sessions gratuites</td>
                        <td style="padding: 10px 0; color: #00c764; text-align: right; font-weight: bold;">
                          ${skipFreeSessionGeneration ? "0 (réabonnement récent)" : PLAN_FREE_SESSIONS[plan]}
                        </td>
                      </tr>
                    </table>
                  </div>
                  <div style="background-color: #1a1a2a; border-radius: 12px; padding: 24px;">
                    <h3 style="color: #ffffff; font-size: 15px; margin: 0 0 12px;">Nous contacter</h3>
                    <p style="color: #cccccc; font-size: 14px; margin: 0;">
                      📍 11 rue des dominicains, 67500 Haguenau<br>
                      📞 <a href="tel:+33640583619" style="color: #245E97;">0640583619</a><br>
                      ✉️ elsass.simracing@gmail.com
                    </p>
                  </div>
                </div>
              </body>
            </html>
          `
        })

        this.res.status(200).json({ received: true })
      } else if (event.type === "customer.subscription.deleted") {
        const stripeSubscription = event.data.object
        const foundSubscription = await this.subscriptionRepository.findOneBy({
          stripe_subscription_id: stripeSubscription.id
        })
        if (!foundSubscription) return this.res.status(404).json({ message: "Subscription not found" })

        const user = await this.userRepository.find(foundSubscription.user_id)
        user.is_member = false
        await this.userRepository.save(user)

        foundSubscription.status = "cancelled"
        await this.subscriptionRepository.save(foundSubscription)

        this.res.status(200).json({ received: true })
      } else if (event.type === "invoice.paid") {
        const invoice = event.data.object

        if (invoice.billing_reason !== "subscription_create") {
          const periodStart = invoice.lines.data[0]?.period?.start
          const periodEnd = invoice.lines.data[0]?.period?.end
          const customerId = invoice.customer

          const user = await this.userRepository.findOneBy({ stripe_customer_id: customerId })
          if (!user) {
            this.res.status(200).json({ received: true })
            return
          }

          const stripeSubscriptionId = invoice.subscription
          const foundSubscription = await this.subscriptionRepository.findOneBy({
            stripe_subscription_id: stripeSubscriptionId
          })
          if (!foundSubscription) {
            this.res.status(200).json({ received: true })
            return
          }

          const plan = foundSubscription.plan as SubscriptionPlan

          foundSubscription.free_sessions_remaining = PLAN_FREE_SESSIONS[plan]
          foundSubscription.current_period_start = new Date(periodStart * 1000)
          foundSubscription.current_period_end = new Date(periodEnd * 1000)
          await this.subscriptionRepository.save(foundSubscription)

          const qrBuffers = await generateFreeSessionQRs(foundSubscription.id, plan)

          const transporter = nodemailer.createTransport({
            host: process.env.MAILER_HOST,
            port: Number(process.env.MAILER_PORT),
            secure: false,
            auth: {
              user: process.env.MAILER_USER,
              pass: process.env.MAILER_PASS
            }
          })

          await transporter.sendMail({
            from: process.env.MAILER_SENDER,
            to: user.email,
            subject: `Renouvellement abonnement – Vos nouvelles sessions gratuites`,
            attachments: qrBuffers.map((qr) => ({
              filename: `session-gratuite-${qr.index}.png`,
              content: qr.buffer,
              contentType: "image/png"
            })),
            html: `
              <html>
                <body style="margin: 0; padding: 0; background-color: #0a0a14; font-family: Arial, sans-serif; color: #ffffff;">
                  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <div style="text-align: center; margin-bottom: 32px;">
                      <h1 style="color: #245E97; font-size: 28px; margin: 0;">ELSASS SIMRACING</h1>
                      <p style="color: #aaaaaa; margin: 8px 0 0;">Renouvellement de votre abonnement</p>
                    </div>
                    <div style="background-color: #1a1a2a; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
                      <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 16px;">Bonjour ${user.firstname} ${user.lastname},</h2>
                      <p style="color: #cccccc; line-height: 1.6; margin: 0 0 24px;">
                        Votre abonnement a été renouvelé. Vous trouverez en pièces jointes vos ${PLAN_FREE_SESSIONS[plan]} nouveaux QR codes de sessions gratuites.
                        Les anciens QR codes ne sont plus valides.
                      </p>
                    </div>
                    <div style="background-color: #1a1a2a; border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #00c764;">
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid #2a2a3a;">
                          <td style="padding: 10px 0; color: #aaaaaa;">Plan</td>
                          <td style="padding: 10px 0; color: #ffffff; text-align: right; font-weight: bold;">${plan}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; color: #aaaaaa;">Sessions gratuites rechargées</td>
                          <td style="padding: 10px 0; color: #00c764; text-align: right; font-weight: bold;">${PLAN_FREE_SESSIONS[plan]}</td>
                        </tr>
                      </table>
                    </div>
                    <div style="background-color: #1a1a2a; border-radius: 12px; padding: 24px;">
                      <h3 style="color: #ffffff; font-size: 15px; margin: 0 0 12px;">Nous contacter</h3>
                      <p style="color: #cccccc; font-size: 14px; margin: 0;">
                        📍 11 rue des dominicains, 67500 Haguenau<br>
                        📞 <a href="tel:+33640583619" style="color: #245E97;">0640583619</a><br>
                        ✉️ elsass.simracing@gmail.com
                      </p>
                    </div>
                  </div>
                </body>
              </html>
            `
          })
        }

        // Réponse en dehors du if pour couvrir billing_reason === "subscription_create"
        this.res.status(200).json({ received: true })
      } else {
        this.res.status(200).json({ received: true })
      }
    } catch (error) {
      console.log("WEBHOOK ERROR:", error)
      this.next(error)
    }
  }

  @Put({ path: "/:order", resolve: { order: UserOrder }, middlewares: [isAuthenticated] })
  async update(order: UserOrder) {
    try {
      const data = this.req.body
      Object.assign(order, data)
      const updatedOrder = await this.orderRepository.save(order)
      this.res.status(200).json({ message: "Order updated successfully", updatedOrder })
    } catch (error) {
      this.next(error)
    }
  }

  @Delete({ path: "/:order", resolve: { order: UserOrder }, middlewares: [isAuthenticated] })
  async delete(order: UserOrder) {
    try {
      if (!order?.id) {
        return this.res.status(400).json({ message: "Invalid Order id" })
      }
      await this.orderRepository.delete(order.id)
      this.res.status(200).json({ message: "Order deleted successfully" })
    } catch (error) {
      this.next(error)
    }
  }
}