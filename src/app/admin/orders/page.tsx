import React from 'react';
import { redirect } from 'next/navigation';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { query } from '@/lib/db';
import { Order } from '@/lib/types';
import { OrdersClient } from './OrdersClient';

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    redirect('/admin/login');
  }

  const [orders, allStaff] = await Promise.all([
    query<Order>('SELECT * FROM orders ORDER BY id DESC LIMIT 100'),
    query<{ id: number; name: string }>('SELECT id, name FROM admin_users WHERE is_active = 1'),
  ]);

  return <OrdersClient initialOrders={orders} allStaff={allStaff} />;
}
