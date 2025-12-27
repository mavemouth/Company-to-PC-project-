import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from "components/user-context";
import { DashboardLayout } from "components/dashboard-layout";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "CTPC Dashboard",
  description: "Central Training and Placement Cell Dashboard",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <DashboardLayout>{children}</DashboardLayout>
        </UserProvider>
      </body>
    </html>
  );
}
