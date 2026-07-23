import type { Metadata } from "next";
import { Space_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nyc-blockscore-app.vercel.app"),
  title: "BlockScore: Compare NYC blocks",
  description:
    "Compare 51 curated sample NYC blocks across noise, transit, food, walkability, and construction, then get a verdict.",
  openGraph: {
    type: "website",
    title: "BlockScore: The 11pm walk-by, without leaving bed",
    description:
      "Compare 51 curated sample NYC blocks, get a winner, and see the receipt that broke the tie.",
    url: "https://nyc-blockscore-app.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "BlockScore: The 11pm walk-by, without leaving bed",
    description:
      "Compare 51 curated sample NYC blocks, get a winner, and see the receipt that broke the tie.",
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
      className={`${spaceGrotesk.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
