import { Controller, /*Mail,*/ Post, Route } from "@lyra-js/core"
import nodemailer from "nodemailer";

@Route({ path: "/contact" })
export class MailController extends Controller {
  @Post({ path: "/mail" })
  /*async sendContactMail() {
    try {
      const { firstname, lastname, email, phone, message } = this.req.body
      const mail = new Mail(
        "zaugjulien@gmail.com",
        "Nouveau message test depuis elsass-simracing.fr",
        `
          <html>
            <body>
                <p>Message de: ${firstname} ${lastname}</p>
                <p>Adresse de contact: ${email}</p>
                <p>Numéro de tel: ${phone}</p>
                <p>Message :</p>
                <p>${message}</p>
            </body>
          </html>
        `,
        []
      )

      console.log(mail)
      console.log("MAILER_USER:", process.env.MAILER_USER)
      console.log("MAILER_PASS:", process.env.MAILER_PASS ? "défini" : "vide")

      await this.mailer.send(mail)

      return this.res.status(200).json({ message: "Contact Mail sent" })
    } catch (error) {
      console.error(error)
      this.next(error)
    }
  }*/
  async sendContactMail() {
    try {
      const { firstname, lastname, email, phone, subject, message } = this.req.body

      const transporter = nodemailer.createTransport({
        host: process.env.MAILER_HOST,
        port: Number(process.env.MAILER_PORT),
        secure: false,
        auth: {
          user: process.env.MAILER_USER,
          pass: process.env.MAILER_PASS,
        },
      })

      await transporter.sendMail({
        from: process.env.MAILER_SENDER,
        to: "elsass.simracing@gmail.com",
        subject: "Nouveau message depuis elsass-simracing.fr",
        html: `
          <html>
            <body>
                <p>Message de: ${firstname} ${lastname}</p>
                <p>Adresse de contact: ${email}</p>
                <p>Numéro de tel: <a href="tel:${phone}">${phone}</a></p>
                <p>Objet: ${subject}</p>
                <p>Message :</p>
                <p>${message}</p>
            </body>
          </html>
        `,
      })

      return this.res.status(200).json({ message: "Contact Mail sent" })
    } catch (error) {
      console.error(error)
      this.next(error)
    }
  }
}