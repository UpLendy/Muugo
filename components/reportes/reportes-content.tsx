"use client";

import React, { useState } from "react";
import { 
  Calendar, 
  ChevronDown, 
  Search, 
  BarChart3,
  FileText,
  Download,
  Loader2
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuthStore } from "@/store/auth-store";
import { reportsService } from "@/services/reports.service";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const tabs = [
  "Ventas", "Compras", "Extracto", "Pagos", "Traslados", "Reversas", "Consumido"
];

export function ReportesContent() {
  const [activeTab, setActiveTab] = useState("Ventas");
  const [isGenerating, setIsGenerating] = useState(false);
  const user = useAuthStore(state => state.user);

  const handleGenerateReport = async () => {
    if (!user?.id) return;
    
    setIsGenerating(true);
    try {
      // Mapeamos el tab activo al tipo de reporte esperado por la API
      const tabToTypeMap: Record<string, any> = {
        "Ventas": "sales",
        "Compras": "payments",
        "Extracto": "extracto",
        "Pagos": "payments",
        "Traslados": "traslados",
        "Reversas": "reversas",
        "Consumido": "consumido"
      };
      
      const reportType = tabToTypeMap[activeTab] || "sales";

      // Disparar la descarga
      reportsService.downloadReport(reportType, { from: "2026-04-04", to: "2026-05-04" });
      
      setTimeout(() => {
        setIsGenerating(false);
      }, 1000); // Simulando delay de UI
      
    } catch (error) {
      console.error(error);
      alert("Hubo un error al generar el reporte.");
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-8 bg-white m-8 rounded-[2rem] border border-neutral-100 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <h2 className="text-3xl font-black text-neutral-800 uppercase tracking-tight">Reportes</h2>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-neutral-100 mb-12 overflow-x-auto pb-4 hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
               "text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap",
              activeTab === tab 
                ? "text-neutral-800" 
                : "text-neutral-300 hover:text-neutral-500"
            )}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute -bottom-[17px] left-0 right-0 h-1 bg-[#eb0028] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <div className="flex-1 flex flex-col items-center justify-start pt-10">
        <div className="w-full max-w-lg space-y-8">
          
          {/* Common Date Range Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-neutral-50 border border-neutral-200 rounded-2xl p-4 cursor-pointer hover:border-neutral-300 transition-colors">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-neutral-400" />
                <span className="text-sm font-bold text-neutral-700 font-mono tracking-tight">2026/04/04 - 2026/05/04</span>
              </div>
              <ChevronDown className="w-5 h-5 text-neutral-300" />
            </div>
          </div>

          {/* Conditional Fields based on Active Tab */}
          {activeTab === "Ventas" && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Seleccione un operador *</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-white border border-neutral-200 rounded-2xl p-4 text-sm text-neutral-500 focus:outline-none focus:border-[#eb0028] transition-colors cursor-pointer">
                    <option>Selecciona una opción</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Linea *</label>
                <input 
                  type="text" 
                  placeholder="Linea"
                  className="w-full bg-white border border-neutral-200 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#eb0028] transition-colors"
                />
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Seleccione el estado</label>
                <div className="flex items-center gap-8">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-6 h-6 rounded-full border-2 border-neutral-200 group-hover:border-neutral-300 transition-colors" />
                    <span className="text-base font-bold text-neutral-700">Fallida</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-6 h-6 rounded-full border-2 border-neutral-200 group-hover:border-neutral-300 transition-colors" />
                    <span className="text-base font-bold text-neutral-700">Exitosa</span>
                  </label>
                </div>
              </div>
            </>
          )}

          {activeTab === "Reversas" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Seleccione un Tipo *</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-white border border-neutral-200 rounded-2xl p-4 text-sm text-neutral-500 focus:outline-none focus:border-[#eb0028] transition-colors cursor-pointer">
                    <option>Selecciona una opción</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Seleccione una bolsa</label>
                <div className="flex items-center gap-8">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-6 h-6 rounded-full border-2 border-neutral-200 group-hover:border-neutral-300 transition-colors" />
                    <span className="text-base font-bold text-neutral-700">Saldo</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {(activeTab === "Extracto" || activeTab === "Traslados" || activeTab === "Consumido") && (
            <div className="space-y-4">
              <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Seleccione una bolsa</label>
              <div className="flex items-center gap-8">
                {(activeTab === "Extracto" || activeTab === "Consumido") && (
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-6 h-6 rounded-full border-2 border-neutral-200 group-hover:border-neutral-300 transition-colors" />
                    <span className="text-base font-bold text-neutral-700">Saldo</span>
                  </label>
                )}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-6 h-6 rounded-full border-2 border-neutral-200 group-hover:border-neutral-300 transition-colors" />
                  <span className="text-base font-bold text-neutral-700">Ganancia</span>
                </label>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="pt-8 flex justify-center">
            <button 
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="bg-gradient-to-r from-[#eb0028] to-[#ff4d6d] text-white px-10 py-4 rounded-full font-black uppercase tracking-widest text-xs shadow-lg shadow-red-200 hover:scale-105 transition-all disabled:opacity-70 disabled:hover:scale-100 flex items-center gap-2"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Generar reporte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
