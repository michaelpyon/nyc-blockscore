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
  title: "BlockScore: NYC Block Intelligence",
  description:
    "Block-level scores across noise, transit, food, walkability, and construction for Brooklyn and Manhattan.",
  openGraph: {
    type: "website",
    title: "BlockScore: NYC Block Intelligence",
    description:
      "Score any NYC block on noise, transit, food, walkability, and construction before you sign the lease.",
    url: "https://nyc-blockscore-app.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "BlockScore: NYC Block Intelligence",
    description:
      "Score any NYC block on noise, transit, food, walkability, and construction before you sign the lease.",
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
