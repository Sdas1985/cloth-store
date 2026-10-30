import React from 'react';
import { redirect } from 'next/navigation';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { query } from '@/lib/db';
import { InventoryMovement } from '@/lib/types';
import { InventoryClient } from './InventoryClient';

export const revalidate = 0;

export default async function AdminInventoryPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    redirect('/admin/login');
  }

  // Load variant-level inventory or base products if simple
  const inventoryItems = await query<any>(`
    SELECT 
      pv.id as id,
      p.id as product_id,
      pv.id as variant_id,
      p.name_en as product_name,
      pv.sku as sku,
      CONCAT(COALESCE(s.name, ''), ' - ', COALESCE(c.name_en, '')) as variant_label,
      pv.stock_quantity as stock_quantity,
      'variable' as type
    FROM product_variants pv
    JOIN products p ON pv.product_id = p.id
    LEFT JOIN sizes s ON pv.size_id = s.id
    LEFT JOIN colors c ON pv.color_id = c.id
    
    UNION ALL
    
    SELECT 
      p.id as id,
      p.id as product_id,
      NULL as variant_id,
      p.name_en as product_name,
      p.sku as sku,
      'Simple Product' as variant_label,
      p.stock_quantity as stock_quantity,
      'simple' as type
    FROM products p
    WHERE p.product_type = 'simple'
    ORDER BY sku ASC
  `);

  const movements = await query<InventoryMovement>(`
    SELECT * FROM inventory_movements 
    ORDER BY id DESC 
    LIMIT 30
  `);

  return <InventoryClient initialInventory={inventoryItems} initialMovements={movements} />;
}
