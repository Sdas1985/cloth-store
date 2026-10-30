import React from 'react';
import { redirect } from 'next/navigation';
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, MapPin } from 'lucide-react';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export const revalidate = 0;

export default async function AdminReportsPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    redirect('/admin/login');
  }

  const [salesSummary, districtBreakdown, dailyOrders] = await Promise.all([
    queryOne<any>(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(AVG(total_amount), 0) as avg_order_value,
        COALESCE(SUM(delivery_charge), 0) as total_delivery_collected
      FROM orders
      WHERE fulfillment_status != 'cancelled'
    `),

    query<any>(`
      SELECT 
        district_name,
        COUNT(*) as order_count,
        SUM(total_amount) as total_spend
      FROM orders
      GROUP BY district_name
      ORDER BY order_count DESC
      LIMIT 8
    `),

    query<any>(`
      SELECT 
        DATE(created_at) as order_date,
        COUNT(*) as daily_count,
        SUM(total_amount) as daily_revenue
      FROM orders
      GROUP BY DATE(created_at)
      ORDER BY order_date DESC
      LIMIT 7
    `),
  ]);

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-[#E7E5E4]">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917]">
          Reports & Analytics (বিক্রয় ও আর্থিক প্রতিবেদন)
        </h1>
        <p className="text-xs sm:text-sm text-[#57534E] mt-0.5">
          Real database analytics on sales volume, average order values, and district distribution
        </p>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-xl border border-[#E7E5E4] shadow-xs space-y-1">
          <div className="text-xs text-[#78716C]">Total Gross Revenue</div>
          <div className="text-2xl font-bold text-[#631322]">
            ৳{Number(salesSummary?.total_revenue || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-[#15803D]">Based on confirmed & delivered orders</div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-[#E7E5E4] shadow-xs space-y-1">
          <div className="text-xs text-[#78716C]">Average Order Value (AOV)</div>
          <div className="text-2xl font-bold text-[#1C1917]">
            ৳{Math.round(Number(salesSummary?.avg_order_value || 0)).toLocaleString()}
          </div>
          <div className="text-[11px] text-[#78716C]">Per completed checkout</div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-[#E7E5E4] shadow-xs space-y-1">
          <div className="text-xs text-[#78716C]">Total Courier Fees Handled</div>
          <div className="text-2xl font-bold text-[#1C1917]">
            ৳{Number(salesSummary?.total_delivery_collected || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-[#78716C]">Across 64 Bangladesh districts</div>
        </div>
      </div>

      {/* District Distribution */}
      <div className="bg-white rounded-xl border border-[#E7E5E4] p-5 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-[#1C1917] flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#631322]" />
          <span>Top Ordering Districts in Bangladesh (শীর্ষ জেলাসমূহ)</span>
        </h3>

        {districtBreakdown.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#78716C]">
            অর্ডার সংগৃহীত হলে জেলা অনুযায়ী তথ্য প্রদর্শিত হবে।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF9F5] border-b text-[#78716C]">
                  <th className="p-3">District</th>
                  <th className="p-3">Orders</th>
                  <th className="p-3">Total Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4]">
                {districtBreakdown.map((d: any, i: number) => (
                  <tr key={i}>
                    <td className="p-3 font-semibold text-[#1C1917]">{d.district_name}</td>
                    <td className="p-3 font-bold">{d.order_count}</td>
                    <td className="p-3 font-bold text-[#631322]">
                      ৳{Number(d.total_spend).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
