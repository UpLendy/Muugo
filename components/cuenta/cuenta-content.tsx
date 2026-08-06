"use client";

import React, { useState, useRef } from "react";
import {
  User as UserIcon,
  Star,
  Store,
  Building2,
  ShieldCheck,
  FileText,
  Fingerprint,
  ChevronRight,
  ShieldAlert,
  Key,
  Smartphone,
  History,
  Camera,
  Loader2
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuthStore } from "@/store/auth-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storeService } from "@/services/store.service";
import { payoutService } from "@/services/payout.service";
import { uploadService } from "@/services/upload.service";
import { authService } from "@/services/auth.service";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AccountItem {
  icon: React.ElementType;
  label: string;
  sub: string;
  progress?: number;
  hidden?: boolean;
}

// Solo "Tus datos", "Datos del comercio" y "Cuentas bancarias" están conectadas a un
// endpoint real. El resto queda oculto (sin borrar) hasta que se implementen.
const profileItems: AccountItem[] = [
  { icon: Star, label: "Activación de productos especiales", sub: "Aumenta tus ganancias con estos productos", hidden: true },
  { icon: UserIcon, label: "Tus datos", sub: "Gestiona tus datos personales" },
  { icon: Store, label: "Datos del comercio", sub: "Gestiona los datos de tu comercio" },
  { icon: Building2, label: "Cuentas bancarias", sub: "Registra y valida tus cuentas bancarias" },
  { icon: ShieldCheck, label: "Privacidad", sub: "Permítenos tratar tus datos personales", progress: 50, hidden: true },
  { icon: FileText, label: "Documentos", sub: "Ingresa tus documentos", hidden: true },
  { icon: Fingerprint, label: "Verificación de identidad", sub: "Por seguridad debemos saber quien eres tú", hidden: true },
];

const configItems: AccountItem[] = [
  { icon: ShieldAlert, label: "Segunda clave", sub: "Agrega una segunda clave en la plataforma para mayor seguridad", hidden: true },
  { icon: History, label: "Sesiones", sub: "Prende y apaga tus sesiones en dispositivos móviles y computadores", hidden: true },
  { icon: Key, label: "Contraseña", sub: "Cambia la contraseña que pusiste al momento de registrarte" },
  { icon: Smartphone, label: "Token", sub: "Si quieres activar el token en tu usuario para mayor seguridad, ingresa acá", hidden: true },
];

const togglableLabels = ["Tus datos", "Datos del comercio", "Cuentas bancarias", "Contraseña"];

export function CuentaContent() {
  const [activeTab, setActiveTab] = useState("Mi perfil");
  const { user, updateUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const isSeller = !!user?.roles?.includes('seller');

  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordMutation = useMutation({
    mutationFn: async () => {
      if (newPassword !== confirmPassword) throw new Error("Las contraseñas no coinciden");
      await authService.changePassword(currentPassword, newPassword);
    },
    onSuccess: () => {
      alert("Contraseña actualizada exitosamente.");
      setExpandedItem(null);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || error.message || "Error al cambiar la contraseña");
    }
  });

  // Obtener la tienda (punto de venta) del usuario para mostrar el ID y editar sus datos
  const { data: store } = useQuery({
    queryKey: ['myStore', user?.id],
    queryFn: () => storeService.getMyStore(user!.id),
    enabled: !!user?.id && isSeller,
    retry: false,
  });

  // ── Tus datos ────────────────────────────────────────────────────────────
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? "");

  // Sincroniza el formulario si cambia el usuario cargado (ajuste de estado durante
  // el render, no en un efecto, para evitar un render en cascada).
  const [syncedUserId, setSyncedUserId] = useState(user?.id);
  if (user?.id !== syncedUserId) {
    setSyncedUserId(user?.id);
    setFirstName(user?.firstName ?? "");
    setLastName(user?.lastName ?? "");
    setPhoneNumber(user?.phoneNumber ?? "");
  }

  const profileMutation = useMutation({
    mutationFn: () => authService.updateProfile({ firstName, lastName, phoneNumber: phoneNumber || undefined }),
    onSuccess: (updated) => {
      updateUser({ firstName: updated.firstName, lastName: updated.lastName, phoneNumber: updated.phoneNumber });
      alert("Tus datos se actualizaron correctamente.");
      setExpandedItem(null);
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || error.message || "Error al actualizar tus datos");
    }
  });

  // ── Datos del comercio ──────────────────────────────────────────────────
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [storeVisibility, setStoreVisibility] = useState<"public" | "unlisted" | "private">("public");

  const [syncedStoreId, setSyncedStoreId] = useState<string | undefined>(undefined);
  if (store && store.id !== syncedStoreId) {
    setSyncedStoreId(store.id);
    setStoreName(store.name ?? "");
    setStoreDescription(store.description ?? "");
    setStoreVisibility(store.visibility ?? "public");
  }

  const storeMutation = useMutation({
    mutationFn: () => {
      const data = { name: storeName, description: storeDescription, visibility: storeVisibility };
      return store
        ? storeService.updateStore(user!.id, data)
        : storeService.createStore(user!.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myStore', user?.id] });
      alert("Los datos del comercio se actualizaron correctamente.");
      setExpandedItem(null);
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || error.message || "Error al actualizar el comercio");
    }
  });

  // ── Cuentas bancarias ────────────────────────────────────────────────────
  const { data: payoutAccount } = useQuery({
    queryKey: ['payoutAccount', store?.id],
    queryFn: () => payoutService.getAccount(store!.id),
    enabled: !!store?.id && expandedItem === "Cuentas bancarias",
    retry: false,
  });

  const [payoutMethod, setPayoutMethod] = useState("");
  const [payoutKey, setPayoutKey] = useState("");
  const [bankName, setBankName] = useState("");
  const [beneficiary, setBeneficiary] = useState("");

  const [syncedPayoutId, setSyncedPayoutId] = useState<string | undefined>(undefined);
  if (payoutAccount && payoutAccount.id !== syncedPayoutId) {
    setSyncedPayoutId(payoutAccount.id);
    setPayoutMethod(payoutAccount.payoutMethod ?? "");
    setPayoutKey(payoutAccount.key ?? "");
    setBankName(payoutAccount.bankName ?? "");
    setBeneficiary(payoutAccount.beneficiary ?? "");
  }

  const payoutMutation = useMutation({
    mutationFn: () => {
      if (!store?.id) throw new Error("Primero debes crear tu comercio");
      return payoutService.configureAccount(store.id, {
        payoutMethod,
        key: payoutKey,
        bankName: bankName || undefined,
        beneficiary: beneficiary || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payoutAccount', store?.id] });
      alert("La cuenta bancaria se guardó correctamente.");
      setExpandedItem(null);
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || error.message || "Error al guardar la cuenta bancaria");
    }
  });

  // Mutación para subir el avatar
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) throw new Error("Usuario no encontrado");

      // 1. Obtener URL firmada
      const presignedData = await uploadService.getPresignedUrl('user-avatar', user.id, file.name, file.type);

      // 2. Subir a S3
      await uploadService.uploadToS3(presignedData.uploadUrl, file);

      // 3. Actualizar avatar en el backend y estado global
      // El backend en este caso asume que debe guardar la fileUrl retornada en la respuesta de presignedData
      const updatedUser = await authService.updateAvatar(presignedData.fileUrl);
      updateUser({ avatarUrl: updatedUser.avatarUrl });

      return updatedUser;
    },
    onError: (error) => {
      console.error("Error subiendo el avatar:", error);
      alert("Hubo un error al subir la imagen. Intenta de nuevo.");
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (ej. max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen es muy pesada. Máximo 5MB.");
      return;
    }

    uploadMutation.mutate(file);
  };

  const handleAvatarClick = () => {
    if (!uploadMutation.isPending) {
      fileInputRef.current?.click();
    }
  };

  if (!user) return null;

  return (
    <div className="flex-1 flex flex-col items-center py-12 px-8 overflow-y-auto">
      <div className="w-full max-w-2xl space-y-8">

        {/* Tabs */}
        <div className="flex justify-center gap-8 mb-4">
          {["Mi perfil", "Configuración"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-2 text-sm font-bold transition-all relative",
                activeTab === tab ? "text-neutral-800" : "text-neutral-300 hover:text-neutral-400"
              )}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#00d2ff] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* User Card */}
        <div className="bg-white border border-neutral-100 rounded-[2.5rem] p-8 flex flex-col sm:flex-row items-center sm:items-start gap-8 shadow-sm relative overflow-hidden group text-center sm:text-left">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00d2ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          <div
            onClick={handleAvatarClick}
            className="w-24 h-24 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center text-[#658cff] relative z-10 cursor-pointer overflow-hidden group/avatar shadow-md"
          >
            {uploadMutation.isPending ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : user.avatarUrl ? (
              <>
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </>
            ) : (
              <>
                <UserIcon className="w-12 h-12" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex-1 space-y-1 relative z-10 mt-2 sm:mt-0">
            <h3 className="text-3xl font-black text-neutral-800">{user.firstName} {user.lastName}</h3>
            <p className="text-neutral-400 font-medium">{user.email}</p>
            <p className="text-neutral-400 font-mono text-xs tracking-widest mt-2">
              ID: {store?.id ? store.id.slice(0, 6).toUpperCase() : 'PENDIENTE'}
            </p>
          </div>

          <div className="relative w-20 h-20 flex items-center justify-center z-10 shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-neutral-100"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray="213.6"
                strokeDashoffset={213.6 * (1 - 0.05)}
                className="text-[#00d2ff]"
              />
            </svg>
            <span className="absolute text-sm font-black text-[#00d2ff]">5%</span>
          </div>
        </div>

        {/* List Items */}
        <div className="space-y-3">
          {(activeTab === "Mi perfil" ? profileItems : configItems).filter(item => !item.hidden).map((item, index) => (
            <div key={index} className="flex flex-col gap-2">
              <button
                onClick={() => {
                  if (togglableLabels.includes(item.label)) {
                    setExpandedItem(expandedItem === item.label ? null : item.label);
                  }
                }}
                className="w-full bg-white border border-neutral-50 rounded-2xl p-5 flex items-center gap-6 hover:border-neutral-200 transition-all group hover:shadow-lg hover:shadow-neutral-100"
              >
                <div className="w-12 h-12 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:bg-[#eb0028]/5 group-hover:text-[#eb0028] transition-colors shrink-0">
                  <item.icon className="w-6 h-6" />
                </div>

                <div className="flex-1 text-left">
                  <p className="font-bold text-neutral-800 text-lg">{item.label}</p>
                  <p className="text-xs text-neutral-400 font-medium leading-relaxed">{item.sub}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {item.progress !== undefined && (
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full border-2 border-neutral-100 flex items-center justify-center text-[10px] font-black text-neutral-300 relative overflow-hidden">
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-[#00d2ff]/20 transition-all"
                            style={{ height: `${item.progress}%` }}
                          />
                          {item.progress}%
                       </div>
                     </div>
                  )}
                  <ChevronRight className={cn("w-6 h-6 text-neutral-300 group-hover:text-neutral-800 transition-colors", expandedItem === item.label ? "rotate-90" : "")} />
                </div>
              </button>

              {/* Tus datos */}
              {item.label === "Tus datos" && expandedItem === "Tus datos" && (
                <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Nombre</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      className="w-full p-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#eb0028] bg-white text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Apellido</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      className="w-full p-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#eb0028] bg-white text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Teléfono</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      className="w-full p-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#eb0028] bg-white text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Correo</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full p-3 rounded-xl border border-neutral-200 bg-neutral-100 text-neutral-400 text-sm cursor-not-allowed"
                    />
                  </div>
                  <button
                    onClick={() => profileMutation.mutate()}
                    disabled={!firstName || !lastName || profileMutation.isPending}
                    className="w-full py-3 bg-[#eb0028] text-white font-bold rounded-xl hover:bg-opacity-90 transition-all disabled:opacity-50"
                  >
                    {profileMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Guardar datos"}
                  </button>
                </div>
              )}

              {/* Datos del comercio */}
              {item.label === "Datos del comercio" && expandedItem === "Datos del comercio" && (
                <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200 space-y-4 animate-in fade-in slide-in-from-top-2">
                  {!isSeller ? (
                    <p className="text-sm text-neutral-500">Esta sección está disponible solo para vendedores.</p>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Nombre del comercio</label>
                        <input
                          type="text"
                          value={storeName}
                          onChange={e => setStoreName(e.target.value)}
                          className="w-full p-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#eb0028] bg-white text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Descripción</label>
                        <textarea
                          value={storeDescription}
                          onChange={e => setStoreDescription(e.target.value)}
                          rows={3}
                          className="w-full p-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#eb0028] bg-white text-sm resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Visibilidad</label>
                        <select
                          value={storeVisibility}
                          onChange={e => setStoreVisibility(e.target.value as "public" | "unlisted" | "private")}
                          className="w-full p-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#eb0028] bg-white text-sm"
                        >
                          <option value="public">Pública</option>
                          <option value="unlisted">No listada</option>
                          <option value="private">Privada</option>
                        </select>
                      </div>
                      <button
                        onClick={() => storeMutation.mutate()}
                        disabled={!storeName || storeMutation.isPending}
                        className="w-full py-3 bg-[#eb0028] text-white font-bold rounded-xl hover:bg-opacity-90 transition-all disabled:opacity-50"
                      >
                        {storeMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Guardar comercio"}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Cuentas bancarias */}
              {item.label === "Cuentas bancarias" && expandedItem === "Cuentas bancarias" && (
                <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200 space-y-4 animate-in fade-in slide-in-from-top-2">
                  {!isSeller ? (
                    <p className="text-sm text-neutral-500">Esta sección está disponible solo para vendedores.</p>
                  ) : !store ? (
                    <p className="text-sm text-neutral-500">Primero registra los datos de tu comercio en &quot;Datos del comercio&quot;.</p>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Método de pago</label>
                        <input
                          type="text"
                          placeholder="Ej. nequi, bancolombia, bre-b"
                          value={payoutMethod}
                          onChange={e => setPayoutMethod(e.target.value)}
                          className="w-full p-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#eb0028] bg-white text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Número de cuenta / llave</label>
                        <input
                          type="text"
                          value={payoutKey}
                          onChange={e => setPayoutKey(e.target.value)}
                          className="w-full p-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#eb0028] bg-white text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Banco</label>
                        <input
                          type="text"
                          value={bankName}
                          onChange={e => setBankName(e.target.value)}
                          className="w-full p-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#eb0028] bg-white text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Titular</label>
                        <input
                          type="text"
                          value={beneficiary}
                          onChange={e => setBeneficiary(e.target.value)}
                          className="w-full p-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#eb0028] bg-white text-sm"
                        />
                      </div>
                      <button
                        onClick={() => payoutMutation.mutate()}
                        disabled={!payoutMethod || !payoutKey || payoutMutation.isPending}
                        className="w-full py-3 bg-[#eb0028] text-white font-bold rounded-xl hover:bg-opacity-90 transition-all disabled:opacity-50"
                      >
                        {payoutMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Guardar cuenta bancaria"}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Contraseña */}
              {item.label === "Contraseña" && expandedItem === "Contraseña" && (
                <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Contraseña actual</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      className="w-full p-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#eb0028] bg-white text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Nueva contraseña</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full p-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#eb0028] bg-white text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Confirmar contraseña</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full p-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#eb0028] bg-white text-sm"
                    />
                  </div>
                  <button
                    onClick={() => passwordMutation.mutate()}
                    disabled={!currentPassword || !newPassword || !confirmPassword || passwordMutation.isPending}
                    className="w-full py-3 bg-[#eb0028] text-white font-bold rounded-xl hover:bg-opacity-90 transition-all disabled:opacity-50"
                  >
                    {passwordMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Guardar contraseña"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
