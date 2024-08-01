import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import HandleUserLogin from "./components/HandleUserLogin";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TouchGrass",
  description: "Your ultimate platform for creating, discovering, and managing events!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <UserProvider>
        <HandleUserLogin/>
      <body className=  {inter.className}   >
        <Navbar/>
        {children}
        </body>
        </UserProvider>
    </html>
  );
}
