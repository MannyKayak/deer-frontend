import type { Metadata } from "next";
import { Lexend, Inter } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  variable: "--font-lexend-raw",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter-raw",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Deer — La strada più veloce per vincere la farmacia",
  description:
    "3000 domande ufficiali per il concorso pubblico farmacie. Le ricordi con la mnemotecnica, non le rileggi all'infinito.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${lexend.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-surface-base text-text-primary">
        {children}
      </body>
    </html>
  );
}
