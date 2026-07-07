"use client";

import React from "react";
import { User as UserIcon, Bell, ArrowUpCircle, TrendingUp } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useQuery } from "@tanstack/react-query";
import { storeService } from "@/services/store.service";
import { payoutService } from "@/services/payout.service";
import { sellerBalanceService } from "@/services/sellerBalance.service";

interface HeaderProps {
  showBalances?: boolean;
}

export function Header({ showBalances = false }: HeaderProps) {
  const user = useAuthStore((state) => state.user);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
  };

  // Saldo disponible (SellerBalance, devuelve centavos, así que dividimos)
  const availableBalance = sellerBalanceData 
    ? Number(sellerBalanceData.data?.availableCents ?? sellerBalanceData.availableCents ?? 0) / 100 
    : 0;
    
  // Ganancias (StoreBalance, devuelve centavos, así que dividimos)
  const pendingBalance = storeBalanceData 
    ? Number(
        storeBalanceData.data?.availableCents ?? storeBalanceData.availableCents ?? 
        storeBalanceData.data?.pendingCents ?? storeBalanceData.pendingCents ?? 0
      ) / 100 
    : 0; 

  return (
    <header className="h-20 bg-white border-b border-neutral-100 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        {showBalances ? (
          <div className="flex gap-4">
            {/* Saldo Card */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-[#00d2ff] to-[#3a7bd5] text-white px-6 py-2.5 rounded-2xl shadow-lg shadow-blue-200/50">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <ArrowUpCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Saldo</span>
                <span className="text-xl font-black">{formatCurrency(availableBalance)}</span>
              </div>
              <div className="ml-4 h-6 w-px bg-white/20" />
              <button className="text-white/60 hover:text-white transition-colors">
                <span className="text-lg">⋮</span>
              </button>
            </div>

            {/* Ganancias Card */}
            <div className="flex items-center gap-3 bg-neutral-900 text-white px-6 py-2.5 rounded-2xl shadow-lg shadow-black/10">
              <div className="bg-white/10 p-1.5 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Ganancias</span>
                <span className="text-xl font-black">{formatCurrency(pendingBalance)}</span>
              </div>
              <div className="ml-4 h-6 w-px bg-white/20" />
              <button className="text-white/60 hover:text-white transition-colors">
                <span className="text-lg">⋮</span>
              </button>
            </div>
          </div>
        ) : (
          <h1 className="text-xl font-bold text-neutral-900">
            ¡Bienvenid@! <span className="font-black">{user ? `${user.firstName} ${user.lastName}` : 'Cargando...'}</span>
          </h1>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-neutral-900">Punto de venta</span>
          <span className="text-xs text-neutral-500 font-mono tracking-wider">
            ID: {store?.id ? store.id.slice(0, 6).toUpperCase() : 'PENDIENTE'}
          </span>
        </div>
        
        <div className="h-10 w-px bg-neutral-100" />
        
        <button className="relative p-2 text-neutral-400 hover:text-neutral-900 transition-colors">
          <Bell className="w-6 h-6" />
          {/* Mock notification dot */}
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#eb0028] rounded-full border-2 border-white" />
        </button>

        <div className="flex items-center gap-3 pl-2">
          {user?.avatarUrl ? (
             <img src={user.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-xl object-cover shadow-lg" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-[#658cff] flex items-center justify-center text-white shadow-lg shadow-[#658cff]/20">
              <UserIcon className="w-6 h-6" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
