"use client";

import React, { useState } from "react";
import {
  Calendar,
  Download,
  Loader2
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuthStore } from "@/store/auth-store";
import { reportsService, type ReportType } from "@/services/reports.service";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Extracto, Traslados, Reversas y Consumido salieron de este deploy — la UI para
// Reversas/Consumido nunca se conectó a un endpoint, y Extracto/Traslados quedaron sin
// pulir del lado del front. El backend (/reports/extracto, /reports/traslados) sigue
// intacto para retomarlos cuando haga falta.
const tabs = ["Ventas", "Pagos"];

const toDateInput = (d: Date) => d.toISOString().slice(0, 10);

export function ReportesContent() {
  const [activeTab, setActiveTab] = useState("Ventas");
  const [isGenerating, setIsGenerating] = useState(false);
  const user = useAuthStore(state => state.user);

  const monthAgo = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  }, []);
  const [from, setFrom] = useState(toDateInput(monthAgo));
  const [to, setTo] = useState(toDateInput(new Date()));

  // Solo relevante en la pestaña "Ventas" — el backend de /reports/sells sí soporta
  // filtrar por status ("completed" | "failed"), a diferencia de operador/línea.
  const [estado, setEstado] = useState<"completed" | "failed" | null>(null);

  const tabToTypeMap: Record<string, ReportType> = {
    "Ventas": "sells",
    "Pagos": "charges",
  };

  const handleGenerateReport = async () => {
    if (!user?.id) return;

    const reportType = tabToTypeMap[activeTab];

    setIsGenerating(true);
    try {
      const params: { from: string; to: string; status?: string } = { from, to };
      if (activeTab === "Ventas" && estado) params.status = estado;
      await reportsService.downloadReport(reportType, params);
    } catch (error) {
      console.error(error);
      alert("Hubo un error al generar el reporte.");
    } finally {
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
            <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-200 rounded-2xl p-4">
              <Calendar className="w-5 h-5 text-neutral-400 shrink-0" />
              <input
                type="date"
                value={from}
                max={to}
                onChange={(e) => setFrom(e.target.value)}
                className="flex-1 bg-transparent text-sm font-bold text-neutral-700 font-mono tracking-tight focus:outline-none"
              />
              <span className="text-neutral-300">–</span>
              <input
                type="date"
                value={to}
                min={from}
                max={toDateInput(new Date())}
                onChange={(e) => setTo(e.target.value)}
                className="flex-1 bg-transparent text-sm font-bold text-neutral-700 font-mono tracking-tight focus:outline-none"
              />
            </div>
          </div>

          {/* Conditional Fields based on Active Tab */}
          {activeTab === "Ventas" && (
            <div className="space-y-4">
              <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Seleccione el estado</label>
              <div className="flex items-center gap-8">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="estado"
                    checked={estado === "failed"}
                    onChange={() => setEstado("failed")}
                    className="w-6 h-6 accent-[#eb0028] cursor-pointer"
                  />
                  <span className="text-base font-bold text-neutral-700">Fallida</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="estado"
                    checked={estado === "completed"}
                    onChange={() => setEstado("completed")}
                    className="w-6 h-6 accent-[#eb0028] cursor-pointer"
                  />
                  <span className="text-base font-bold text-neutral-700">Exitosa</span>
                </label>
                {estado && (
                  <button
                    type="button"
                    onClick={() => setEstado(null)}
                    className="text-xs font-bold text-neutral-400 hover:text-[#eb0028] underline"
                  >
                    Limpiar
                  </button>
                )}
              </div>
              <p className="text-xs text-neutral-400 ml-1">Sin seleccionar incluye todos los estados.</p>
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
