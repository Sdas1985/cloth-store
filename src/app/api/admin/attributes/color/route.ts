import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { execute } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { nameEn, nameBn, hexCode, displayOrder } = await req.json();
    if (!nameEn || !hexCode) {
      return NextResponse.json({ error: 'Color name and hex code required' }, { status: 400 });
    }

    const res = await execute(
      'INSERT INTO colors (name_en, name_bn, hex_code, display_order) VALUES (?, ?, ?, ?)',
      [nameEn.trim(), (nameBn || nameEn).trim(), hexCode.trim(), Number(displayOrder || 1)]
    );

    return NextResponse.json({ success: true, id: res.lastInsertId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
