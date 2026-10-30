import { NextRequest, NextResponse } from 'next/server';
import { calculateDeliveryCharge } from '@/lib/delivery';

export async function POST(req: NextRequest) {
  try {
    const { districtId, subtotal } = await req.json();

    if (!districtId) {
      return NextResponse.json({ error: 'District ID required' }, { status: 400 });
    }

    const result = await calculateDeliveryCharge(Number(districtId), Number(subtotal || 0));
    return NextResponse.json(result);
  } catch (error) {
    console.error('Delivery calculation API error:', error);
    return NextResponse.json({ error: 'Calculation failed' }, { status: 500 });
  }
}
