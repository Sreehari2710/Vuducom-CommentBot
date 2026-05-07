'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Navbar';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/signin' || pathname === '/signup';

  return (
    <div className="flex min-h-screen w-full">
      {!isAuthPage && <Sidebar />}
      <main className={`flex-1 min-w-0 ${!isAuthPage ? 'pl-64' : ''}`}>
        {children}
      </main>
    </div>
  );
}
