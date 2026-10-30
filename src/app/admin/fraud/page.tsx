import React from 'react';
import { redirect } from 'next/navigation';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { query } from '@/lib/db';
import { BlockedCustomer } from '@/lib/types';
import { FraudClient } from './FraudClient';

export const revalidate = 0;

export default async function AdminFraudPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    redirect('/admin/login');
  }

  const blocked = await query<BlockedCustomer>(
    'SELECT * FROM blocked_customers WHERE is_active = 1 ORDER BY id DESC'
  );

  return <FraudClient initialBlocked={blocked} />;
}
