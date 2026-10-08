import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from '@/lib/LanguageProvider';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Thailand TOR Intelligence - Software House Matcher & AI Evaluator",
  description: "Centralized AI platform for discovering, evaluating, and matching Thailand TOR contracts with Software Houses and Freelancers using Vertex AI.",
  keywords: ["Thailand TOR", "Software House", "TOR Evaluation", "Vertex AI", "Contract Matching", "Thailand Government Procurement"],
  authors: [{ name: "Thailand TOR Platform Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${inter.variable}`}>
      <body className="antialiased min-h-screen">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
