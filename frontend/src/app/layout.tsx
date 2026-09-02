import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Bangkok TOR Intelligence - Software House Matcher & AI Evaluator",
  description: "Centralized AI platform for discovering, evaluating, and matching Bangkok TOR contracts with Software Houses and Freelancers using Vertex AI.",
  keywords: ["Bangkok TOR", "Software House", "TOR Evaluation", "Vertex AI", "Contract Matching", "BMA Government Procurement"],
  authors: [{ name: "Bangkok TOR Platform Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${inter.variable}`}>
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
