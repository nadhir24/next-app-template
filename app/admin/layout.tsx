'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // Assuming you use AuthContext
import { jwtDecode } from 'jwt-decode';
import { toast } from 'sonner'; // Or your preferred toast library
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

interface DecodedToken {
  userId: number;
  email: string;
  roleId: Array<{ userId: number; roleId: number }>;
  iat: number;
  exp: number;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  // Use auth context if available to potentially speed up check or get user info
  // const { user, loading: authLoading } = useAuth(); 
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    console.log('[AdminLayout] Starting auth check...');
    setCheckingAuth(true);
    
    const token = localStorage.getItem('token');
    console.log('[AdminLayout] Token from localStorage:', token ? 'Found' : 'Not Found');

    if (!token) {
      console.log('[AdminLayout] No token found, redirecting to login.');
      toast.error('Akses ditolak. Silakan login terlebih dahulu.');
      router.replace('/'); 
      return; // Stop further execution in this effect run
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      console.log('[AdminLayout] Decoded token:', decoded);

      // Check token expiration
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        console.log('[AdminLayout] Token expired, redirecting to login.');
        localStorage.removeItem('token');
        localStorage.removeItem('user'); // Also clear stored user data if any
        toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
        router.replace('/');
        return; 
      }

      // --- Role Check --- 
      // Access the roleId within the first element of the roleId array
      const userRoleId = decoded.roleId && Array.isArray(decoded.roleId) && decoded.roleId.length > 0 
                       ? decoded.roleId[0].roleId 
                       : undefined;
      console.log('[AdminLayout] Extracted userRoleId:', userRoleId);

      if (userRoleId === 1) { // Compare the extracted roleId with 1 (Admin)
        console.log('[AdminLayout] User is Admin. Access granted.');
        setIsAuthorized(true);
      } else {
        console.log(`[AdminLayout] User is not Admin (extracted roleId: ${userRoleId}), redirecting to home.`);
        toast.error('Akses ditolak. Anda tidak memiliki izin admin.');
        router.replace('/'); // Redirect non-admins to home page
        return;
      }
    } catch (error) {
      console.error('[AdminLayout] Invalid token or decoding error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.error('Token tidak valid. Silakan login kembali.');
      router.replace('/'); // Redirect if token is invalid
      return;
    } finally {
      setCheckingAuth(false);
      console.log('[AdminLayout] Auth check complete.');
    }
  // Run only once on mount, router changes shouldn't trigger re-check unless needed
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]); 

  // Show loading state while checking authorization
  if (checkingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="mb-4">Memeriksa otorisasi admin...</p>
        
      </div>
    );
  }

  // If authorized, render the children (the actual admin page content)
  if (isAuthorized) {
    return <>{children}</>;
  }

  // Fallback (should be handled by redirects, but good for safety)
  // Returning null prevents rendering anything before redirect completes
  return null; 
} 