import mysql from "mysql2/promise"
import nodemailer from "nodemailer"
import QRCode from "qrcode"
import { randomBytes } from "crypto"

// ============================================================
// CONFIGURATION — remplace par les vraies valeurs prod
// ============================================================
const DB_CONFIG = {
  host: "temp-mariadb",
  port: 3306,
  user: "elsass_simracing",
  password: "PqV0B7hSldfyGTcirCwjO4dNl3N1ggm",
  database: "elsass_simracing",
}

const MAILER_CONFIG = {
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "elsass.simracing@gmail.com",
    pass: "tlveikjtkyafqaiy",
  },
}

const MAILER_SENDER = "elsass.simracing@gmail.com"
const CLIENT_APP_URL = "https://elsass-simracing.fr/"

// IDs des subscriptions à rattraper — à remplir
const SUBSCRIPTION_IDS = [
  2, 3, 4, 5
]

const PLAN_FREE_SESSIONS = {
  STARTER: 2,
  PLUS: 4,
  ULTRA: 8,
}
// ============================================================

const db = await mysql.createConnection(DB_CONFIG)
const transporter = nodemailer.createTransport(MAILER_CONFIG)

for (const subId of SUBSCRIPTION_IDS) {
  console.log(`\n--- Traitement subscription ${subId} ---`)

  // 1. Récupérer la subscription
  const [subRows] = await db.execute(
    `SELECT s.*, u.email, u.firstname, u.lastname 
     FROM subscription s
     JOIN user u ON u.id = s.user_id
     WHERE s.id = ?`,
    [subId]
  )

  if (!subRows.length) {
    console.log(`Subscription ${subId} introuvable, on passe.`)
    continue
  }

  const sub = subRows[0]
  const plan = sub.plan
  const sessionCount = PLAN_FREE_SESSIONS[plan]

  if (!sessionCount) {
    console.log(`Plan inconnu : ${plan}, on passe.`)
    continue
  }

  console.log(`User: ${sub.firstname} ${sub.lastname} (${sub.email}) — Plan: ${plan} — Sessions: ${sessionCount}`)

  // 2. Générer les tokens QR en DB
  const qrBuffers = []
  for (let i = 0; i < sessionCount; i++) {
    const qrToken = randomBytes(32).toString("hex")
    await db.execute(
      `INSERT INTO free_session_token (qr_token, is_used, created_at, sub_id) VALUES (?, false, NOW(), ?)`,
      [qrToken, subId]
    )
    const buffer = await QRCode.toBuffer(qrToken, { width: 300, margin: 2 })
    qrBuffers.push({ buffer, index: i + 1 })
    console.log(`Token ${i + 1}/${sessionCount} généré`)
  }

  // 3. Mettre à jour free_sessions_remaining
  await db.execute(
    `UPDATE subscription SET free_sessions_remaining = ? WHERE id = ?`,
    [sessionCount, subId]
  )

  // 4. Envoyer le mail
  await transporter.sendMail({
    from: MAILER_SENDER,
    to: sub.email,
    subject: `Renouvellement abonnement — Vos nouvelles sessions gratuites`,
    attachments: qrBuffers.map((qr) => ({
      filename: `session-gratuite-${qr.index}.png`,
      content: qr.buffer,
      contentType: "image/png",
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
              <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 16px;">Bonjour ${sub.firstname} ${sub.lastname},</h2>
              <p style="color: #cccccc; line-height: 1.6; margin: 0 0 24px;">
                Votre abonnement a été renouvelé. Vous trouverez en pièces jointes vos ${sessionCount} nouveaux QR codes de sessions gratuites. Les anciens QR codes ne sont plus valides.
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
                  <td style="padding: 10px 0; color: #00c764; text-align: right; font-weight: bold;">${sessionCount}</td>
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
    `,
  })

  console.log(`Mail envoyé à ${sub.email}`)
}

await db.end()
console.log("\nTerminé.")