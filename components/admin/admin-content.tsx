"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Calendar, 
  ChevronDown, 
  Search, 
  FileText,
  UserPlus,
  ArrowDownCircle,
  Wallet,
  Filter
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const adminTabs = [
  "Usuarios", "Mis deudas", "Saldo", "Reversa de saldo"
];

export function AdminContent() {
  const [activeTab, setActiveTab] = useState("Usuarios");

  return (
    <div className="flex-1 flex flex-col p-8 bg-white m-8 rounded-[2rem] border border-neutral-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 mb-8">
        <h2 className="text-3xl font-black text-neutral-800 uppercase tracking-tight">Administración</h2>
        <div className="bg-purple-600 text-white rounded-full p-0.5">
          <Plus className="w-4 h-4 rotate-45" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-neutral-100 mb-10">
        {adminTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "pb-4 text-sm font-bold uppercase tracking-widest transition-all relative",
              activeTab === tab 
                ? "text-neutral-800" 
                : "text-neutral-300 hover:text-neutral-500"
            )}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#eb0028] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Action Bar / Filters */}
      <div className="mb-8">
        {activeTab === "Usuarios" && (
          <div className="flex items-center justify-between">
            <button className="bg-[#00d2ff] text-white px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs shadow-lg shadow-cyan-100 hover:scale-105 transition-all flex items-center gap-2">
              Crear usuario
            </button>
            <div className="flex items-center gap-3">
               <button className="p-2.5 bg-[#006b3d] text-white rounded-xl hover:opacity-90 transition-opacity">
                  <FileText className="w-5 h-5" />
               </button>
               <button className="p-2.5 bg-neutral-100 text-neutral-500 rounded-xl hover:bg-neutral-200 transition-colors">
                  <Search className="w-5 h-5" />
               </button>
            </div>
          </div>
        )}

        {activeTab === "Mis deudas" && (
          <div className="space-y-8">
            <div className="bg-neutral-50 p-6 rounded-[2rem] border border-neutral-100 flex items-center gap-6">
               <div className="flex-1 grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Fecha inicial</span>
                    <div className="bg-white border border-neutral-200 rounded-xl px-4 py-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-neutral-300" />
                      <span className="text-xs text-neutral-400 font-mono italic">dd/mm/aaaa</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Fecha final</span>
                    <div className="bg-white border border-neutral-200 rounded-xl px-4 py-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-neutral-300" />
                      <span className="text-xs text-neutral-400 font-mono italic">dd/mm/aaaa</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Estado *</span>
                    <div className="relative">
                      <select className="w-full appearance-none bg-white border border-neutral-200 rounded-xl px-4 py-2 text-xs text-neutral-400 focus:outline-none">
                        <option>Selecciona una opción</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 pointer-events-none" />
                    </div>
                  </div>
               </div>
               <button className="bg-[#00d2ff] text-white px-10 py-3 rounded-full font-black uppercase tracking-widest text-xs shadow-lg shadow-cyan-100">
                  Buscar
               </button>
               <div className="w-px h-12 bg-neutral-200" />
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#eb0028]/10 rounded-xl">
                    <Wallet className="w-6 h-6 text-[#eb0028]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Pendiente por pagar</span>
                    <span className="text-xl font-black text-neutral-800">$ 0</span>
                  </div>
               </div>
            </div>
            
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-neutral-800">Últimas transacciones</h3>
              <div className="flex items-center gap-3">
                 <button className="p-2.5 bg-[#006b3d] text-white rounded-xl">
                    <FileText className="w-5 h-5" />
                 </button>
                 <button className="p-2.5 bg-neutral-100 text-neutral-500 rounded-xl">
                    <Search className="w-5 h-5" />
                 </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Saldo" && (
          <div className="flex items-center justify-between">
            <button className="bg-[#00d2ff] text-white px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs shadow-lg shadow-cyan-100 hover:scale-105 transition-all flex items-center gap-2">
              Solicitar saldo
            </button>
            <div className="flex items-center gap-3">
               <button className="p-2.5 bg-[#006b3d] text-white rounded-xl">
                  <FileText className="w-5 h-5" />
               </button>
               <button className="p-2.5 bg-neutral-100 text-neutral-500 rounded-xl">
                  <Search className="w-5 h-5" />
               </button>
            </div>
          </div>
        )}

        {activeTab === "Reversa de saldo" && (
          <div className="flex items-center gap-6">
            <div className="flex-1 grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <span className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Selecciona un rango de fecha</span>
                <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-neutral-400" />
                    <span className="text-sm font-bold text-neutral-700 font-mono">2026/04/04 - 2026/05/04</span>
                  </div>
                  <ChevronDown className="w-5 h-5 text-neutral-300" />
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Filtrar por estado *</span>
                <div className="relative">
                  <select className="w-full appearance-none bg-white border border-neutral-200 rounded-2xl p-4 text-sm text-neutral-500 focus:outline-none">
                    <option>Selecciona una opción</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <button className="bg-[#00d2ff] text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs shadow-lg shadow-cyan-100">
                Filtrar
              </button>
              <button className="bg-[#00d2ff] text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs shadow-lg shadow-cyan-100">
                Limpiar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-neutral-100">
              {activeTab === "Usuarios" && ["Código", "Nombre completo", "Usuario", "Estado"].map((head) => (
                <th key={head} className="p-4 text-left text-xs font-black text-neutral-400 uppercase tracking-widest">{head}</th>
              ))}
              {activeTab === "Mis deudas" && ["Código", "Fecha", "Hora", "valor", "Pago", "Restante", "Estado", "Observaciones"].map((head) => (
                <th key={head} className="p-4 text-left text-xs font-black text-neutral-400 uppercase tracking-widest">{head}</th>
              ))}
              {activeTab === "Saldo" && ["Estado", "#id", "Fecha y Hora", "Nombre", "Valor", "Observaciones", "Respuesta"].map((head) => (
                <th key={head} className="p-4 text-left text-xs font-black text-neutral-400 uppercase tracking-widest">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={10} className="p-20 text-center text-neutral-300 font-medium italic">
                No hay datos para mostrar en este momento
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
