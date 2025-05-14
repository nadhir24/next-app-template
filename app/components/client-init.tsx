'use client';

import { useEffect } from 'react';
import { resetCartIfNeeded } from '../_app';

// Client-side component untuk menginisialisasi reset cart otomatis
export default function ClientInit() {
  useEffect(() => {
    const initApp = async () => {
      try {
        await resetCartIfNeeded();
      } catch (error) {
        console.error("Failed to initialize app:", error);
      }
    };
    
    initApp();
  }, []);
  
  return null;
} 