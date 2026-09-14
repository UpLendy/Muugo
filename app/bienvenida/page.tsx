import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Muugo — Recarga, cobra y vende en un solo lugar",
  description:
    "Muugo es la plataforma para comercios que quieren recargar celulares, vender pines digitales (Netflix, Disney+ y más), cobrar pagos y gestionar su punto de venta desde un solo lugar.",
  alternates: { canonical: "/bienvenida" },
  openGraph: {
    title: "Muugo — Recarga, cobra y vende en un solo lugar",
    description:
      "Multiplica tus ingresos ofreciendo recargas, pines digitales y pagos a tus clientes con Muugo.",
    type: "website",
    url: "/bienvenida",
  },
};

export default function BienvenidaPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="flex items-center justify-between px-6 sm:px-12 py-6 max-w-6xl mx-auto">
        <div className="relative h-10 w-32">
          <Image src="/logo-muugo.png" alt="Muugo" fill sizes="128px" className="object-contain" priority />
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-bold text-neutral-600 hover:text-[#eb0028] transition-colors">
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="bg-[#eb0028] hover:bg-[#d10023] text-white text-sm font-black uppercase tracking-widest px-6 py-3 rounded-full transition-colors"
          >
            Crear cuenta
          </Link>
        </nav>
      </header>

      <main>
        <section className="max-w-4xl mx-auto text-center px-6 py-20 sm:py-28">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Recarga, cobra y vende{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#eb0028] to-[#658cff]">
              todo en un solo lugar
            </span>
          </h1>
          <p className="mt-6 text-lg text-neutral-500 font-medium max-w-2xl mx-auto">
            Muugo es la plataforma para comercios que quieren multiplicar sus ingresos ofreciendo
            recargas de celular, pines digitales (Netflix, Disney+ y más) y servicios de pago a sus clientes.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="bg-[#eb0028] hover:bg-[#d10023] text-white font-black uppercase tracking-widest text-sm px-8 py-4 rounded-full shadow-lg shadow-[#eb0028]/30 transition-all"
            >
              Empieza gratis
            </Link>
            <Link
              href="/login"
              className="text-neutral-600 hover:text-neutral-900 font-bold text-sm px-8 py-4 rounded-full border border-neutral-200 transition-colors"
            >
              Ya tengo una cuenta
            </Link>
          </div>
        </section>

        <section className="bg-neutral-50 py-20">
          <div className="max-w-5xl mx-auto px-6 grid sm:grid-cols-3 gap-10 text-center">
            <div>
              <h2 className="font-black text-lg mb-2">Vende pines y recargas</h2>
              <p className="text-neutral-500 text-sm font-medium">
                Ofrece recargas de celular y pines digitales de las mejores marcas directamente a tus clientes.
              </p>
            </div>
            <div>
              <h2 className="font-black text-lg mb-2">Cobra y gestiona pagos</h2>
              <p className="text-neutral-500 text-sm font-medium">
                Recibe pagos de tus clientes y administra tu saldo de forma simple y segura.
              </p>
            </div>
            <div>
              <h2 className="font-black text-lg mb-2">Gana comisiones</h2>
              <p className="text-neutral-500 text-sm font-medium">
                Cada venta y cada cobro que realices genera comisiones para tu negocio.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="text-center text-neutral-400 text-xs py-10">
        <p>© 2026 Muugo. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
