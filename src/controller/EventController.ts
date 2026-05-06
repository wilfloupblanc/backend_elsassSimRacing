import { Controller, Delete, Get, Post, Put, QueryBuilder, Route } from "@lyra-js/core"
import * as nodemailer from "nodemailer"

import { Event } from "@entity/Event"

@Route({ path: "/event" })
export class EventController extends Controller {
  @Get({ path: "/" })
  async list() {
    try {
      const events = await this.eventRepository.findAll()
      this.res.status(200).json({ message: "Event list fetched successfully", events })
    } catch (error) {
      this.next(error)
    }
  }

  @Get({ path: "/:event/registrations", resolve: { event: Event } })
  async registrations(event: Event) {
    try {
      if (!event) return this.res.status(404).json({ message: "Event not found" })
      const query = new QueryBuilder()
        .raw(
          `SELECT COUNT(*) as count FROM booking WHERE event_id = ? AND status = 'confirmed'`,
          [event.id]
        )
      const [rows] = await query.execute() as [Array<{ count: number }>]
      this.res.status(200).json({ count: rows[0].count })
    } catch (error) {
      this.next(error)
    }
  }

  @Get({ path: "/:event", resolve: { event: Event } })
  async read(event: Event) {
    try {
      if (!event) return this.res.status(404).json({ message: "Event not found" })
      this.res.status(200).json({ message: "Event fetched successfully", event })
    } catch (error) {
      this.next(error)
    }
  }

  @Post({ path: "/" })
  async create() {
    try {
      const data = this.req.body
      const event = await this.eventRepository.save(data)
      const dateStr = new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]

      const query = new QueryBuilder()
        .raw(
          `UPDATE availability
           SET slots_remaining = GREATEST(0, slots_remaining - ?)
           WHERE date = ? 
         AND start_time >= ? 
         AND start_time < ?`,
          [event.simulators_count, dateStr, event.start_time, event.end_time]
        )
      await query.execute()

      const members = await this.userRepository.findAll()
      const activeMembers = members.filter((u: any) => u.is_member === true || u.is_member === 1)

      if (activeMembers.length > 0) {
        const transporter = nodemailer.createTransport({
          host: process.env.MAILER_HOST,
          port: Number(process.env.MAILER_PORT),
          secure: false,
          auth: {
            user: process.env.MAILER_USER,
            pass: process.env.MAILER_PASS
          }
        })

        const accessLabel = event.access === "members" ? "Événement exclusif membres" : "Événement ouvert à tous"
        const dateFormatted = new Date(event.date).toLocaleDateString("fr-FR", {
          timeZone: "Europe/Paris",
          day: "numeric",
          month: "long",
          year: "numeric"
        })

        for (const member of activeMembers) {
          await transporter.sendMail({
            from: process.env.MAILER_SENDER,
            to: member.email,
            subject: `🏁 Nouvel événement Elsass SimRacing — ${event.title}`,
            html: `
              <html>
                <body style="font-family: sans-serif; background: #1a1a1a; color: #f8f8f8; padding: 40px;">
                  <div style="max-width: 600px; margin: 0 auto; background: #242424; border-radius: 12px; padding: 32px;">
                    <h1 style="color: #00b2ff; font-size: 22px; margin-bottom: 8px;">Nouvel événement !</h1>
                    <h2 style="font-size: 18px; margin-bottom: 16px;">${event.title}</h2>
                    <p style="color: #aaa; margin-bottom: 8px;">${accessLabel}</p>
                    <p style="color: #aaa; margin-bottom: 8px;">📅 ${dateFormatted}</p>
                    <p style="color: #aaa; margin-bottom: 8px;">🕐 ${event.start_time} — ${event.end_time}</p>
                    ${event.description ? `<p style="color: #f8f8f8; margin-top: 16px;">${event.description}</p>` : ""}
                    <a href="${process.env.CLIENT_APP_URL}/events" style="display: inline-block; margin-top: 24px; padding: 12px 24px; background: #00b2ff; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 600;">
                        Voir l'événement
                    </a>
                  </div>
                </body>
              </html>
            `
          })
        }
      }

      this.res.status(201).json({ message: "Event created successfully", event })
    } catch (error) {
      this.next(error)
    }
  }

  @Put({ path: "/:event", resolve: { event: Event } })
  async update(event: Event) {
    try {
      const data = this.req.body
      Object.assign(event, data)
      const updatedEvent = await this.eventRepository.save(event)
      this.res.status(200).json({ message: "Event updated successfully", updatedEvent })
    } catch (error) {
      this.next(error)
    }
  }

  @Delete({ path: "/:event", resolve: { event: Event } })
  async delete(event: Event) {
    try {
      if (!event?.id) {
        return this.res.status(400).json({ message: "Invalid Event id" })
      }
      const dateStr = new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]

      // Restaurer les slots
      const slotsQuery = new QueryBuilder()
        .raw(
          `UPDATE availability 
         SET slots_remaining = LEAST(slots_total, slots_remaining + ?)
         WHERE date = ? 
         AND start_time >= ? 
         AND start_time < ?`,
          [event.simulators_count, dateStr, event.start_time, event.end_time]
        )
      await slotsQuery.execute()

      // Supprimer les orderdetails liés aux bookings de l'event
      await new QueryBuilder()
        .raw(
          `DELETE od FROM orderdetails od
         INNER JOIN booking b ON od.booking_id = b.id
         WHERE b.event_id = ?`,
          [event.id]
        )
        .execute()

      // Supprimer les bookings liés à l'event
      await new QueryBuilder()
        .raw(`DELETE FROM booking WHERE event_id = ?`, [event.id])
        .execute()

      await this.eventRepository.delete(event.id)
      this.res.status(200).json({ message: "Event deleted successfully" })
    } catch (error) {
      this.next(error)
    }
  }
}
