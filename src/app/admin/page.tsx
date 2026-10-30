import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  UserX,
  Package,
  Eye,
  ShieldAlert,
} from 'lucide-react';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { queryOne, query } from '@/lib/db';
import { Order } from '@/lib/types';

export const revalidate = 0;

export default async function AdminOverviewPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    redirect('/admin/login');
  }

  // Real Database Queries for Real Analytics
  const [
    orderStats,
    salesStats,
    todayOrders,
    productStockStats,
    abandonmentStats,
    recentOrders,
    topSellingProducts,
    suspiciousOrders,
  ] = await Promise.all([
    // 1. Order status counts
    queryOne<{
      total: number;
      pending: number;
      confirmed: number;
      delivered: number;
      cancelled: number;
    }>(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN fulfillment_status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN fulfillment_status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN fulfillment_status = 'delivered' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN fulfillment_status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
      FROM orders
    `),

    // 2. Gross Sales & Estimated Profit
    queryOne<{
      gross_sales: number;
      avg_order_value: number;
    }>(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as gross_sales,
        COALESCE(AVG(total_amount), 0) as avg_order_value
      FROM orders 
      WHERE fulfillment_status != 'cancelled'
    `),

    // 3. Today's orders count
    queryOne<{ count: number }>(`
      SELECT COUNT(*) as count 
      FROM orders 
      WHERE DATE(created_at) = DATE('now')
    `),

    // 4. Low stock & out of stock products
    queryOne<{
      low_stock: number;
      out_of_stock: number;
      total_products: number;
    }>(`
      SELECT 
        COUNT(*) as total_products,
        SUM(CASE WHEN stock_quantity > 0 AND stock_quantity <= 5 THEN 1 ELSE 0 END) as low_stock,
        SUM(CASE WHEN stock_quantity <= 0 THEN 1 ELSE 0 END) as out_of_stock
      FROM products
      WHERE status = 'published'
    `),

    // 5. Checkout abandonment stats
    queryOne<{
      abandoned_count: number;
      recovered_count: number;
      total_sessions: number;
    }>(`
      SELECT 
        COUNT(*) as total_sessions,
        SUM(CASE WHEN status = 'abandoned' THEN 1 ELSE 0 END) as abandoned_count,
        SUM(CASE WHEN status = 'recovered' OR status = 'converted' THEN 1 ELSE 0 END) as recovered_count
      FROM checkout_sessions
    `),

    // 6. Recent 8 Orders
    query<Order>(`
      SELECT * FROM orders 
      ORDER BY id DESC 
      LIMIT 8
    `),

    // 7. Best selling products based on real order line items
    query<any>(`
      SELECT 
        p.id, p.name_en, p.name_bn, p.sku, p.main_image,
        COALESCE(SUM(oi.quantity), 0) as units_sold,
        COALESCE(SUM(oi.total_price), 0) as revenue
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      GROUP BY p.id
      ORDER BY units_sold DESC
      LIMIT 5
    `),

    // 8. Suspicious / High Risk Orders
    query<Order>(`
      SELECT * FROM orders 
      WHERE risk_level = 'high' 
      ORDER BY id DESC 
      LIMIT 5
    `),
  ]);

  const totalOrders = Number(orderStats?.total || 0);
  const pendingOrders = Number(orderStats?.pending || 0);
  const confirmedOrders = Number(orderStats?.confirmed || 0);
  const deliveredOrders = Number(orderStats?.delivered || 0);
  const cancelledOrders = Number(orderStats?.cancelled || 0);
  const grossSales = Number(salesStats?.gross_sales || 0);
  const avgOrderValue = Math.round(Number(salesStats?.avg_order_value || 0));
  const todayCount = Number(todayOrders?.count || 0);
  const lowStockCount = Number(productStockStats?.low_stock || 0);
  const outOfStockCount = Number(productStockStats?.out_of_stock || 0);
  const abandonedCount = Number(abandonmentStats?.abandoned_count || 0);

  return (
    <div className="space-y-8">
      {/* Top Welcome & Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E7E5E4] gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917]">
            Commerce Dashboard (ড্যাশবোর্ড)
          </h1>
          <p className="text-xs sm:text-sm text-[#57534E] mt-0.5">
            Welcome back, <strong className="text-[#1C1917]">{admin.name}</strong> • Real-time database metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="px-4 py-2.5 bg-[#631322] hover:bg-[#4E0E1A] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            + Add New Product
          </Link>
          <Link
            href="/admin/orders"
            className="px-4 py-2.5 bg-white border border-[#D6D3D1] hover:border-[#631322] text-[#1C1917] text-xs font-semibold rounded-lg transition-colors"
          >
            Manage Orders
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-white rounded-xl border border-[#E7E5E4] p-4 sm:p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#78716C]">
            <span>Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-[#631322]" />
          </div>
          <div className="text-2xl font-bold text-[#1C1917]">{totalOrders}</div>
          <div className="text-[11px] text-[#15803D] font-medium">
            Today: +{todayCount} orders
          </div>
        </div>

        {/* Gross Sales */}
        <div className="bg-white rounded-xl border border-[#E7E5E4] p-4 sm:p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#78716C]">
            <span>Gross Sales (COD)</span>
            <DollarSign className="w-4 h-4 text-[#15803D]" />
          </div>
          <div className="text-2xl font-bold text-[#631322]">
            ৳{grossSales.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#78716C]">
            Avg Value: ৳{avgOrderValue.toLocaleString()}
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-xl border border-[#E7E5E4] p-4 sm:p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#78716C]">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-[#B45309]" />
          </div>
          <div className="text-2xl font-bold text-[#B45309]">{pendingOrders}</div>
          <div className="text-[11px] text-[#78716C]">
            Requires customer call
          </div>
        </div>

        {/* Delivered Orders */}
        <div className="bg-white rounded-xl border border-[#E7E5E4] p-4 sm:p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#78716C]">
            <span>Delivered / Paid</span>
            <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
          </div>
          <div className="text-2xl font-bold text-[#15803D]">{deliveredOrders}</div>
          <div className="text-[11px] text-[#78716C]">
            Cancelled: {cancelledOrders}
          </div>
        </div>
      </div>

      {/* Secondary Alerts & Queues */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Inventory Stock Warning */}
        <div className="bg-white rounded-xl border border-[#E7E5E4] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-4 h-4 text-[#631322]" />
              <span>Stock Alerts (ইনভেন্টরি)</span>
            </h3>
            <Link href="/admin/inventory" className="text-xs text-[#631322] font-semibold hover:underline">
              View
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-3 bg-[#FEF2F2] rounded-lg border border-[#FECACA]">
              <div className="text-lg font-bold text-[#B91C1C]">{outOfStockCount}</div>
              <div className="text-[10px] text-[#78716C]">স্টক নেই (Out)</div>
            </div>
            <div className="p-3 bg-[#FFFBEB] rounded-lg border border-[#FDE68A]">
              <div className="text-lg font-bold text-[#B45309]">{lowStockCount}</div>
              <div className="text-[10px] text-[#78716C]">স্বল্প স্টক (Low ≤5)</div>
            </div>
          </div>
        </div>

        {/* Checkout Abandonment Queue */}
        <div className="bg-white rounded-xl border border-[#E7E5E4] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider flex items-center gap-1.5">
              <UserX className="w-4 h-4 text-[#631322]" />
              <span>Abandoned Checkouts</span>
            </h3>
            <Link href="/admin/abandonment" className="text-xs text-[#631322] font-semibold hover:underline">
              Follow Up
            </Link>
          </div>
          <div className="p-3 bg-[#FAF9F5] rounded-lg border border-[#E7E5E4] flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-[#1C1917]">{abandonedCount}</div>
              <div className="text-[10px] text-[#78716C]">গ্রাহক যারা ফরম পূরণ করেননি</div>
            </div>
            <Link
              href="/admin/abandonment"
              className="px-3 py-1.5 bg-[#631322] text-white text-[11px] font-semibold rounded-md"
            >
              WhatsApp Recovery →
            </Link>
          </div>
        </div>

        {/* Suspicious Orders Queue */}
        <div className="bg-white rounded-xl border border-[#E7E5E4] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#B91C1C]" />
              <span>Fraud / High Risk Orders</span>
            </h3>
            <Link href="/admin/fraud" className="text-xs text-[#631322] font-semibold hover:underline">
              Blocklist
            </Link>
          </div>
          <div className="p-3 bg-[#FEF2F2] rounded-lg border border-[#FECACA] flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-[#B91C1C]">{suspiciousOrders.length}</div>
              <div className="text-[10px] text-[#78716C]">উচ্চ ঝুঁকিপূর্ণ অর্ডার</div>
            </div>
            <Link
              href="/admin/orders?risk=high"
              className="px-3 py-1.5 bg-[#B91C1C] text-white text-[11px] font-semibold rounded-md"
            >
              Review Queue →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl border border-[#E7E5E4] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E7E5E4] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#1C1917]">Recent Orders (সর্বশেষ অর্ডারসমূহ)</h3>
            <p className="text-xs text-[#78716C]">Real-time orders placed via COD</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-[#631322] hover:underline flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#78716C]">
            বর্তমানে কোনো অর্ডার নেই।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF9F5] border-b border-[#E7E5E4] text-[#1C1917]">
                  <th className="p-3.5 font-bold">Reference</th>
                  <th className="p-3.5 font-bold">Customer</th>
                  <th className="p-3.5 font-bold">Phone</th>
                  <th className="p-3.5 font-bold">District</th>
                  <th className="p-3.5 font-bold">Amount</th>
                  <th className="p-3.5 font-bold">Status</th>
                  <th className="p-3.5 font-bold">Risk</th>
                  <th className="p-3.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4]">
                {recentOrders.map((ord) => {
                  return (
                    <tr key={ord.id} className="hover:bg-[#FAF9F5] transition-colors">
                      <td className="p-3.5 font-mono font-bold text-[#631322]">
                        {ord.public_reference}
                      </td>
                      <td className="p-3.5 font-medium text-[#1C1917]">{ord.customer_name}</td>
                      <td className="p-3.5 text-[#57534E] font-mono">{ord.customer_phone}</td>
                      <td className="p-3.5 text-[#57534E]">{ord.district_name}</td>
                      <td className="p-3.5 font-bold text-[#1C1917]">
                        ৳{Number(ord.total_amount).toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.fulfillment_status === 'delivered'
                              ? 'bg-[#F0FDF4] text-[#15803D]'
                              : ord.fulfillment_status === 'cancelled'
                              ? 'bg-[#FEF2F2] text-[#B91C1C]'
                              : ord.fulfillment_status === 'confirmed'
                              ? 'bg-[#EFF6FF] text-[#1D4ED8]'
                              : 'bg-[#FFFBEB] text-[#B45309]'
                          }`}
                        >
                          {ord.fulfillment_status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-bold ${
                            ord.risk_level === 'high' ? 'text-[#B91C1C]' : 'text-[#15803D]'
                          }`}
                        >
                          {ord.risk_level.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          href={`/admin/orders?view=${ord.id}`}
                          className="p-1.5 inline-flex items-center justify-center rounded-md hover:bg-[#E7E5E4] text-[#631322]"
                          title="View Order Details & Customer History"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Best Sellers Preview */}
      <div className="bg-white rounded-xl border border-[#E7E5E4] p-5 shadow-xs">
        <h3 className="text-base font-bold text-[#1C1917] mb-4">
          Best-Selling Collections (শীর্ষ বিক্রীত পোশাক)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {topSellingProducts.map((p: any) => (
            <div key={p.id} className="p-3 bg-[#FAF9F5] rounded-lg border border-[#E7E5E4] flex gap-3 items-center">
              <img src={p.main_image} alt={p.name_en} className="w-12 h-14 object-cover rounded-md" />
              <div className="truncate">
                <h4 className="text-xs font-semibold text-[#1C1917] truncate">{p.name_en}</h4>
                <div className="text-[11px] text-[#78716C]">SKU: {p.sku}</div>
                <div className="text-[11px] font-bold text-[#631322]">
                  {p.units_sold} units sold
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
