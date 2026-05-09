import { Controller, Delete, Get, isAdmin, isAuthenticated, Post, Put, QueryBuilder, Route } from "@lyra-js/core"
import nodemailer from "nodemailer"

import { Booking } from "@entity/Booking"

@Route({ path: "/booking" })
export class BookingController extends Controller {
  @Get({ path: "/" })
  async list() {
    try {
      const bookings = await this.bookingRepository.findAll()
      this.res.status(200).json({ message: "Booking list fetched successfully", bookings })
    } catch (error) {
      this.next(error)
    }
  }

  @Get({ path: "/event/:eventId" })
  async listByEvent() {
    try {
      const eventId = Number(this.req.params.eventId)
      const query = new QueryBuilder()
        .raw(
          `SELECT
               b.id,
               b.status,
               b.pilots,
               b.price_paid,
               b.vehicle,
               u.firstname,
               u.lastname,
               u.email,
               e.title as event_title,
               e.date as event_date,
               e.start_time,
               e.end_time,
               e.price
           FROM booking b
                    JOIN user u ON b.user_id = u.id
                    JOIN event e ON b.event_id = e.id
           WHERE b.event_id = ?
           ORDER BY b.id DESC`,
          [eventId]
        )
      const [registrations] = await query.execute()
      this.res.status(200).json({ message: "Event registrations fetched successfully", registrations })
    } catch (error) {
      this.next(error)
    }
  }

  @Get({ path: "/me", middlewares: [isAuthenticated] })
  async me() {
    try {
      console.log("USER ID:", this.req.user.id)
      const bookings = await this.bookingRepository.findByUserId(this.req.user.id)
      console.log("BOOKINGS:", bookings)
      this.res.status(200).json({ message: "Bookings fetched successfully", bookings })
    } catch (error) {
      this.next(error)
    }
  }

  @Get({ path: "/:booking", resolve: { booking: Booking } })
  async read(booking: Booking) {
    try {
      if (!booking) return this.res.status(404).json({ message: "Booking not found" })
      this.res.status(200).json({ message: "Booking fetched successfully", booking })
    } catch (error) {
      this.next(error)
    }
  }

  @Post({ path: "/cancel/:bookingId", middlewares: [isAuthenticated] })
  async cancelBooking() {
    try {
      const bookingId = Number(this.req.params.bookingId)
      const userId = this.req.user.id

      const booking = await this.bookingRepository.find(bookingId)
      if (!booking) return this.res.status(404).json({ message: "Booking not found" })
      if (booking.user_id !== Number(userId)) return this.res.status(403).json({ message: "Forbidden" })
      if (booking.status === "cancelled") return this.res.status(400).json({ message: "Booking already cancelled" })

      const bookingDateTime = new Date(`${booking.date}T${booking.start_time}`)
      const now = new Date()
      const diffHours = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
      if (diffHours < 1) {
        return this.res.status(400).json({ message: "Cancellation not allowed less than 1 hour before the session" })
      }

      const orderDetail = await this.orderDetailsRepository.findOneBy({ booking_id: bookingId })
      if (!orderDetail) return this.res.status(404).json({ message: "Order detail not found" })

      const payment = await this.paymentsRepository.findOneBy({ order_id: orderDetail.order_id })
      if (!payment) return this.res.status(404).json({ message: "Payment not found" })

      // Remboursement Stripe uniquement si un paiement en ligne a eu lieu
      if (payment.stripe_charge_id) {
        await this.stripeService.instance.refunds.create({
          payment_intent: payment.stripe_charge_id
        })
        payment.status = "refunded"
        await this.paymentsRepository.save(payment)
      }

      // Recrémenter les slots de disponibilité
      if (booking.availability_id) {
        await this.incrementSlots(booking.date, booking.start_time, booking.end_time, booking.pilots ?? 1)
      }

      // Recrémenter les sessions gratuites si c'était une session offerte
      if (booking.is_free_session) {
        const subscription = await this.subscriptionRepository.findOneBy({
          user_id: booking.user_id,
          status: "active"
        })
        if (subscription) {
          subscription.free_sessions_remaining += 1
          subscription.monthly_free_session_used = false
          await this.subscriptionRepository.save(subscription)
        }
      }

      booking.status = "cancelled"
      await this.bookingRepository.save(booking)

      this.res.status(200).json({ message: "Booking cancelled and refunded successfully" })
    } catch (error) {
      this.next(error)
    }
  }

  @Post({ path: "/" })
  async create() {
    try {
      const { availability_id, session_id, gift_voucher_id, pilots, pay_on_site, use_free_session } = this.req.body as {
        availability_id: number
        session_id: number
        gift_voucher_id: number | null
        pilots: number
        pay_on_site: boolean
        use_free_session: boolean
      }

      if (!availability_id || (!session_id && !use_free_session)) {
        return this.badRequest("Missing data")
      }

      let subscription = null
      if (use_free_session) {
        subscription = await this.subscriptionRepository.findOneBy({
          user_id: this.req.user.id,
          status: "active"
        })
        if (!subscription) return this.res.status(400).json({ message: "No active subscription" })
        if (subscription.free_sessions_remaining <= 0)
          return this.res.status(400).json({ message: "No free sessions remaining" })
      }

      const finalSessionId = use_free_session ? 1 : session_id
      const availability = await this.availabilityRepository.find(availability_id)
      const session = await this.sessionRepository.find(finalSessionId)

      if (availability === null || session === null || availability.is_open === false) {
        return this.badRequest("Full")
      }

      const start = new Date(`1970-01-01T${availability.start_time}`)
      start.setMinutes(start.getMinutes() + session.duration_minutes)
      const end_time = start.toTimeString().split(" ")[0]
      const availableSimulator = await this.bookingRepository.findAvailableSimulator(
        availability.date,
        availability.start_time,
        end_time
      )
      if (!availableSimulator) {
        return this.badRequest("No availability found for this booking")
      }

      const booking = new Booking()
      booking.availability_id = availability_id
      booking.session_id = finalSessionId
      booking.gift_voucher_id = gift_voucher_id ?? null
      booking.start_time = availability.start_time
      booking.end_time = end_time
      booking.date = availability.date
      booking.simulator_id = availableSimulator
      booking.user_id = this.req.user.id
      booking.pilots = pilots ?? 1

      if (use_free_session) {
        booking.price_paid = 0
        booking.is_free_session = true
        booking.status = "confirmed"
      } else if (pay_on_site) {
        booking.price_paid = this.req.user.is_member
          ? session.price_member + (pilots - 1) * session.price_normal
          : session.price_normal * pilots
        booking.is_free_session = false
        booking.status = "pending_payment"
      } else {
        booking.price_paid = this.req.user.is_member
          ? session.price_member + (pilots - 1) * session.price_normal
          : session.price_normal * pilots
        booking.is_free_session = false
      }

      const savedBooking = await this.bookingRepository.save(booking)
      await this.decrementSlots(availability.date, availability.start_time, end_time, pilots ?? 1)

      if (use_free_session && subscription) {
        subscription.free_sessions_remaining -= 1
        if (subscription.free_sessions_remaining === 0) {
          subscription.monthly_free_session_used = true
        }
        await this.subscriptionRepository.save(subscription)
      }

      // Envoi mail non-bloquant : un échec ici ne fait pas échouer la réservation
      if (pay_on_site || use_free_session) {
        try {
          const user = await this.userRepository.find(this.req.user.id)

          const transporter = nodemailer.createTransport({
            host: process.env.MAILER_HOST,
            port: Number(process.env.MAILER_PORT),
            secure: false,
            auth: {
              user: process.env.MAILER_USER,
              pass: process.env.MAILER_PASS
            }
          })

          const dateFormatted = new Date(availability.date).toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
          })

          if (pay_on_site) {
            await transporter.sendMail({
              from: process.env.MAILER_SENDER,
              to: process.env.MAILER_SENDER,
              subject: `Nouvelle réservation (paiement sur place) - ${user.firstname} ${user.lastname}`,
              html: `
              <html>
                <body>
                  <p>Réservation paiement sur place</p>
                  <p>Client: ${user.firstname} ${user.lastname} (${user.email})</p>
                  <p>Date: ${dateFormatted}</p>
                  <p>Heure: ${availability.start_time}</p>
                  <p>Durée: ${session.duration_minutes} minutes</p>
                  <p>Pilotes: ${pilots}</p>
                  <p>Montant à encaisser: ${booking.price_paid.toFixed(2)} €</p>
                </body>
              </html>
            `
            })

            await transporter.sendMail({
              from: process.env.MAILER_SENDER,
              to: user.email,
              subject: `Confirmation de réservation — Elsass SimRacing`,
              html: `
              <html>
                <body style="margin: 0; padding: 0; background-color: #0a0a14; font-family: Arial, sans-serif; color: #ffffff;">
                  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <div style="text-align: center; margin-bottom: 32px;">
                      <h1 style="color: #245E97; font-size: 28px; margin: 0;">ELSASS SIMRACING</h1>
                      <p style="color: #aaaaaa; margin: 8px 0 0;">Confirmation de réservation</p>
                    </div>
                    <div style="background-color: #1a1a2a; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
                      <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 24px;">
                        Bonjour ${user.firstname} ${user.lastname},
                      </h2>
                      <p style="color: #cccccc; line-height: 1.6; margin: 0 0 24px;">
                        Votre réservation a bien été enregistrée. Le paiement sera à régler sur place.
                      </p>
                      <table style="width: 100%; border-collapse: collapse;">
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
                          <td style="padding: 12px 0; color: #ffffff; text-align: right;">${session.duration_minutes} minutes</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #2a2a3a;">
                          <td style="padding: 12px 0; color: #aaaaaa;">Nombre de pilotes</td>
                          <td style="padding: 12px 0; color: #ffffff; text-align: right;">${pilots}</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; color: #aaaaaa;">Montant à régler sur place</td>
                          <td style="padding: 12px 0; color: #245E97; text-align: right; font-weight: bold; font-size: 18px;">${booking.price_paid.toFixed(2)} €</td>
                        </tr>
                      </table>
                    </div>
                    <div style="background-color: #1a1a2a; border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #f59e0b;">
                      <h3 style="color: #f59e0b; font-size: 15px; margin: 0 0 12px;">⚠️ Paiement sur place</h3>
                      <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 0;">
                        Le règlement s'effectuera directement à l'accueil le jour de votre session.
                        Pensez à vous munir de votre confirmation (lien ci-dessous).
                      </p>
                    </div>
                    <div style="text-align: center; margin-bottom: 24px;">
                      <a href="${process.env.CLIENT_APP_URL}/booking/${savedBooking.id}"
                         style="background-color: #245E97; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                        Voir ma confirmation
                      </a>
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
                        et notre
                        <a href="${process.env.CLIENT_APP_URL}/politique-confidentialite" style="color: #245E97;">politique de confidentialité</a>.
                      </p>
                    </div>
                  </div>
                </body>
              </html>
            `
            })
          }

          if (use_free_session) {
            await transporter.sendMail({
              from: process.env.MAILER_SENDER,
              to: user.email,
              subject: `Session gratuite confirmée — Elsass SimRacing`,
              html: `
              <html>
                <body style="margin: 0; padding: 0; background-color: #0a0a14; font-family: Arial, sans-serif; color: #ffffff;">
                  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <div style="text-align: center; margin-bottom: 32px;">
                      <h1 style="color: #245E97; font-size: 28px; margin: 0;">ELSASS SIMRACING</h1>
                      <p style="color: #aaaaaa; margin: 8px 0 0;">Session membre offerte</p>
                    </div>
                    <div style="background-color: #1a1a2a; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
                      <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 24px;">
                        Bonjour ${user.firstname} ${user.lastname},
                      </h2>
                      <p style="color: #cccccc; line-height: 1.6; margin: 0 0 24px;">
                        Votre session gratuite membre a bien été confirmée. À bientôt sur la piste !
                      </p>
                      <table style="width: 100%; border-collapse: collapse;">
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
                          <td style="padding: 12px 0; color: #ffffff; text-align: right;">15 minutes</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; color: #aaaaaa;">Sessions gratuites restantes</td>
                          <td style="padding: 12px 0; color: #22c55e; text-align: right; font-weight: bold;">${subscription ? subscription.free_sessions_remaining : 0}</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; color: #aaaaaa;">Prix</td>
                          <td style="padding: 12px 0; color: #22c55e; text-align: right; font-weight: bold;">Gratuit</td>
                        </tr>
                      </table>
                    </div>
                    <div style="text-align: center; margin-bottom: 24px;">
                      <a href="${process.env.CLIENT_APP_URL}/booking/${savedBooking.id}"
                         style="background-color: #245E97; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                        Voir ma confirmation
                      </a>
                    </div>
                    <div style="background-color: #1a1a2a; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
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
        } catch (mailError) {
          console.error("Mail error:", mailError)
        }
      }

      this.res.status(201).json({ message: "Booking created successfully", savedBooking })
    } catch (error) {
      this.next(error)
    }
  }

  private async decrementSlots(date: string | Date, startTime: string, endTime: string, pilots: number) {
    const query = new QueryBuilder().raw(
      `SELECT * FROM availability WHERE date = ? AND start_time >= ? AND start_time < ? AND is_open = true`,
      [date, startTime, endTime]
    )
    const [slots] = await query.execute()
    for (const slot of slots as any[]) {
      const slotEntity = await this.availabilityRepository.find(slot.id)
      if (slotEntity) {
        slotEntity.slots_remaining -= pilots
        await this.availabilityRepository.save(slotEntity)
      }
    }
  }

  private async incrementSlots(date: string | Date, startTime: string, endTime: string, pilots: number) {
    const query = new QueryBuilder().raw(
      `SELECT * FROM availability WHERE date = ? AND start_time >= ? AND start_time < ?`,
      [date, startTime, endTime]
    )
    const [slots] = await query.execute()
    for (const slot of slots as any[]) {
      const slotEntity = await this.availabilityRepository.find(slot.id)
      if (slotEntity) {
        slotEntity.slots_remaining += pilots
        await this.availabilityRepository.save(slotEntity)
      }
    }
  }

  @Put({ path: "/:booking", resolve: { booking: Booking } })
  async update(booking: Booking) {
    try {
      const data = this.req.body
      Object.assign(booking, data)
      const updatedBooking = await this.bookingRepository.save(booking)
      this.res.status(200).json({ message: "Booking updated successfully", updatedBooking })
    } catch (error) {
      this.next(error)
    }
  }

  @Put({ path: "/:booking/checkin", resolve: { booking: Booking } })
  async checkIn(booking: Booking) {
    try {
      if (!booking) return this.res.status(404).json({ message: "Booking not found" })

      if (booking.checked_in) {
        return this.res.status(409).json({
          message: "Déjà validé",
          checked_in_at: booking.checked_in_at
        })
      }

      booking.checked_in = true
      booking.checked_in_at = new Date()
      const updatedBooking = await this.bookingRepository.save(booking)

      this.res.status(200).json({ message: "Check-in effectué avec succès", updatedBooking })
    } catch (error) {
      this.next(error)
    }
  }

  @Put({ path: "/:booking/cancel", resolve: { booking: Booking }, middlewares: [isAdmin] })
  async adminCancel(booking: Booking) {
    try {
      if (!booking) return this.res.status(404).json({ message: "Booking not found" })
      if (booking.status === "cancelled") return this.res.status(400).json({ message: "Booking already cancelled" })

      // Recrémentation availability
      if (booking.availability_id) {
        await this.incrementSlots(booking.date, booking.start_time, booking.end_time, booking.pilots ?? 1)
      }

      // Recrémentation session gratuite si applicable
      if (booking.is_free_session) {
        const subscription = await this.subscriptionRepository.findOneBy({
          user_id: booking.user_id,
          status: "active"
        })
        if (subscription) {
          subscription.free_sessions_remaining += 1
          await this.subscriptionRepository.save(subscription)
        }
      }

      booking.status = "cancelled"
      booking.cancelled_at = new Date()
      await this.bookingRepository.save(booking)

      this.res.status(200).json({ message: "Booking cancelled successfully" })
    } catch (error) {
      this.next(error)
    }
  }

  @Put({ path: "/:booking/restore", resolve: { booking: Booking }, middlewares: [isAdmin] })
  async adminRestore(booking: Booking) {
    try {
      if (!booking) return this.res.status(404).json({ message: "Booking not found" })
      if (booking.status !== "cancelled") return this.res.status(400).json({ message: "Booking is not cancelled" })

      // Décrémentation availability
      if (booking.availability_id) {
        await this.decrementSlots(booking.date, booking.start_time, booking.end_time, booking.pilots ?? 1)
      }

      // Décrémentation session gratuite si applicable
      if (booking.is_free_session) {
        const subscription = await this.subscriptionRepository.findOneBy({
          user_id: booking.user_id,
          status: "active"
        })
        if (subscription) {
          subscription.free_sessions_remaining -= 1
          await this.subscriptionRepository.save(subscription)
        }
      }

      booking.status = "confirmed"
      booking.cancelled_at = null
      await this.bookingRepository.save(booking)

      this.res.status(200).json({ message: "Booking restored successfully" })
    } catch (error) {
      this.next(error)
    }
  }

  @Delete({ path: "/:booking", resolve: { booking: Booking } })
  async delete(booking: Booking) {
    try {
      if (!booking?.id) {
        return this.res.status(400).json({ message: "Invalid Booking id" })
      }
      await this.bookingRepository.delete(booking.id)
      this.res.status(200).json({ message: "Booking deleted successfully" })
    } catch (error) {
      this.next(error)
    }
  }
}