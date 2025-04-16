"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: number;
  email: string;
  name: string;
  fullName: string;
  photoProfile?: string;
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check for stored user data on initial load
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Basic validation: check if essential properties exist
        if (parsedUser && parsedUser.id && parsedUser.email && parsedUser.fullName) {
           // You might want to add a check for a token if you store one:
           // if (parsedUser.token) { ... }
          setUser(parsedUser);
          setIsLoggedIn(true);
        } else {
          // Invalid user structure, clear storage
          console.warn("Invalid user data found in localStorage. Clearing...");
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        // Clear storage if parsing fails
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    localStorage.removeItem("guestId");
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout }}>
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
