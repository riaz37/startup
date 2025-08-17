import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { PriceManagementService } from "@/lib/services/price-management-service";

const priceService = new PriceManagementService();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {


      case 'price-history':
        try {
          const productId = searchParams.get('productId');
          const days = parseInt(searchParams.get('days') || '30');
          
          if (!productId) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
          }

          const history = await priceService.getProductPriceHistory(productId, days);
          return NextResponse.json({ history });
        } catch (error) {
          console.error('Error fetching price history:', error);
          return NextResponse.json(
            { error: 'Failed to fetch price history', details: error instanceof Error ? error.message : 'Unknown error' }, 
            { status: 500 }
          );
        }

      case 'price-trends':
        try {
          const trendProductId = searchParams.get('productId');
          const trendDays = parseInt(searchParams.get('days') || '30');
          
          if (!trendProductId) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
          }

          const trends = await priceService.getPriceTrends(trendProductId, trendDays);
          return NextResponse.json({ trends });
        } catch (error) {
          console.error('Error fetching price trends:', error);
          return NextResponse.json(
            { error: 'Failed to fetch price trends', details: error instanceof Error ? error.message : 'Unknown error' }, 
            { status: 500 }
          );
        }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Price management API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'update-prices':
        try {
          const { action, productId, newMrp, newSellingPrice, changeReason } = await request.json();
          
          if (action !== 'update-prices' || !productId || !newMrp || !newSellingPrice || !changeReason) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
          }

          const result = await priceService.updateProductPrices({
            productId,
            newMrp: parseFloat(newMrp),
            newSellingPrice: parseFloat(newSellingPrice),
            changeReason,
            adminId: session.user.id
          });

          return NextResponse.json({ 
            message: 'Prices updated successfully', 
            result 
          });
        } catch (error) {
          console.error('Error updating prices:', error);
          return NextResponse.json(
            { error: 'Failed to update prices', details: error instanceof Error ? error.message : 'Unknown error' }, 
            { status: 500 }
          );
        }



      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Price management API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 