"use client";

import React, { useState } from "react";
import {
  Plus,
  ChevronDown,
  Search,
  FileText,
  X,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
  Scale,
  Ban
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { webhookService } from "@/services/webhook.service";
import { sellerBalanceService } from "@/services/sellerBalance.service";
import { adminService } from "@/services/admin.service";
import { useAuthStore } from "@/store/auth-store";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const money = (cents: number) => `$ ${new Intl.NumberFormat('es-CO').format(cents / 100)}`;

const adminTabs = [
  "Usuarios", "Saldo", "Logs de pagos", "Saldo Refácil"
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

const TOPUP_STATUS_META: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  pending:    { label: "Pendiente",  className: "text-amber-600 bg-amber-50 border-amber-100",     icon: Clock },
  processing: { label: "Procesando", className: "text-cyan-600 bg-cyan-50 border-cyan-100",         icon: RefreshCw },
  approved:   { label: "Aprobado",   className: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: CheckCircle2 },
  rejected:   { label: "Rechazado",  className: "text-red-600 bg-red-50 border-red-100",             icon: XCircle },
  cancelled:  { label: "Cancelado",  className: "text-neutral-500 bg-neutral-100 border-neutral-200", icon: XCircle },
  expired:    { label: "Expirado",   className: "text-neutral-500 bg-neutral-100 border-neutral-200", icon: Clock },
  failed:     { label: "Fallido",    className: "text-red-600 bg-red-50 border-red-100",             icon: XCircle },
};

function SaldoPanel() {
  const [status, setStatus] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [email, setEmail] = useState("");
  const [page, setPage] = useState(1);
  const [selectedTopup, setSelectedTopup] = useState<any | null>(null);
  const limit = 20;

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["adminTopups", status, email, page],
    queryFn: () => sellerBalanceService.getAdminTopups({ status: status || undefined, email: email || undefined, page, limit }),
    placeholderData: (prev: any) => prev,
  });

  const topups: any[] = data?.items || [];
  const total: number = data?.total ?? 0;

  const applySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setEmail(emailInput.trim());
  };

  const sellerLabel = (t: any) => {
    const user = t.sellerProfile?.user;
    if (!user) return "—";
    const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || t.sellerProfile?.displayName;
    return name ? `${name} · ${user.email}` : user.email;
  };

  return (
    <div className="flex flex-col h-full">
      <form onSubmit={applySearch} className="bg-neutral-50 p-6 rounded-[2rem] border border-neutral-100 flex flex-wrap items-end gap-4 mb-8">
        <div className="space-y-1 flex-1 min-w-[220px]">
          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Buscar por email del vendedor</span>
          <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-xl px-4 py-2.5">
            <Search className="w-4 h-4 text-neutral-300 flex-shrink-0" />
            <input
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="vendedor@correo.com"
              className="w-full outline-none text-xs font-bold text-neutral-700 placeholder:text-neutral-300 placeholder:font-normal"
            />
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Estado</span>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="appearance-none bg-white border border-neutral-200 rounded-xl pl-4 pr-9 py-2.5 text-xs font-bold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-cyan-100 min-w-[180px]"
            >
              <option value="">Todos</option>
              {Object.entries(TOPUP_STATUS_META).map(([slug, meta]) => (
                <option key={slug} value={slug}>{meta.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 pointer-events-none" />
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
          {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        </button>
      </form>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-neutral-100">
              {["Fecha", "Vendedor", "Monto", "Método", "Estado", ""].map((head) => (
                <th key={head} className="p-4 text-left text-xs font-black text-neutral-400 uppercase tracking-widest">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="p-20 text-center"><Loader2 className="w-6 h-6 animate-spin text-neutral-300 mx-auto" /></td></tr>
            ) : topups.length === 0 ? (
              <tr><td colSpan={6} className="p-20 text-center text-neutral-300 font-medium italic">No hay solicitudes de saldo con estos filtros</td></tr>
            ) : (
              topups.map((t) => {
                const st = TOPUP_STATUS_META[t.status] || TOPUP_STATUS_META.pending;
                const Icon = st.icon;
                return (
                  <tr key={t.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                    <td className="p-4 text-xs font-mono text-neutral-500 whitespace-nowrap">{new Date(t.createdAt).toLocaleString('es-CO')}</td>
                    <td className="p-4 text-xs font-bold text-neutral-700">{sellerLabel(t)}</td>
                    <td className="p-4 text-xs font-bold text-neutral-800">{money(Number(t.amountCents))}</td>
                    <td className="p-4 text-xs text-neutral-500">{t.paymentMethod || "—"}</td>
                    <td className="p-4">
                      <span className={cn("inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-full border", st.className)}>
                        <Icon className="w-3 h-3" /> {st.label}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedTopup(t)}
                        className="text-[10px] font-black uppercase tracking-widest text-cyan-600 hover:text-cyan-700"
                      >
                        Ver detalle
                      </button>
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
          Página {page} · {total} solicitud{total !== 1 ? "es" : ""} en total
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl bg-neutral-100 text-neutral-600 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-200 transition-colors"
          >
            Anterior
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page * limit >= total}
            className="px-4 py-2 rounded-xl bg-neutral-100 text-neutral-600 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-200 transition-colors"
          >
            Siguiente
          </button>
        </div>
      </div>

      {selectedTopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-neutral-100 flex-shrink-0">
              <div>
                <h3 className="text-lg font-black text-neutral-900">Solicitud de saldo</h3>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">{selectedTopup.customerReference || selectedTopup.id}</p>
              </div>
              <button onClick={() => setSelectedTopup(null)} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                {(() => {
                  const st = TOPUP_STATUS_META[selectedTopup.status] || TOPUP_STATUS_META.pending;
                  const Icon = st.icon;
                  return (
                    <span className={cn("inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-full border", st.className)}>
                      <Icon className="w-3 h-3" /> {st.label}
                    </span>
                  );
                })()}
                <span className="text-xs text-neutral-400">Vendedor: {sellerLabel(selectedTopup)}</span>
                <span className="text-xs text-neutral-400">Monto: {money(Number(selectedTopup.amountCents))}</span>
              </div>
              <pre className="bg-neutral-900 text-emerald-300 text-xs p-4 rounded-2xl overflow-x-auto font-mono leading-relaxed">
                {JSON.stringify({ request: selectedTopup.requestPayload, response: selectedTopup.responsePayload, webhook: selectedTopup.webhookPayload }, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ROLE_META: Record<string, { label: string; className: string }> = {
  admin: { label: "Admin", className: "text-purple-600 bg-purple-50 border-purple-100" },
  seller: { label: "Vendedor", className: "text-cyan-600 bg-cyan-50 border-cyan-100" },
  customer: { label: "Comprador", className: "text-neutral-500 bg-neutral-100 border-neutral-200" },
};
const ASSIGNABLE_ROLES = ["admin", "seller", "customer"];

function UserStatusBadge({ user }: { user: any }) {
  if (user.isBanned) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-red-600 bg-red-50 border border-red-100 px-2 py-1 rounded-full">
        <Ban className="w-3 h-3" /> Baneado
      </span>
    );
  }
  if (!user.isActive) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-600 bg-amber-50 border border-amber-100 px-2 py-1 rounded-full">
        <Clock className="w-3 h-3" /> Suspendido
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">
      <CheckCircle2 className="w-3 h-3" /> Activo
    </span>
  );
}

function UserManageModal({ user, onClose, defaultCommissionRate }: { user: any; onClose: () => void; defaultCommissionRate: number }) {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const [reason, setReason] = useState("");
  const [pendingStatusAction, setPendingStatusAction] = useState<"suspend" | "ban" | null>(null);

  const userRoleSlugs: string[] = (user.userRoles || []).map((ur: any) => ur.role.slug);
  const isSelf = currentUser?.id === user.id;
  const isSeller = userRoleSlugs.includes("seller");
  const customCommissionRate: number | null = user.sellerProfile?.commissionRate ?? null;
  const [commissionInput, setCommissionInput] = useState(String(customCommissionRate ?? defaultCommissionRate));

  const roleMutation = useMutation({
    mutationFn: ({ action, roleSlug }: { action: "assign" | "revoke"; roleSlug: string }) =>
      adminService.updateUserRoles(user.id, action, roleSlug),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminUsers"] }),
  });

  const commissionMutation = useMutation({
    mutationFn: (rate: number | null) => adminService.updateCommissionRate(user.id, rate),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminUsers"] }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ action, reason }: { action: "activate" | "suspend" | "ban"; reason?: string }) =>
      adminService.updateUserStatus(user.id, action, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      setPendingStatusAction(null);
      setReason("");
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-neutral-100 flex-shrink-0">
          <div>
            <h3 className="text-lg font-black text-neutral-900">{user.firstName} {user.lastName}</h3>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">{user.email}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8">
          <div>
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Roles</span>
            <div className="mt-3 flex flex-wrap gap-2">
              {ASSIGNABLE_ROLES.map((slug) => {
                const active = userRoleSlugs.includes(slug);
                const lockedSelfAdmin = slug === "admin" && active && isSelf;
                const disabled = roleMutation.isPending || lockedSelfAdmin;
                return (
                  <button
                    key={slug}
                    disabled={disabled}
                    onClick={() => roleMutation.mutate({ action: active ? "revoke" : "assign", roleSlug: slug })}
                    title={lockedSelfAdmin ? "No puedes quitarte tu propio rol admin" : undefined}
                    className={cn(
                      "text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-full border transition-all disabled:opacity-40 disabled:cursor-not-allowed",
                      active ? ROLE_META[slug].className : "text-neutral-400 bg-white border-neutral-200 hover:bg-neutral-50"
                    )}
                  >
                    {active ? "✓ " : "+ "}{ROLE_META[slug].label}
                  </button>
                );
              })}
            </div>
          </div>

          {isSeller && (
            <div>
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Comisión de plataforma</span>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-xl px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={commissionInput}
                    onChange={(e) => setCommissionInput(e.target.value)}
                    className="w-16 outline-none text-xs font-bold text-neutral-700 text-right"
                  />
                  <span className="text-xs font-bold text-neutral-400">%</span>
                </div>
                <button
                  onClick={() => commissionMutation.mutate(Number(commissionInput))}
                  disabled={commissionMutation.isPending || commissionInput.trim() === ""}
                  className="text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-cyan-200 text-cyan-600 bg-cyan-50 hover:bg-cyan-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {commissionMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Guardar"}
                </button>
                {customCommissionRate !== null && (
                  <button
                    onClick={() => { setCommissionInput(String(defaultCommissionRate)); commissionMutation.mutate(null); }}
                    disabled={commissionMutation.isPending}
                    className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest px-3 py-2 hover:text-neutral-600 disabled:opacity-50"
                  >
                    Restablecer
                  </button>
                )}
              </div>
              <p className="mt-2 text-[11px] text-neutral-400">
                {customCommissionRate !== null
                  ? "Valor personalizado para este vendedor."
                  : `Usando el valor por defecto de la plataforma (${defaultCommissionRate}%).`}
              </p>
            </div>
          )}

          <div>
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Estado de la cuenta</span>
            <div className="mt-3 flex items-center gap-3">
              <UserStatusBadge user={user} />
              {isSelf && <span className="text-[10px] text-neutral-400 italic">(tu propia cuenta)</span>}
            </div>

            {!isSelf && (
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {user.isActive && !user.isBanned && (
                    <>
                      <button
                        onClick={() => setPendingStatusAction("suspend")}
                        className="text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-amber-200 text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors"
                      >
                        Suspender
                      </button>
                      <button
                        onClick={() => setPendingStatusAction("ban")}
                        className="text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                      >
                        Banear
                      </button>
                    </>
                  )}
                  {(!user.isActive || user.isBanned) && (
                    <button
                      onClick={() => statusMutation.mutate({ action: "activate" })}
                      disabled={statusMutation.isPending}
                      className="text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                    >
                      {statusMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Reactivar"}
                    </button>
                  )}
                </div>

                {pendingStatusAction && (
                  <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 space-y-3">
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder={`Motivo (opcional) para ${pendingStatusAction === "suspend" ? "suspender" : "banear"}...`}
                      className="w-full text-xs text-neutral-700 bg-white border border-neutral-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-cyan-100 resize-none"
                      rows={2}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => statusMutation.mutate({ action: pendingStatusAction, reason: reason.trim() || undefined })}
                        disabled={statusMutation.isPending}
                        className="bg-red-600 text-white px-6 py-2 rounded-full font-black uppercase tracking-widest text-[11px] disabled:opacity-50"
                      >
                        {statusMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : `Confirmar ${pendingStatusAction === "suspend" ? "suspensión" : "baneo"}`}
                      </button>
                      <button
                        onClick={() => { setPendingStatusAction(null); setReason(""); }}
                        className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest px-4 py-2"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {user.bannedReason && (
            <p className="text-xs text-neutral-400 italic">Motivo registrado: {user.bannedReason}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function UsersPanel() {
  const [emailInput, setEmailInput] = useState("");
  const [email, setEmail] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const limit = 20;

  let isActive: string | undefined;
  let isBanned: string | undefined;
  if (statusFilter === "active") isActive = "true";
  if (statusFilter === "suspended") { isActive = "false"; isBanned = "false"; }
  if (statusFilter === "banned") isBanned = "true";

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["adminUsers", email, roleFilter, statusFilter, page],
    queryFn: () => adminService.getUsers({ email: email || undefined, role: roleFilter || undefined, isActive, isBanned, page, limit }),
    placeholderData: (prev: any) => prev,
  });

  const users: any[] = data?.items || [];
  const total: number = data?.total ?? 0;

  const applySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setEmail(emailInput.trim());
  };

  // Mantiene el modal sincronizado con la lista tras invalidar la query (ej. después de asignar un rol)
  const liveSelectedUser = selectedUser ? users.find((u) => u.id === selectedUser.id) || selectedUser : null;

  return (
    <div className="flex flex-col h-full">
      <form onSubmit={applySearch} className="bg-neutral-50 p-6 rounded-[2rem] border border-neutral-100 flex flex-wrap items-end gap-4 mb-8">
        <div className="space-y-1 flex-1 min-w-[220px]">
          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Buscar por email</span>
          <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-xl px-4 py-2.5">
            <Search className="w-4 h-4 text-neutral-300 flex-shrink-0" />
            <input
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="cliente@correo.com"
              className="w-full outline-none text-xs font-bold text-neutral-700 placeholder:text-neutral-300 placeholder:font-normal"
            />
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Rol</span>
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="appearance-none bg-white border border-neutral-200 rounded-xl pl-4 pr-9 py-2.5 text-xs font-bold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-cyan-100 min-w-[160px]"
            >
              <option value="">Todos los roles</option>
              {ASSIGNABLE_ROLES.map((slug) => (
                <option key={slug} value={slug}>{ROLE_META[slug].label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Estado</span>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="appearance-none bg-white border border-neutral-200 rounded-xl pl-4 pr-9 py-2.5 text-xs font-bold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-cyan-100 min-w-[160px]"
            >
              <option value="">Todos</option>
              <option value="active">Activos</option>
              <option value="suspended">Suspendidos</option>
              <option value="banned">Baneados</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 pointer-events-none" />
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
          {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        </button>
      </form>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-neutral-100">
              {["Usuario", "Teléfono", "Roles", "Estado", "Registrado", ""].map((head) => (
                <th key={head} className="p-4 text-left text-xs font-black text-neutral-400 uppercase tracking-widest">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="p-20 text-center"><Loader2 className="w-6 h-6 animate-spin text-neutral-300 mx-auto" /></td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="p-20 text-center text-neutral-300 font-medium italic">No hay usuarios con estos filtros</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                  <td className="p-4">
                    <p className="text-xs font-bold text-neutral-800">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-neutral-400 font-mono">{u.email}</p>
                  </td>
                  <td className="p-4 text-xs font-mono text-neutral-500">{u.phoneNumber || "—"}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {(u.userRoles || []).length === 0 ? (
                        <span className="text-xs text-neutral-300 italic">Sin roles</span>
                      ) : (
                        u.userRoles.map((ur: any) => (
                          <span
                            key={ur.role.slug}
                            className={cn(
                              "text-[10px] font-black uppercase px-2 py-1 rounded-full border",
                              ROLE_META[ur.role.slug]?.className || "text-neutral-500 bg-neutral-100 border-neutral-200"
                            )}
                          >
                            {ROLE_META[ur.role.slug]?.label || ur.role.slug}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="p-4"><UserStatusBadge user={u} /></td>
                  <td className="p-4 text-xs font-mono text-neutral-500 whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString("es-CO")}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedUser(u)}
                      className="text-[10px] font-black uppercase tracking-widest text-cyan-600 hover:text-cyan-700"
                    >
                      Gestionar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-6 mt-4 border-t border-neutral-100">
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
          Página {page} · {total} usuario{total !== 1 ? "s" : ""} en total
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl bg-neutral-100 text-neutral-600 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-200 transition-colors"
          >
            Anterior
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page * limit >= total}
            className="px-4 py-2 rounded-xl bg-neutral-100 text-neutral-600 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-200 transition-colors"
          >
            Siguiente
          </button>
        </div>
      </div>

      {liveSelectedUser && (
        <UserManageModal
          user={liveSelectedUser}
          onClose={() => setSelectedUser(null)}
          defaultCommissionRate={data?.defaultCommissionRate ?? 5}
        />
      )}
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
      ) : activeTab === "Saldo" ? (
        <SaldoPanel />
      ) : (
        <UsersPanel />
      )}
    </div>
  );
}
