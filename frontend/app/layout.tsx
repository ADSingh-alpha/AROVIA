import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../src/shaders/laser/laser.css";
import { LaserBackground } from "../src/shaders/laser/LaserBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AROVIA — The Online Pitching Platform",
  description:
    "AROVIA is where visionary founders meet decision-making investors in real time. Pitch your idea to the world.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#020305] text-white overflow-x-hidden">
        {/* ── Vanishing Array laser — full-viewport fixed background ── */}
        <LaserBackground />

        {/* ── Page content sits above the WebGL canvas ── */}
        <div className="arovia-page-content relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
