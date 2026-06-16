import React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ComingSoonContent } from "@/components/shared/coming-soon-content";

export default function AyudaPage() {
  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-900">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header showBalances={true} />
        <main className="flex-1 flex flex-col">
          <ComingSoonContent title="Ayuda" />
        </main>
        <footer className="p-6 text-center text-neutral-400 text-xs border-t border-neutral-100 bg-white">
          <p>© 2026 Dismanet. Todos los derechos reservados. Desarrollado por UpLendy.</p>
        </footer>
      </div>
    </div>
  );
}
