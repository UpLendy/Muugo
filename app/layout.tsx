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
  title: "Muugo | Próximamente",
  description:
    "Estamos construyendo algo increíble. Muugo estará disponible muy pronto.",
  keywords: ["Muugo", "próximamente", "en construcción"],
  openGraph: {
    title: "Muugo | Próximamente",
    description:
      "Estamos construyendo algo increíble. Muugo estará disponible muy pronto.",
    type: "website",
  },
};

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
        {children}
      </body>
    </html>
  );
}
