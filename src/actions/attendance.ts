"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAttendanceByDate(tenantId: string, date: string) {
  try {
    // Fetch all staff members for the tenant
    const staffList = await prisma.staff.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' }
    });

    // Fetch attendance records for the specific date
    const attendances = await prisma.attendance.findMany({
      where: {
        tenantId,
        date
      }
    });

    // Merge staff with their attendance records
    const attendanceMap = new Map();
    attendances.forEach(a => attendanceMap.set(a.staffId, a));

    const result = staffList.map(staff => {
      const record = attendanceMap.get(staff.id);
      return {
        staffId: staff.id,
        staffName: staff.name,
        role: staff.role,
        clockIn: record?.clockIn || "",
        clockOut: record?.clockOut || "",
        status: record?.status || "Present",
        notes: record?.notes || "",
      };
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to fetch attendance:", error);
    return { success: false, error: "Failed to fetch attendance data" };
  }
}

export async function upsertAttendance({
  tenantId,
  staffId,
  date,
  clockIn,
  clockOut,
  status,
  notes
}: {
  tenantId: string;
  staffId: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  status?: string;
  notes?: string;
}) {
  try {
    const record = await prisma.attendance.upsert({
      where: {
        tenantId_staffId_date: {
          tenantId,
          staffId,
          date
        }
      },
      update: {
        clockIn,
        clockOut,
        status,
        notes
      },
      create: {
        tenantId,
        staffId,
        date,
        clockIn,
        clockOut,
        status: status || "Present",
        notes
      }
    });

    revalidatePath(`/[tenantSlug]/admin/attendance`, "page");
    return { success: true, data: record };
  } catch (error) {
    console.error("Failed to upsert attendance:", error);
    return { success: false, error: "Failed to save attendance" };
  }
}

export async function getMonthlyAttendance(tenantId: string, staffId: string, year: number, month: number) {
  try {
    const monthStr = month.toString().padStart(2, "0");
    const prefix = `${year}-${monthStr}-`;

    const records = await prisma.attendance.findMany({
      where: {
        tenantId,
        staffId,
        date: {
          startsWith: prefix
        }
      }
    });

    return { success: true, data: records };
  } catch (error) {
    console.error("Failed to fetch monthly attendance:", error);
    return { success: false, error: "Failed to fetch data" };
  }
}
