import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { execute, withTransaction } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const {
      bannerHeadlineEn,
      bannerHeadlineBn,
      bannerSubheadlineEn,
      bannerSubheadlineBn,
    } = await req.json();

    await withTransaction(async (tx) => {
      await tx.execute(
        `UPDATE store_settings 
         SET banner_headline_en = ?,
             banner_headline_bn = ?,
             banner_subheadline_en = ?,
             banner_subheadline_bn = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = 1`,
        [bannerHeadlineEn, bannerHeadlineBn, bannerSubheadlineEn, bannerSubheadlineBn]
      );

      await tx.execute(
        `INSERT INTO admin_audit_logs (admin_user_id, admin_name, action, target_type, target_id, details)
         VALUES (?, ?, 'update_content', 'website', '1', 'Updated homepage banner headlines')`,
        [admin.userId, admin.name]
      );
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
