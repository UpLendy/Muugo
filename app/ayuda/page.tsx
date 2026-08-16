import React from "react";
import { HelpCircle } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function AyudaPage() {
  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-900">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen pt-16 lg:pt-0">
        <Header showBalances={true} />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#658cff]/10 flex items-center justify-center text-[#658cff]">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-neutral-900">Centro de ayuda</h1>
          <p className="text-neutral-400 max-w-md">
            Estamos preparando esta sección. Muy pronto vas a encontrar aquí guías y respuestas
            a las preguntas más frecuentes.
          </p>
        </main>
        <footer className="p-6 text-center text-neutral-400 text-xs border-t border-neutral-100 bg-white">
          <p>© 2026 Muugo. Todos los derechos reservados. Desarrollado por UpLendy.</p>
        </footer>
      </div>
    </div>
  );
}
