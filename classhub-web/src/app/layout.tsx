import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Header } from "@/components/layout/Header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: {
    default: "ClassHub — Find Trusted Tutors in Chennai",
    template: "%s | ClassHub",
  },
  description:
    "Chennai's marketplace for verified tutors and tuition centers. Browse, compare, and book the best home tutors for CBSE, State Board, and NEET.",
  keywords: ["tutor", "tuition", "Chennai", "CBSE", "NEET", "home tutor", "online tutor"],
  authors: [{ name: "ClassHub" }],
  creator: "ClassHub",
  openGraph: {
    type: "website",
    locale: "en_IN",
    title: "ClassHub — Find Trusted Tutors in Chennai",
    description: "Browse verified tutors and tuition centers. Book your first class today.",
    siteName: "ClassHub",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClassHub — Find Trusted Tutors in Chennai",
    description: "Browse verified tutors and tuition centers. Book your first class today.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
