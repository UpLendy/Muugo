import type { Metadata } from "next";
import { Alexandria, Montserrat } from "next/font/google";
import "./globals.css";

const alexandria = Alexandria({
  variable: "--font-alexandria",
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "800", "900"],
});

// Usando Montserrat como alternativa limpia y moderna a Museo Sans (que es de pago)
const museoSansFallback = Montserrat({
  variable: "--font-museo",
  subsets: ["latin"],
  weight: ["100", "300", "500", "700"],
});

export const metadata: Metadata = {
  title: "Muugo",
  description: "Muugo — recarga, cobra y vende en un solo lugar.",
  keywords: ["Muugo"],
  openGraph: {
    title: "Muugo",
    description: "Muugo — recarga, cobra y vende en un solo lugar.",
    type: "website",
  },
};

import { QueryProvider } from "@/providers/query-provider";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${alexandria.variable} ${museoSansFallback.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col noise-overlay bg-neutral-50 text-neutral-900 selection:bg-[#eb0028] selection:text-white">
        <QueryProvider>
          <ProtectedRoute>
            {children}
          </ProtectedRoute>
        </QueryProvider>
      </body>
    </html>
  );
}
