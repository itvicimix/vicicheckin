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
    console.error('Error fetching SystemSettings:', error);
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
    console.error('Error updating SystemSettings:', error);
    return { success: false, error: error.message };
  }
}

export async function updateSMSTemplates(data: { pendingSmsTemplate: string; approvedSmsTemplate: string; rejectedSmsTemplate: string }) {
  try {
    const settings = await prisma.systemSettings.upsert({
      where: { id: 'global' },
      update: {
        pendingSmsTemplate: data.pendingSmsTemplate,
        approvedSmsTemplate: data.approvedSmsTemplate,
        rejectedSmsTemplate: data.rejectedSmsTemplate,
      },
      create: {
        id: 'global',
        pendingSmsTemplate: data.pendingSmsTemplate,
        approvedSmsTemplate: data.approvedSmsTemplate,
        rejectedSmsTemplate: data.rejectedSmsTemplate,
      },
    });
    return { success: true, settings };
  } catch (error: any) {

    console.error('Error updating SMS templates:', error);
    return { success: false, error: error.message };
  }
}

export async function updateSMTPSettings(data: {
  smtpProvider: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
}) {
  try {
    const settings = await prisma.systemSettings.upsert({
      where: { id: 'global' },
      update: {
        smtpProvider: data.smtpProvider,
        smtpHost: data.smtpHost,
        smtpPort: data.smtpPort,
        smtpUser: data.smtpUser,
        smtpPass: data.smtpPass,
        smtpFrom: data.smtpFrom,
      },
      create: {
        id: 'global',
        smtpProvider: data.smtpProvider,
        smtpHost: data.smtpHost,
        smtpPort: data.smtpPort,
        smtpUser: data.smtpUser,
        smtpPass: data.smtpPass,
        smtpFrom: data.smtpFrom,
      },
    });
    return { success: true, settings };
  } catch (error: any) {
    console.error('Error updating SMTP Settings:', error);
    return { success: false, error: error.message };
  }
}
