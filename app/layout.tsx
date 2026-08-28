import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DimsCash",
  description: "Aplikasi manajemen keuangan pribadi",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Theme is resolved on the server from a cookie — no client-side script
  // needed, so there is never a flash of the wrong theme.
  const theme = (await cookies()).get("theme")?.value;
  const pinnedDark = theme === "dark";

  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased ${
        pinnedDark ? "dark" : ""
      }`}
      data-theme={theme === "dark" || theme === "light" ? theme : undefined}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
