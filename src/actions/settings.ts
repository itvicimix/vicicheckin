'use server';

import { prisma } from "@/lib/prisma";

export async function getSystemSettings() {
  try {
    let settings = await prisma.systemSettings.findUnique({
      where: { id: 'global' },
    });

    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          id: 'global',
        },
      });
    }

    return settings;
  } catch (error) {
    console.error('Lỗi khi lấy SystemSettings:', error);
    return null;
  }
}

export async function updateTwilioSettings(data: { twilioSid: string; twilioAuthToken: string; twilioPhone: string }) {
  try {
    const settings = await prisma.systemSettings.upsert({
      where: { id: 'global' },
      update: {
        twilioSid: data.twilioSid,
        twilioAuthToken: data.twilioAuthToken,
        twilioPhone: data.twilioPhone,
      },
      create: {
        id: 'global',
        twilioSid: data.twilioSid,
        twilioAuthToken: data.twilioAuthToken,
        twilioPhone: data.twilioPhone,
      },
    });
    return { success: true, settings };
  } catch (error: any) {
    console.error('Lỗi khi cập nhật SystemSettings:', error);
    return { success: false, error: error.message };
  }
}
