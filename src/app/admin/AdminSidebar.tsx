'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  FolderTree,
  Palette,
  Boxes,
  Users,
  ShieldAlert,
  UserX,
  Truck,
  TicketPercent,
  Star,
  BarChart3,
  Globe,
  Search,
  UserCheck,
  History,
  Settings,
  Database,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { AdminJwtPayload } from '@/lib/auth';

interface AdminSidebarProps {
  admin: AdminJwtPayload;
}

export function AdminSidebar({ admin }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // If on /admin/login, don't show admin chrome
  if (pathname === '/admin/login') {
    return null;
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navSections = [
    {
      title: 'CORE COMMERCE',
      links: [
        { name: 'Overview', href: '/admin', icon: LayoutDashboard },
        { name: 'Orders', href: '/admin/orders', icon: ShoppingBag, badge: 'Live' },
        { name: 'Products', href: '/admin/products', icon: Package },
        { name: 'Categories', href: '/admin/categories', icon: Layers },
        { name: 'Subcategories', href: '/admin/subcategories', icon: FolderTree },
        { name: 'Sizes & Colors', href: '/admin/attributes', icon: Palette },
        { name: 'Inventory Stock', href: '/admin/inventory', icon: Boxes },
      ],
    },
    {
      title: 'CUSTOMERS & FRAUD',
      links: [
        { name: 'Customers', href: '/admin/customers', icon: Users },
        { name: 'Blocked / Fraud Review', href: '/admin/fraud', icon: ShieldAlert },
        { name: 'Checkout Abandonment', href: '/admin/abandonment', icon: UserX },
      ],
    },
    {
      title: 'OPERATIONS & MARKETING',
      links: [
        { name: 'Delivery Settings', href: '/admin/delivery', icon: Truck },
        { name: 'Coupons & Discounts', href: '/admin/coupons', icon: TicketPercent },
        { name: 'Customer Reviews', href: '/admin/reviews', icon: Star },
        { name: 'Reports & Analytics', href: '/admin/reports', icon: BarChart3 },
      ],
    },
    {
      title: 'SYSTEM & SETTINGS',
      links: [
        { name: 'Website Content', href: '/admin/content', icon: Globe },
        { name: 'SEO Settings', href: '/admin/seo', icon: Search },
        { name: 'Staff & Roles', href: '/admin/staff', icon: UserCheck },
        { name: 'Audit Logs', href: '/admin/audit-logs', icon: History },
        { name: 'Store Settings', href: '/admin/settings', icon: Settings },
        { name: 'Backup & Export', href: '/admin/backup', icon: Database },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Top Toggle Header */}
      <div className="lg:hidden bg-[#1C1917] text-white px-4 py-3 flex items-center justify-between border-b border-[#292524] sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 text-white hover:text-[#D4AF37]"
            aria-label="Toggle admin menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-serif font-bold tracking-wider text-sm">ROXY ADMIN</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#D4AF37] font-semibold bg-[#292524] px-2 py-0.5 rounded-full">
            {admin.role.replace('_', ' ')}
          </span>
          <button
            onClick={handleLogout}
            className="p-1.5 text-[#A8A29E] hover:text-white"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#1C1917] text-[#FAF9F5] flex flex-col border-r border-[#292524] transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#292524] flex items-center justify-between bg-[#161413]">
          <div>
            <Link href="/admin" className="block">
              <span className="font-serif text-xl font-bold tracking-widest text-white">
                ROXY ADMIN
              </span>
              <span className="block text-[9px] tracking-widest text-[#D4AF37] font-semibold uppercase">
                Control Center • BD
              </span>
            </Link>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-[#A8A29E] hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Profile Chip */}
        <div className="px-5 py-3 border-b border-[#292524] bg-[#221F1F] flex items-center justify-between text-xs">
          <div className="truncate">
            <div className="font-semibold text-white truncate">{admin.name}</div>
            <div className="text-[10px] text-[#A8A29E] uppercase tracking-wider">{admin.role.replace('_', ' ')}</div>
          </div>
          <button
            onClick={handleLogout}
            className="text-[#A8A29E] hover:text-[#B91C1C] p-1 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Modules (20 sections) */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-5">
          {navSections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-[#78716C] tracking-wider uppercase">
                {sec.title}
              </div>
              {sec.links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#631322] text-white shadow-xs'
                        : 'text-[#D6D3D1] hover:bg-[#292524] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-[#D4AF37]" />
                      <span>{link.name}</span>
                    </div>
                    {link.badge && (
                      <span className="text-[9px] font-bold bg-[#15803D] text-white px-1.5 py-0.2 rounded-full">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom Storefront Link */}
        <div className="p-3 border-t border-[#292524] bg-[#161413]">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 bg-[#292524] hover:bg-[#34302E] rounded-lg text-xs text-[#FAF9F5] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#D4AF37]" />
              <span>Visit Storefront</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
          </Link>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
        />
      )}
    </>
  );
}
