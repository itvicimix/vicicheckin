'use server';

import twilio from 'twilio';
import { getSystemSettings } from './settings';

/**
 * Gửi SMS đến một hoặc nhiều khách hàng bằng Twilio.
 * Cấu hình được lấy từ bảng SystemSettings do Super Admin quản lý.
 */
export async function sendSMSPromotion(message: string, recipients: string[]) {
  try {
    const settings = await getSystemSettings();
    
    if (!settings || !settings.twilioSid || !settings.twilioAuthToken || !settings.twilioPhone) {
      return {
        success: false,
        error: 'Hệ thống chưa cấu hình thông tin xác thực Twilio. Vui lòng liên hệ Super Admin.',
      };
    }

    const accountSid = settings.twilioSid.trim();
    const authToken = settings.twilioAuthToken.trim();
    const fromNumber = settings.twilioPhone.trim();

    const client = twilio(accountSid, authToken);

    const results = await Promise.allSettled(
      recipients.map(async (to) => {
        // Có thể format lại số điện thoại (VD: thêm +84 nếu ở VN) ở đây trước khi gửi
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
    
    // Nếu tất cả đều thất bại, báo lỗi rõ hơn từ Twilio API
    if (failed > 0 && successful === 0) {
       const firstError = results.find((r) => r.status === 'rejected') as PromiseRejectedResult;
       return {
         success: false,
         error: firstError.reason?.message || 'Lỗi gửi tin nhắn từ Twilio (ví dụ: sai số ĐT hoặc sai cấu hình)',
       };
    }

    return {
      success: true,
      message: `Đã gửi thành công ${successful} tin nhắn. ${failed > 0 ? `${failed} tin thất bại.` : ''}`,
      details: {
        successful,
        failed,
      },
    };
  } catch (error: any) {
    console.error('Lỗi khi gửi SMS Twilio:', error);
    return {
      success: false,
      error: error.message || 'Có lỗi xảy ra khi gửi SMS (Có thể cấu hình Twilio sai định dạng)',
    };
  }
}

/**
 * Gửi một tin nhắn SMS đơn lẻ.
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

