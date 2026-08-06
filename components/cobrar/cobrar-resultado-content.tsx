"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useQuery } from "@tanstack/react-query";
import { chargeService } from "@/services/charge.service";

const PENDING_STATUSES = ["pending", "processing"];
const FAILED_STATUSES = ["rejected", "failed", "cancelled", "expired"];

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(cents / 100);

export function CobrarResultadoContent() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const chargeId = typeof window !== "undefined" ? sessionStorage.getItem("dismanet:lastChargeId") : null;

  const { data: chargeByIdData, isLoading: isLoadingById } = useQuery({
    queryKey: ["charges", "byId", chargeId],
    queryFn: () => chargeService.get(chargeId as string),
    enabled: !!chargeId,
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      return status && PENDING_STATUSES.includes(status) ? 3000 : false;
    },
  });

  const { data: chargesData, isLoading: isLoadingLatest } = useQuery({
    queryKey: ["charges", "latest", user?.id],
    queryFn: () => chargeService.list({ limit: 1 }),
    enabled: !!user?.id && !chargeId,
    refetchInterval: (query) => {
      const list = Array.isArray(query.state.data)
        ? query.state.data
        : (query.state.data?.items || query.state.data?.data || []);
      const status = list[0]?.status;
      return status && PENDING_STATUSES.includes(status) ? 3000 : false;
    },
  });

  const isLoading = chargeId ? isLoadingById : isLoadingLatest;
  const charges = Array.isArray(chargesData) ? chargesData : (chargesData?.items || chargesData?.data || []);
  const latest = chargeId ? chargeByIdData?.data : charges[0];
  const status: string | undefined = latest?.status;

  const goToComercio = () => router.push("/cobrar");

  let icon = <Loader2 className="w-16 h-16 text-neutral-400 animate-spin" />;
  let title = "Consultando el estado de tu cobro...";
  let description = "Estamos verificando tu transacción, un momento.";
  let accentColor = "text-neutral-500";

  if (!isLoading && latest) {
    if (status === "approved") {
      icon = <CheckCircle2 className="w-16 h-16 text-[#1f8f53]" />;
      title = "¡Cobro exitoso!";
      description = `Tu cobro de ${formatCurrency(Number(latest.amountCents))} fue aprobado.`;
      accentColor = "text-[#1f8f53]";
    } else if (!!status && PENDING_STATUSES.includes(status)) {
      icon = <Loader2 className="w-16 h-16 text-amber-500 animate-spin" />;
      title = "Procesando tu cobro";
      description = "Estamos confirmando la transacción con el banco. Esto puede tardar unos segundos.";
      accentColor = "text-amber-500";
    } else if (!!status && FAILED_STATUSES.includes(status)) {
      icon = <XCircle className="w-16 h-16 text-[#eb0028]" />;
      title = "No pudimos procesar el cobro";
      description = "La transacción fue rechazada o cancelada. Puedes intentarlo de nuevo desde tu comercio.";
      accentColor = "text-[#eb0028]";
    }
  } else if (!isLoading && !latest) {
    icon = <XCircle className="w-16 h-16 text-neutral-400" />;
    title = "No encontramos tu cobro";
    description = "No pudimos ubicar información de esta transacción. Revisa tu historial de cobros.";
    accentColor = "text-neutral-500";
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-10 rounded-[32px] border border-neutral-100 shadow-sm flex flex-col items-center text-center gap-4">
        {icon}
        <h1 className={`text-2xl font-black ${accentColor}`}>{title}</h1>
        <p className="text-neutral-500 text-sm leading-relaxed">{description}</p>

        <button
          onClick={goToComercio}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-[#eb0028] text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a mi comercio
        </button>
      </div>
    </div>
  );
}
