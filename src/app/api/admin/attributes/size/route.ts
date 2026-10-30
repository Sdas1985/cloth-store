import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { execute, query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, displayOrder } = await req.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Size name required' }, { status: 400 });
    }

    const res = await execute(
      'INSERT INTO sizes (name, display_order) VALUES (?, ?)',
      [name.trim(), Number(displayOrder || 1)]
    );

    return NextResponse.json({ success: true, id: res.lastInsertId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
