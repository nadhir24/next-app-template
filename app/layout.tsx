import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Providers } from "./providers";
import clsx from "clsx";
import Link from "next/link";
import {
  GoogleMapsIcon,
  HeartFilledIcon,
  Logo,
  RanoIcon,
  WhatsappIcon,
} from "@/components/icons";
import { title } from "@/components/primitives";
import Navy from "@/components/navbar";
import { Divider } from "@heroui/divider";
import Image from "next/image";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFD500" }, // Gold for light mode
    { media: "(prefers-color-scheme: dark)", color: "#8B0000" }, // Dark red for dark mode
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {process.env.NEXT_PUBLIC_API_URL && (
          <link 
            rel="preconnect" 
            href={process.env.NEXT_PUBLIC_API_URL} 
          />
        )}
      </head>
      <body
        className={clsx(
          "min-h-screen font-sans antialiased",
          fontSans.variable
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
          <AuthProvider>
            <CartProvider>
              <div className="relative flex flex-col min-h-screen bg-gradient-custom">
                <Navy />
                <main className="container mx-auto pt-16 px-6 flex-grow">
                  {children}
                </main>

                {/* Footer */}
                <footer className="w-full bg-gradient-to-t from-red-600 to-yellow-500 text-white mt-32">
                  <div className="container mx-auto max-w-7xl px-6 py-12">
                    <Divider className="mb-8 border-gray-200" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                      <div>
                        <h3 className="text-xl font-bold mb-6">Tentang Kami</h3>
                        <p className="text-gray-100">Rano cake adalah produsen makanan ringan berkualitas baik.</p>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-6">Kontak</h3>
                        <p className="text-gray-100">Email: info@ranocake.com</p>
                        <p className="text-gray-100">Telepon: (021) 123-4567</p>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-6">Support Pembayaran</h3>
                        <div className="flex flex-col space-y-6">
                          <div className="grid grid-cols-3 gap-4 items-center">
                            <Link href={siteConfig.links.whatsapp} target="_blank" rel="noopener noreferrer" title="Hubungi via WhatsApp">
                              <WhatsappIcon className="text-white hover:text-gray-300 transition-colors" size={35} />
                            </Link>
                            <Image
                              src="/GoPay.svg"
                              alt="GoPay"
                              width={80}
                              height={80}
                              className="hover:opacity-80 transition-opacity object-contain h-auto w-auto"
                            />
                            <Image
                              src="/QRIS.svg"
                              alt="QRIS"
                              width={80}
                              height={80}
                              className="hover:opacity-80 transition-opacity object-contain h-auto w-auto"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-4 items-center">
                            <Image
                              src="/jcb.svg"
                              alt="jcb"
                              width={60}
                              height={60}
                              className="hover:opacity-80 transition-opacity object-contain h-auto w-auto"
                            />
                            <Image
                              src="/visa.svg"
                              alt="visa"
                              width={60}
                              height={60}
                              className="hover:opacity-80 transition-opacity object-contain h-auto w-auto"
                            />
                            <Image
                              src="/msc.svg"
                              alt="msc"
                              width={60}
                              height={60}
                              className="hover:opacity-80 transition-opacity object-contain h-auto w-auto"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center mt-12">
                      <p className="text-gray-100">&copy; {new Date().getFullYear()} Rano Cake. All rights reserved.</p>
                    </div>
                  </div>
                </footer>
              </div>
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
