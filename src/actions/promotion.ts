"use server";

import { prisma } from "@/lib/prisma";

const PRIZES = [
  { name: "2% Off", weight: 50 },
  { name: "5% Off", weight: 30 },
  { name: "10% Off", weight: 5 },
  { name: "Free Lipstick", weight: 10 },
  { name: "Free Makeup", weight: 5 },
];

function getRandomPrize() {
  const totalWeight = PRIZES.reduce((sum, prize) => sum + prize.weight, 0);
  let random = Math.random() * totalWeight;

  for (const prize of PRIZES) {
    if (random < prize.weight) return prize.name;
    random -= prize.weight;
  }
  return PRIZES[0].name; // Fallback
}

export async function checkEligibility(tenantId: string, phone: string) {
  try {
    // 1. Check if phone is already a customer
    const existingCustomer = await prisma.customer.findFirst({
      where: { tenantId, phone },
    });

    if (existingCustomer) {
      return { eligible: false, reason: "already_customer" };
    }

    // 2. Check if phone has already spun the wheel
    const existingClaim = await prisma.promotionClaim.findUnique({
      where: {
        tenantId_phone: {
          tenantId,
          phone,
        },
      },
    });

    if (existingClaim) {
      return { eligible: false, reason: "already_spun" };
    }

    return { eligible: true };
  } catch (error) {
    console.error("Error checking eligibility:", error);
    return { eligible: false, reason: "error" };
  }
}

export async function claimPromotion(tenantId: string, phone: string) {
  try {
    // Re-verify eligibility to prevent race conditions
    const eligibility = await checkEligibility(tenantId, phone);
    if (!eligibility.eligible) {
      return { success: false, error: eligibility.reason };
    }

    const prize = getRandomPrize();

    const claim = await prisma.promotionClaim.create({
      data: {
        tenantId,
        phone,
        prize,
        status: "Unused",
      },
    });

    return { success: true, prize: claim.prize };
  } catch (error) {
    console.error("Error claiming promotion:", error);
    return { success: false, error: "Lỗi hệ thống khi quay thưởng" };
  }
}

export async function getUnusedPromotion(tenantId: string, phone: string) {
  if (!phone) return null;
  
  try {
    const claim = await prisma.promotionClaim.findFirst({
      where: {
        tenantId,
        phone,
        status: "Unused",
      },
      orderBy: { createdAt: "desc" }
    });
    
    return claim;
  } catch (error) {
    console.error("Error fetching unused promotion:", error);
    return null;
  }
}
