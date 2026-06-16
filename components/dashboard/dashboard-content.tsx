"use client";

import React from "react";
import { 
  TrendingUp, 
  ChevronRight, 
  PlusCircle, 
  Calendar,
  MessageCircle,
  Download
} from "lucide-react";

export function DashboardContent() {
  return (
    <div className="flex flex-1 gap-8 p-8">
      {/* Main Content Area */}
      <div className="flex-[2] space-y-10">
        
        {/* Sales Chart Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#eb0028]/10 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6 text-[#eb0028]" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-neutral-900">Total ventas</h2>
                <div className="px-3 py-1 bg-neutral-100 rounded-full text-xs font-bold text-neutral-400 font-mono">
                  $ 1.234.567
                </div>
              </div>
              <p className="text-sm text-neutral-500">Visualiza tus ventas de la semana hasta el día de ayer</p>
            </div>
          </div>

          <div className="w-full aspect-[21/9] bg-neutral-50 rounded-3xl border border-neutral-100 flex items-center justify-center relative overflow-hidden group">
            {/* Mock Chart representation */}
            <div className="absolute inset-0 flex items-end justify-around px-12 py-8">
              {[40, 60, 45, 90, 65, 80, 55].map((h, i) => (
                <div 
                  key={i} 
                  className="w-12 bg-gradient-to-t from-[#eb0028] to-[#ff4d6d] rounded-t-lg transition-all duration-500 group-hover:opacity-80"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="relative text-neutral-300 font-medium z-10 bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full border border-neutral-100 shadow-sm">
              Gráfico de actividad semanal
            </div>
          </div>
        </div>

        {/* Quick Access Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-neutral-900">Tus accesos directos</h2>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Card 1 */}
            <div className="p-6 bg-white border border-neutral-100 rounded-3xl hover:shadow-xl hover:shadow-[#eb0028]/5 transition-all group flex flex-col justify-between h-40">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center text-[#eb0028] font-black text-xl italic tracking-tighter">
                  Br-B
                </div>
                <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center self-center group-hover:bg-[#eb0028] group-hover:text-white transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-neutral-900">Bre-B</p>
                <p className="text-xs text-neutral-400">Crea y administra tus llaves</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-6 bg-white border border-neutral-100 rounded-3xl hover:shadow-xl hover:shadow-[#658cff]/5 transition-all group flex flex-col justify-between h-40">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-[#658cff] flex items-center justify-center text-white">
                  <Download className="w-6 h-6" />
                </div>
                <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center self-center group-hover:bg-[#658cff] group-hover:text-white transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-neutral-900">Cargar</p>
                <p className="text-xs text-neutral-400">Recarga tu inventario y saldo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Advertising Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-neutral-900">Publicidad</h2>
          <div className="w-full h-40 bg-gradient-to-r from-[#eb0028] to-[#658cff] rounded-3xl relative overflow-hidden flex items-center px-10">
            <div className="relative z-10 text-white space-y-2">
              <h3 className="text-2xl font-black">Nuevos beneficios Dismanet</h3>
              <p className="text-white/80 max-w-sm">Descubre las nuevas herramientas que tenemos para potenciar tu negocio.</p>
              <button className="bg-white text-[#eb0028] px-6 py-2 rounded-full font-bold text-sm hover:bg-neutral-100 transition-colors mt-2">
                Conocer más
              </button>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-white/10 skew-x-[-20deg] translate-x-20" />
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-[-20deg] translate-x-40" />
          </div>
        </div>
      </div>

      {/* Right Sidebar - Business Summary */}
      <div className="flex-1 space-y-8 bg-neutral-50 p-8 rounded-[40px] border border-neutral-100 h-fit">
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-neutral-900">Resumen de tu negocio</h2>
          <p className="text-sm text-neutral-500 leading-relaxed">
            Visualiza tus ventas hasta el día de ayer, en el rango de fechas seleccionado
          </p>
        </div>

        <div className="space-y-6">
          <button className="w-full bg-white border border-neutral-200 rounded-2xl p-4 flex items-center justify-between hover:border-[#eb0028]/30 transition-colors">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-neutral-400" />
              <div className="text-left">
                <p className="text-[10px] text-neutral-400 uppercase font-black tracking-widest">Rango de fechas</p>
                <p className="text-sm font-bold text-neutral-900">2026/03/21 - 2026/04/20</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-300" />
          </button>

          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-t-[#658cff] border-neutral-100 animate-spin" />
            <p className="text-neutral-400 font-medium">Cargando resumen...</p>
          </div>
        </div>

        {/* WhatsApp Float Mockup */}
        <div className="pt-20 flex justify-end">
          <button className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#25D366]/20 hover:scale-110 transition-transform">
            <MessageCircle className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
}
