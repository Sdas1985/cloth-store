import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdminCredentials, signAdminToken, setAdminSessionCookie } from '@/lib/auth';
import { execute } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'ইমেইল এবং পাসওয়ার্ড আবশ্যক (Email and password required)' },
        { status: 400 }
      );
    }

    const admin = await authenticateAdminCredentials(email, password);

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'ভুল ইমেইল অথবা পাসওয়ার্ড (Invalid credentials)' },
        { status: 401 }
      );
    }

    const token = await signAdminToken(admin);
    await setAdminSessionCookie(token);

    // Audit log
    await execute(
      `INSERT INTO admin_audit_logs (admin_user_id, admin_name, action, target_type, target_id, details)
       VALUES (?, ?, 'login', 'auth', ?, 'Admin logged in successfully')`,
      [admin.id, admin.name, String(admin.id)]
    );

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return NextResponse.json({ success: false, error: 'লগইন ব্যর্থ হয়েছে' }, { status: 500 });
  }
}
