import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { queryOne } from './db';
import { AdminRole, AdminUser } from './types';

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'roxy-secret-fashion-key-bangladesh-2026-super-secure'
);

const COOKIE_NAME = 'roxy_admin_token';

export interface AdminJwtPayload {
  userId: number;
  email: string;
  role: AdminRole;
  name: string;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function signAdminToken(user: AdminUser): Promise<string> {
  return new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyAdminToken(token: string): Promise<AdminJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: Number(payload.userId),
      email: String(payload.email),
      role: payload.role as AdminRole,
      name: String(payload.name),
    };
  } catch {
    return null;
  }
}

export async function getAuthenticatedAdmin(): Promise<AdminJwtPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyAdminToken(token);
  } catch {
    return null;
  }
}

export async function setAdminSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Role Permission Matrix
 */
const ROLE_HIERARCHY: Record<AdminRole, number> = {
  super_admin: 4,
  order_manager: 3,
  product_manager: 2,
  support_agent: 1,
};

export function hasPermission(userRole: AdminRole, requiredRole: AdminRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export async function authenticateAdminCredentials(email: string, plainPassword: string): Promise<AdminUser | null> {
  const user = await queryOne<{
    id: number;
    name: string;
    email: string;
    password_hash: string;
    role: AdminRole;
    is_active: number | boolean;
  }>('SELECT * FROM admin_users WHERE email = ?', [email.toLowerCase().trim()]);

  if (!user || !user.is_active) {
    return null;
  }

  const isValid = await comparePassword(plainPassword, user.password_hash);
  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    is_active: Boolean(user.is_active),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
