"use client";

import * as React from "react";
import { NextUIProvider } from "@nextui-org/system";
import { useRouter } from 'next/navigation';
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: Omit<ThemeProviderProps, 'children'>; // Exclude children from themeProps
}

const Providers: React.FC<ProvidersProps> = ({ children, themeProps }) => {
  const router = useRouter();

  return (
    <NextUIProvider navigate={router.push}>
      <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false} {...themeProps}>
        {children}
      </NextThemesProvider>
    </NextUIProvider>
  );
};

export default Providers;
