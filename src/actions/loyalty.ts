"use server";

import { prisma } from "@/lib/prisma";

export type LoyaltyTier = "None" | "Bronze" | "Silver" | "Gold" | "Diamond";

export async function checkCustomerLoyalty(tenantId: string, phone: string) {
  try {
    if (!phone || phone.trim() === "") return null;

    const customer = await prisma.customer.findFirst({
      where: {
        tenantId,
        phone: phone.trim(),
      },
    });

    if (!customer) return null;

    const points = customer.points || 0;
    let tier: LoyaltyTier = "None";
    let discountPercentage = 0;

    if (points >= 2000) {
      tier = "Diamond";
      discountPercentage = 15;
    } else if (points >= 1000) {
      tier = "Gold";
      discountPercentage = 10;
    } else if (points >= 500) {
      tier = "Silver";
      discountPercentage = 5;
    } else if (points > 100) {
      tier = "Bronze";
      discountPercentage = 2;
    }

    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      points,
      tier,
      discountPercentage,
    };
  } catch (error) {
    console.error("Error checking loyalty:", error);
    return null;
  }
}
