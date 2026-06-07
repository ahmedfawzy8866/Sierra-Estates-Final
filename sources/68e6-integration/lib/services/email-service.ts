/**
 * sierra estates — EMAIL SERVICE
 * Sends transactional emails for confirmations, proposals, and notifications.
 * Integrates with SendGrid or resend.dev
 */

interface EmailConfig {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  attachments?: { filename: string; content: Buffer }[];
}

export class EmailService {
  private static SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  private static FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@sierraestates.luxury';
  private static RESEND_API_KEY = process.env.RESEND_API_KEY;

  /**
   * Send a transactional email using SendGrid or Resend.
   */
  static async sendEmail(config: EmailConfig): Promise<boolean> {
    const provider = this.RESEND_API_KEY ? 'resend' : this.SENDGRID_API_KEY ? 'sendgrid' : null;

    if (!provider) {
      console.warn('[EmailService] No email provider configured (SENDGRID_API_KEY or RESEND_API_KEY). Email not sent.');
      return false;
    }

    if (provider === 'resend') {
      return this.sendViaResend(config);
    } else {
      return this.sendViaSendGrid(config);
    }
  }

  /**
   * Send email via SendGrid.
   */
  private static async sendViaSendGrid(config: EmailConfig): Promise<boolean> {
    if (!this.SENDGRID_API_KEY) return false;

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: config.to }],
              subject: config.subject,
            },
          ],
          from: { email: config.from || this.FROM_EMAIL },
          content: [
            {
              type: 'text/html',
              value: config.html,
            },
          ],
          reply_to: config.replyTo ? { email: config.replyTo } : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('[EmailService] SendGrid error:', error);
        return false;
      }

      console.log(`[EmailService] Email sent to ${config.to} via SendGrid`);
      return true;
    } catch (error: any) {
      console.error('[EmailService] SendGrid send error:', error.message);
      return false;
    }
  }

  /**
   * Send email via Resend.
   */
  private static async sendViaResend(config: EmailConfig): Promise<boolean> {
    if (!this.RESEND_API_KEY) return false;

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: config.from || this.FROM_EMAIL,
          to: config.to,
          subject: config.subject,
          html: config.html,
          reply_to: config.replyTo,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('[EmailService] Resend error:', error);
        return false;
      }

      console.log(`[EmailService] Email sent to ${config.to} via Resend`);
      return true;
    } catch (error: any) {
      console.error('[EmailService] Resend send error:', error.message);
      return false;
    }
  }

  /**
   * Send a proposal email with PDF attachment.
   */
  static async sendProposalEmail(
    investorEmail: string,
    investorName: string,
    proposalId: string,
    pdfBuffer?: Buffer
  ): Promise<boolean> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>Your Investment Proposal from Sierra Estates</h2>
        <p>Dear ${investorName},</p>
        <p>We're excited to present your personalized investment proposal.</p>
        <p><strong>Proposal ID:</strong> ${proposalId}</p>
        <p>Please find your detailed analysis attached. Your proposal is valid for 30 days.</p>
        <p>To schedule a consultation or discuss next steps, reply to this email or contact our concierge team.</p>
        <p style="margin-top: 30px; color: #999; font-size: 12px;">
          Sierra Estates Realty | Ultra-Cinematic Asset Intelligence<br/>
          Cairo, Egypt | +20 10 61399688
        </p>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: investorEmail,
      subject: `Your Investment Proposal - Sierra Estates Realty [${proposalId}]`,
      html: htmlContent,
      attachments: pdfBuffer ? [{ filename: `proposal-${proposalId}.pdf`, content: pdfBuffer }] : undefined,
    });
  }

  /**
   * Send a viewing confirmation email.
   */
  static async sendViewingConfirmation(
    investorEmail: string,
    investorName: string,
    propertyTitle: string,
    viewingDate: string,
    viewingTime: string
  ): Promise<boolean> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>Viewing Confirmation</h2>
        <p>Dear ${investorName},</p>
        <p>Your property viewing has been scheduled:</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>${propertyTitle}</strong></p>
          <p>📅 <strong>Date:</strong> ${viewingDate}</p>
          <p>🕐 <strong>Time:</strong> ${viewingTime}</p>
        </div>
        <p>Our team will meet you at the property. If you need to reschedule, please contact us at least 24 hours in advance.</p>
        <p style="margin-top: 30px; color: #999; font-size: 12px;">
          Sierra Estates Realty | +20 10 61399688
        </p>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: investorEmail,
      subject: `Viewing Confirmation: ${propertyTitle}`,
      html: htmlContent,
    });
  }

  /**
   * Send a closing reminder email.
   */
  static async sendClosingReminder(
    investorEmail: string,
    investorName: string,
    propertyTitle: string,
    closingDate: string,
    escrowAmount: number
  ): Promise<boolean> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>Closing Reminder - ${propertyTitle}</h2>
        <p>Dear ${investorName},</p>
        <p>Your property purchase is moving to closing stage.</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Property:</strong> ${propertyTitle}</p>
          <p><strong>Closing Date:</strong> ${closingDate}</p>
          <p><strong>Escrow Amount:</strong> EGP ${escrowAmount.toLocaleString()}</p>
        </div>
        <p>Our legal team will be in touch with final documents and timeline.</p>
        <p style="margin-top: 30px; color: #999; font-size: 12px;">
          Sierra Estates Realty | Legal & Closing Team
        </p>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: investorEmail,
      subject: `Closing Reminder: ${propertyTitle}`,
      html: htmlContent,
    });
  }
}
