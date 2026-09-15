import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://tow-gg-xyz.iamxd79.workers.dev"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "GG Thesis of the Week",
    title: "Thesis of the Week � GG",
    description: "Submit your GG thesis. Win $1,000 USDC or earn ggPoints.",
    images: [{ url: "/og-social.png", width: 2172, height: 724, alt: "GG Thesis of the Week" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Thesis of the Week � GG",
    description: "Submit your GG thesis. Win $1,000 USDC or earn ggPoints.",
    images: ["/og-social.png"],
  },
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

