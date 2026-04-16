import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import UserSidebar from './UserSidebar';
import { Toaster } from 'sonner';

export default function UserLayout() {
  // Simulating auth check (MVP)
  const isAuthenticated = true; // Later add real logic

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-teal-500/30">
      <UserSidebar />
      <main className="flex-1 overflow-x-hidden pt-16 lg:pt-0">
        <div className="relative min-h-full">
          {/* Subtle Background Glow for Portal */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-blue-500/[0.03] rounded-full blur-[100px] pointer-events-none" />
          
          <div className="p-4 lg:p-8 animate-in fade-in duration-700">
            <Outlet />
          </div>
        </div>
      </main>
      <Toaster position="top-right" theme="dark" />
    </div>
  );
}
