"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: () => authService.login({ email, password }),
    onSuccess: (data) => {
      login(data.user, data.token);
      router.push("/");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    mutation.mutate();
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Lado Izquierdo - Branding */}
      <div className="hidden lg:flex w-1/2 bg-neutral-900 relative items-center justify-center overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#eb0028] rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#658cff] rounded-full blur-[120px]" />
        </div>
        
        <div className="relative z-10 p-12 text-center">
          <div className="mb-10 inline-block">
             {/* Logo placeholder o tipográfico */}
             <span className="text-4xl font-black tracking-tighter text-white flex items-center justify-center gap-1">
               <span className="text-[#eb0028] text-5xl">D</span>ismanet
             </span>
          </div>
          <h2 className="text-4xl font-black text-white mb-6 leading-tight">
            Bienvenido a tu <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d2ff] to-[#658cff]">
              punto de venta
            </span>
          </h2>
          <p className="text-neutral-400 text-lg font-medium max-w-md mx-auto">
            Gestiona tus recargas, pines, pagos y reportes en una sola plataforma rápida y segura.
          </p>
        </div>
      </div>

      {/* Lado Derecho - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white relative">
        <div className="w-full max-w-md space-y-8 relative z-10">
          
          {/* Logo solo en móvil */}
          <div className="lg:hidden mb-8 text-center">
             <span className="text-3xl font-black tracking-tighter text-neutral-900 flex items-center justify-center gap-1">
               <span className="text-[#eb0028] text-4xl">D</span>ismanet
             </span>
          </div>

          <div>
            <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Iniciar Sesión</h1>
            <p className="text-neutral-500 font-medium mt-2">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-10">
            {mutation.isError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-start gap-3 text-sm font-medium">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{(mutation.error as any)?.response?.data?.message || "Credenciales incorrectas o ha ocurrido un error."}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#eb0028]/20 focus:border-[#eb0028] transition-all"
                    placeholder="usuario@ejemplo.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-black text-neutral-400 uppercase tracking-widest">Contraseña</label>
                  <a href="#" className="text-xs font-bold text-[#658cff] hover:text-[#eb0028] transition-colors">¿Olvidaste tu contraseña?</a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#eb0028]/20 focus:border-[#eb0028] transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full flex items-center justify-center gap-2 bg-[#eb0028] hover:bg-[#d10023] text-white py-4 px-8 rounded-full font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-[#eb0028]/30 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {mutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Ingresar
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-500 font-medium">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="font-bold text-[#eb0028] hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
