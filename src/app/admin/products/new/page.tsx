import React from 'react';
import { redirect } from 'next/navigation';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { query } from '@/lib/db';
import { Category, Subcategory, Size, Color } from '@/lib/types';
import { ProductCreateClient } from './ProductCreateClient';

export const revalidate = 0;

export default async function AdminNewProductPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    redirect('/admin/login');
  }

  const [categories, subcategories, sizes, colors] = await Promise.all([
    query<Category>('SELECT * FROM categories ORDER BY sort_order ASC'),
    query<Subcategory>('SELECT * FROM subcategories ORDER BY sort_order ASC'),
    query<Size>('SELECT * FROM sizes ORDER BY display_order ASC'),
    query<Color>('SELECT * FROM colors ORDER BY display_order ASC'),
  ]);

  return (
    <ProductCreateClient
      categories={categories}
      subcategories={subcategories}
      sizes={sizes}
      colors={colors}
    />
  );
}
