import type { Metadata } from "next";
import "./globals.css";
import { LayoutWrapper } from "@/components/LayoutWrapper";

export const metadata: Metadata = {
  title: "InstaBot | Pro Instagram Automation",
  description: "The most reliable and secure Instagram automation platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full bg-[#020617] text-slate-200 antialiased selection:bg-indigo-500/30">
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
