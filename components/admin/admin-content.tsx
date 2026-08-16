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
  Filter,
  X,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
  Scale
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { webhookService } from "@/services/webhook.service";
import { sellerBalanceService } from "@/services/sellerBalance.service";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const money = (cents: number) => `$ ${new Intl.NumberFormat('es-CO').format(cents / 100)}`;

const adminTabs = [
  "Usuarios", "Mis deudas", "Saldo", "Reversa de saldo", "Logs de pagos", "Saldo Refácil"
];

const WEBHOOK_SOURCES = [
  { value: "", label: "Todos los orígenes" },
  { value: "REFACIL_PAY", label: "Refácil Pay (Cargar / Cobrar / Retiros)" },
  { value: "REFACIL_COMMERCE", label: "Refácil Commerce (Ventas)" },
  { value: "INTERNAL", label: "Interno" },
];

function WebhookLogsPanel() {
  const [source, setSource] = useState("");
  const [processed, setProcessed] = useState("");
  const [reference, setReference] = useState("");
  const [referenceInput, setReferenceInput] = useState("");
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const limit = 20;

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["webhookLogs", source, processed, reference, page],
    queryFn: () => webhookService.list({
      source: source || undefined,
      processed: processed === "" ? undefined : processed === "true",
      reference: reference || undefined,
      page,
      limit,
    }),
    placeholderData: (prev) => prev,
  });

  const logs: any[] = data?.data || [];

  const applySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setReference(referenceInput.trim());
  };

  const statusBadge = (log: any) => {
    if (!log.processed) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-600 bg-amber-50 border border-amber-100 px-2 py-1 rounded-full">
          <Clock className="w-3 h-3" /> Pendiente
        </span>
      );
    }
    const msg: string = log.statusMsg || "";
    const isRejected = /mismatch|no_signature|no_secret|rejected|failed|not_found/i.test(msg);
    return (
      <span className={cn(
        "inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-full border",
        isRejected
          ? "text-red-600 bg-red-50 border-red-100"
          : "text-emerald-600 bg-emerald-50 border-emerald-100"
      )}>
        {isRejected ? <XCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
        {msg || (isRejected ? "Rechazado" : "Procesado")}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Filtros */}
      <form onSubmit={applySearch} className="bg-neutral-50 p-6 rounded-[2rem] border border-neutral-100 flex flex-wrap items-end gap-4 mb-8">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Origen</span>
          <div className="relative">
            <select
              value={source}
              onChange={(e) => { setSource(e.target.value); setPage(1); }}
              className="appearance-none bg-white border border-neutral-200 rounded-xl pl-4 pr-9 py-2.5 text-xs font-bold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-cyan-100 min-w-[260px]"
            >
              {WEBHOOK_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Estado</span>
          <div className="relative">
            <select
              value={processed}
              onChange={(e) => { setProcessed(e.target.value); setPage(1); }}
              className="appearance-none bg-white border border-neutral-200 rounded-xl pl-4 pr-9 py-2.5 text-xs font-bold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-cyan-100 min-w-[160px]"
            >
              <option value="">Todos</option>
              <option value="true">Procesados</option>
              <option value="false">Pendientes</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-1 flex-1 min-w-[220px]">
          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Referencia (ID de transacción)</span>
          <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-xl px-4 py-2.5">
            <Search className="w-4 h-4 text-neutral-300 flex-shrink-0" />
            <input
              value={referenceInput}
              onChange={(e) => setReferenceInput(e.target.value)}
              placeholder="Ej: CHG-..., TOPUP-..."
              className="w-full outline-none text-xs font-bold text-neutral-700 placeholder:text-neutral-300 placeholder:font-normal"
            />
          </div>
        </div>

        <button type="submit" className="bg-[#00d2ff] text-white px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs shadow-lg shadow-cyan-100 hover:scale-105 transition-all">
          Buscar
        </button>
        <button
          type="button"
          onClick={() => refetch()}
          className="p-3 bg-neutral-100 text-neutral-500 rounded-xl hover:bg-neutral-200 transition-colors"
          title="Refrescar"
        >
          {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
        </button>
      </form>

      {/* Tabla */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-neutral-100">
              {["Fecha", "Origen", "Referencia", "Resultado", ""].map((head) => (
                <th key={head} className="p-4 text-left text-xs font-black text-neutral-400 uppercase tracking-widest">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-20 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-neutral-300 mx-auto" />
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-20 text-center text-neutral-300 font-medium italic">
                  No hay webhooks registrados con estos filtros
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                  <td className="p-4 text-xs font-mono text-neutral-500 whitespace-nowrap">
                    {new Date(log.receivedAt).toLocaleString('es-CO')}
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-bold text-neutral-700">{log.source}</span>
                  </td>
                  <td className="p-4 text-xs font-mono text-neutral-600">{log.reference || '—'}</td>
                  <td className="p-4">{statusBadge(log)}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="text-[10px] font-black uppercase tracking-widest text-cyan-600 hover:text-cyan-700"
                    >
                      Ver payload
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between pt-6 mt-4 border-t border-neutral-100">
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
          Página {page} · {logs.length} resultado{logs.length !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl bg-neutral-100 text-neutral-600 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-200 transition-colors"
          >
            Anterior
          </button>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={logs.length < limit}
            className="px-4 py-2 rounded-xl bg-neutral-100 text-neutral-600 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-200 transition-colors"
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* Modal de payload crudo */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-neutral-100 flex-shrink-0">
              <div>
                <h3 className="text-lg font-black text-neutral-900">Webhook {selectedLog.source}</h3>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">{selectedLog.reference || selectedLog.id}</p>
              </div>
              <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                {statusBadge(selectedLog)}
                <span className="text-xs text-neutral-400">
                  Recibido: {new Date(selectedLog.receivedAt).toLocaleString('es-CO')}
                </span>
              </div>
              <pre className="bg-neutral-900 text-emerald-300 text-xs p-4 rounded-2xl overflow-x-auto font-mono leading-relaxed">
                {JSON.stringify(selectedLog.payload, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const RECONCILE_STATUS_STYLE: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  ok:          { label: "OK",           className: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: CheckCircle2 },
  warning:     { label: "Advertencia",  className: "text-amber-600 bg-amber-50 border-amber-100",       icon: AlertTriangle },
  low_balance: { label: "Saldo bajo",   className: "text-amber-600 bg-amber-50 border-amber-100",       icon: AlertTriangle },
  critical:    { label: "Crítico",      className: "text-red-600 bg-red-50 border-red-100",             icon: XCircle },
};

function ReconciliationPanel() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ["reconciliationLatest"],
    queryFn: () => sellerBalanceService.getReconciliationLogs({ page: 1, limit: 1 }),
  });

  const { data: historyData, isLoading: historyLoading, isFetching } = useQuery({
    queryKey: ["reconciliationLogs", page],
    queryFn: () => sellerBalanceService.getReconciliationLogs({ page, limit }),
    placeholderData: (prev) => prev,
  });

  const reconcileMutation = useMutation({
    mutationFn: () => sellerBalanceService.runReconciliation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reconciliationLatest"] });
      queryClient.invalidateQueries({ queryKey: ["reconciliationLogs"] });
    },
  });

  const latest = summaryData?.data?.items?.[0];
  const logs: any[] = historyData?.data?.items || [];
  const statusInfo = RECONCILE_STATUS_STYLE[latest?.status] || RECONCILE_STATUS_STYLE.ok;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="flex flex-col h-full">
      <div className="bg-neutral-50 p-6 rounded-[2rem] border border-neutral-100 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-neutral-400" />
            <h3 className="text-sm font-black text-neutral-700 uppercase tracking-widest">
              Muugo (wallets) vs. Refácil (cuenta JMURIEL)
            </h3>
          </div>
          <button
            onClick={() => reconcileMutation.mutate()}
            disabled={reconcileMutation.isPending}
            className="flex items-center gap-2 bg-[#00d2ff] text-white px-6 py-2.5 rounded-full font-black uppercase tracking-widest text-xs shadow-lg shadow-cyan-100 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            {reconcileMutation.isPending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <RefreshCw className="w-4 h-4" />}
            Recalcular ahora
          </button>
        </div>

        {summaryLoading ? (
          <div className="p-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-neutral-300" /></div>
        ) : !latest ? (
          <p className="text-sm text-neutral-400 italic">Aún no se ha corrido ninguna reconciliación. Usa "Recalcular ahora".</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-white rounded-2xl p-4 border border-neutral-100">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Wallets sellers (Dismanet)</span>
                <p className="text-lg font-black text-neutral-800 mt-1">{money(latest.totalSellerBalanceCents)}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-neutral-100">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Cupo Refácil (posBalance)</span>
                <p className="text-lg font-black text-neutral-800 mt-1">{money(latest.platformPosBalanceCents)}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-neutral-100">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Diferencia (drift)</span>
                <p className={cn("text-lg font-black mt-1", latest.driftCents < 0 ? "text-red-600" : "text-neutral-800")}>
                  {money(latest.driftCents)} <span className="text-xs font-bold text-neutral-400">({latest.driftPercentage?.toFixed(1)}%)</span>
                </p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-neutral-100">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Estado</span>
                <span className={cn("mt-1 inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-full border", statusInfo.className)}>
                  <StatusIcon className="w-3 h-3" /> {statusInfo.label}
                </span>
              </div>
            </div>
            {latest.details && (
              <p className="text-xs text-neutral-400">
                tmpBalance: {latest.details.tmpBalance != null ? `$ ${new Intl.NumberFormat('es-CO').format(latest.details.tmpBalance)}` : '—'}
                {" · "}deuda con Refácil: {latest.details.debt != null ? `$ ${new Intl.NumberFormat('es-CO').format(latest.details.debt)}` : '—'}
                {" · "}última consulta: {new Date(latest.createdAt).toLocaleString('es-CO')}
                {latest.details.remoteAvailable === false && " · ⚠ usando último valor conocido, Refácil no respondió"}
              </p>
            )}
          </>
        )}
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-neutral-100">
              {["Fecha", "Wallets sellers", "Refácil posBalance", "Drift", "Estado"].map((head) => (
                <th key={head} className="p-4 text-left text-xs font-black text-neutral-400 uppercase tracking-widest">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {historyLoading ? (
              <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="w-6 h-6 animate-spin text-neutral-300 mx-auto" /></td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="p-20 text-center text-neutral-300 font-medium italic">Sin historial de reconciliación</td></tr>
            ) : (
              logs.map((log) => {
                const st = RECONCILE_STATUS_STYLE[log.status] || RECONCILE_STATUS_STYLE.ok;
                const Icon = st.icon;
                return (
                  <tr key={log.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                    <td className="p-4 text-xs font-mono text-neutral-500 whitespace-nowrap">{new Date(log.createdAt).toLocaleString('es-CO')}</td>
                    <td className="p-4 text-xs font-bold text-neutral-700">{money(log.totalSellerBalanceCents)}</td>
                    <td className="p-4 text-xs font-bold text-neutral-700">{money(log.platformPosBalanceCents)}</td>
                    <td className={cn("p-4 text-xs font-bold", log.driftCents < 0 ? "text-red-600" : "text-neutral-700")}>
                      {money(log.driftCents)} ({log.driftPercentage?.toFixed(1)}%)
                    </td>
                    <td className="p-4">
                      <span className={cn("inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-full border", st.className)}>
                        <Icon className="w-3 h-3" /> {st.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-6 mt-4 border-t border-neutral-100">
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
          Página {page} · {logs.length} resultado{logs.length !== 1 ? 's' : ''} {isFetching && '· actualizando…'}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl bg-neutral-100 text-neutral-600 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-200 transition-colors"
          >
            Anterior
          </button>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={logs.length < limit}
            className="px-4 py-2 rounded-xl bg-neutral-100 text-neutral-600 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-200 transition-colors"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}

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

      {activeTab === "Logs de pagos" ? (
        <WebhookLogsPanel />
      ) : activeTab === "Saldo Refácil" ? (
        <ReconciliationPanel />
      ) : (
      <>
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
      </>
      )}
    </div>
  );
}
