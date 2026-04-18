import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { AuthPopup } from './AuthPopup';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900 border border-gray-800">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
          <p className="text-gray-400">Verificando credenciais...</p>
        </div>
      </div>
    );
  }

  // Determine which role we are requesting
  const requiredRole = allowedRoles?.includes('admin') ? 'admin' : 'user';

  if (!isAuthenticated || (allowedRoles && user && !allowedRoles.includes(user.type))) {
    // If Admin page and not logged in (or wrong type), render loading state indefinitely / AuthPopup overlay.
    if (requiredRole === 'admin' && !isAuthenticated) {
       return (
         <div className="flex relative h-screen w-full items-center justify-center bg-gray-900 border border-gray-800">
             <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
             <AuthPopup requiredRole="admin" />
         </div>
       );
    }

    return (
      <div className="relative h-screen w-full overflow-hidden">
        {/* Render a blurred mock of the content or actual content blurred */}
        <div className="absolute inset-0 filter blur-xl scale-105 pointer-events-none opacity-50 bg-gray-900" />
        <AuthPopup requiredRole={requiredRole} />
      </div>
    );
  }

  return <Outlet />;
};
