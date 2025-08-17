import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { PriceManagementService } from "@/lib/services/price-management-service";

const priceService = new PriceManagementService();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const alerts = await priceService.getUserPriceAlerts(session.user.id);
    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Price alerts API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, targetPrice, alertType } = body;

    if (!productId || !targetPrice || !alertType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const alert = await priceService.createPriceAlert({
      userId: session.user.id,
      productId,
      targetPrice,
      alertType
    });

    return NextResponse.json({ success: true, alert });
  } catch (error) {
    console.error('Price alerts API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('alertId');

    if (!alertId) {
      return NextResponse.json({ error: 'Alert ID required' }, { status: 400 });
    }

    await priceService.deactivatePriceAlert(alertId, session.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Price alerts API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 