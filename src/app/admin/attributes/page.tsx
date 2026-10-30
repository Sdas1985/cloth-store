import React from 'react';
import { redirect } from 'next/navigation';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { query } from '@/lib/db';
import { Size, Color } from '@/lib/types';
import { AttributesClient } from './AttributesClient';

export const revalidate = 0;

export default async function AdminAttributesPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    redirect('/admin/login');
  }

  const [sizes, colors] = await Promise.all([
    query<Size>('SELECT * FROM sizes ORDER BY display_order ASC'),
    query<Color>('SELECT * FROM colors ORDER BY display_order ASC'),
  ]);

  return <AttributesClient initialSizes={sizes} initialColors={colors} />;
}
