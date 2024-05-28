"use client";
import React, { useState } from 'react';
import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@nextui-org/navbar";
import { Button } from "@nextui-org/button";
import NextLink from "next/link";
import clsx from "clsx";
import { Logo } from "@/components/icons";
import { siteConfig } from "@/config/site";
import { usePathname } from 'next/navigation';
import "./../styles/navbar.css";

export const Navbar = function ({ onOpenModal } : {onOpenModal: () => void}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  if (typeof window !== "undefined") {
    window.addEventListener('resize', () => {setIsMenuOpen(false)});
    
  }

  return (
    <NextUINavbar maxWidth="lg" position="sticky">
      <NavbarContent className="flex items-center" justify="start">
        <NavbarBrand as="li">
          <NextLink href="/">
            <div className="flex items-center gap-1">
              <Logo />
              <p className="font-bold text-inherit">BiblioTech</p>
            </div>
          </NextLink>
        </NavbarBrand>
        <div className={clsx("flex-grow pl-40 navbar-items", { hidden: isMenuOpen })}>
          <ul className="flex gap-4">
            {siteConfig.navItems.map((item) => (
              <NavbarItem
              key={item.href}
              className={pathname === item.href ? 'active-tab' : ''}
            >
                <NextLink href={item.href}>
                  {item.label}
                </NextLink>
              </NavbarItem>
            ))}
          </ul>
        </div>
        <div className="flex gap-4">
          <Button color="primary" variant="solid" onClick={onOpenModal} className="sign">
              Connexion
            </Button>
          <Button color="secondary" variant="faded" className="sign">
            Inscription
          </Button>
        </div>
        <NavbarMenuToggle
          aria-label="Toggle menu"
          className="navbar-menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        />
      </NavbarContent>

      {isMenuOpen && (
        <NavbarMenu className="lg:hidden">
          {siteConfig.navItems.map((item) => (
            <NavbarMenuItem key={item.href}>
              <NextLink href={item.href}>
                {item.label}
              </NextLink>
            </NavbarMenuItem>
          ))}
		  <NavbarMenuItem>
            <Button color="primary" variant="solid" onClick={onOpenModal} className="sign2">
              Connexion
            </Button>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Button color="secondary" variant="faded" className="sign2">
              Inscription
            </Button>
          </NavbarMenuItem>
        </NavbarMenu>
      )}
    </NextUINavbar>
  );
};