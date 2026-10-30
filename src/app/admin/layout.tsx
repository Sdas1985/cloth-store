import React from 'react';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { AdminSidebar } from './AdminSidebar';

export const revalidate = 0;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAuthenticatedAdmin();

  // If not authenticated, we check if they are already on /admin/login
  // Using headers to check current pathname
  const headersList = await headers();
  const headerUrl = headersList.get('x-url') || '';

  // If user is not authenticated and not on login page
  if (!admin) {
    // When rendered inside Server Component, redirect unauthenticated requests to login
    // Note: Next.js redirect() will perform a server redirect
    // If the request is for /admin/login, we allow rendering children without sidebar
    // We will render children directly for login, but redirect otherwise
  }

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      {admin ? (
        <div className="flex">
          <AdminSidebar admin={admin} />
          <div className="flex-1 lg:pl-64 min-w-0 flex flex-col">
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>
        </div>
      ) : (
        <div>{children}</div>
      )}
    </div>
  );
}
