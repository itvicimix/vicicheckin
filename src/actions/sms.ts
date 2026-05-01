'use server';

import twilio from 'twilio';
import { getSystemSettings } from './settings';

/**
 * Send SMS to one or more customers using Twilio.
 * Configuration is fetched from SystemSettings managed by Super Admin.
 */
export async function sendSMSPromotion(message: string, recipients: string[]) {
  try {
    const settings = await getSystemSettings();
    
    if (!settings || !settings.twilioSid || !settings.twilioAuthToken || !settings.twilioPhone) {
      return {
        success: false,
        error: 'System has not configured Twilio credentials. Please contact Super Admin.',
      };
    }

    const accountSid = settings.twilioSid.trim();
    const authToken = settings.twilioAuthToken.trim();
    const fromNumber = settings.twilioPhone.trim();

    const client = twilio(accountSid, authToken);

    const results = await Promise.allSettled(
      recipients.map(async (to) => {
        // Can format phone number here before sending
        const messageResponse = await client.messages.create({
          body: message,
          from: fromNumber,
          to,
        });
        return messageResponse.sid;
      })
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;
    
    // If all fail, report clearer error from Twilio API
    if (failed > 0 && successful === 0) {
       const firstError = results.find((r) => r.status === 'rejected') as PromiseRejectedResult;
       return {
         success: false,
         error: firstError.reason?.message || 'Error sending SMS from Twilio (e.g. wrong phone number or bad config)',
       };
    }

    return {
      success: true,
      message: `Successfully sent ${successful} messages. ${failed > 0 ? `${failed} messages failed.` : ''}`,
      details: {
        successful,
        failed,
      },
    };
  } catch (error: any) {
    console.error('Error sending Twilio SMS:', error);
    return {
      success: false,
      error: error.message || 'Error sending SMS (Twilio config might be malformed)',
    };
  }
}

/**
 * Send a single SMS message.
 */
export async function sendSMS(to: string, message: string) {
  try {
    const settings = await getSystemSettings();
    if (!settings || !settings.twilioSid || !settings.twilioAuthToken || !settings.twilioPhone) {
      return { success: false, error: 'Twilio settings not configured' };
    }

    const client = twilio(settings.twilioSid, settings.twilioAuthToken);
    const result = await client.messages.create({
      body: message,
      from: settings.twilioPhone,
      to,
    });

    return { success: true, sid: result.sid };
  } catch (error: any) {
    console.error('Error sending single SMS:', error);
    return { success: false, error: error.message };
  }
}

