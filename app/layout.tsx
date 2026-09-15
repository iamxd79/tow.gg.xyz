import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thesis of the Week · GG",
  description: "Submit your GG thesis. Win $1,000 USDC or earn ggPoints.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

