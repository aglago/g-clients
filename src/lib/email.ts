import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail({ to, subject, html, text }: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject,
        html,
        text,
      });
      console.log(`Email sent successfully to ${to}`);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendVerificationEmail(email: string, token: string, firstName: string): Promise<void> {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}`;
    
    const html = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #333; text-align: center;">Welcome to ProjectOne!</h2>
        <p>Hi ${firstName},</p>
        <p>Thank you for registering with ProjectOne. Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #007bff;">${verificationUrl}</p>
        <p>This verification link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          This email was sent from ProjectOne. Please do not reply to this email.
        </p>
      </div>
    `;

    const text = `
      Welcome to ProjectOne!
      
      Hi ${firstName},
      
      Thank you for registering with ProjectOne. Please visit the following link to verify your email address:
      
      ${verificationUrl}
      
      This verification link will expire in 24 hours.
      
      If you didn't create an account, please ignore this email.
    `;

    await this.sendEmail({
      to: email,
      subject: 'Verify Your Email Address - ProjectOne',
      html,
      text,
    });
  }

  async sendPasswordResetEmail(email: string, token: string, firstName: string): Promise<void> {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
    
    const html = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
        <p>Hi ${firstName},</p>
        <p>We received a request to reset your password for your ProjectOne account. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #dc3545;">${resetUrl}</p>
        <p>This password reset link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          This email was sent from ProjectOne. Please do not reply to this email.
        </p>
      </div>
    `;

    const text = `
      Reset Your Password
      
      Hi ${firstName},
      
      We received a request to reset your password for your ProjectOne account. Please visit the following link to reset your password:
      
      ${resetUrl}
      
      This password reset link will expire in 1 hour.
      
      If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
    `;

    await this.sendEmail({
      to: email,
      subject: 'Reset Your Password - ProjectOne',
      html,
      text,
    });
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/login`;
    
    const html = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #333; text-align: center;">Welcome to ProjectOne!</h2>
        <p>Hi ${firstName},</p>
        <p>Your email has been successfully verified! Welcome to ProjectOne - your gateway to professional learning and development.</p>
        <p>You can now access all our features:</p>
        <ul style="color: #333;">
          <li>Browse and enroll in courses</li>
          <li>Track your learning progress</li>
          <li>Access learning tracks</li>
          <li>Manage your profile</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" 
             style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Start Learning
          </a>
        </div>
        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          This email was sent from ProjectOne. Please do not reply to this email.
        </p>
      </div>
    `;

    const text = `
      Welcome to ProjectOne!
      
      Hi ${firstName},
      
      Your email has been successfully verified! Welcome to ProjectOne - your gateway to professional learning and development.
      
      You can now access all our features:
      - Browse and enroll in courses
      - Track your learning progress
      - Access learning tracks
      - Manage your profile
      
      Visit: ${loginUrl}
      
      If you have any questions or need assistance, please don't hesitate to contact our support team.
    `;

    await this.sendEmail({
      to: email,
      subject: 'Welcome to ProjectOne!',
      html,
      text,
    });
  }
}

export const emailService = new EmailService();