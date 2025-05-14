import { useEffect } from 'react';

// Reset cart function untuk mengatasi masalah guest session
export const resetCartIfNeeded = async () => {
  // Cek apakah ini pertama kali halaman dimuat
  if (!sessionStorage.getItem('app_initialized')) {
    console.log('Initializing app and resetting cart state');
    
    // Tandai bahwa halaman sudah dimuat
    sessionStorage.setItem('app_initialized', 'true');
    
    // Reset localStorage cart-related data
    localStorage.removeItem('session_restored');
    localStorage.setItem('cart_items', JSON.stringify([]));
    localStorage.setItem('cart_count', '0');
    localStorage.setItem('cart_total', '0');
    
    // Ambil guest ID dari localStorage (jika ada)
    const storedGuestId = localStorage.getItem("guestId");
    
    if (storedGuestId) {
      try {
        // Force call API untuk membersihkan cart di database
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/cart/clear-guest-cart?guestId=${storedGuestId}`,
          { 
            method: 'DELETE',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            }
          }
        );
        console.log('Cart cleanup response:', await response.json());
      } catch (err) {
        console.error('Failed to clear guest cart:', err);
      }
    }
    
    // Trigger event untuk memaksa komponen memperbarui
    window.dispatchEvent(new Event("FORCE_CART_RESET"));
  }
}; 