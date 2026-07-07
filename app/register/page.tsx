"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { storeService } from "@/services/store.service";
import { profileService } from "@/services/profile.service";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, AlertCircle, Loader2, User as UserIcon, Phone } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });
  
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: () => authService.register(formData),
    onSuccess: async (data) => {
      login(data.user, data.token);
      try {
        // 1. Crear perfil de vendedor
        const profileRes = await profileService.createSellerProfile(data.user.id, {});
        // 2. Usar el sellerId retornado para crear la tienda
        const sellerId = profileRes?.data?.id ?? profileRes?.id ?? data.user.id;
        await storeService.createStore(sellerId, {});
      } catch {
        console.warn("No se pudo completar la configuración inicial del vendedor");
      }
      router.push("/");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) return;
    mutation.mutate();
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Lado Izquierdo - Formulario (Invertido respecto al login para dar variedad) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white relative overflow-y-auto">
        <div className="w-full max-w-md space-y-8 relative z-10 my-auto py-10">
          
          {/* Logo solo en móvil */}
          <div className="lg:hidden mb-8 text-center">
             <span className="text-3xl font-black tracking-tighter text-neutral-900 flex items-center justify-center gap-1">
               <span className="text-[#eb0028] text-4xl">D</span>ismanet
             </span>
          </div>

          <div>
            <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Crear Cuenta</h1>
            <p className="text-neutral-500 font-medium mt-2">Únete a la mejor red transaccional</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 mt-10">
            {mutation.isError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-start gap-3 text-sm font-medium">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{(mutation.error as any)?.response?.data?.message || "Ha ocurrido un error al crear la cuenta. Verifica los datos."}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Nombres</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#eb0028]/20 focus:border-[#eb0028] transition-all"
                    placeholder="Juan"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Apellidos</label>
                <div className="relative">
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="block w-full px-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#eb0028]/20 focus:border-[#eb0028] transition-all"
                    placeholder="Pérez"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#eb0028]/20 focus:border-[#eb0028] transition-all"
                  placeholder="usuario@ejemplo.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Celular (Opcional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  maxLength={10}
                  minLength={10}
                  pattern="[0-9]{10}"
                  className="block w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#eb0028]/20 focus:border-[#eb0028] transition-all"
                  placeholder="300 123 4567"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  minLength={8}
                  className="block w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#eb0028]/20 focus:border-[#eb0028] transition-all"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full flex items-center justify-center gap-2 bg-[#eb0028] hover:bg-[#d10023] text-white py-4 px-8 rounded-full font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-[#eb0028]/30 disabled:opacity-70 disabled:cursor-not-allowed group mt-4"
            >
              {mutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Crear Cuenta
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-500 font-medium">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="font-bold text-[#eb0028] hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>

      {/* Lado Derecho - Branding */}
      <div className="hidden lg:flex w-1/2 bg-neutral-900 relative items-center justify-center overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#00d2ff] rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#eb0028] rounded-full blur-[120px]" />
        </div>
        
        <div className="relative z-10 p-12 text-center">
          <div className="mb-10 inline-block">
             <span className="text-4xl font-black tracking-tighter text-white flex items-center justify-center gap-1">
               <span className="text-[#eb0028] text-5xl">D</span>ismanet
             </span>
          </div>
          <h2 className="text-4xl font-black text-white mb-6 leading-tight">
            Multiplica tus <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d2ff] to-[#658cff]">
              ingresos hoy
            </span>
          </h2>
          <p className="text-neutral-400 text-lg font-medium max-w-md mx-auto">
            Únete a miles de comercios que ya están ofreciendo servicios y ganando comisiones con nuestra plataforma.
          </p>
        </div>
      </div>

    </div>
  );
}
