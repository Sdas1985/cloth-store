import { NextResponse } from 'next/server';
import { clearAdminSessionCookie, getAuthenticatedAdmin } from '@/lib/auth';
import { execute } from '@/lib/db';

export async function POST() {
  const current = await getAuthenticatedAdmin();
  if (current) {
    await execute(
      `INSERT INTO admin_audit_logs (admin_user_id, admin_name, action, target_type, target_id, details)
       VALUES (?, ?, 'logout', 'auth', ?, 'Admin logged out')`,
      [current.userId, current.name, String(current.userId)]
    );
  }
  await clearAdminSessionCookie();
  return NextResponse.json({ success: true });
}
