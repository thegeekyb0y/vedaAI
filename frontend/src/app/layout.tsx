import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Toaster } from "react-hot-toast";
import { Topbar } from "@/components/layout/TopBar";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bricolage",
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
    <html lang="en" className={bricolage.variable}>
      <body>
        <Sidebar />
        <div className="layout-main">
          <Topbar />
          <main className="layout-content">{children}</main>
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
