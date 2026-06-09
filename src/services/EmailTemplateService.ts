export class EmailTemplateService {
  static subscriptionRenewalMail(
    userFirstname: string,
    userLastname: string,
    activePlan: string,
    freeSessions: number
  ) {
    return `
      <html>
        <body style="margin: 0; padding: 0; background-color: #0a0a14; font-family: Arial, sans-serif; color: #ffffff;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #245E97; font-size: 28px; margin: 0;">ELSASS SIMRACING</h1>
              <p style="color: #aaaaaa; margin: 8px 0 0;">Renouvellement de votre abonnement</p>
            </div>
            <div style="background-color: #1a1a2a; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
              <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 16px;">Bonjour ${userFirstname} ${userLastname},</h2>
              <p style="color: #cccccc; line-height: 1.6; margin: 0 0 24px;">
                Votre abonnement a été renouvelé. Vous trouverez en pièces jointes vos ${freeSessions} nouveaux QR codes de sessions gratuites. Les anciens QR codes ne sont plus valides.
              </p>
            </div>
            <div style="background-color: #1a1a2a; border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #00c764;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #2a2a3a;">
                  <td style="padding: 10px 0; color: #aaaaaa;">Plan</td>
                  <td style="padding: 10px 0; color: #ffffff; text-align: right; font-weight: bold;">${activePlan}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #aaaaaa;">Sessions gratuites rechargées</td>
                  <td style="padding: 10px 0; color: #00c764; text-align: right; font-weight: bold;">${freeSessions}</td>
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
  }

  static subscriptionCreatedMail(
    userFirstname: string,
    userLastname: string,
    plan: string,
    freeSessions: number,
    skipFreeSessionGeneration: boolean
  ) {
    return `
    <html>
      <body style="margin: 0; padding: 0; background-color: #0a0a14; font-family: Arial, sans-serif; color: #ffffff;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #245E97; font-size: 28px; margin: 0;">ELSASS SIMRACING</h1>
            <p style="color: #aaaaaa; margin: 8px 0 0;">Votre abonnement ${plan}</p>
          </div>
          <div style="background-color: #1a1a2a; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
            <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 16px;">Bonjour ${userFirstname} ${userLastname},</h2>
            <p style="color: #cccccc; line-height: 1.6; margin: 0 0 24px;">
              ${
      skipFreeSessionGeneration
        ? `Bienvenue ! Votre abonnement a bien été activé. Vos sessions gratuites seront disponibles à partir du prochain cycle de facturation.`
        : `Bienvenue ! Vous trouverez en pièces jointes vos ${freeSessions} QR codes de sessions gratuites. Chaque QR code est nominatif et à usage unique — présentez-en un à l'accueil pour chaque session gratuite.`
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
                  ${skipFreeSessionGeneration ? "0 (réabonnement récent)" : freeSessions}
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
  }

  static bookingConfirmationMail(
    userFirstname: string,
    userLastname: string,
    orderNumber: number,
    dateFormatted: string,
    startTime: string,
    durationMinutes: number,
    pilots: number,
    amount: number,
    discountCode: string | null,
    clientAppUrl: string
  ) {
    return `
    <html>
      <body style="margin: 0; padding: 0; background-color: #0a0a14; font-family: Arial, sans-serif; color: #ffffff;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #245E97; font-size: 28px; margin: 0;">ELSASS SIMRACING</h1>
            <p style="color: #aaaaaa; margin: 8px 0 0;">Confirmation de réservation</p>
          </div>
          <div style="background-color: #1a1a2a; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
            <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 24px;">Bonjour ${userFirstname} ${userLastname},</h2>
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
                <td style="padding: 12px 0; color: #ffffff; text-align: right;">${startTime}</td>
              </tr>
              <tr style="border-bottom: 1px solid #2a2a3a;">
                <td style="padding: 12px 0; color: #aaaaaa;">Durée</td>
                <td style="padding: 12px 0; color: #ffffff; text-align: right;">${durationMinutes} minutes</td>
              </tr>
              <tr style="border-bottom: 1px solid #2a2a3a;">
                <td style="padding: 12px 0; color: #aaaaaa;">Nombre de pilotes</td>
                <td style="padding: 12px 0; color: #ffffff; text-align: right;">${pilots}</td>
              </tr>
              ${discountCode ? `
              <tr style="border-bottom: 1px solid #2a2a3a;">
                <td style="padding: 12px 0; color: #aaaaaa;">Code de réduction</td>
                <td style="padding: 12px 0; color: #00c764; text-align: right; font-weight: bold;">${discountCode}</td>
              </tr>
              ` : ""}
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
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${clientAppUrl}/order/success"
              style="display: inline-block; background-color: #245E97; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: bold;">
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
              <a href="${clientAppUrl}/cgv" style="color: #245E97;">CGV</a>
              et notre <a href="${clientAppUrl}/politique-confidentialite" style="color: #245E97;">politique de confidentialité</a>.
            </p>
          </div>
        </div>
      </body>
    </html>
  `
  }

  static giftVoucherMail(
    userFirstname: string,
    userLastname: string,
    orderNumber: number,
    giftVoucherMails: { recipientName: string; sessionLabel: string }[]
  ) {
    return `
    <html>
      <body style="margin: 0; padding: 0; background-color: #0a0a14; font-family: Arial, sans-serif; color: #ffffff;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #245E97; font-size: 28px; margin: 0;">ELSASS SIMRACING</h1>
            <p style="color: #aaaaaa; margin: 8px 0 0;">Vos bons cadeaux</p>
          </div>
          <div style="background-color: #1a1a2a; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
            <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 16px;">Bonjour ${userFirstname} ${userLastname},</h2>
            <p style="color: #cccccc; line-height: 1.6; margin: 0 0 24px;">
              Votre commande N°${orderNumber} a bien été confirmée. Vous trouverez en pièces jointes les QR codes de vos bons cadeaux, à transmettre à leurs destinataires.
            </p>
            <table style="width: 100%; border-collapse: collapse;">
              ${giftVoucherMails.map((gv, index) => `
                <tr style="border-bottom: 1px solid #2a2a3a;">
                  <td style="padding: 10px 0; color: #aaaaaa;">Bon ${index + 1}</td>
                  <td style="padding: 10px 0; color: #ffffff; text-align: right;">${gv.recipientName} — ${gv.sessionLabel}</td>
                </tr>
              `).join("")}
            </table>
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
  }

  static eventBookingMail(
    userFirstname: string,
    userLastname: string,
    orderNumber: number,
    amount: number
  ) {
    return `
    <html>
      <body style="margin: 0; padding: 0; background-color: #0a0a14; font-family: Arial, sans-serif; color: #ffffff;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #245E97; font-size: 28px; margin: 0;">ELSASS SIMRACING</h1>
            <p style="color: #aaaaaa; margin: 8px 0 0;">Confirmation d'inscription événement</p>
          </div>
          <div style="background-color: #1a1a2a; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
            <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 16px;">Bonjour ${userFirstname} ${userLastname},</h2>
            <p style="color: #cccccc; line-height: 1.6; margin: 0 0 24px;">Votre inscription a bien été confirmée. Voici le récapitulatif :</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #2a2a3a;">
                <td style="padding: 12px 0; color: #aaaaaa;">Numéro de commande</td>
                <td style="padding: 12px 0; color: #ffffff; text-align: right; font-weight: bold;">N°${orderNumber}</td>
              </tr>
              <tr style="border-bottom: 1px solid #2a2a3a;">
                <td style="padding: 12px 0; color: #aaaaaa;">Montant payé</td>
                <td style="padding: 12px 0; color: #245E97; text-align: right; font-weight: bold; font-size: 18px;">${amount.toFixed(2)} €</td>
              </tr>
            </table>
          </div>
          <div style="background-color: #1a1a2a; border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #245E97;">
            <h3 style="color: #ffffff; font-size: 15px; margin: 0 0 12px;">Votre QR code</h3>
            <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 0;">
              Votre QR code d'inscription est joint à cet email. Présentez-le à l'accueil le jour de l'événement.
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
        </div>
      </body>
    </html>
  `
  }
}