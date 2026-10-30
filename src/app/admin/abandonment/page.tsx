import React from 'react';
import { redirect } from 'next/navigation';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { query } from '@/lib/db';
import { CheckoutSession } from '@/lib/types';
import { AbandonmentClient } from './AbandonmentClient';

export const revalidate = 0;

export default async function AdminAbandonmentPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    redirect('/admin/login');
  }

  const sessions = await query<any>(`
    SELECT 
      cs.*,
      d.name_en as district_name_en,
      d.name_bn as district_name_bn
    FROM checkout_sessions cs
    LEFT JOIN districts d ON cs.district_id = d.id
    ORDER BY cs.id DESC
    LIMIT 100
  `);

  const formattedSessions = sessions.map((s) => {
    let items = [];
    try {
      items = JSON.parse(s.items_snapshot || '[]');
    } catch {
      items = [];
    }

    return {
      ...s,
      items_snapshot: items,
      district_name: s.district_name_en ? `${s.district_name_en} (${s.district_name_bn})` : 'Not Selected',
    };
  });

  return <AbandonmentClient initialSessions={formattedSessions} />;
}
