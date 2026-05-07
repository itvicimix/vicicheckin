'use server';

import nodemailer from 'nodemailer';
import { getSystemSettings } from './settings';

export async function sendTestEmail(toEmail: string) {
  try {
    const settings = await getSystemSettings();
    
    if (!settings || !settings.smtpHost || !settings.smtpUser || !settings.smtpPass) {
      return { success: false, error: 'SMTP Settings are incomplete. Please check your Email Configuration.' };
    }

    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort || 465,
      secure: settings.smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPass,
      },
    });

    const mailOptions = {
      from: settings.smtpFrom || settings.smtpUser,
      to: toEmail,
      subject: 'Test Email from Nail Book 24/7',
      text: 'Hello!\n\nThis is a test email sent from the Nail Book 24/7 Super Admin dashboard to verify your SMTP configuration.\n\nIf you are reading this, your email configuration is working correctly!\n\nBest regards,\nNail Book 24/7 Team',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2563eb;">Hello!</h2>
          <p>This is a test email sent from the <strong>Nail Book 24/7</strong> Super Admin dashboard to verify your SMTP configuration.</p>
          <p>If you are reading this, your email configuration is <strong>working correctly!</strong> 🎉</p>
          <br/>
          <p>Best regards,<br/><strong>Nail Book 24/7 Team</strong></p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Error sending test email:', error);
    return { success: false, error: error.message };
  }
}

export async function sendCustomEmail(formData: FormData) {
  try {
    const toEmail = formData.get('toEmail') as string;
    const fromName = formData.get('fromName') as string || 'Admin';
    const subject = formData.get('subject') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const file = formData.get('file') as File | null;

    if (!toEmail || !subject) {
      return { success: false, error: 'Recipient email and subject are required.' };
    }

    const settings = await getSystemSettings();
    if (!settings || !settings.smtpHost || !settings.smtpUser || !settings.smtpPass) {
      return { success: false, error: 'SMTP Settings are incomplete. Please check your Email Configuration.' };
    }

    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort || 465,
      secure: settings.smtpPort === 465,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPass,
      },
    });

    const attachments = [];
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      attachments.push({
        filename: file.name,
        content: buffer,
        contentType: file.type,
      });
    }

    const senderEmail = settings.smtpFrom || settings.smtpUser;
    const fromString = `"${fromName}" <${senderEmail}>`;

    // Simple replacement of line breaks with <br> for the description
    const formattedDescription = description ? description.replace(/\n/g, '<br/>') : '';

    const mailOptions = {
      from: fromString,
      to: toEmail,
      subject: subject,
      text: `${title}\n\n${description}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          ${title ? `<h2 style="color: #2563eb;">${title}</h2>` : ''}
          <p>${formattedDescription}</p>
        </div>
      `,
      attachments: attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Error sending custom email:', error);
    return { success: false, error: error.message };
  }
}

export async function sendTrialApprovedEmail(data: {
  toEmail: string;
  businessName: string;
  username: string;
  password?: string;
  slug: string;
}) {
  try {
    const settings = await getSystemSettings();
    
    if (!settings || !settings.smtpHost || !settings.smtpUser || !settings.smtpPass) {
      return { success: false, error: 'SMTP Settings are incomplete. Cannot send email.' };
    }

    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort || 465,
      secure: settings.smtpPort === 465,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPass,
      },
    });

    // In a real environment, you might want to replace this with your actual domain
    const bookingLink = `https://nailbook247.com/${data.slug}`;
    const adminLink = `https://nailbook247.com/${data.slug}/admin`;

    const mailOptions = {
      from: `"Nail Book 24/7 Support" <${settings.smtpFrom || settings.smtpUser}>`,
      to: data.toEmail,
      subject: `Your Trial Request for ${data.businessName} has been Approved!`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2563eb;">Congratulations!</h2>
          <p>Your 30-day trial for <strong>${data.businessName}</strong> has been approved by the admin team.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">Your Credentials</h3>
            <p style="margin-bottom: 5px;"><strong>Username:</strong> ${data.username}</p>
            ${data.password ? `<p style="margin-top: 0;"><strong>Password:</strong> ${data.password}</p>` : ''}
          </div>

          <div style="background-color: #eef2ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">Important Links</h3>
            <p style="margin-bottom: 10px;">
              <strong>Booking Link (For Customers):</strong><br/>
              <a href="${bookingLink}" style="color: #2563eb; text-decoration: none;">${bookingLink}</a>
            </p>
            <p style="margin-top: 0;">
              <strong>Admin Dashboard (For You):</strong><br/>
              <a href="${adminLink}" style="color: #2563eb; text-decoration: none;">${adminLink}</a>
            </p>
          </div>

          <p>You can now log in to your admin dashboard, configure your services, staff, working hours, and start accepting bookings.</p>
          <p>Welcome aboard!</p>
          <br/>
          <p>Best regards,<br/><strong>Nail Book 24/7 Team</strong></p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
}

import { prisma } from '@/lib/prisma';

export async function sendNewTrialNotificationToAdmins(data: {
  businessName: string;
  fullName: string;
  email: string;
  phone: string;
  businessType: string;
}) {
  try {
    const settings = await getSystemSettings();
    if (!settings || !settings.smtpHost || !settings.smtpUser || !settings.smtpPass) {
      return { success: false, error: 'SMTP Settings are incomplete.' };
    }

    const superAdmins = await prisma.superAdminUser.findMany({
      select: { email: true }
    });

    if (!superAdmins.length) {
      return { success: false, error: 'No super admins found to notify.' };
    }

    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort || 465,
      secure: settings.smtpPort === 465,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPass,
      },
    });

    const superAdminLink = `https://nailbook247.com/super-admin/super-admin`;
    const adminEmails = superAdmins.map(admin => admin.email).join(', ');

    const mailOptions = {
      from: `"Nail Book 24/7 System" <${settings.smtpFrom || settings.smtpUser}>`,
      to: adminEmails,
      subject: `New Trial Request: ${data.businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #ea580c;">New Trial Request Received</h2>
          <p>A new salon has registered for a 30-day trial and is awaiting your approval.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">Registration Details</h3>
            <p style="margin-bottom: 5px;"><strong>Business Name:</strong> ${data.businessName}</p>
            <p style="margin-bottom: 5px;"><strong>Owner Name:</strong> ${data.fullName}</p>
            <p style="margin-bottom: 5px;"><strong>Email:</strong> ${data.email}</p>
            <p style="margin-bottom: 5px;"><strong>Phone:</strong> ${data.phone}</p>
            <p style="margin-top: 0;"><strong>Business Type:</strong> ${data.businessType}</p>
          </div>

          <p>Please review and approve this request in the Super Admin Dashboard:</p>
          <p>
            <a href="${superAdminLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold;">Go to Super Admin Dashboard</a>
          </p>
          
          <br/>
          <p>Best regards,<br/><strong>Nail Book 24/7 System</strong></p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Error sending admin notification email:', error);
    return { success: false, error: error.message };
  }
}
