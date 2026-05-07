"use server";
import { prisma } from "@/lib/prisma";
import { sendNewTrialNotificationToAdmins } from "@/actions/email";

export async function registerTrial(data: {
  fullName: string;
  phone: string;
  businessName: string;
  email: string;
  location: string;
  googleMapUrl: string;
  businessType: string;
  username: string;
  password: string;
}) {
  try {
    // Basic validation
    if (!data.businessName || !data.email || !data.password || !data.username) {
      return { success: false, error: "Missing required fields" };
    }

    // Generate unique slug
    const baseSlug = data.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let slug = baseSlug || 'salon';
    let counter = 1;
    while (await prisma.tenant.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Check if username exists
    const existingUsername = await prisma.tenant.findUnique({ where: { adminUsername: data.username } });
    if (existingUsername) {
      return { success: false, error: "Username is already taken." };
    }

    // Check if email exists
    const existingEmail = await prisma.tenant.findFirst({ where: { adminEmail: data.email } });
    if (existingEmail) {
      return { success: false, error: "Email is already registered." };
    }

    const defaultFeatures = ["promotions", "staff", "reports", "workingHours"];

    const tenant = await prisma.tenant.create({
      data: {
        name: data.businessName,
        slug,
        adminEmail: data.email,
        adminPassword: data.password,
        adminUsername: data.username,
        ownerName: data.fullName,
        phone: data.phone,
        location: data.location,
        googleMapUrl: data.googleMapUrl,
        businessType: data.businessType,
        status: "TrialRequest",
        enabledFeatures: JSON.stringify(defaultFeatures),
      }
    });

    // Send notification to super admins asynchronously
    sendNewTrialNotificationToAdmins({
      businessName: data.businessName,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      businessType: data.businessType,
    }).catch(console.error);

    return { success: true, slug: tenant.slug };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { success: false, error: error.message || "An unexpected error occurred during registration." };
  }
}
