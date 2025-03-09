"use client";
import {
  Navbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import Modall from "./modal";
import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "./theme-switch";
import Link from "next/link";
import { RanoIcon } from "./icons";
import HoverCartModal from "@/function/HoverCartModal"; // Pastikan jalur ini benar
import { useState } from "react";
import { CartItem } from "@/function/CartItem";
``
export default function Navy() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Default sebagai tamu

  return (
    <Navbar maxWidth="xl" className="sticky top-0 z-50">
      <NavbarContent className="flex items-center justify-between">
        <div className="flex items-center justify-between">
          <NavbarContent className="sm:hidden basis-1 mr-4" justify="start">
            <NavbarMenuToggle />
          </NavbarContent>
          <NavbarBrand as="li" className="max-w-fit mr-4">
            <Link href="/" className="flex items-center gap-1 mt-2 mb-2">
              <RanoIcon />
            </Link>
          </NavbarBrand>
        </div>
        <div className="hidden sm:flex items-center">
          <ul className="flex gap-4 justify-start ml-2">
            {siteConfig.navItems.map((item) => (
              <NavbarItem key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </NavbarItem>
            ))}
          </ul>
        </div>
      </NavbarContent>
      <NavbarContent className="flex basis-1/5 sm:basis-full px-4 lg:px-8" justify="end">
        <NavbarItem className="sm:flex gap-2">
          {/* Pass cartItems and setCartItems props to HoverCart */}
          <HoverCartModal 
            cartItems={cartItems} 
            setCartItems={setCartItems} 
            isLoggedIn={isLoggedIn} 
          />
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem>
          <Modall />
        </NavbarItem>
      </NavbarContent>
      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                className={
                  index === 2
                    ? "text-primary"
                    : index === siteConfig.navMenuItems.length - 1
                    ? "text-red-500"
                    : "text-black"
                }
                href={item.href}
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </Navbar>
  );
}