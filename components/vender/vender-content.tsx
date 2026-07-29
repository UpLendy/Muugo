"use client";

import React, { useState, useMemo } from "react";
import { 
  Ticket, 
  Smartphone, 
  ShieldCheck, 
  Dices, 
  FileText, 
  Wallet, 
  Building2, 
  Send, 
  HandCoins,
  ChevronLeft,
  Info,
  Loader2,
  Box,
  X,
  Zap,
  Check
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { catalogService } from "@/services/catalog.service";
import { sellService } from "@/services/sell.service";
import { useAuthStore } from "@/store/auth-store";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Estilos cíclicos para las categorías (fallback)
const CATEGORY_STYLES = [
  { icon: Ticket,     bg: 'bg-[#e0f8f5]', text: 'text-[#00c9cc]' },
  { icon: Box,        bg: 'bg-[#f4e6ff]', text: 'text-[#b946f0]' },
  { icon: Smartphone, bg: 'bg-[#e0ffe7]', text: 'text-[#50e386]' },
  { icon: ShieldCheck,bg: 'bg-[#dfc4ff]', text: 'text-[#a16af5]' },
  { icon: Dices,      bg: 'bg-[#cceaff]', text: 'text-[#489fff]' },
  { icon: FileText,   bg: 'bg-[#f5edff]', text: 'text-[#b080ff]' },
  { icon: Send,       bg: 'bg-[#f0f0f0]', text: 'text-[#888888]' },
  { icon: Building2,  bg: 'bg-[#e0ffef]', text: 'text-[#47db95]' },
  { icon: Wallet,     bg: 'bg-[#e2d5ff]', text: 'text-[#9b70ff]' },
  { icon: HandCoins,  bg: 'bg-[#d6faff]', text: 'text-[#39dbff]' },
  { icon: Zap,        bg: 'bg-[#fff4e0]', text: 'text-[#f0a500]' },
];

// Grupos padre: agrupan múltiples categoryIds bajo una sola tarjeta visual
const PARENT_GROUPS = [
  {
    id: 'recargas',
    name: 'Recargas',
    icon: Smartphone,
    bg: 'bg-[#e0ffe7]',
    text: 'text-[#1db954]',
    categoryIds: [2, 78],
  },
  {
    id: 'pines',
    name: 'Pines y Gift Cards',
    icon: Ticket,
    bg: 'bg-[#e0f8f5]',
    text: 'text-[#00c9cc]',
    categoryIds: [83, 84, 85, 86, 87, 88, 90, 91, 93, 94, 103, 105, 106, 107, 119, 178, 187, 197, 202, 203],
  },
  {
    id: 'suerte',
    name: 'Suerte y azar',
    icon: Dices,
    bg: 'bg-[#cceaff]',
    text: 'text-[#489fff]',
    categoryIds: [100, 62],
  },
  {
    id: 'billeteras',
    name: 'Billeteras',
    icon: Wallet,
    bg: 'bg-[#e2d5ff]',
    text: 'text-[#9b70ff]',
    categoryIds: [65, 79, 176, 177],
  },
  {
    id: 'corresponsalia',
    name: 'Corresponsalía',
    icon: Building2,
    bg: 'bg-[#e0ffef]',
    text: 'text-[#47db95]',
    categoryIds: [60, 70, 174, 192, 200],
  },
  {
    id: 'enviar',
    name: 'Enviar y recibir dinero',
    icon: Send,
    bg: 'bg-[#f0f0f0]',
    text: 'text-[#888888]',
    categoryIds: [64, 194, 195],
  },
  {
    id: 'pagos',
    name: 'Pagos y cobros',
    icon: FileText,
    bg: 'bg-[#f5edff]',
    text: 'text-[#b080ff]',
    categoryIds: [59, 61, 63, 71, 182, 184, 191, 205, 206, 210],
  },
  {
    id: 'seguros',
    name: 'Seguros y SOAT',
    icon: ShieldCheck,
    bg: 'bg-[#dfc4ff]',
    text: 'text-[#a16af5]',
    categoryIds: [76],
  },
  {
    id: 'servicios',
    name: 'Servicios',
    icon: Zap,
    bg: 'bg-[#fff4e0]',
    text: 'text-[#f0a500]',
    categoryIds: [95, 99, 152],
  },
  {
    id: 'llaves',
    name: 'Llaves Bre-B',
    icon: HandCoins,
    bg: 'bg-[#d6faff]',
    text: 'text-[#39dbff]',
    categoryIds: [189, 199],
  },
] as const;

type ParentGroup = typeof PARENT_GROUPS[number];

// Extrae el nombre de la marca desde imageUrl (e.g. "freefire.png" -> "FreeFire")
function brandNameFromImageUrl(imageUrl: string | null): string {
  if (!imageUrl) return 'Otro';
  return imageUrl
    .replace('.png', '')
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Construye la URL de la imagen del CDN de Refácil
function productImageUrl(imageUrl: string): string {
  return `https://cdn.refacil.com.co/img/${imageUrl}`;
}


export function VenderContent() {
  const user = useAuthStore(state => state.user);
  const queryClient = useQueryClient();

  // -- ESTADOS --
  const [view, setView] = useState<'categories' | 'checkout'>('categories');
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Paso dentro del modal: 'brands' | 'products'
  const [modalStep, setModalStep] = useState<'brands' | 'products'>('brands');
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [activeBrandKey, setActiveBrandKey] = useState<string | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [customAmount, setCustomAmount] = useState('');

  // -- QUERIES --
  const { data: allProductsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['catalogAllProducts'],
    queryFn: () => catalogService.getProducts({ limit: 1000 }),
    staleTime: 5 * 60 * 1000,
  });

  const allProducts: any[] = allProductsData?.data || [];

  // Grupo padre activo
  const activeGroup = PARENT_GROUPS.find(g => g.id === activeGroupId) ?? null;

  // Productos del grupo activo (todos sus categoryIds)
  const categoryProducts = useMemo(() => {
    if (!activeGroup) return [];
    const ids = new Set(activeGroup.categoryIds);
    return allProducts.filter(p => ids.has(p.categoryId));
  }, [allProducts, activeGroup]);

  // Grupos con al menos 1 producto (para no mostrar grupos vacíos)
  const activeGroups = useMemo(() => {
    return PARENT_GROUPS.filter(g => {
      const ids = new Set(g.categoryIds);
      return allProducts.some(p => ids.has(p.categoryId));
    }).map(g => ({
      ...g,
      count: allProducts.filter(p => (g.categoryIds as readonly number[]).includes(p.categoryId)).length,
    }));
  }, [allProducts]);



  // Marcas únicas dentro de la categoría (agrupadas por imageUrl)
  const brandsInCategory = useMemo(() => {
    const map = new Map<string, { key: string; name: string; imageUrl: string; productCount: number; hasVariableAmount: boolean }>();
    categoryProducts.forEach(p => {
      // Productos sin imageUrl se agrupan bajo una key genérica
      const key = p.imageUrl || 'generic';
      if (!map.has(key)) {
        map.set(key, {
          key,
          name: brandNameFromImageUrl(p.imageUrl),
          imageUrl: key,
          productCount: 0,
          hasVariableAmount: false,
        });
      }
      const brand = map.get(key)!;
      brand.productCount++;
      if (p.amount === null) brand.hasVariableAmount = true;
    });
    return Array.from(map.values());
  }, [categoryProducts]);

  // Productos de la marca activa
  const brandProducts = useMemo(() => {
    if (!activeBrandKey) return [];
    return categoryProducts.filter(p => p.imageUrl === activeBrandKey);
  }, [categoryProducts, activeBrandKey]);

  const { data: sellsData, isLoading: isLoadingSells } = useQuery({
    queryKey: ['sells', user?.id],
    queryFn: () => sellService.list({ limit: 5 }),
    enabled: !!user?.id,
  });

  const sells = Array.isArray(sellsData) ? sellsData : (sellsData?.items || sellsData?.data || []);

  // -- MUTACIÓN DE VENTA --
  const saleMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProduct) throw new Error("Debes seleccionar un producto");
      if (!user?.id) throw new Error("Usuario no encontrado");

      // Resolver monto (en PESOS COP para POST /sells)
      let finalAmount = undefined;
      if (selectedProduct.amount === null) {
        finalAmount = parseInt(customAmount.replace(/\D/g, ''), 10);
        if (isNaN(finalAmount) || finalAmount <= 0) throw new Error("Monto inválido");
      }

      // Ejecutar venta directa contra el saldo del vendedor
      const sellRes = await sellService.execute({
        refacilProductId: selectedProduct.id,
        amount: finalAmount,
        // Refácil Commerce suele requerir 'numero' para recargas o 'accountId' para pines/facturas.
        // Agregamos 'cellphone' porque las credenciales de QA de Refácil lo piden de esta forma.
        sellData: { 
          numero: phone, 
          accountId: phone,
          phoneNumber: phone, 
          cellphone: phone,
          email: email || undefined 
        }
      });
      
      return sellRes.data;
    },
    onSuccess: (sell: any) => {
      queryClient.invalidateQueries({ queryKey: ['sells'] });
      if (sell?.status === 'failed') {
        alert(`La venta no se pudo completar: ${sell?.errorMessage || 'Refácil rechazó la transacción'}`);
      } else if (sell?.status === 'completed') {
        alert("¡Venta procesada exitosamente!");
      } else {
        alert("Venta enviada, está en proceso de confirmación. Revisa el estado en tu historial de ventas.");
      }
      setView('categories');
      setPhone("");
      setEmail("");
      setCustomAmount("");
      setSelectedProduct(null);
    },
    onError: (error: any) => {
      console.error(error);
      alert(`Error: ${error?.response?.data?.error?.message || error?.message || "No se pudo procesar la venta"}`);
    },
  });

  // -- HANDLERS --
  const openGroupModal = (groupId: string) => {
    setActiveGroupId(groupId);
    setActiveBrandKey(null);
    setModalStep('brands');
    setIsModalOpen(true);
  };

  const selectBrand = (brandKey: string) => {
    setActiveBrandKey(brandKey);
    setModalStep('products');
  };

  const selectProduct = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(false);
    setView('checkout');
    setPhone('');
    setEmail('');
    setCustomAmount('');
  };

  const goBackToCategories = () => {
    setView('categories');
    setSelectedProduct(null);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (!value) { setCustomAmount(''); return; }
    setCustomAmount(new Intl.NumberFormat('es-CO').format(parseInt(value, 10)));
  };

  const activeBrand = brandsInCategory.find(b => b.key === activeBrandKey);

  return (
    <div className="flex flex-1 gap-8 p-8 overflow-hidden relative">

      {/* -----------------------------------------------------------
          LEFT SIDE: MAIN CONTENT
      ----------------------------------------------------------- */}
      <div className="flex-[2] flex flex-col h-full overflow-y-auto pr-4 custom-scrollbar">

        {view === 'categories' ? (
          /* VISTA 1: GRILLA DE CATEGORÍAS */
          <>
            <div className="flex items-center gap-2 mb-10">
              <h2 className="text-3xl font-black text-neutral-800 tracking-tight">Vender</h2>
              <div className="bg-[#b946f0] text-white rounded-full p-1 cursor-pointer hover:bg-opacity-90">
                <Info className="w-3 h-3" />
              </div>
            </div>

            {isLoadingProducts ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 text-[#00c9cc] animate-spin" />
              </div>
            ) : activeGroups.length === 0 ? (
              <div className="text-center py-20 text-neutral-500">
                No hay productos disponibles en el catálogo.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-6 w-full max-w-3xl pb-20">
                {activeGroups.map((group) => {
                  const Icon = group.icon;
                  return (
                    <button
                      key={group.id}
                      onClick={() => openGroupModal(group.id)}
                      className={cn(
                        "group relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer",
                        group.bg
                      )}
                    >
                      <Icon className={cn("w-8 h-8", group.text)} />
                      <span className={cn("font-bold text-sm text-center leading-tight", group.text)}>
                        {group.name}
                      </span>
                      <span className={cn("text-[10px] font-bold opacity-60", group.text)}>
                        {group.count} producto{group.count !== 1 ? 's' : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* VISTA 2: CHECKOUT */
          <div className="flex flex-col h-full pb-20">
            <div className="flex items-center mb-6">
              <button
                onClick={goBackToCategories}
                className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 font-bold"
              >
                <ChevronLeft className="w-5 h-5" />
                Catálogo
              </button>
            </div>

            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-neutral-100 flex-1">

              {/* Product Header */}
              <div className="mb-10 flex items-center gap-4 p-4 border border-[#00c9cc]/20 bg-[#00c9cc]/5 rounded-2xl">
                <div className="w-14 h-14 rounded-xl bg-white border border-neutral-100 shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img
                    src={productImageUrl(selectedProduct.imageUrl)}
                    alt={selectedProduct.name}
                    className="w-12 h-12 object-contain"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
                <div>
                  <h3 className="font-black text-lg text-neutral-800 leading-tight">{selectedProduct.name}</h3>
                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    {selectedProduct.amount ? (
                      <span className="font-bold text-[#00c9cc] text-sm">${(selectedProduct.amount / 100).toLocaleString('es-CO')} COP</span>
                    ) : (
                      <span className="bg-neutral-200 text-neutral-600 px-2 py-0.5 rounded text-xs font-bold uppercase">Monto Variable</span>
                    )}
                    {selectedProduct.commissionRate && (
                      <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-full text-[10px] font-bold border border-green-100">
                        Comisión: {selectedProduct.commissionType === 'percent' ? `${selectedProduct.commissionRate}%` : `$${(selectedProduct.commissionRate / 100).toLocaleString()}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-5 max-w-lg">

                {selectedProduct.amount === null && (
                  <div>
                    <label className="block text-sm text-neutral-500 mb-1 font-medium">Valor a recargar *</label>
                    <div className="flex items-center gap-2 p-4 border border-neutral-200 rounded-xl focus-within:ring-2 focus-within:ring-[#00c9cc]/20 focus-within:border-[#00c9cc] bg-white transition-all shadow-sm">
                      <span className="text-neutral-400 font-bold">$</span>
                      <input
                        type="text"
                        className="w-full bg-transparent outline-none font-bold text-neutral-800 text-lg placeholder:font-normal placeholder:text-neutral-300"
                        value={customAmount}
                        onChange={handleAmountChange}
                        placeholder="0"
                      />
                      <span className="text-neutral-400 text-xs font-bold">COP</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1 ml-1">Ingresa el valor exacto a recargar en pesos colombianos.</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm text-neutral-500 mb-1 font-medium">Celular de entrega *</label>
                  <input
                    type="tel"
                    placeholder="312 000 0000"
                    className="w-full p-4 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00c9cc]/20 focus:border-[#00c9cc] shadow-sm transition-all"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-500 mb-1 font-medium">Correo electrónico *</label>
                  <input
                    type="email"
                    placeholder="ejemplo@mail.com"
                    className="w-full p-4 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00c9cc]/20 focus:border-[#00c9cc] shadow-sm transition-all"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-neutral-100 flex items-center gap-4">
                <button
                  onClick={() => saleMutation.mutate()}
                  disabled={!phone || !email || (selectedProduct.amount === null && !customAmount) || saleMutation.isPending}
                  className="px-8 py-4 bg-gradient-to-r from-[#00c9cc] to-[#00a3a6] text-white font-bold rounded-full hover:scale-105 transition-all shadow-lg shadow-cyan-200 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed min-w-[200px] flex items-center justify-center gap-2"
                >
                  {saleMutation.isPending ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</>
                  ) : (
                    <><Check className="w-4 h-4" /> Confirmar Venta</>
                  )}
                </button>
                <button
                  onClick={() => { setView('categories'); setSelectedProduct(null); }}
                  className="text-neutral-400 hover:text-neutral-600 text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* -----------------------------------------------------------
          RIGHT SIDE: ÚLTIMAS VENTAS
      ----------------------------------------------------------- */}
      <div className="flex-1 space-y-6 bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm flex flex-col h-full sticky top-0 overflow-hidden">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-800">Últimas ventas</h2>
        </div>

        {isLoadingSells ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#00c9cc] animate-spin" />
          </div>
        ) : sells.length > 0 ? (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {sells.map((sell: any) => (
              <div key={sell.id} className="p-3 rounded-xl border border-neutral-100 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center flex-shrink-0">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-800 text-xs">Venta #{sell.id.slice(0, 6)}</p>
                    <p className="text-[10px] text-neutral-500">{new Date(sell.createdAt).toLocaleDateString('es-CO')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-cyan-600 text-sm">${((sell.amountCents || 0) / 100).toLocaleString('es-CO')}</p>
                  <p className="text-[9px] uppercase font-bold text-neutral-400">{sell.status}</p>
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
              Aún no tienes ventas registradas.
            </p>
          </div>
        )}
      </div>

      {/* -----------------------------------------------------------
          MODAL: PASO 1 (Marcas) y PASO 2 (Productos)
      ----------------------------------------------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl flex flex-col h-[82vh] overflow-hidden">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-neutral-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                {modalStep === 'products' && (
                  <button
                    onClick={() => setModalStep('brands')}
                    className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                <div>
                  <h2 className="text-xl font-black text-neutral-900">
                    {modalStep === 'brands'
                      ? (activeGroup?.name || 'Selecciona un operador')
                      : activeBrand?.name || 'Productos'}
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {modalStep === 'brands'
                      ? `${brandsInCategory.length} operador${brandsInCategory.length !== 1 ? 'es' : ''} disponible${brandsInCategory.length !== 1 ? 's' : ''}`
                      : `${brandProducts.length} producto${brandProducts.length !== 1 ? 's' : ''} disponible${brandProducts.length !== 1 ? 's' : ''}`
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              {isLoadingProducts ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="w-8 h-8 text-[#00c9cc] animate-spin" />
                </div>

              ) : modalStep === 'brands' ? (
                /* --- PASO 1: MARCAS/OPERADORES --- */
                brandsInCategory.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {brandsInCategory.map(brand => (
                      <button
                        key={brand.key}
                        onClick={() => selectBrand(brand.key)}
                        className="bg-white p-5 rounded-2xl border border-neutral-100 hover:border-[#00c9cc] hover:shadow-lg transition-all flex flex-col items-center justify-center gap-3 h-36 group"
                      >
                        {/* Logo con fallback a texto */}
                        <div className="w-14 h-14 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center overflow-hidden group-hover:border-[#00c9cc]/30 transition-colors">
                          <img
                            src={productImageUrl(brand.imageUrl)}
                            alt={brand.name}
                            className="w-12 h-12 object-contain"
                            onError={e => {
                              const el = e.target as HTMLImageElement;
                              el.style.display = 'none';
                              el.parentElement!.innerHTML = `<span class="text-lg font-black text-neutral-400">${brand.name.charAt(0)}</span>`;
                            }}
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-neutral-800 line-clamp-1 group-hover:text-[#00c9cc] transition-colors">{brand.name}</p>
                          <p className="text-[10px] text-neutral-400 mt-0.5">
                            {brand.productCount} plan{brand.productCount !== 1 ? 'es' : ''}
                            {brand.hasVariableAmount ? ' · Monto variable' : ''}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                    <Box className="w-12 h-12 mb-4 opacity-30" />
                    <p>No hay operadores en esta categoría.</p>
                  </div>
                )

              ) : (
                /* --- PASO 2: PRODUCTOS DE LA MARCA --- */
                brandProducts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {brandProducts.map(p => (
                      <button
                        key={p.id}
                        onClick={() => selectProduct(p)}
                        className="bg-white p-5 rounded-2xl border-2 border-neutral-100 hover:border-[#00c9cc] hover:shadow-md transition-all text-left group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                            <img
                              src={productImageUrl(p.imageUrl)}
                              alt={p.name}
                              className="w-8 h-8 object-contain"
                              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          </div>
                          {p.commissionRate && (
                            <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                              +{p.commissionType === 'percent' ? `${p.commissionRate}%` : `$${(p.commissionRate / 100).toLocaleString()}`}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-neutral-800 line-clamp-2 leading-tight mb-2 group-hover:text-[#00c9cc] transition-colors">{p.name}</p>
                        {p.amount ? (
                          <p className="text-base font-black text-neutral-700">${(p.amount / 100).toLocaleString('es-CO')}<span className="text-[10px] font-normal text-neutral-400 ml-1">COP</span></p>
                        ) : (
                          <span className="inline-block text-[10px] font-bold text-[#00c9cc] bg-[#00c9cc]/10 px-2 py-0.5 rounded-full border border-[#00c9cc]/20">Precio Variable</span>
                        )}
                        {p.meta?.tag && (
                          <span className="mt-2 inline-block text-[9px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">{p.meta.tag}</span>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                    <Box className="w-12 h-12 mb-4 opacity-30" />
                    <p>No hay productos para este operador.</p>
                  </div>
                )
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
