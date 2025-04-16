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
    { media: "(prefers-color-scheme: light)", color: "#FFD700" }, // Gold for light mode
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
      <head />
      <body
        className={clsx(
          "min-h-screen font-sans antialiased",
          fontSans.variable
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
          <AuthProvider>
            <div className="relative flex flex-col min-h-screen bg-gradient-custom">
              <Navy />
              <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
                {children}
              </main>

              {/* Footer */}
              <footer className="container mx-auto max-w-7xl pt-16 px-6 bg-gradient-to-t from-red-600 to-yellow-500 text-white">
                <Divider className="mb-4 border-gray-200" />

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-1">
                  <div>
                    <RanoIcon />
                    <div className="grid grid-cols-10 gap-2 mt-2">
                      <Link
                        href={siteConfig.links.google}
                        aria-label="Google"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Image
                          className="mt-1"
                          src="https://developers.google.com/static/maps/images/maps-icon.svg"
                          alt="Google Maps Logo"
                          width={30}
                          height={30}
                        />
                      </Link>
                      <Link
                        href={siteConfig.links.whatsapp}
                        aria-label="Whatsapp"
                      >
                        <WhatsappIcon />
                      </Link>
                    </div>
                  </div>

                  <div>
                    <h1 className="text-lg font-semibold">Bantuan</h1>
                    <ul className="text-sm">
                      {siteConfig.footerItems.map((item) => (
                        <li
                          key={item.href}
                          className="hover:text-yellow-200 transition-colors"
                        >
                          <Link href={item.href}>{item.label}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h1 className="text-lg font-semibold">Jam Kerja</h1>
                    <ul className="text-sm">
                      <li>Senin - Jumat: 8:00 WIB - 5:00 WIB</li>
                      <li>Sabtu: 8:00 WIB - 12:00 WIB</li>
                      <li>Minggu: tutup</li>
                    </ul>
                  </div>

                  <div>
                    <h1 className="text-lg font-semibold">Metode Pembayaran</h1>
                    <ul className="flex space-x-4 mt-2">
                      <li>
                        <Image
                          src="/visa-logo.png"
                          alt="Visa"
                          width={40}
                          height={20}
                        />
                      </li>
                      <li>
                        <Image
                          src="/mastercard-logo.png"
                          alt="Mastercard"
                          width={40}
                          height={20}
                        />
                      </li>
                    </ul>
                  </div>
                </div>

                <Divider className="mt-4 border-gray-200" />
                <div className="text-center py-4 text-sm">
                  © 2024 Rano Cake. All rights reserved.
                </div>
              </footer>
            </div>
            <Toaster />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
