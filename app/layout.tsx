import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "@/components/providers/SettingsProvider";
import { ConversationsProvider } from "@/components/providers/ConversationsProvider";
import { AppShell } from "@/components/AppShell";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${APP_NAME} — AI Voice Assistant`,
  description: APP_TAGLINE,
  applicationName: APP_NAME,
  authors: [{ name: "Nova Voice Assistant" }],
  keywords: ["voice assistant", "AI", "speech recognition", "Next.js"],
};

export const viewport: Viewport = {
  themeColor: "#0a0a12",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <SettingsProvider>
          <ConversationsProvider>
            <AppShell>{children}</AppShell>
          </ConversationsProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
