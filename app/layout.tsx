import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SupabaseProvider from '@/app/lib/providers/SupabaseProvider';
import Navbar from "@/app/components/Navbar";
import TimeTracker from "@/app/TimeTracker";

export const metadata: Metadata = {
  title: "Fluentures",
  description: "Sign up for Fluentures and explore its features.",
  icons: {
    icon: "/favicon.ico",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SupabaseProvider>
          <TimeTracker intervalMinutes={1} />
          <Navbar/>
          {children}
        </SupabaseProvider>
      </body>
    </html>
  );
}
