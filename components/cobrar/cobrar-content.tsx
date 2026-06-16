"use client";

import React, { useState } from "react";
import { 
  Share2, 
  QrCode, 
  MessageCircle, 
  ChevronRight,
  ChevronLeft,
  FileText,
  CreditCard,
  Zap,
  Loader2,
  AlertCircle
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuthStore } from "@/store/auth-store";
import { useQuery, useMutation } from "@tanstack/react-query";
import { orderService } from "@/services/order.service";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const paymentMethods = [
  { id: "llave", label: "Tu llave", isNew: true, isSpecial: true },
  { id: "link", label: "Link de pago", icon: Share2 },
  { id: "transfiya", label: "Pagos con Transfiya", icon: Zap, logo: "transfiya", barLabel: "Notificación al celular" },
  { id: "qr", label: "QR", icon: QrCode },
  { id: "bancolombia", label: "Bancolombia", logo: "bancolombia", barLabel: "Escanear QR" },
  { id: "whatsapp", label: "Pagos Por WhatsApp", icon: MessageCircle, barLabel: "WhatsApp" },
];

export function CobrarContent() {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  
  const user = useAuthStore(state => state.user);

  // Obtener últimos pagos (órdenes)
  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['payments', user?.id],
    queryFn: () => orderService.getOrders(user!.id, { limit: 5 }),
    enabled: !!user?.id,
  });

  const orders = Array.isArray(ordersData) ? ordersData : (ordersData?.items || []);

  // Mutación para cobrar
  const payMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Usuario no encontrado");
      const numAmount = parseInt(amount.replace(/\D/g, ''), 10);
      if (isNaN(numAmount) || numAmount <= 0) throw new Error("Monto inválido");

      // 1. Crear la orden
      const order = await orderService.createOrder(user.id, {
        items: [{
          productId: "cobro-generico",
          quantity: 1,
          unitPrice: numAmount
        }],
        totalAmount: numAmount,
        shippingAddressId: null
      });

      // 2. Iniciar el pago
      const payment = await orderService.initPayment(user.id, order.id, {
        method: selectedMethod!
      });

      return payment;
    },
    onSuccess: (data) => {
      if (data?.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert("Pago iniciado exitosamente.");
        setAmount("");
        setPhone("");
        setSelectedMethod(null);
      }
    },
    onError: (error) => {
      console.error(error);
      alert("Hubo un error al procesar el cobro.");
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
  const isBreB = selectedMethod === "llave";

  const renderActiveMethodIcon = () => {
    if (!activeMethod) return null;
    if (activeMethod.logo === "bancolombia") {
      return <span className="font-black text-sm">Bancolombia</span>;
    }
    if (activeMethod.logo === "transfiya") {
      return <span className="font-black italic text-blue-600">transfiya</span>;
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
        
        {isBreB ? (
          /* VISTA EXCLUSIVA BRE-B (TU LLAVE) */
          <div className="flex flex-col h-full">
            <div className="flex items-center mb-10">
               <button 
                onClick={() => setSelectedMethod(null)}
                className="flex items-center gap-2 text-neutral-800 font-bold hover:text-black transition-colors"
               >
                 <ChevronLeft className="w-5 h-5" />
                 Cobrar
               </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center">
               <h1 className="text-5xl font-black text-[#00e5ff] italic mb-12">Bre-B</h1>
               
               <div className="relative mb-8">
                 <div className="w-40 h-40 bg-gradient-to-tr from-[#00d2ff] to-[#00ff88] rounded-full flex items-center justify-center shadow-lg relative overflow-hidden">
                   <div className="w-24 h-24 bg-[#7a2dfb] rounded-full flex items-center justify-center shadow-inner z-10">
                      <div className="text-white text-5xl font-black italic">!</div>
                   </div>
                   <div className="absolute top-2 left-2 w-8 h-8 bg-purple-500 rounded-full blur-sm" />
                   <div className="absolute bottom-2 right-2 w-6 h-6 bg-blue-600 rounded-md" />
                 </div>
               </div>

               <h2 className="text-3xl font-black text-neutral-900 mb-4">Aún no tienes llaves creadas</h2>
               <p className="text-neutral-500 mb-8">Activa ya Bre-B para comenzar a utilizar tus llaves.</p>
               
               <button className="px-8 py-3 bg-[#00d2ff] text-white font-bold rounded-full hover:opacity-90 transition-opacity">
                 Activar ahora
               </button>
            </div>
          </div>
        ) : (
          /* FLUJO NORMAL (OTROS METODOS) */
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
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 group",
                        method.isSpecial 
                          ? "bg-gradient-to-r from-[#00d2ff] to-[#00ff88] border-transparent text-white shadow-md shadow-cyan-100" 
                          : "bg-white border-neutral-100 text-neutral-800 hover:border-neutral-200"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        {method.isSpecial ? (
                          <div className="w-8 h-8 flex items-center justify-center">
                            <span className="text-xl font-black italic tracking-tighter">---</span>
                          </div>
                        ) : method.logo === "bancolombia" ? (
                          <div className="w-8 h-8 flex items-center justify-center font-black text-[10px] leading-none">
                            Bancolombia
                          </div>
                        ) : method.logo === "transfiya" ? (
                          <div className="w-8 h-8 flex items-center justify-center italic font-black text-blue-600 text-xs">
                            transfiya
                          </div>
                        ) : (
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                            method.isSpecial ? "bg-white/20" : "bg-neutral-50 text-neutral-400 group-hover:bg-neutral-100"
                          )}>
                            {method.icon && <method.icon className="w-5 h-5" />}
                          </div>
                        )}
                        
                        <span className="font-bold text-base">{method.label}</span>
                        
                        {method.isNew && (
                          <div className="bg-white rounded-full px-2 py-0.5 flex items-center gap-1 shadow-sm">
                             <div className="w-3 h-3 bg-purple-600 rounded-full flex items-center justify-center text-[8px] text-white">!</div>
                             <span className="text-[9px] font-black text-purple-600 uppercase tracking-tight">¡Nuevo!</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        {method.isSpecial && (
                          <div className="bg-purple-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md shadow-purple-600/30">
                            Activar
                          </div>
                        )}
                        {!method.isSpecial && (
                          <div className="w-5 h-5 rounded-full border-2 border-neutral-200" />
                        )}
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
                          onClick={() => { setSelectedMethod(null); setPhone(""); }}
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
                    {(selectedMethod === "link" || selectedMethod === "whatsapp") && (
                      <p className="text-sm text-neutral-600">
                        <span className="font-bold">Importante:</span> Recuerda que para usar éste medio tu cliente debe tener la aplicación de Whatsapp en su dispositivo, allí le llegara el link para realizar el pago.
                      </p>
                    )}

                    {selectedMethod === "transfiya" && (
                      <p className="text-sm text-neutral-600">
                        <span className="font-bold">Recuerda:</span> El número de celular de tu cliente debe estar asociado a una cuenta de ahorros de los bancos autorizados para hacer el pago. <span className="text-[#00d2ff] font-bold cursor-pointer hover:underline">¡Aprende a usar Transfiya!</span>
                      </p>
                    )}

                    {selectedMethod === "bancolombia" && (
                      <div className="space-y-4">
                        <h3 className="text-center font-bold text-lg text-neutral-800">¡Atención!</h3>
                        <p className="text-sm text-neutral-500 text-center">
                          El <span className="font-bold">QR de Bancolombia</span> ya no está disponible. Muy pronto podrás disfrutar del <span className="font-bold text-neutral-800">nuevo QR de Refácil</span>, con el que tendrás la opción de recargar saldo desde más de 12 bancos, incluyendo Bancolombia.
                        </p>
                        <p className="text-sm text-neutral-500 text-center">
                          Mientras tanto, te invitamos a usar <span className="font-bold text-neutral-800">Transfiya</span>, una manera <span className="font-bold text-neutral-800">más rápida, sencilla y segura</span> de recargar tu plataforma Refácil:
                        </p>
                        <p className="text-sm text-neutral-600 mt-4">
                          <span className="font-bold">Importante:</span> El número de celular de tu cliente debe estar asociado a una cuenta de ahorros de los bancos autorizados para hacer el pago. <span className="text-[#00d2ff] font-bold cursor-pointer hover:underline">¡Aprende a usar Transfiya!</span>
                        </p>
                      </div>
                    )}

                    {/* INPUT CELULAR COMUN */}
                    {selectedMethod !== "qr" && (
                      <div>
                        <label className="block text-sm text-neutral-600 mb-2">{selectedMethod === "transfiya" || selectedMethod === "bancolombia" ? "Numero de teléfono *" : "Teléfono *"}</label>
                        <input 
                          type="text" 
                          placeholder="3200000000"
                          className="w-full p-4 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d2ff]/20 focus:border-[#00d2ff] bg-white shadow-sm"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                        />
                      </div>
                    )}

                    {/* CAJAS NEGRAS DE AVISO (RATES) */}
                    {(selectedMethod === "transfiya" || selectedMethod === "bancolombia") && (
                      <div className="bg-black text-white p-5 rounded-2xl text-xs leading-relaxed">
                        *Montos {selectedMethod === "transfiya" ? "iguales o " : ""}superiores a <span className="font-bold">$20.000</span>, no tiene{selectedMethod === "bancolombia" ? "n" : ""} costo adicional, en cambio si es inferior, la entidad te descuenta <span className="font-bold">{selectedMethod === "transfiya" ? "$500" : "1%"}</span> del valor ingresado.
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

                      {(selectedMethod === "link" || selectedMethod === "whatsapp") && (
                        <button className="px-10 py-3 border border-neutral-300 text-neutral-600 font-bold rounded-full hover:bg-neutral-50 transition-colors w-full sm:w-auto">
                          Copiar link
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              )}
            </div>
          </div>
        )}
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

        {isLoadingOrders ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#00d2ff] animate-spin" />
          </div>
        ) : orders.length > 0 ? (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {orders.map((order: any) => (
              <div key={order.id} className="p-3 rounded-xl border border-neutral-100 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-800 text-xs">Cobro #{order.id.slice(0,6)}</p>
                    <p className="text-[10px] text-neutral-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-neutral-800 text-sm">${(order.totalCents / 100).toLocaleString()}</p>
                  <p className="text-[9px] uppercase font-bold text-neutral-400">{order.status}</p>
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
