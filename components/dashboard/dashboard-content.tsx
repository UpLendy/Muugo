"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  ChevronRight,
  PlusCircle,
  Calendar,
  MessageCircle,
  Download,
  HandCoins,
  Loader2
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";

const toDateInput = (d: Date) => d.toISOString().slice(0, 10);

export function DashboardContent() {
  const router = useRouter();
  const today = React.useMemo(() => new Date(), []);
  const weekAgo = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d;
  }, []);

  const [from, setFrom] = React.useState(toDateInput(weekAgo));
  const [to, setTo] = React.useState(toDateInput(today));

  const { data: summaryResponse, isLoading } = useQuery({
    queryKey: ['dashboardSummary', from, to],
    queryFn: () => dashboardService.getSummary({ from, to }),
  });

  const summary = summaryResponse;
  const salesRevenueCents = summary?.sells?.collectedCents || 0;
  const salesRevenueFormatted = new Intl.NumberFormat('es-CO').format(salesRevenueCents / 100);
  const totalCollectedCents = (summary?.charges?.collectedCents || 0) + (summary?.sells?.collectedCents || 0);
  const totalCollectedFormatted = new Intl.NumberFormat('es-CO').format(totalCollectedCents / 100);

  const dailyRevenue: { date: string; cents: number }[] = summary?.dailyRevenue || [];
  const maxDailyCents = Math.max(1, ...dailyRevenue.map((d) => d.cents));
  const dayLabels = ["D", "L", "M", "X", "J", "V", "S"];

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
                <div className="px-3 py-1 bg-neutral-100 rounded-full text-xs font-bold text-neutral-400 font-mono flex items-center gap-2">
                  {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  $ {salesRevenueFormatted}
                </div>
              </div>
              <p className="text-sm text-neutral-500">Visualiza tus ventas de los últimos 7 días</p>
            </div>
          </div>

          <div className="w-full aspect-[21/9] bg-neutral-50 rounded-3xl border border-neutral-100 flex items-center justify-center relative overflow-hidden group">
            {dailyRevenue.length > 0 ? (
              <div className="absolute inset-0 flex items-end justify-around px-12 py-8">
                {dailyRevenue.map((d, i) => {
                  const dayOfWeek = new Date(d.date + 'T00:00:00').getDay();
                  const heightPct = Math.max(4, (d.cents / maxDailyCents) * 100);
                  return (
                    <div key={d.date} className="flex flex-col items-center gap-2 h-full justify-end">
                      <div
                        className="w-12 bg-gradient-to-t from-[#eb0028] to-[#ff4d6d] rounded-t-lg transition-all duration-500 group-hover:opacity-80"
                        style={{ height: `${heightPct}%` }}
                        title={`$ ${new Intl.NumberFormat('es-CO').format(d.cents / 100)}`}
                      />
                      <span className="text-[10px] font-bold text-neutral-400">{dayLabels[dayOfWeek]}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="relative text-neutral-300 font-medium z-10 bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full border border-neutral-100 shadow-sm">
                {isLoading ? "Cargando actividad..." : "Sin actividad en este rango"}
              </div>
            )}
          </div>
        </div>

        {/* Quick Access Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-neutral-900">Tus accesos directos</h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Card 1 */}
            <button
              onClick={() => router.push('/cobrar')}
              className="text-left p-6 bg-white border border-neutral-100 rounded-3xl hover:shadow-xl hover:shadow-[#eb0028]/5 transition-all group flex flex-col justify-between h-40 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-[#eb0028] flex items-center justify-center text-white">
                  <HandCoins className="w-6 h-6" />
                </div>
                <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center self-center group-hover:bg-[#eb0028] group-hover:text-white transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-neutral-900">Cobrar</p>
                <p className="text-xs text-neutral-400">Cobra a tus clientes fácil y rápido</p>
              </div>
            </button>

            {/* Card 2 */}
            <button
              onClick={() => router.push('/cargar')}
              className="text-left p-6 bg-white border border-neutral-100 rounded-3xl hover:shadow-xl hover:shadow-[#658cff]/5 transition-all group flex flex-col justify-between h-40 cursor-pointer"
            >
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
            </button>
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
          <div className="w-full bg-white border border-neutral-200 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-5 h-5 text-neutral-400" />
              <p className="text-[10px] text-neutral-400 uppercase font-black tracking-widest">Rango de fechas</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={from}
                max={to}
                onChange={(e) => setFrom(e.target.value)}
                className="flex-1 text-sm font-bold text-neutral-900 border border-neutral-100 rounded-xl px-3 py-2 focus:outline-none focus:border-[#eb0028]/40"
              />
              <span className="text-neutral-300">–</span>
              <input
                type="date"
                value={to}
                min={from}
                max={toDateInput(today)}
                onChange={(e) => setTo(e.target.value)}
                className="flex-1 text-sm font-bold text-neutral-900 border border-neutral-100 rounded-xl px-3 py-2 focus:outline-none focus:border-[#eb0028]/40"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full border-4 border-t-[#658cff] border-neutral-100 animate-spin" />
              <p className="text-neutral-400 font-medium">Cargando resumen...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white border border-neutral-200 rounded-2xl p-4">
                <p className="text-[10px] text-neutral-400 uppercase font-black tracking-widest">Recaudado</p>
                <p className="text-xl font-black text-neutral-900">$ {totalCollectedFormatted}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-neutral-200 rounded-2xl p-4">
                  <p className="text-[10px] text-neutral-400 uppercase font-black tracking-widest">Cobros</p>
                  <p className="text-lg font-bold text-neutral-900">{summary?.charges?.total ?? 0}</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-2xl p-4">
                  <p className="text-[10px] text-neutral-400 uppercase font-black tracking-widest">Ventas</p>
                  <p className="text-lg font-bold text-neutral-900">{summary?.sells?.total ?? 0}</p>
                </div>
              </div>
            </div>
          )}
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
