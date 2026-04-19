import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stride - AI Fitness Coach",
  description: "Log workouts naturally. Let AI handle the rest.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Stride",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pb-20 sm:pb-0 bg-gray-50">
        <Navigation />
        <main className="flex-1 w-full h-full">
          {children}
        </main>
      </body>
    </html>
  );
}
