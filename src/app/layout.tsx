import type { Metadata } from "next";
import "./globals.css";
import { Open_Sans } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import Providers from "./providers";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Marcador de falta",
};

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${openSans.className} antialiased`}>
        <NuqsAdapter>
          <Providers>
            <Navbar />
            {children}
          </Providers>
        </NuqsAdapter>
      </body>
    </html>
  );
}
