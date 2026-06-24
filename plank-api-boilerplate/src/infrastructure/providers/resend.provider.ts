import { Resend } from 'resend';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface IResendProvider {
  sendEmail(options: SendEmailOptions): Promise<void>;
}

export class ResendProvider implements IResendProvider {
  private readonly client: Resend;

  constructor() {
    this.client = new Resend(process.env.RESEND_API_KEY);
  }

  async sendEmail({ to, subject, html, from = 'noreply@example.com' }: SendEmailOptions): Promise<void> {
    const { error } = await this.client.emails.send({ from, to, subject, html });
    if (error) throw new Error(`Resend error: ${error.message}`);
  }
}
