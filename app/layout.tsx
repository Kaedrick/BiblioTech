"use client";

import "@/styles/globals.css";
import { Viewport } from "next";
import { fontSans } from "@/config/fonts";
import { Providers } from "./providers";
import { Navbar } from "@/components/navbar";
import ModalLogin from "@/components/modalLogin";
import { Link } from "@nextui-org/link";
import { useState } from 'react';
import clsx from "clsx";

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "white" },
		{ media: "(prefers-color-scheme: dark)", color: "black" },
	],
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {

	const [showModal, setShowModal] = useState(false);

    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

	return (
		<html lang="en" suppressHydrationWarning>
			<head />
			<body
				className={clsx(
					"min-h-screen bg-background font-sans antialiased",
					fontSans.variable
				)}
			>
				<Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
					<div className="relative flex flex-col h-screen">
						<Navbar onOpenModal={handleOpenModal}/>
						<main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
							{children}
							<ModalLogin show={showModal} onClose={handleCloseModal}/>
						</main>
						<footer className="w-full flex items-center justify-center py-3">
						</footer>
					</div>
				</Providers>
			</body>
		</html>
	);
}
