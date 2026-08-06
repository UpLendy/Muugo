import React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CuentaContent } from "@/components/cuenta/cuenta-content";

export default function CuentaPage() {
  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-900">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen pt-16 lg:pt-0">
        <Header showBalances={true} />
        <main className="flex-1 flex flex-col">
          <CuentaContent />
        </main>
        <footer className="p-6 text-center text-neutral-400 text-xs border-t border-neutral-100 bg-white">
          <p>© 2026 Dismanet. Todos los derechos reservados. Desarrollado por UpLendy.</p>
        </footer>
      </div>
    </div>
  );
}
