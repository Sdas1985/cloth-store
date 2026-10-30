import React from 'react';
import { redirect } from 'next/navigation';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { queryOne } from '@/lib/db';
import { StoreSettings } from '@/lib/types';
import { SettingsClient } from './SettingsClient';

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    redirect('/admin/login');
  }

  const settings = await queryOne<StoreSettings>('SELECT * FROM store_settings WHERE id = 1');

  return <SettingsClient settings={settings!} />;
}
