"use client";

import React, { useState, useMemo } from "react";
import { 
  Ticket, 
  Smartphone, 
  Zap, 
  ShieldCheck, 
  Dices, 
  FileText, 
  Wallet, 
  Building2, 
  Send, 
  HandCoins,
  ChevronRight,
  ChevronLeft,
  Info,
  Loader2,
  Box,
  Search,
  X
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { orderService } from "@/services/order.service";
import { useAuthStore } from "@/store/auth-store";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ----------------------------------------------------------------------
// DATA MOCKS & HELPERS (To simulate missing backend data for Categories/Brands)
// ----------------------------------------------------------------------

const CATEGORIES = [
  { id: 'pines', label: 'Venta de pines', icon: Ticket, bg: 'bg-[#e0f8f5]', text: 'text-[#00c9cc]' },
  { id: 'paquetes', label: 'Paquetes', icon: Box, bg: 'bg-[#f4e6ff]', text: 'text-[#b946f0]' },
  { id: 'recargas', label: 'Recargas', icon: Smartphone, bg: 'bg-[#e0ffe7]', text: 'text-[#50e386]' },
  { id: 'seguros', label: 'Seguros', icon: ShieldCheck, bg: 'bg-[#dfc4ff]', text: 'text-[#a16af5]' },
  { id: 'azar', label: 'Suerte y azar', icon: Dices, bg: 'bg-[#cceaff]', text: 'text-[#489fff]' },
  { id: 'facturas', label: 'Facturas', icon: FileText, bg: 'bg-[#f5edff]', text: 'text-[#b080ff]' },
  { id: 'enviar', label: 'Enviar Dinero', icon: Send, bg: 'bg-[#f0f0f0]', text: 'text-[#888888]' },
  { id: 'corresponsalia', label: 'Corresponsalía', icon: Building2, bg: 'bg-[#e0ffef]', text: 'text-[#47db95]' },
  { id: 'billeteras', label: 'Billeteras', icon: Wallet, bg: 'bg-[#e2d5ff]', text: 'text-[#9b70ff]' },
  { id: 'recibir', label: 'Recibir Dinero', icon: HandCoins, bg: 'bg-[#d6faff]', text: 'text-[#39dbff]' },
];

const MOCK_BRANDS = [
  { id: 'netflix', name: 'Netflix', category: 'pines', logoText: 'NETFLIX', color: 'text-red-600 font-black' },
  { id: 'xbox', name: 'Xbox suscripciones', category: 'pines', logoText: 'XBOX', color: 'text-green-600 font-black' },
  { id: 'freefire', name: 'FreeFire', category: 'pines', logoText: 'FREEFIRE', color: 'text-orange-500 font-black' },
  { id: 'claro', name: 'Claro', category: 'recargas', logoText: 'CLARO', color: 'text-red-500 font-black' },
  { id: 'tigo', name: 'Tigo', category: 'recargas', logoText: 'TIGO', color: 'text-blue-800 font-black' },
];

export function VenderContent() {
  const user = useAuthStore(state => state.user);

  // -- STATES FOR NAVIGATION --
  const [view, setView] = useState<'categories' | 'checkout'>('categories');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pines');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  // Form State
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedProductSku, setSelectedProductSku] = useState<string | null>(null);

  // -- DATA FETCHING --
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getProducts(),
  });

  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: () => orderService.getOrders(user!.id, { limit: 5 }),
    enabled: !!user?.id,
  });

  const products = Array.isArray(productsData) ? productsData : (productsData?.items || []);
  const orders = Array.isArray(ordersData) ? ordersData : (ordersData?.items || []);

  // -- COMPUTED --
  // Products filtered by selected brand
  const brandProducts = useMemo(() => {
    if (!selectedBrand) return [];
    return products.filter((p: any) => p.name.toLowerCase().includes(selectedBrand.toLowerCase()));
  }, [products, selectedBrand]);

  const activeCategory = CATEGORIES.find(c => c.id === activeTab);

  // -- HANDLERS --
  const openCategoryModal = (categoryId: string) => {
    setActiveTab(categoryId);
    setIsModalOpen(true);
  };

  const selectBrand = (brandId: string) => {
    setSelectedBrand(brandId);
    setIsModalOpen(false);
    setView('checkout');
    // Reset form
    setPhone('');
    setEmail('');
    setSelectedProductSku(null);
  };

  const goBackToCategories = () => {
    setView('categories');
    setSelectedBrand(null);
  };


  return (
    <div className="flex flex-1 gap-8 p-8 overflow-hidden relative">
      
      {/* -----------------------------------------------------------
          LEFT SIDE: MAIN CONTENT (Categories OR Checkout) 
      ----------------------------------------------------------- */}
      <div className="flex-[2] flex flex-col h-full overflow-y-auto pr-4">
        
        {view === 'categories' ? (
          /* VISTA 1: GRILLA DE CATEGORIAS */
          <>
            <div className="flex items-center gap-2 mb-10">
              <h2 className="text-3xl font-black text-neutral-800 tracking-tight">Vender</h2>
              <div className="bg-[#b946f0] text-white rounded-full p-1 cursor-pointer hover:bg-opacity-90">
                <Info className="w-3 h-3" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 w-full max-w-3xl">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => openCategoryModal(cat.id)}
                    className={cn(
                      "group relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl transition-all duration-300 hover:shadow-md hover:-translate-y-1",
                      cat.bg
                    )}
                  >
                    <Icon className={cn("w-8 h-8", cat.text)} />
                    <span className={cn("font-bold text-sm text-center", cat.text)}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          /* VISTA 3: CHECKOUT DEL PRODUCTO SELECCIONADO */
          <div className="flex flex-col h-full">
            <div className="flex items-center mb-6">
              <button 
                onClick={goBackToCategories}
                className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 font-bold"
              >
                <ChevronLeft className="w-5 h-5" />
                {activeCategory?.label || 'Categorías'}
              </button>
            </div>

            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-neutral-100 flex-1">
              <div className="space-y-6 max-w-lg">
                <div>
                  <label className="block text-sm text-neutral-500 mb-1">Producto</label>
                  <div className="w-full p-3 border border-neutral-200 rounded-xl flex items-center justify-between bg-neutral-50 cursor-pointer">
                    <span className="font-bold flex items-center gap-2 text-neutral-800">
                      <span className="text-red-600 font-black uppercase text-xs border border-red-200 px-1 rounded">{selectedBrand}</span> 
                      {MOCK_BRANDS.find(b => b.id === selectedBrand)?.name || selectedBrand}
                    </span>
                    <ChevronRight className="w-4 h-4 text-neutral-400 rotate-90" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-neutral-500 mb-1 font-medium">Celular *</label>
                  <input 
                    type="text" 
                    placeholder="Número de celular"
                    className="w-full p-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00c9cc]/20 focus:border-[#00c9cc]"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-500 mb-1 font-medium">Correo electrónico *</label>
                  <input 
                    type="email" 
                    placeholder="ejemplo@mail.com"
                    className="w-full p-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00c9cc]/20 focus:border-[#00c9cc]"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">Ingresa tu correo en minúsculas y sin espacios</p>
                </div>
              </div>

              <div className="mt-10">
                <h3 className="text-neutral-500 mb-4 capitalize">{selectedBrand}</h3>
                
                {isLoadingProducts ? (
                   <Loader2 className="w-8 h-8 text-[#00c9cc] animate-spin" />
                ) : brandProducts.length > 0 ? (
                  <div className="flex gap-4 overflow-x-auto pb-4">
                    {brandProducts.map((p: any) => {
                      const isSelected = selectedProductSku === p.sku;
                      return (
                        <button 
                          key={p.id}
                          onClick={() => setSelectedProductSku(p.sku)}
                          className={cn(
                            "flex-shrink-0 w-48 p-4 rounded-2xl border-2 text-left transition-all",
                            isSelected 
                              ? "border-[#00c9cc] bg-[#00c9cc]/5 shadow-sm" 
                              : "border-neutral-100 bg-neutral-50 hover:border-neutral-200"
                          )}
                        >
                          <div className="h-12 flex items-center text-xl font-black text-neutral-300 mb-4 uppercase">
                            {selectedBrand}
                          </div>
                          <p className="text-xs text-neutral-500 font-medium mb-1 leading-tight line-clamp-2">{p.name}</p>
                          <p className="text-lg font-black text-neutral-800">${(p.priceCents / 100).toLocaleString()}</p>
                          <p className="text-[10px] text-neutral-400 mt-1 uppercase">ID: {p.id.slice(-4)}</p>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-neutral-500 italic p-4 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                    No hay productos configurados en el backend para la marca '{selectedBrand}'.<br/>
                    (Prueba buscando 'Netflix' o 'Xbox' si corriste el seed).
                  </div>
                )}
              </div>

              <div className="mt-8">
                 <button 
                    disabled={!selectedProductSku || !phone || !email}
                    className="px-8 py-3 bg-[#00c9cc] text-white font-bold rounded-full hover:bg-opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    Continuar Venta
                 </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* -----------------------------------------------------------
          RIGHT SIDE: LATEST SALES (Sticky)
      ----------------------------------------------------------- */}
      <div className="flex-1 space-y-6 bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm flex flex-col h-full sticky top-0">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-800">Últimas ventas</h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center justify-between bg-white border border-neutral-200 rounded-lg px-3 py-2 text-xs text-neutral-500">
             <span>2026/05/06 - 2026/06/05</span>
             <ChevronRight className="w-3 h-3 rotate-90" />
          </div>
          <button className="p-2 bg-[#1f8f53] text-white rounded-lg hover:opacity-90 transition-opacity">
            <FileText className="w-4 h-4" />
          </button>
          <button className="p-2 bg-white border border-neutral-200 text-neutral-500 rounded-lg hover:bg-neutral-50">
            <Search className="w-4 h-4" />
          </button>
        </div>

        {isLoadingOrders ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#00c9cc] animate-spin" />
          </div>
        ) : orders.length > 0 ? (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {orders.map((order: any) => (
              <div key={order.id} className="p-3 rounded-xl border border-neutral-100 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-800 text-xs">Orden #{order.id.slice(0,6)}</p>
                    <p className="text-[10px] text-neutral-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-cyan-600 text-sm">${(order.totalCents / 100).toLocaleString()}</p>
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

      {/* -----------------------------------------------------------
          MODAL: PRODUCT SELECTION (VISTA 2)
      ----------------------------------------------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black text-neutral-900">Selecciona un producto</h2>
                <div className="px-4 py-1 bg-[#00c9cc] text-white text-xs font-bold rounded-full">
                  {CATEGORIES.find(c => c.id === activeTab)?.label}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input 
                    type="text" 
                    className="pl-4 pr-10 py-2 bg-white border border-neutral-200 rounded-full text-sm focus:outline-none focus:border-[#00c9cc] w-64"
                  />
                  <Search className="w-4 h-4 text-neutral-400 absolute right-4 top-1/2 -translate-y-1/2" />
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6 flex gap-6 border-b border-neutral-100 overflow-x-auto custom-scrollbar">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={cn(
                    "py-4 text-sm font-bold whitespace-nowrap border-b-4 transition-colors",
                    activeTab === cat.id 
                      ? "border-[#00c9cc] text-neutral-900" 
                      : "border-transparent text-neutral-400 hover:text-neutral-600"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Modal Body (Brands Grid) */}
            <div className="p-8 overflow-y-auto bg-neutral-50/50 flex-1">
              <h3 className="text-lg font-bold text-neutral-800 mb-6">{CATEGORIES.find(c => c.id === activeTab)?.label}</h3>
              
              <div className="grid grid-cols-4 gap-4">
                {MOCK_BRANDS.filter(b => b.category === activeTab).map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => selectBrand(brand.id)}
                    className="bg-white p-4 rounded-2xl border border-neutral-100 hover:border-[#00c9cc] hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 h-28 group"
                  >
                    <div className={cn("text-xl tracking-tighter", brand.color, "group-hover:scale-105 transition-transform")}>
                      {brand.logoText}
                    </div>
                    <span className="text-xs text-neutral-600 font-medium">{brand.name}</span>
                  </button>
                ))}
              </div>

              {MOCK_BRANDS.filter(b => b.category === activeTab).length === 0 && (
                <div className="text-center py-12 text-neutral-400">
                  <Box className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aún no hay marcas configuradas para esta categoría.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
