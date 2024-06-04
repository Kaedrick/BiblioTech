"use client";
import React, { useState, useEffect } from 'react';
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
import Image from 'next/image';
import Link from "next/link";
import clsx from "clsx";
import { Logo } from "@/components/icons";
import { siteConfig } from "@/config/site";
import { usePathname } from 'next/navigation';
import axios from 'axios';
import "./../styles/navbar.css";
require('dotenv').config();
const serverUrl = process.env.BASE_URL || 'http://localhost:3001';
const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

export const Navbar = function ({ onOpenModal } : {onOpenModal: () => void}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Waits for loggin check before loading the page
  const pathname = usePathname();

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };
  

  useEffect(() => {
    const checkIfLoggedIn = () => {
      axios.get(`${serverUrl}/check-auth`, { withCredentials: true })
        .then((res) => {
          if (res.data.isAuthenticated) {
            setIsAuthenticated(true);
          }
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setIsLoading(false); // Ends loading AFTER the call to the server
        }); 
    };

    // If user clicks outside of the menu, it'll close it
    document.body.addEventListener('click', (event: MouseEvent) => {
      if (!event.target) {
        return;
      }
    
      const closestProfileMenu = (event.target as HTMLElement).closest('.profile-menu');
    
      if (!closestProfileMenu) {
        setIsProfileMenuOpen(false);
      }
    });
    checkIfLoggedIn();
  }, []);

  if (isLoading) {
    return null;
  }

  if (typeof window !== "undefined") {
    window.addEventListener('resize', () => {setIsMenuOpen(false)});
  }

  const logout = () => {
    console.log("test");
    axios({
      method: "post",
      withCredentials: true,
      url: `${serverUrl}/logout`,
      timeout: 5000
    }).then((res) => {
      if(res.status === 200) {
        console.log("OK");
        window.location.reload();
      }
    }).catch((err) => {
      if (err.response) {
          console.log(err);
          console.log("ERROR 403");
      }
    })
  };

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
        {!isAuthenticated && (
          <>
            <Button color="primary" variant="solid" onClick={onOpenModal} className="sign">
                Connexion
              </Button>
            <Link href="/inscription" legacyBehavior>
              <Button color="secondary" variant="faded" className="sign">
                Inscription
              </Button>
            </Link>
          </>
        )}
        </div>
        <div>
        {isAuthenticated && (
          <>
            <Image
              src="/img/profil.png" 
              alt="Profile"
              width={43}
              height={43}
              className="cursor-pointer profile"
              onClick={toggleProfileMenu}
            />
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-59 profile-menu">
                <ul>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    Mon profil
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    Mes réservations
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={logout}>
                      Déconnexion
                  </li>
                </ul>
              </div>
            )}
            </>
            )}
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
      {!isAuthenticated && (
          <>
            <Button color="primary" variant="solid" onClick={onOpenModal} className="sign2">
              Connexion
            </Button>
          </>
        )}  
          </NavbarMenuItem>
          <NavbarMenuItem>
          {!isAuthenticated && (
            <>
            <Link href="/inscription" legacyBehavior>
              <Button color="secondary" variant="faded" className="sign2">
                Inscription
              </Button>
            </Link>
            </>
          )}
          </NavbarMenuItem>
        </NavbarMenu>
      )}
    </NextUINavbar>
  );
};