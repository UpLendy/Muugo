"use client";

import React, { useState } from "react";
import {
  Share2,
  QrCode,
  ChevronRight,
  ChevronLeft,
  FileText,
  CreditCard,
  Loader2,
  AlertCircle,
  MessageCircle
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuthStore } from "@/store/auth-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chargeService } from "@/services/charge.service";
import { storeService } from "@/services/store.service";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const paymentMethods = [
  { id: "link", label: "Link de pago", icon: Share2 },
  { id: "qr", label: "QR", icon: QrCode },
  { id: "bancolombia", label: "Bancolombia", logo: "bancolombia", barLabel: "Escanear QR" },
  { id: "whatsapp", label: "Pagos Por WhatsApp", icon: MessageCircle },
];

export function CobrarContent() {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const user = useAuthStore(state => state.user);

  // Obtener la tienda del vendedor
  const { data: storeData } = useQuery({
    queryKey: ['myStore', user?.id],
    queryFn: () => storeService.getMyStore(user!.id),
    enabled: !!user?.id,
    retry: false,
  });

  const storeId: string | undefined = storeData?.data?.id ?? storeData?.id;

  const queryClient = useQueryClient();

  // Obtener últimos cobros
  const { data: chargesData, isLoading: isLoadingCharges } = useQuery({
    queryKey: ['charges', user?.id],
    queryFn: () => chargeService.list({ limit: 5 }),
    enabled: !!user?.id,
  });

  const charges = Array.isArray(chargesData) ? chargesData : (chargesData?.items || chargesData?.data || []);

  // Mutación para cobrar
  const payMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Usuario no encontrado");
      const numAmount = parseInt(amount.replace(/\D/g, ''), 10);
      if (isNaN(numAmount) || numAmount < 100) throw new Error("El monto mínimo es $100 COP");

      let paymentMethodId: number | undefined = undefined;
      // Ejemplos de mapeo de IDs (se ajustan según el backend real de Refácil)
      if (selectedMethod === 'qr' || selectedMethod === 'bancolombia') paymentMethodId = 248;
      if (selectedMethod === 'whatsapp') paymentMethodId = 277; // WhatsApp nativo de Refácil: envía el link directo al celular del cliente

      const origin = window.location.origin.includes('localhost')
        ? window.location.origin.replace('localhost', 'lvh.me')
        : window.location.origin;

      const chargeRes = await chargeService.create({
        amountCents: numAmount * 100, // Enviar en centavos
        paymentMethodId,
        cellphone: phone || undefined,
        description: `Cobro vía ${selectedMethod}`,
        returnUrl: `${origin}/cobrar/resultado`,
      });

      return chargeRes.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['charges'] });
      if (data?.chargeId) {
        sessionStorage.setItem('dismanet:lastChargeId', data.chargeId);
      }
      if (selectedMethod === 'whatsapp') {
        // Refácil manda el link de pago directo al WhatsApp del cliente, no hay nada que compartir acá.
        alert("Listo, le enviamos el link de pago por WhatsApp a tu cliente.");
        setAmount("");
        setPhone("");
        setSelectedMethod(null);
      } else if ((selectedMethod === 'qr' || selectedMethod === 'bancolombia') && data?.paymentUrl) {
        // Refácil muestra el QR para escanear en esa misma página, sí hay que llevar al vendedor ahí.
        window.location.href = data.paymentUrl;
      } else if (data?.paymentUrl) {
        setPaymentLink(data.paymentUrl);
        setLinkCopied(false);
      } else {
        alert("Pago iniciado exitosamente.");
        setAmount("");
        setPhone("");
        setSelectedMethod(null);
      }
    },
    onError: (error: any) => {
      console.error(error);
      alert(`Error: ${error?.response?.data?.error?.message || error?.message || "Hubo un error al procesar el cobro."}`);
    }
  });

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value === '') {
      setAmount('');
      return;
    }
    const formatted = new Intl.NumberFormat('es-CO').format(parseInt(value, 10));
    setAmount(formatted);
  };

  const activeMethod = paymentMethods.find(m => m.id === selectedMethod);

  const renderActiveMethodIcon = () => {
    if (!activeMethod) return null;
    if (activeMethod.logo === "bancolombia") {
      return <span className="font-black text-sm">Bancolombia</span>;
    }
    if (activeMethod.icon) {
      const Icon = activeMethod.icon;
      return <Icon className="w-5 h-5 text-neutral-500" />;
    }
    return null;
  };

  return (
    <div className="flex flex-1 gap-8 p-8 overflow-hidden relative">
      {/* Main Cobrar Section */}
      <div className="flex-[2] flex flex-col h-full overflow-y-auto pr-4 pb-20">
        
        <div className="space-y-10 max-w-xl mx-auto w-full">

            {/* Step 1: Amount */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#00d2ff] flex items-center justify-center text-white font-black text-sm">1</div>
                <h2 className="text-xl font-black text-neutral-800">Ingrese el valor a cobrar</h2>
              </div>
              
              <div className="bg-white border-2 border-neutral-100 rounded-[2rem] p-6 flex items-center justify-center shadow-sm relative group focus-within:border-[#00d2ff] transition-colors">
                <div className="text-5xl font-black text-neutral-800 flex items-center gap-2">
                  <span className="text-neutral-300 pointer-events-none">$</span>
                  <input 
                    type="text" 
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0"
                    className="w-full bg-transparent outline-none text-center placeholder:text-neutral-200"
                    style={{ width: `${Math.max(1, amount.length)}ch` }}
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-500 font-black text-sm">2</div>
                <h2 className="text-xl font-black text-neutral-800">Elige el medio de cobro</h2>
              </div>

              {!selectedMethod ? (
                /* LISTA DE METODOS (COLAPSADA) */
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className="w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 group bg-white border-neutral-100 text-neutral-800 hover:border-neutral-200"
                    >
                      <div className="flex items-center gap-4">
                        {method.logo === "bancolombia" ? (
                          <div className="w-8 h-8 flex items-center justify-center font-black text-[10px] leading-none">
                            Bancolombia
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors bg-neutral-50 text-neutral-400 group-hover:bg-neutral-100">
                            {method.icon && <method.icon className="w-5 h-5" />}
                          </div>
                        )}

                        <span className="font-bold text-base">{method.label}</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-5 h-5 rounded-full border-2 border-neutral-200" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                /* METODO SELECCIONADO (VISTA DETALLE) */
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                  {/* BARRA DEL METODO ACTIVO */}
                  <div className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-2xl shadow-sm">
                     <div className="flex items-center gap-3">
                        <button
                          onClick={() => { setSelectedMethod(null); setPhone(""); setPaymentLink(null); setLinkCopied(false); }}
                          className="p-1 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-500"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2">
                           {renderActiveMethodIcon()}
                           <span className="font-bold text-neutral-800 text-sm">
                             {activeMethod?.barLabel || activeMethod?.label}
                           </span>
                        </div>
                     </div>
                     <div className="w-5 h-5 rounded-full border-4 border-[#00d2ff] bg-white" />
                  </div>

                  {/* FORMULARIO ESPECIFICO DEL METODO */}
                  <div className="space-y-6">
                    
                    {/* TEXTOS INFORMATIVOS SEGUN METODO */}
                    {selectedMethod === "link" && (
                      <p className="text-sm text-neutral-600">
                        <span className="font-bold">Importante:</span> Generamos un link de pago que puedes copiar y compartir con tu cliente por el medio que prefieras.
                      </p>
                    )}
                    {selectedMethod === "whatsapp" && (
                      <p className="text-sm text-neutral-600">
                        <span className="font-bold">Importante:</span> Recuerda que para usar éste medio tu cliente debe tener la aplicación de WhatsApp en su dispositivo, allí le llegará el link para realizar el pago.
                      </p>
                    )}

                    {selectedMethod === "bancolombia" && (
                      <div className="space-y-4">
                        <h3 className="text-center font-bold text-lg text-neutral-800">¡Atención!</h3>
                        <p className="text-sm text-neutral-500 text-center">
                          El <span className="font-bold">QR de Bancolombia</span> ya no está disponible. Muy pronto podrás disfrutar del <span className="font-bold text-neutral-800">nuevo QR de Refácil</span>, con el que tendrás la opción de recargar saldo desde más de 12 bancos, incluyendo Bancolombia.
                        </p>
                      </div>
                    )}

                    {/* INPUT CELULAR COMUN */}
                    {selectedMethod !== "qr" && (
                      <div>
                        <label className="block text-sm text-neutral-600 mb-2">{selectedMethod === "bancolombia" ? "Numero de teléfono *" : "Teléfono *"}</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={10}
                          placeholder="3200000000"
                          className="w-full p-4 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d2ff]/20 focus:border-[#00d2ff] bg-white shadow-sm"
                          value={phone}
                          onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        />
                      </div>
                    )}

                    {/* CAJAS NEGRAS DE AVISO (RATES) */}
                    {selectedMethod === "bancolombia" && (
                      <div className="bg-black text-white p-5 rounded-2xl text-xs leading-relaxed">
                        *Montos superiores a <span className="font-bold">$20.000</span>, no tienen costo adicional, en cambio si es inferior, la entidad te descuenta <span className="font-bold">1%</span> del valor ingresado.
                      </div>
                    )}

                    {selectedMethod === "link" && paymentLink && (
                      <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-600 break-all">
                        {paymentLink}
                      </div>
                    )}

                    {/* ACCIONES (BOTON COBRAR Y COPIAR) */}
                    <div className="pt-4 flex flex-col items-start gap-4">
                      <button
                        onClick={() => payMutation.mutate()}
                        disabled={!amount || amount === "0" || payMutation.isPending || (!phone && selectedMethod !== "qr")}
                        className="px-10 py-3 bg-[#00d2ff] text-white font-bold rounded-full hover:bg-opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                      >
                        {payMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Cobrar"}
                      </button>

                      {selectedMethod === "link" && paymentLink && (
                        <button
                          onClick={async () => {
                            await navigator.clipboard.writeText(paymentLink);
                            setLinkCopied(true);
                          }}
                          className="px-10 py-3 border border-neutral-300 text-neutral-600 font-bold rounded-full hover:bg-neutral-50 transition-colors w-full sm:w-auto"
                        >
                          {linkCopied ? "¡Copiado!" : "Copiar link"}
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              )}
            </div>
          </div>
      </div>

      {/* Right Sidebar - Recent Payments (Sticky) */}
      <div className="flex-1 space-y-6 bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm flex flex-col h-full sticky top-0">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-800">Últimos Pagos</h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center justify-between bg-white border border-neutral-200 rounded-lg px-3 py-2 text-xs text-neutral-500">
             <span>2026/05/06 - 2026/06/05</span>
             <ChevronRight className="w-3 h-3 rotate-90" />
          </div>
          <button className="p-2 bg-[#1f8f53] text-white rounded-lg hover:opacity-90 transition-opacity">
            <FileText className="w-4 h-4" />
          </button>
        </div>

        {isLoadingCharges ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#00d2ff] animate-spin" />
          </div>
        ) : charges.length > 0 ? (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {charges.map((charge: any) => (
              <div key={charge.chargeId || charge.id} className="p-3 rounded-xl border border-neutral-100 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-800 text-xs">Cobro #{(charge.chargeId || charge.id).slice(0,6)}</p>
                    <p className="text-[10px] text-neutral-500">{new Date(charge.createdAt || Date.now()).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-neutral-800 text-sm">${((charge.amountCents || 0) / 100).toLocaleString()}</p>
                  <p className="text-[9px] uppercase font-bold text-neutral-400">{charge.status}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="relative mb-6">
              <div className="w-40 h-40 bg-gradient-to-tr from-cyan-300 to-blue-500 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden">
                <div className="w-24 h-24 bg-[#6c48ff] rounded-full flex items-center justify-center shadow-inner z-10">
                   <div className="text-white text-5xl font-black italic">!</div>
                </div>
                <div className="absolute top-4 left-4 w-6 h-6 bg-purple-500 rounded-full blur-sm" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-neutral-800 mb-2">Sin resultados</h3>
            <p className="text-neutral-500 text-xs leading-relaxed max-w-[200px]">
              Anímate a transar con los productos de la plataforma. Aún no tienes ventas registradas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
