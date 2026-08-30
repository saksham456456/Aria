import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ARIA Co-Teacher",
  description: "AI-powered live classroom for real learning",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
