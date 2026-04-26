import "./globals.css";

import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meal Planner AI",
  description: "Plan meals, generate grocery lists, and keep prep simple.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.className} min-h-screen bg-[#fbf9f4] text-[#1b1c19] antialiased`}
      >
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#0f5238]/8 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#fc8a40]/8 blur-3xl" />
        </div>
        {children}
      </body>
    </html>
  );
}
