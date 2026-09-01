import type { Metadata } from "next";
import { Gabarito, Instrument_Sans } from "next/font/google";
import "./globals.css";

const gabarito = Gabarito({
  subsets: ["latin"],
  variable: "--font-gabarito",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Postula — Tu CV. Cada oportunidad.",
  description:
    "Adapta tu hoja de vida a cada oferta laboral y mejora su compatibilidad con los filtros ATS.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`h-full antialiased ${gabarito.variable} ${instrumentSans.variable}`}
    >
      <body className="flex min-h-full flex-col bg-canvas font-sans text-ink">
        {children}
      </body>
    </html>
  );
}
