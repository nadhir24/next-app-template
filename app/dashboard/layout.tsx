'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface DecodedToken {
  userId: number;
  email: string;
  roleId: Array<{ userId: number; roleId: number }>;
  iat: number;
  exp: number;
}

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Force recheck auth on any route change within dashboard
  useEffect(() => {
    console.log('[UserDashboardLayout] Path changed to:', pathname);
    checkUserAuthorization();
  }, [pathname]);

  // Main authorization check function
  const checkUserAuthorization = () => {
    console.log('[UserDashboardLayout] Starting auth check...');
    setCheckingAuth(true);
    
    const token = localStorage.getItem('token');
    console.log('[UserDashboardLayout] Token from localStorage:', token ? 'Found' : 'Not Found');

    if (!token) {
      console.log('[UserDashboardLayout] No token found, redirecting to login.');
      toast.error('Akses ditolak. Silakan login terlebih dahulu.');
      router.replace('/'); 
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      console.log('[UserDashboardLayout] Decoded token:', decoded);

      // Check token expiration
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        console.log('[UserDashboardLayout] Token expired, redirecting to login.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
        router.replace('/');
        return; 
      }

      // --- Role Check --- 
      const userRoleId = decoded.roleId && Array.isArray(decoded.roleId) && decoded.roleId.length > 0 
                       ? decoded.roleId[0].roleId 
                       : undefined;
      console.log('[UserDashboardLayout] Extracted userRoleId:', userRoleId);

      if (userRoleId === 3) { // Compare with 3 (User)
        console.log('[UserDashboardLayout] User is authorized. Access granted.');
        setIsAuthorized(true);
      } else {
        console.log(`[UserDashboardLayout] User is not authorized (roleId: ${userRoleId}), redirecting.`);
        toast.error('Akses ditolak. Anda tidak memiliki izin yang tepat.');
        
        // If user is admin, redirect to admin dashboard, otherwise to home
        if (userRoleId === 1) {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/');
        }
        return;
      }
    } catch (error) {
      console.error('[UserDashboardLayout] Invalid token or decoding error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.error('Token tidak valid. Silakan login kembali.');
      router.replace('/');
      return;
    } finally {
      setCheckingAuth(false);
      console.log('[UserDashboardLayout] Auth check complete.');
    }
  };

  // Show loading state while checking authorization
  if (checkingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="mb-4">Memeriksa otorisasi...</p>
        <Skeleton className="h-4 w-[200px] mb-2" />
        <Skeleton className="h-4 w-[150px] mb-2" />
        <Skeleton className="h-4 w-[180px]" />
      </div>
    );
  }

  // If authorized, render the children
  if (isAuthorized) {
    return <>{children}</>;
  }

  // Fallback (should be handled by redirects, but good for safety)
  return null;
} 