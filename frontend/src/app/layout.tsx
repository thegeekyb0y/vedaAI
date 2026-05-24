import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Toaster } from "react-hot-toast";
import { Topbar } from "@/components/layout/TopBar";

const bricolage = localFont({
  src: "./fonts/BricolageGrotesqueLatin.woff2",
  weight: "400 700",
  variable: "--font-bricolage",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VedaAI",
  description: "AI Assessment Creator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bricolage.variable} ${inter.variable} `}>
      <body className="min-h-screen ">
        <Sidebar />
        <div className="min-h-screen lg:pl-[calc(var(--sidebar-width)+var(--shell-gap)+(var(--shell-pad)*2))]">
          <Topbar />
          <main className="min-h-screen px-4 pb-24 pt-[calc(var(--topbar-height)+1rem)] sm:px-6 lg:px-[var(--shell-pad)] lg:pb-10 lg:pr-[var(--shell-pad)] lg:pt-[calc(var(--topbar-height)+var(--shell-gap)+var(--shell-pad))]">
            {children}
          </main>
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
