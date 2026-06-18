import { Config, QueryBuilder, Service } from "@lyra-js/core"
import { randomBytes } from "crypto"
import nodemailer from "nodemailer"
import QRCode from "qrcode"
import Stripe from "stripe"

import { Booking } from "@entity/Booking"

import { EmailTemplateService } from "./EmailTemplateService"

type SubscriptionPlan = "STARTER" | "PLUS" | "ULTRA"

export class StripeService extends Service {
  instance: Stripe
  sk: string = ""
  pk: string = ""

  readonly PLAN_FREE_SESSIONS: Record<string, number> = {
    STARTER: 2,
    PLUS: 4,
    ULTRA: 8
  }

  constructor() {
    super()
    const config = new Config()
    const apiEnv = config.getParam("api_env")
    const stripeConfig = config.getParam("stripe")
    const { sk_test, pk_test, sk, pk } = stripeConfig
    this.sk = apiEnv === "prod" || apiEnv === "production" ? sk : sk_test
    this.pk = apiEnv === "prod" || apiEnv === "production" ? pk : pk_test
    this.instance = new Stripe(this.sk)
  }

  async handleSubscriptionDeleted(event: Stripe.Event) {
    const stripeSubscription = event.data.object as Stripe.Subscription

    const foundSubscription = await this.subscriptionRepository.findOneBy({
      stripe_subscription_id: stripeSubscription.id
    })
    if (!foundSubscription) return

    const user = await this.userRepository.find(foundSubscription.user_id)
    user.is_member = false
    await this.userRepository.save(user)

    foundSubscription.status = "cancelled"
    await this.subscriptionRepository.save(foundSubscription)
  }

  async handleSubscriptionUpdated(event: Stripe.Event) {
    const stripeSubscription = event.data.object as Stripe.Subscription

    const foundSubscription = await this.subscriptionRepository.findOneBy({
      stripe_subscription_id: stripeSubscription.id
    })
    if (!foundSubscription) return

    if (stripeSubscription.cancel_at_period_end === true) {
      foundSubscription.status = "pending_cancellation"
      await this.subscriptionRepository.save(foundSubscription)
    } else if (
      stripeSubscription.cancel_at_period_end === false &&
      foundSubscription.status === "pending_cancellation"
    ) {
      foundSubscription.status = "active"
      await this.subscriptionRepository.save(foundSubscription)
    } else if (stripeSubscription.cancel_at_period_end === false) {
      const newPriceId = stripeSubscription.items.data[0]?.price?.id
      const newPlanData = newPriceId ? await this.planRepository.findOneBy({ stripe_price_id: newPriceId }) : null
      const newPlan = newPlanData?.plan as SubscriptionPlan
      const oldPlan = foundSubscription.plan as SubscriptionPlan

      if (newPlan && newPlan !== oldPlan && newPlan !== foundSubscription.pending_plan) {
        foundSubscription.pending_plan = newPlan
        await this.subscriptionRepository.save(foundSubscription)
      }
    }
  }

  private createTransporter() {
    return nodemailer.createTransport({
      host: process.env.MAILER_HOST,
      port: Number(process.env.MAILER_PORT),
      secure: false,
      auth: {
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASS
      }
    })
  }

  private async generateFreeSessionQRs(subId: number, plan: SubscriptionPlan) {
    const qrBuffers: { buffer: Buffer; index: number }[] = []
    for (let i = 0; i < this.PLAN_FREE_SESSIONS[plan]; i++) {
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

  async handleSubscriptionCreated(event: Stripe.Event) {
    const stripeSubscription = event.data.object as Stripe.Subscription
    const customerId = stripeSubscription.customer as string

    try {
      const checkoutSessions = await this.instance.checkout.sessions.list({
        subscription: stripeSubscription.id,
        limit: 1
      })
      const checkoutSession = checkoutSessions.data[0]
      const plan = (checkoutSession?.metadata?.plan ?? "STARTER") as SubscriptionPlan

      const planData = await this.planRepository.findOneBy({ plan })
      if (!planData) {
        console.log("WEBHOOK SUBSCRIPTION CREATED ERROR: Plan not found")
        return
      }

      const user = await this.userRepository.findOneBy({ stripe_customer_id: customerId })
      if (!user) {
        console.log("WEBHOOK SUBSCRIPTION CREATED ERROR: User not found")
        return
      }

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const recentCancelledSubscription = await this.subscriptionRepository.findOneBy({
        user_id: user.id,
        status: "cancelled"
      })

      const skipFreeSessionGeneration =
        recentCancelledSubscription && new Date(recentCancelledSubscription.current_period_end) > thirtyDaysAgo

      user.is_member = true
      await this.userRepository.save(user)

      await this.subscriptionRepository.save({
        stripe_subscription_id: stripeSubscription.id,
        plan,
        price: planData.price,
        status: "active",
        free_sessions_remaining: skipFreeSessionGeneration ? 0 : this.PLAN_FREE_SESSIONS[plan],
        current_period_start: new Date(stripeSubscription.items.data[0].current_period_start * 1000),
        current_period_end: new Date(stripeSubscription.items.data[0].current_period_end * 1000),
        user_id: user.id
      })

      const savedSubscription = await this.subscriptionRepository.findOneBy({
        stripe_subscription_id: stripeSubscription.id
      })

      const qrBuffers = skipFreeSessionGeneration ? [] : await this.generateFreeSessionQRs(savedSubscription.id, plan)
      const transporter = this.createTransporter()

      await transporter.sendMail({
        from: process.env.MAILER_SENDER,
        to: user.email,
        subject: `Votre abonnement Elsass SimRacing — Vos sessions gratuites`,
        attachments: qrBuffers.map((qr) => ({
          filename: `session-gratuite-${qr.index}.png`,
          content: qr.buffer,
          contentType: "image/png"
        })),
        html: EmailTemplateService.subscriptionCreatedMail(
          user.firstname,
          user.lastname,
          plan,
          this.PLAN_FREE_SESSIONS[plan],
          !!skipFreeSessionGeneration
        )
      })
    } catch (error) {
      console.log("WEBHOOK SUBSCRIPTION CREATED ERROR:", error)
    }
  }

  async handleInvoicePaid(event: Stripe.Event) {
    const invoice = event.data.object as Stripe.Invoice & {
      subscription: string | { id: string } | null
      billing_reason: string
    }

    console.log("INVOICE PAID - lines subscription:", JSON.stringify(invoice.lines.data[0]?.subscription))
    console.log("INVOICE PAID - raw customer:", JSON.stringify(invoice.customer))

    try {
      const periodStart = invoice.lines.data[0]?.period?.start
      const periodEnd = invoice.lines.data[0]?.period?.end

      const customerId =
        typeof invoice.customer === "string" ? invoice.customer : (invoice.customer as { id: string })?.id

      const stripeSubscriptionId = invoice.lines.data[0]?.subscription as string | undefined

      console.log("INVOICE PAID - customerId:", customerId)
      console.log("INVOICE PAID - stripeSubscriptionId:", stripeSubscriptionId)
      console.log("INVOICE PAID - billing_reason:", invoice.billing_reason)

      const user = await this.userRepository.findOneBy({ stripe_customer_id: customerId })
      if (!user) {
        console.log("INVOICE PAID - user not found for customerId:", customerId)
        return
      }

      const foundSubscription = await this.subscriptionRepository.findOneBy({
        stripe_subscription_id: stripeSubscriptionId
      })
      if (!foundSubscription) {
        console.log("INVOICE PAID - subscription not found for:", stripeSubscriptionId)
        return
      }

      const plan = foundSubscription.plan as SubscriptionPlan
      const activePlan = (foundSubscription.pending_plan || plan) as SubscriptionPlan

      foundSubscription.plan = activePlan
      foundSubscription.pending_plan = null
      foundSubscription.free_sessions_remaining = this.PLAN_FREE_SESSIONS[activePlan]
      foundSubscription.current_period_start = new Date(periodStart * 1000)
      foundSubscription.current_period_end = new Date(periodEnd * 1000)
      await this.subscriptionRepository.save(foundSubscription)

      const qrBuffers = await this.generateFreeSessionQRs(foundSubscription.id, activePlan)
      const transporter = this.createTransporter()

      await transporter.sendMail({
        from: process.env.MAILER_SENDER,
        to: user.email,
        subject: `Renouvellement abonnement — Vos nouvelles sessions gratuites`,
        attachments: qrBuffers.map((qr) => ({
          filename: `session-gratuite-${qr.index}.png`,
          content: qr.buffer,
          contentType: "image/png"
        })),
        html: EmailTemplateService.subscriptionRenewalMail(
          user.firstname,
          user.lastname,
          activePlan,
          this.PLAN_FREE_SESSIONS[activePlan]
        )
      })
      console.log("INVOICE PAID - mail envoyé:")
      console.log("INVOICE PAID - qr sending:", qrBuffers)
    } catch (error) {
      console.log("WEBHOOK INVOICE PAID ERROR:", error)
    }
  }

  async handleCheckoutCompleted(event: Stripe.Event) {
    const stripeSession = event.data.object as Stripe.Checkout.Session

    if (!stripeSession.metadata || stripeSession.amount_total === null) {
      console.log("WEBHOOK CHECKOUT ERROR: missing metadata or amount_total")
      return
    }

    const userId = stripeSession.metadata.user_id
    const availability_id = Number(stripeSession.metadata.availability_id)
    const session_id = Number(stripeSession.metadata.session_id)
    const pilots = Number(stripeSession.metadata.pilots)
    const amount = stripeSession.amount_total / 100
    const stripeCharge = stripeSession.payment_intent
    const orderNumber = Date.now()
    const createdAt = new Date()

    try {
      // 0. Incrémenter uses_count du code de réduction
      const discount_code = stripeSession.metadata.discount_code
      if (discount_code) {
        const discount = await this.discountCodeRepository.findOneBy({ code: discount_code })
        if (discount) {
          discount.uses_count += 1
          if (discount.max_uses !== null && discount.uses_count >= discount.max_uses) {
            discount.is_active = 0
          }
          await this.discountCodeRepository.save(discount)
        }
      }

      // 1. Créer l'order
      await this.orderRepository.save({
        related_user_id: userId,
        amount,
        created_at: createdAt,
        number: orderNumber,
        discount_code: discount_code ?? null
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
      let bookingQrBuffer: Buffer | null = null

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
        const bookingUser = await this.userRepository.find(Number(userId))
        const subscription = await this.subscriptionRepository.findOneBy({ user_id: Number(userId) })
        const hasMemberPrice = bookingUser.is_member && subscription?.plan !== "STARTER"
        const sessionPrice = session
          ? hasMemberPrice
            ? session.price_member + (pilots - 1) * session.price_normal
            : session.price_normal * pilots
          : 0
        booking.price_paid = sessionPrice
        booking.is_free_session = false
        booking.pilots = pilots

        await this.bookingRepository.save(booking)
        const savedBooking = await this.bookingRepository.findOneBy({
          availability_id: availability_id,
          user_id: Number(userId)
        })
        bookingQrBuffer = await QRCode.toBuffer(`${process.env.CLIENT_APP_URL}/admin/booking/${savedBooking.id}`, {
          width: 300,
          margin: 2
        })

        savedBooking.status = "confirmed"
        await this.bookingRepository.save(savedBooking)

        const slotsQuery = new QueryBuilder().raw(
          `SELECT * FROM availability WHERE date = ? AND start_time >= ? AND start_time < ? AND is_open = true`,
          [availability.date, availability.start_time, end_time]
        )
        const [affectedSlots] = await slotsQuery.execute()
        for (const slot of affectedSlots as { id: number }[]) {
          const slotEntity = await this.availabilityRepository.find(slot.id)
          if (slotEntity) {
            slotEntity.slots_remaining -= pilots
            await this.availabilityRepository.save(slotEntity)
          }
        }

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
      let savedEventBooking = null
      let eventQrBuffer: Buffer | null = null

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
        eventBooking.vehicle = stripeSession.metadata.selected_vehicle || null

        await this.bookingRepository.save(eventBooking)
        savedEventBooking = await this.bookingRepository.findOneBy({
          event_id: Number(event_id),
          user_id: Number(userId)
        })

        eventQrBuffer = await QRCode.toBuffer(`${process.env.CLIENT_APP_URL}/admin/booking/${savedEventBooking.id}`, {
          width: 300,
          margin: 2
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
      interface GiftVoucherMailData {
        buffer: Buffer
        recipientEmail: string
        recipientName: string
        sessionLabel: string
      }
      const giftVoucherMails: GiftVoucherMailData[] = []
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
            const qrBuffer = await QRCode.toBuffer(qrCode, { width: 300, margin: 2 })
            giftVoucherMails.push({
              buffer: qrBuffer,
              recipientEmail: r.email,
              recipientName: `${r.firstname} ${r.lastname}`,
              sessionLabel: `${item.duration_minutes} minutes`
            })
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
      const transporter = this.createTransporter()

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
            ${discount_code ? `<p>Code de réduction utilisé: ${discount_code}</p>` : ""}
            <p>Montant: ${amount.toFixed(2)} €</p>
          </body></html>
        `
        })

        await transporter.sendMail({
          from: process.env.MAILER_SENDER,
          to: user.email,
          subject: `Confirmation de réservation N°${orderNumber} — Elsass SimRacing`,
          attachments: bookingQrBuffer
            ? [{ filename: `reservation-${orderNumber}.png`, content: bookingQrBuffer, contentType: "image/png" }]
            : [],
          html: EmailTemplateService.bookingConfirmationMail(
            user.firstname,
            user.lastname,
            orderNumber,
            dateFormatted,
            availability.start_time,
            session?.duration_minutes,
            pilots,
            amount,
            discount_code ?? null,
            process.env.CLIENT_APP_URL ?? ""
          )
        })
      }

      if (giftVoucherMails.length > 0) {
        await transporter.sendMail({
          from: process.env.MAILER_SENDER,
          to: user.email,
          subject: `Vos bons cadeaux Elsass SimRacing – Commande N°${orderNumber}`,
          attachments: giftVoucherMails.map((gv, index) => ({
            filename: `bon-cadeau-${index + 1}-${gv.recipientName.replace(/\s+/g, "-").toLowerCase()}.png`,
            content: gv.buffer,
            contentType: "image/png"
          })),
          html: EmailTemplateService.giftVoucherMail(user.firstname, user.lastname, orderNumber, giftVoucherMails)
        })
      }

      if (event_id && savedEventBooking) {
        await transporter.sendMail({
          from: process.env.MAILER_SENDER,
          to: user.email,
          subject: `Confirmation d'inscription événement N°${orderNumber} – Elsass SimRacing`,
          attachments: eventQrBuffer
            ? [
                {
                  filename: `inscription-evenement-${orderNumber}.png`,
                  content: eventQrBuffer,
                  contentType: "image/png"
                }
              ]
            : [],
          html: EmailTemplateService.eventBookingMail(user.firstname, user.lastname, orderNumber, amount)
        })
      }
    } catch (error) {
      console.log("WEBHOOK CHECKOUT ERROR:", error)
    }
  }
}
