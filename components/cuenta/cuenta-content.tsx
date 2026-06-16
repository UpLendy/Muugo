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
import { useQuery, useMutation } from "@tanstack/react-query";
import { storeService } from "@/services/store.service";
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
}

const profileItems: AccountItem[] = [
  { icon: Star, label: "Activación de productos especiales", sub: "Aumenta tus ganancias con estos productos" },
  { icon: UserIcon, label: "Tus datos", sub: "Gestiona tus datos personales", progress: 0 },
  { icon: Store, label: "Datos del comercio", sub: "Gestiona los datos de tu comercio", progress: 0 },
  { icon: Building2, label: "Cuentas bancarias", sub: "Registra y valida tus cuentas bancarias", progress: 0 },
  { icon: ShieldCheck, label: "Privacidad", sub: "Permítenos tratar tus datos personales", progress: 50 },
  { icon: FileText, label: "Documentos", sub: "Ingresa tus documentos", progress: 0 },
  { icon: Fingerprint, label: "Verificación de identidad", sub: "Por seguridad debemos saber quien eres tú", progress: 0 },
];

const configItems: AccountItem[] = [
  { icon: ShieldAlert, label: "Segunda clave", sub: "Agrega una segunda clave en la plataforma para mayor seguridad" },
  { icon: History, label: "Sesiones", sub: "Prende y apaga tus sesiones en dispositivos móviles y computadores" },
  { icon: Key, label: "Contraseña", sub: "Cambia la contraseña que pusiste al momento de registrarte" },
  { icon: Smartphone, label: "Token", sub: "Si quieres activar el token en tu usuario para mayor seguridad, ingresa acá" },
];

export function CuentaContent() {
  const [activeTab, setActiveTab] = useState("Mi perfil");
  const { user, updateUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Obtener la tienda (punto de venta) del usuario para mostrar el ID
  const { data: store } = useQuery({
    queryKey: ['myStore', user?.id],
    queryFn: () => storeService.getMyStore(user!.id),
    enabled: !!user?.id && user?.roles?.includes('seller'),
    retry: false,
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
          {(activeTab === "Mi perfil" ? profileItems : configItems).map((item, index) => (
            <button
              key={index}
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
                <ChevronRight className="w-6 h-6 text-neutral-300 group-hover:text-neutral-800 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
