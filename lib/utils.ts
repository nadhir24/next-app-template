import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Normalizes a URL by fixing double slashes in the path portion
 * This is particularly useful for image URLs from the backend
 * @param url The URL to normalize
 * @returns The normalized URL with no double slashes in the path
 */
export function normalizeImageUrl(url: string): string {
  if (!url) return url;
  
  try {
    // For complete URLs (with protocol and domain)
    if (url.includes('://')) {
      const urlObj = new URL(url);
      // Fix path with double slashes
      urlObj.pathname = urlObj.pathname.replace(/\/+/g, '/');
      return urlObj.toString();
    } 
    // For relative URLs (just the path)
    else {
      return url.replace(/\/+/g, '/');
    }
  } catch (error) {
    // If URL parsing fails, just do basic replacement
    return url.replace(/([^:])\/+/g, '$1/');
  }
}
