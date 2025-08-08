"use client";
import { useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

export default function ProtectedRoute({ children, requireAuth = false }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && requireAuth && !isAuthenticated) {
      // Store the attempted URL
      sessionStorage.setItem('redirectUrl', pathname);
      router.push('/login');
    }
  }, [isAuthenticated, loading, requireAuth, pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  return children;
}
