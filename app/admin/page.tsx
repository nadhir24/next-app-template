"use client";
import { Input } from "@nextui-org/input";
import { title } from "@/components/primitives";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@nextui-org/navbar";
import { useState } from "react";
export default function admin() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <h1>test</h1>
      <div className={title()}>hello</div>
      <Navbar>
        <NavbarContent>
          <NavbarBrand>helllo</NavbarBrand>
        </NavbarContent>

        <NavbarMenu>
          <NavbarMenuItem>helllo1</NavbarMenuItem>
          <NavbarMenuItem>helllo2</NavbarMenuItem>
          {/* Add more NavbarMenuItem as needed */}
        </NavbarMenu>
      </Navbar>
    </>
  );
}
