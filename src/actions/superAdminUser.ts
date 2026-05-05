"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function getSuperAdminUsers() {
  try {
    const users = await prisma.superAdminUser.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      }
    });
    return { success: true, data: users };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createSuperAdminUser(data: { email: string, password: string, name?: string }) {
  try {
    // Check if user already exists
    const existing = await prisma.superAdminUser.findUnique({
      where: { email: data.email }
    });
    
    if (existing || data.email === "it@vicimix.com") {
      return { success: false, error: "Email already exists or is reserved." };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.superAdminUser.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name || "Sub Admin",
      }
    });
    
    revalidatePath("/super-admin/users");
    return { success: true, data: { id: user.id, email: user.email } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteSuperAdminUser(id: string) {
  try {
    await prisma.superAdminUser.delete({
      where: { id }
    });
    revalidatePath("/super-admin/users");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function verifySubAdminLogin(email: string, password: string) {
  try {
    const user = await prisma.superAdminUser.findUnique({
      where: { email }
    });
    
    if (!user) return false;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid;
  } catch (error) {
    console.error("Sub admin login error:", error);
    return false;
  }
}
