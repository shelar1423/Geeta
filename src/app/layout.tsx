import type { Metadata, Viewport } from "next";
import { Eczar, Mukta, Tiro_Devanagari_Sanskrit } from "next/font/google";
import "./globals.css";

const display = Eczar({ variable: "--font-display", subsets: ["latin", "devanagari"], weight: ["500", "700"] });
const body = Mukta({ variable: "--font-body", subsets: ["latin", "devanagari"], weight: ["400", "500", "600"] });
const shloka = Tiro_Devanagari_Sanskrit({
  variable: "--font-shloka",
  subsets: ["latin", "devanagari"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Gita Vani",
  description: "The Bhagavad Gita as a living dialogue: Krishna, Arjuna, Sanjaya and Dhritarashtra, each in their own voice, in Hindi, English and Marathi.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf6ef" },
    { media: "(prefers-color-scheme: dark)", color: "#14110d" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${shloka.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
