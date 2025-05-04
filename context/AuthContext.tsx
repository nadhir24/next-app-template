"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";

interface User {
  id: number;
  email: string;
  name: string;
  fullName: string;
  phoneNumber?: string;
  photoProfile?: string;
  token?: string;
  roleId?: { roleId: number }[];
  userProfile?: {
    birthDate?: string;
    gender?: string;
    address?: {
      label?: string;
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    addresses?: Array<{
      id: number;
      label?: string;
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      isDefault: boolean;
      createdAt: string;
      updatedAt: string | null;
      userProfileId: number;
    }>;
  };
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  setUserState: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on initial load
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Basic validation: check if essential properties exist
        if (parsedUser && parsedUser.id && parsedUser.email && parsedUser.fullName) {
          setUser(parsedUser);
          setIsLoggedIn(true);
        } else {
          console.warn("Invalid user data found in localStorage. Clearing...");
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    console.log('[AuthContext] Login called with user:', userData.email);
    
    // Ensure the token exists
    if (!userData.token) {
      console.error('[AuthContext] Login attempted with missing token!');
    } else {
      console.log('[AuthContext] Setting token in localStorage');
      localStorage.setItem("token", userData.token);
      
      // Verify token was saved
      const savedToken = localStorage.getItem("token");
      if (!savedToken) {
        console.error('[AuthContext] Failed to save token to localStorage!');
      }
    }
    
    // Update state
    setUser(userData);
    setIsLoggedIn(true);
    
    // Save user data
    localStorage.setItem("user", JSON.stringify(userData));
    
    // Clean up guest ID if it exists
    localStorage.removeItem("guestId");
    
    console.log('[AuthContext] Login completed successfully');
  };

  const logout = () => {
    // First, announce we're starting logout
    console.log("🚫 AUTH CONTEXT: LOGOUT INITIATED");
    
    // Immediately set state changes
    setUser(null);
    setIsLoggedIn(false);
    
    // Broadcast the most important custom event BEFORE clearing storage
    window.dispatchEvent(new CustomEvent('FORCE_CART_RESET', {
      detail: { reason: 'explicit_logout' }
    }));
    
    // Wait briefly to allow components to react
    setTimeout(() => {
      // Clear all relevant data from localStorage
      try {
        console.log("🧹 AUTH CONTEXT: Clearing localStorage data");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("guestId");
        
        // Explicitly remove CartContext keys
        localStorage.removeItem("cart_items");
        localStorage.removeItem("cart_count");
        localStorage.removeItem("cart_total");
        localStorage.removeItem("cart_last_fetch_time");
        
        // Also remove the old "cart" key if it exists
        localStorage.removeItem("cart");
        
        // Clear any other possible cart-related data in sessionStorage
        sessionStorage.removeItem("cart");
        
        // Verification (Optional but good practice)
        if (localStorage.getItem("cart_items")) {
          console.warn("⚠️ cart_items still exists after removal attempt.");
          localStorage.removeItem("cart_items");
        }
         if (localStorage.getItem("cart_count")) {
          console.warn("⚠️ cart_count still exists after removal attempt.");
          localStorage.removeItem("cart_count");
        }
         if (localStorage.getItem("cart_total")) {
          console.warn("⚠️ cart_total still exists after removal attempt.");
          localStorage.removeItem("cart_total");
        }
        if (localStorage.getItem("cart_last_fetch_time")) {
          console.warn("⚠️ cart_last_fetch_time still exists after removal attempt.");
          localStorage.removeItem("cart_last_fetch_time");
        }

      } catch (e) {
        console.error("Error during storage cleanup:", e);
      }
      
      // Trigger standard storage events for other components to react
      try {
        console.log("🔄 AUTH CONTEXT: Dispatching storage events");
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'user',
          newValue: null
        }));
        
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'cart',
          newValue: null
        }));
        
        // Final cart_clear_needed event
        window.dispatchEvent(new CustomEvent('cart_clear_needed', {
          detail: { reason: 'logout_completed' }
        }));
      } catch (e) {
        console.error("Error dispatching events:", e);
      }
      
      console.log("✅ AUTH CONTEXT: Logout completed");
    }, 50); // 50ms delay
  };

  const setUserState = (userData: Partial<User>) => {
    // Get the current token from localStorage first
    const currentToken = localStorage.getItem("token");
    
    console.log('[AuthContext] setUserState called with:', userData);
    console.log('[AuthContext] Current token in localStorage:', currentToken ? 'Present' : 'Missing');

    // If we don't have a token but userData has one, use it
    if (!currentToken && userData.token) {
      console.log('[AuthContext] Using token from userData');
      localStorage.setItem("token", userData.token);
    }
    
    // Get the token again (either existing or new)
    const tokenToUse = localStorage.getItem("token") || userData.token;
    
    if (!tokenToUse) {
      console.warn('[AuthContext] No token available after update attempt');
    }

    const currentUser = user || {} as User;
    const updatedUserData = {
      ...currentUser,
      ...userData,
      // Always include the token in the user object
      token: tokenToUse
    };
    
    setUser(updatedUserData);
    localStorage.setItem("user", JSON.stringify(updatedUserData));
    
    console.log('[AuthContext] User state updated:', updatedUserData.id);
    console.log('[AuthContext] Token status after update:', localStorage.getItem("token") ? 'Present' : 'Missing');
  };

  // Placeholder function for refreshing the token
  const refreshToken = async () => {
    console.warn('[AuthContext] refreshToken function needs implementation!');
    // TODO: Implement API call to your backend refresh token endpoint
    // Example:
    // try {
    //   const response = await fetch('/api/auth/refresh', { method: 'POST' });
    //   const data = await response.json();
    //   if (data.token) {
    //     localStorage.setItem("token", data.token);
    //     console.log('[AuthContext] Token refreshed successfully.');
    //   } else {
    //     logout(); // Logout if refresh fails
    //   }
    // } catch (error) {
    //   console.error('[AuthContext] Error refreshing token:', error);
    //   logout(); // Logout on error
    // }
  };

  // useEffect for periodic token check
  useEffect(() => {
    const checkTokenExpiry = () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded: { exp: number } = jwtDecode(token);
          const expiryTime = decoded.exp * 1000; // Convert to milliseconds
          const currentTime = Date.now();
          const bufferTime = 15 * 60 * 1000; // 15 minutes buffer

          console.log(`[AuthContext] Token Check: Expires at ${new Date(expiryTime)}, Current time ${new Date(currentTime)}, Diff: ${(expiryTime - currentTime)/1000}s`);

          // If token expires within the buffer time
          if (expiryTime - currentTime < bufferTime) {
            console.log('[AuthContext] Token nearing expiry or expired. Attempting refresh.');
            refreshToken();
          }
        } catch (e) {
          console.error("[AuthContext] Error decoding token during check:", e);
          // Optionally logout if token is invalid
          // logout(); 
        }
      }
    };

    // Check immediately on mount
    checkTokenExpiry();

    // Set interval to check every 5 minutes
    const intervalId = setInterval(checkTokenExpiry, 5 * 60 * 1000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [user]); // Re-run if user state changes, e.g., after login

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, isLoading, login, logout, setUserState }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
