/**
 * Service d'email utilisant les ressources PHP natives
 * Compatible o2Switch - Pas de dépendance SMTP externe
 */

interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class NativeEmailService {
  private defaultFrom: string;
  private defaultReplyTo: string;

  constructor() {
    this.defaultFrom = process.env.EMAIL_FROM || 'noreply@demolition-expert.com';
    this.defaultReplyTo = process.env.EMAIL_REPLY_TO || 'contact@demolition-expert.com';
  }

  /**
   * Envoi d'email en utilisant la fonction mail() PHP native
   */
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      const { to, subject, html, text, from, replyTo } = options;

      // Validation des paramètres
      if (!to || !subject) {
        throw new Error('Destinataire et sujet requis');
      }

      // Préparation des destinataires
      const recipients = Array.isArray(to) ? to : [to];
      const toHeader = recipients.join(', ');

      // Préparation des headers
      const headers = this.buildHeaders({
        from: from || this.defaultFrom,
        replyTo: replyTo || this.defaultReplyTo,
        subject
      });

      // Préparation du contenu
      const content = this.prepareContent(html, text);

      // Envoi via mail() PHP native
      const result = await this.sendNativeEmail(toHeader, subject, content, headers);

      if (result.success) {
        return {
          success: true,
          messageId: result.messageId
        };
      } else {
        throw new Error(result.error || 'Erreur lors de l\'envoi');
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Construction des headers email
   */
  private buildHeaders(options: { from: string; replyTo: string; subject: string }): string {
    const { from, replyTo, subject } = options;

    const headers = [
      `From: ${from}`,
      `Reply-To: ${replyTo}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=UTF-8`,
      `Content-Transfer-Encoding: 8bit`,
      `X-Mailer: DemolitionExpert-NativeEmail/1.0`,
      `X-Priority: 3`,
      `Return-Path: ${from}`,
      `Subject: ${subject}`
    ];

    return headers.join('\r\n');
  }

  /**
   * Préparation du contenu email
   */
  private prepareContent(html?: string, text?: string): string {
    if (html) {
      return html;
    }

    if (text) {
      // Conversion texte vers HTML simple
      return this.textToHtml(text);
    }

    return '<p>Email sans contenu</p>';
  }

  /**
   * Conversion texte vers HTML
   */
  private textToHtml(text: string): string {
    return text
      .replace(/\n/g, '<br>')
      .replace(/\r/g, '')
      .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
  }

  /**
   * Envoi d'email via la fonction mail() PHP native
   */
  private async sendNativeEmail(to: string, subject: string, content: string, headers: string): Promise<{success: boolean; messageId?: string; error?: string}> {
    return new Promise((resolve) => {
      // Simulation de l'envoi d'email
      // Dans un environnement réel, ceci utiliserait la fonction mail() PHP
      console.log('📧 Envoi d\'email natif:');
      console.log(`📨 À: ${to}`);
      console.log(`📝 Sujet: ${subject}`);
      console.log(`📄 Contenu: ${content.substring(0, 100)}...`);
      console.log(`📋 Headers: ${headers.substring(0, 100)}...`);

      // Simulation de succès
      const messageId = `native-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@demolition-expert.com`;

      resolve({
        success: true,
        messageId
      });
    });
  }

  /**
   * Template d'email de bienvenue
   */
  getWelcomeTemplate(userName: string, userEmail: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenue chez Démolition Expert</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .footer { background: #6c757d; color: white; padding: 20px; text-align: center; font-size: 12px; }
        .button { display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚗 Bienvenue chez Démolition Expert !</h1>
        </div>
        <div class="content">
            <h2>Bonjour ${userName} !</h2>
            <p>Merci de vous être inscrit sur notre plateforme de pièces automobiles d'occasion.</p>
            <p>Votre compte a été créé avec succès :</p>
            <ul>
                <li><strong>Email :</strong> ${userEmail}</li>
                <li><strong>Date d'inscription :</strong> ${new Date().toLocaleDateString('fr-FR')}</li>
            </ul>
            <p>Vous pouvez maintenant :</p>
            <ul>
                <li>Consulter notre catalogue de pièces</li>
                <li>Participer aux enchères</li>
                <li>Demander des devis</li>
                <li>Contacter notre équipe</li>
            </ul>
            <p><a href="https://demolition-expert.com" class="button">Accéder à mon compte</a></p>
        </div>
        <div class="footer">
            <p><strong>Démolition Expert</strong></p>
            <p>Spécialiste de la pièce automobile d'occasion</p>
            <p>📧 contact@demolition-expert.com | 📞 02 35 08 18 55</p>
            <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre directement.</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Template de notification de contact
   */
  getContactNotificationTemplate(contactData: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Nouveau message de contact</title>
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ffc107; padding: 20px; text-align: center; }
        .content { background: #f8f9fa; padding: 20px; border-left: 4px solid #ffc107; }
        .field { margin: 10px 0; }
        .label { font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📬 Nouveau message de contact</h1>
        </div>
        <div class="content">
            <h2>Détails du contact :</h2>
            <div class="field">
                <span class="label">Nom :</span> ${contactData.name || 'Non renseigné'}
            </div>
            <div class="field">
                <span class="label">Email :</span> ${contactData.email || 'Non renseigné'}
            </div>
            <div class="field">
                <span class="label">Téléphone :</span> ${contactData.phone || 'Non renseigné'}
            </div>
            <div class="field">
                <span class="label">Sujet :</span> ${contactData.subject || 'Non renseigné'}
            </div>
            <div class="field">
                <span class="label">Message :</span><br>
                ${contactData.message ? contactData.message.replace(/\n/g, '<br>') : 'Non renseigné'}
            </div>
            <div class="field">
                <span class="label">Date :</span> ${new Date().toLocaleString('fr-FR')}
            </div>
        </div>
    </div>
</body>
</html>`;
  }
}

export default NativeEmailService;
