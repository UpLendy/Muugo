"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { User as UserIcon, Bell, ArrowUpCircle, TrendingUp } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useQuery } from "@tanstack/react-query";
import { storeService } from "@/services/store.service";
import { payoutService } from "@/services/payout.service";
import { sellerBalanceService } from "@/services/sellerBalance.service";

interface HeaderProps {
  showBalances?: boolean;
}

// El campo "description" que guarda el backend es texto técnico para debugging
// (incluye errores crudos de Refácil) — nunca se muestra al seller. Acá se arma
// un texto humano a partir de "type" + "referenceType", que sí son estables.
function friendlyMovement(m: { type: string; referenceType?: string | null }): { title: string; positive: boolean } {
  switch (m.type) {
    case 'RESERVE':
      return { title: 'Compra en proceso', positive: false };
    case 'CONFIRM':
      return { title: 'Compra completada', positive: false };
    case 'RELEASE':
      return { title: 'Compra cancelada, saldo devuelto', positive: true };
    case 'CREDIT':
      return {
        title: m.referenceType === 'topup' ? 'Recarga acreditada' : 'Reembolso a tu saldo',
        positive: true,
      };
    case 'DEBIT':
      return { title: 'Débito de saldo', positive: false };
    case 'ADMIN_CREDIT':
      return { title: 'Ajuste a tu favor', positive: true };
    case 'ADMIN_DEBIT':
      return { title: 'Ajuste en contra', positive: false };
    default:
      return { title: 'Movimiento de saldo', positive: true };
  }
}

export function Header({ showBalances = false }: HeaderProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const notifRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Obtener la tienda (punto de venta) del usuario
  const { data: store } = useQuery({
    queryKey: ['myStore', user?.id],
    queryFn: () => storeService.getMyStore(user!.id),
    enabled: !!user?.id && user?.roles?.includes('seller'),
    retry: false, // No reintentar si da 404 (no tiene tienda)
  });

  // Obtener el balance de la billetera virtual (Saldo para compras/ventas)
  const { data: sellerBalanceData } = useQuery({
    queryKey: ['sellerBalance', user?.id],
    queryFn: () => sellerBalanceService.getBalance(),
    enabled: !!user?.id && user?.roles?.includes('seller'),
  });

  // Obtener el balance de la tienda (Ganancias y cobros)
  const { data: storeBalanceData } = useQuery({
    queryKey: ['storeBalance', store?.id],
    queryFn: () => payoutService.getBalance(store!.id),
    enabled: !!store?.id,
  });

  // Últimos movimientos de saldo, usados como feed de notificaciones
  const { data: movementsData } = useQuery({
    queryKey: ['sellerBalanceMovements', user?.id, 'notif'],
    queryFn: () => sellerBalanceService.getMovements({ limit: 5 }),
    enabled: !!user?.id && user?.roles?.includes('seller'),
    refetchInterval: 60_000,
  });
  const movements = movementsData?.items ?? movementsData?.data?.items ?? [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
  };

  // Saldo disponible (SellerBalance, devuelve centavos, así que dividimos)
  const availableBalance = sellerBalanceData 
    ? Number(sellerBalanceData.data?.availableCents ?? sellerBalanceData.availableCents ?? 0) / 100 
    : 0;
    
  // Ganancias (StoreBalance, devuelve centavos, así que dividimos)
  // Ojo: usamos ?? solo para desenvolver el payload (data vs raíz), no para elegir
  // entre campos — availableCents=0 es un valor válido y no debe "caer" a pendingCents.
  const storeBalance = storeBalanceData?.data ?? storeBalanceData;
  const pendingBalance = storeBalance
    ? (Number(storeBalance.availableCents ?? 0) + Number(storeBalance.pendingCents ?? 0)) / 100
    : 0;

  return (
    <header className="min-h-20 bg-white border-b border-neutral-100 flex flex-wrap items-center justify-between gap-4 px-4 sm:px-8 py-3 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1 min-w-0 order-1">
        {showBalances ? (
          <div className="flex flex-wrap gap-3 sm:gap-4">
            {/* Saldo Card */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-[#00d2ff] to-[#3a7bd5] text-white px-4 sm:px-6 py-2.5 rounded-2xl shadow-lg shadow-blue-200/50">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <ArrowUpCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Saldo</span>
                <span className="text-lg sm:text-xl font-black whitespace-nowrap">{formatCurrency(availableBalance)}</span>
              </div>
              <div className="ml-2 sm:ml-4 h-6 w-px bg-white/20 hidden sm:block" />
              <button className="text-white/60 hover:text-white transition-colors hidden sm:block">
                <span className="text-lg">⋮</span>
              </button>
            </div>

            {/* Ganancias Card */}
            <div className="flex items-center gap-3 bg-neutral-900 text-white px-4 sm:px-6 py-2.5 rounded-2xl shadow-lg shadow-black/10">
              <div className="bg-white/10 p-1.5 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Ganancias</span>
                <span className="text-lg sm:text-xl font-black whitespace-nowrap">{formatCurrency(pendingBalance)}</span>
              </div>
              <div className="ml-2 sm:ml-4 h-6 w-px bg-white/20 hidden sm:block" />
              <button className="text-white/60 hover:text-white transition-colors hidden sm:block">
                <span className="text-lg">⋮</span>
              </button>
            </div>
          </div>
        ) : (
          <h1 className="text-base sm:text-xl font-bold text-neutral-900 truncate">
            ¡Bienvenid@! <span className="font-black">{user ? `${user.firstName} ${user.lastName}` : 'Cargando...'}</span>
          </h1>
        )}
      </div>

      <div className="flex items-center gap-3 sm:gap-6 order-2">
        <div className="flex-col items-end hidden md:flex">
          <span className="text-sm font-medium text-neutral-900">Punto de venta</span>
          <span className="text-xs text-neutral-500 font-mono tracking-wider">
            ID: {store?.id ? store.id.slice(0, 6).toUpperCase() : 'PENDIENTE'}
          </span>
        </div>

        <div className="h-10 w-px bg-neutral-100 hidden md:block" />

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative p-2 text-neutral-400 hover:text-neutral-900 transition-colors"
            aria-label="Notificaciones"
          >
            <Bell className="w-6 h-6" />
            {movements.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#eb0028] rounded-full border-2 border-white" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-neutral-100 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-100 font-bold text-sm text-neutral-800">
                Movimientos recientes
              </div>
              <div className="max-h-80 overflow-y-auto">
                {movements.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-neutral-400">
                    Sin movimientos recientes
                  </div>
                ) : (
                  movements.map((m: any) => {
                    const { title, positive } = friendlyMovement(m);
                    return (
                      <div key={m.id} className="px-4 py-3 border-b border-neutral-50 last:border-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-neutral-800">{title}</span>
                          <span className={`text-sm font-bold ${positive ? "text-[#00c9cc]" : "text-neutral-500"}`}>
                            {positive ? "+" : "-"}
                            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(m.amountCents) / 100)}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-300 mt-1">
                          {new Date(m.createdAt).toLocaleString('es-CO')}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => router.push('/cuenta')}
          className="flex items-center gap-3 pl-2"
          aria-label="Mi cuenta"
        >
          {user?.avatarUrl ? (
             <img src={user.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-xl object-cover shadow-lg" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-[#658cff] flex items-center justify-center text-white shadow-lg shadow-[#658cff]/20">
              <UserIcon className="w-6 h-6" />
            </div>
          )}
        </button>
      </div>
    </header>
  );
}
