"use client";

import React, { useState } from "react";
import { 
  QrCode, 
  ChevronRight,
  ChevronLeft,
  FileText,
  CreditCard,
  Banknote,
  Zap,
  Globe,
  Loader2,
  Download
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuthStore } from "@/store/auth-store";
import { useQuery, useMutation } from "@tanstack/react-query";
import { orderService } from "@/services/order.service";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const loadMethods = [
  { id: "pse", label: "Transferencia", icon: Globe, logo: "pse" },
  { id: "bancolombia", label: "Bancolombia", logo: "bancolombia", barLabel: "Directo al banco" },
  { id: "nequi", label: "Nequi", logo: "nequi", barLabel: "Notificación al ..." },
  { id: "daviplata", label: "Daviplata", logo: "daviplata", barLabel: "Notificación al ..." },
  { id: "transfiya", label: "Transfiya", icon: Zap, logo: "transfiya", barLabel: "Notificación al ..." },
  { id: "qr", label: "QR", icon: QrCode, barLabel: "Notificación al ..." },
  { id: "efectivo", label: "Efectivo", icon: Banknote },
];

const bankOptions = ["Banco de Bogotá", "Bancolombia", "Davivienda", "Nequi", "BBVA Colombia", "Banco de Occidente"];
const personTypes = ["Natural", "Jurídica"];
const documentTypes = ["Cédula de ciudadanía", "NIT", "Cédula de extranjería", "Pasaporte"];

export function CargarContent() {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  
  // Form states
  const [bank, setBank] = useState("");
  const [personType, setPersonType] = useState("Natural");
  const [docType, setDocType] = useState("Cédula de ciudadanía");
  const [docNumber, setDocNumber] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const user = useAuthStore(state => state.user);

  // Obtener últimos pagos
  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['payments', user?.id],
    queryFn: () => orderService.getOrders(user!.id, { limit: 5 }),
    enabled: !!user?.id,
  });

  const orders = Array.isArray(ordersData) ? ordersData : (ordersData?.items || []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value === '') {
      setAmount('');
      return;
    }
    const formatted = new Intl.NumberFormat('es-CO').format(parseInt(value, 10));
    setAmount(formatted);
  };

  const activeMethod = loadMethods.find(m => m.id === selectedMethod);

  const renderActiveMethodIcon = (method: any) => {
    if (!method) return null;
    if (method.logo === "pse") {
      return (
        <div className="w-6 h-6 rounded-full bg-blue-900 flex items-center justify-center">
          <span className="text-white text-[6px] font-bold">PSE</span>
        </div>
      );
    }
    if (method.logo === "bancolombia") {
      return <span className="font-black text-xs">Bancolombia</span>;
    }
    if (method.logo === "transfiya") {
      return <span className="font-black italic text-blue-600 text-sm">transfiya</span>;
    }
    if (method.logo === "nequi") {
      return <span className="font-black text-pink-600 text-sm">Nequi</span>;
    }
    if (method.logo === "daviplata") {
      return <span className="font-black text-red-600 text-sm">Daviplata</span>;
    }
    if (method.icon) {
      const Icon = method.icon;
      return <Icon className="w-5 h-5 text-neutral-500" />;
    }
    return null;
  };

  const isEfectivo = selectedMethod === "efectivo";

  return (
    <div className="flex flex-1 gap-8 p-8 overflow-hidden relative">
      {/* Main Cargar Section */}
      <div className="flex-[2] flex flex-col h-full overflow-y-auto pr-4 pb-20">
        <div className="space-y-10 max-w-xl mx-auto w-full">
          
          {/* Step 1: Amount (Hidden for Efectivo) */}
          {!isEfectivo && (
            <div className="space-y-6">
              {!selectedMethod ? (
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#00d2ff] flex items-center justify-center text-white font-black text-sm">1</div>
                  <h2 className="text-xl font-black text-neutral-800">Ingrese el valor a cargar</h2>
                </div>
              ) : (
                <div className="flex justify-center mb-8">
                   <h1 className="text-5xl font-black text-neutral-800 flex items-center gap-2">
                     <span className="text-neutral-800">$</span>
                     {amount || "0"}
                   </h1>
                </div>
              )}
              
              {!selectedMethod && (
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
              )}
            </div>
          )}

          {/* Step 2: Load Method */}
          <div className="space-y-6">
            {!selectedMethod && (
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-500 font-black text-sm">2</div>
                <h2 className="text-xl font-black text-neutral-800">Elige el medio de carga</h2>
              </div>
            )}
            
            {selectedMethod && (
              <div className="flex justify-center mb-4">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-500 font-black text-sm">2</div>
                   <h2 className="text-xl font-black text-neutral-800">Elige el medio de carga</h2>
                 </div>
              </div>
            )}

            {!selectedMethod ? (
              /* LISTA DE METODOS (COLAPSADA) */
              <div className="space-y-3">
                {loadMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border-2 bg-white border-neutral-100 text-neutral-800 hover:border-neutral-200 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-4">
                      {method.logo === "pse" ? (
                        <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center overflow-hidden">
                           <span className="text-white text-[8px] font-bold">PSE</span>
                        </div>
                      ) : method.logo === "bancolombia" ? (
                        <div className="w-8 h-8 flex items-center justify-center font-black text-[10px] leading-none">
                          Bancolombia
                        </div>
                      ) : method.logo === "transfiya" ? (
                        <div className="w-8 h-8 flex items-center justify-center italic font-black text-blue-600 text-xs">
                          transfiya
                        </div>
                      ) : method.logo === "nequi" ? (
                        <div className="w-8 h-8 flex items-center justify-center font-black text-pink-600 text-xs">
                          Nequi
                        </div>
                      ) : method.logo === "daviplata" ? (
                        <div className="w-8 h-8 flex items-center justify-center font-black text-red-600 text-xs">
                          Daviplata
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-neutral-50 text-neutral-400 group-hover:bg-neutral-100 flex items-center justify-center transition-colors">
                          {method.icon && <method.icon className="w-5 h-5" />}
                        </div>
                      )}
                      
                      <span className="font-bold text-base">{method.label}</span>
                    </div>

                    <div className="w-5 h-5 rounded-full border-2 border-neutral-200" />
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
                        onClick={() => setSelectedMethod(null)}
                        className="p-1 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-500"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <div className="flex items-center gap-2">
                         {renderActiveMethodIcon(activeMethod)}
                         <span className="font-bold text-neutral-800 text-sm">
                           {activeMethod?.barLabel || activeMethod?.label}
                         </span>
                      </div>
                   </div>
                   <div className="w-5 h-5 rounded-full border-4 border-[#00d2ff] bg-white" />
                </div>

                {/* FORMULARIO ESPECIFICO DEL METODO */}
                {selectedMethod === "efectivo" ? (
                  <div className="space-y-6">
                    <p className="text-sm text-neutral-600 leading-relaxed">
                      Descarga tu tarjeta de recaudo y acércate al punto más cercano.<br/>
                      También puedes descargar el instructivo y dirigirte a las sucursales de BBVA o Supergiros para realizar la carga de tu saldo.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="border border-neutral-200 rounded-2xl p-6 bg-white flex flex-col items-center justify-between text-center gap-4">
                          <h3 className="font-bold text-neutral-800">Tarjeta de recaudo</h3>
                          <div className="flex flex-col gap-2">
                            <span className="text-orange-500 font-black italic">Apostar</span>
                            <span className="text-blue-800 font-black italic">Susuerte</span>
                          </div>
                          <button className="w-full py-2.5 bg-[#00d2ff] text-white font-bold rounded-full hover:bg-opacity-90">
                            Descargar
                          </button>
                       </div>
                       
                       <div className="border border-neutral-200 rounded-2xl p-6 bg-white flex flex-col items-center justify-between text-center gap-4">
                          <h3 className="font-bold text-neutral-800">Convenio 35602</h3>
                          <div className="flex flex-col gap-2">
                            <span className="text-blue-900 font-black text-2xl">BBVA</span>
                            <span className="text-red-600 font-black italic text-sm">SuperGIROS</span>
                          </div>
                          <button className="w-full py-2.5 bg-[#00d2ff] text-white font-bold rounded-full hover:bg-opacity-90">
                            Descargar
                          </button>
                       </div>
                       
                       <div className="border border-neutral-200 rounded-2xl p-6 bg-white flex flex-col items-center justify-between text-center gap-4">
                          <h3 className="font-bold text-neutral-800">Tarjeta recaudo (manual)</h3>
                          <div className="flex items-center justify-center gap-3 flex-wrap opacity-60">
                            <span className="text-xs font-bold">Bancolombia</span>
                            <span className="text-xs font-bold text-red-600">DAVIVIENDA</span>
                            <span className="text-xs font-bold text-blue-600">Grupo Aval</span>
                          </div>
                          <button className="w-full py-2.5 bg-[#00d2ff] text-white font-bold rounded-full hover:bg-opacity-90 mt-2">
                            Descargar
                          </button>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* INFO TEXTS */}
                    {selectedMethod === "pse" && (
                      <p className="text-sm text-neutral-600">El pago va a ser realizado a través del Proveedor de Servicios Electrónicos PSE.</p>
                    )}
                    {(selectedMethod === "nequi" || selectedMethod === "daviplata" || selectedMethod === "qr") && (
                      <p className="text-sm text-neutral-600">
                        <span className="font-bold">Recuerda:</span> Tu transacción está siendo procesada a través de PSE. Al finalizar te saldrá una pantalla "Inscribe tu comercio" marca "Acepto" en el botón para que puedas evitar varios pasos.
                      </p>
                    )}
                    {selectedMethod === "transfiya" && (
                      <p className="text-sm text-neutral-600">
                        <span className="font-bold">Recuerda:</span> El número de celular de tu cliente debe estar asociado a una cuenta de ahorros de los bancos autorizados para hacer el pago. <span className="text-[#00d2ff] font-bold cursor-pointer hover:underline">¡Aprende a usar Transfiya!</span>
                      </p>
                    )}

                    {/* DYNAMIC FORMS */}
                    {(selectedMethod === "pse" || selectedMethod === "bancolombia") ? (
                      <div className="grid grid-cols-2 gap-4">
                        {selectedMethod === "pse" && (
                          <div className="col-span-1">
                            <label className="block text-sm text-neutral-600 mb-1">Banco *</label>
                            <select 
                              className="w-full p-3 border border-red-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d2ff]/20 focus:border-[#00d2ff] bg-white text-sm"
                              value={bank}
                              onChange={e => setBank(e.target.value)}
                            >
                              <option value="">Selecciona una opción</option>
                              {bankOptions.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                            {!bank && <p className="text-red-500 text-[10px] mt-1">El campo banco es requerido</p>}
                          </div>
                        )}
                        <div className={selectedMethod === "bancolombia" ? "col-span-1" : "col-span-1"}>
                          <label className="block text-sm text-neutral-600 mb-1">Tipo de persona *</label>
                          <select 
                            className="w-full p-3 border border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d2ff]/20 bg-white text-sm"
                            value={personType}
                            onChange={e => setPersonType(e.target.value)}
                          >
                            {personTypes.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>
                        <div className="col-span-1">
                          <label className="block text-sm text-neutral-600 mb-1">Tipo *</label>
                          <select 
                            className="w-full p-3 border border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d2ff]/20 bg-white text-sm"
                            value={docType}
                            onChange={e => setDocType(e.target.value)}
                          >
                            {documentTypes.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                        <div className="col-span-1">
                          <label className="block text-sm text-neutral-600 mb-1">Documento *</label>
                          <input 
                            type="text" 
                            className="w-full p-3 border border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d2ff]/20 bg-white text-sm"
                            value={docNumber}
                            onChange={e => setDocNumber(e.target.value)}
                            placeholder="1027210235"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-sm text-neutral-600 mb-1">Nombre *</label>
                          <input 
                            type="text" 
                            className="w-full p-3 border border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d2ff]/20 bg-white text-sm"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Juan Felipe Lopez Sana"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-sm text-neutral-600 mb-1">Correo *</label>
                          <input 
                            type="email" 
                            className="w-full p-3 border border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d2ff]/20 bg-white text-sm truncate"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="lopezsanabriajuanfelipe..."
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-sm text-neutral-600 mb-1">Celular *</label>
                          <input 
                            type="text" 
                            className="w-full p-3 border border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d2ff]/20 bg-white text-sm"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="3015667793"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm text-neutral-600 mb-2">Numero de teléfono *</label>
                        <input 
                          type="text" 
                          placeholder="312 000 0000"
                          className="w-full max-w-sm p-4 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00d2ff]/20 focus:border-[#00d2ff] bg-white shadow-sm"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                        />
                      </div>
                    )}

                    {/* ALERTS */}
                    <div className="bg-black text-white p-5 rounded-2xl text-xs leading-relaxed max-w-lg">
                      {selectedMethod === "transfiya" ? (
                        <>*Montos iguales o superiores a <span className="font-bold">$20.000</span>, no tiene costo adicional, en cambio si es inferior, la entidad te descuenta <span className="font-bold">$500</span>.</>
                      ) : (selectedMethod === "nequi" || selectedMethod === "daviplata" || selectedMethod === "qr") ? (
                        <>*Montos superiores a <span className="font-bold">$20.000</span>, no tiene costo adicional, en cambio si es inferior, la entidad te descuenta <span className="font-bold">$500</span>.</>
                      ) : (
                        <>*Montos superiores a <span className="font-bold">$50.000</span>, no tienen costo adicional, en cambio si es inferior, la entidad te descuenta <span className="font-bold">$500</span>.</>
                      )}
                    </div>

                    <div className="pt-4">
                      <button
                        disabled={!amount || amount === "0" || (selectedMethod === "pse" && !bank)}
                        className="px-8 py-3 bg-[#00d2ff] text-white font-bold rounded-full hover:bg-opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                      >
                        Cargar
                      </button>
                    </div>

                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Recent Loads (Sticky) */}
      <div className="flex-1 space-y-6 bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm flex flex-col h-full sticky top-0">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-800">Últimas Cargas</h2>
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

        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 mt-8">
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
      </div>
    </div>
  );
}
