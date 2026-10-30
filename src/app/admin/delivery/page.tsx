import React from 'react';
import { redirect } from 'next/navigation';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { queryOne, query } from '@/lib/db';
import { StoreSettings, DeliveryRule } from '@/lib/types';
import { DeliverySettingsClient } from './DeliverySettingsClient';

export const revalidate = 0;

export default async function AdminDeliveryPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    redirect('/admin/login');
  }

  const [settings, rules] = await Promise.all([
    queryOne<StoreSettings>('SELECT * FROM store_settings WHERE id = 1'),
    query<DeliveryRule>('SELECT * FROM delivery_rules WHERE is_active = 1 ORDER BY id ASC'),
  ]);

  return <DeliverySettingsClient settings={settings!} rules={rules} />;
}
