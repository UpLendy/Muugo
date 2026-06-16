import React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CargarContent } from "@/components/cargar/cargar-content";

export default function CargarPage() {
  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-900">
      {/* Sidebar - Fixed width */}
      <Sidebar />

      {/* Main Content - Pushed by sidebar width */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header showBalances={true} />
        
        <main className="flex-1 flex flex-col">
          <CargarContent />
        </main>

        {/* Footer info */}
        <footer className="p-6 text-center text-neutral-400 text-xs border-t border-neutral-100 bg-white">
          <p>© 2026 Dismanet. Todos los derechos reservados. Desarrollado por UpLendy.</p>
        </footer>
      </div>
    </div>
  );
}
