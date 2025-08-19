import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib";
import { prisma } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    
    const now = new Date();
    
    // Get total count
    const total = await prisma.discountConfig.count();
    
    // Get active count
    const active = await prisma.discountConfig.count({
      where: { isActive: true }
    });
    
    // Get inactive count
    const inactive = await prisma.discountConfig.count({
      where: { isActive: false }
    });
    
    // Get expired count
    const expired = await prisma.discountConfig.count({
      where: {
        isActive: true,
        endDate: { lt: now }
      }
    });
    
    // Get scheduled count
    const scheduled = await prisma.discountConfig.count({
      where: {
        isActive: true,
        startDate: { gt: now }
      }
    });
    
    return NextResponse.json({
      total,
      active,
      inactive,
      expired,
      scheduled
    });
    
  } catch (error: any) {
    console.error("Error fetching discount stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch discount statistics" },
      { status: 500 }
    );
  }
} 