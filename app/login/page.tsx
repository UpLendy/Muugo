"use client";

import React, { useState } from "react";
import Image from "next/image";
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
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 100% at 15% -10%, rgba(235,0,40,0.28), transparent 60%), radial-gradient(120% 100% at 95% 110%, rgba(101,140,255,0.22), transparent 60%)",
          }}
        />
        
        <div className="relative z-10 p-12 text-center">
          <div className="relative mb-10 inline-block">
            <div
              className="pointer-events-none absolute -inset-20 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.55) 40%, transparent 72%)",
              }}
            />
            <div className="relative h-14 w-48">
              <Image
                src="/logo-muugo-dark.jpeg"
                alt="Muugo"
                fill
                sizes="192px"
                className="object-contain rounded-xl"
                priority
              />
            </div>
          </div>
          <h2 className="relative z-10 text-4xl font-black text-white mb-6 leading-tight">
            Bienvenido a tu <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d2ff] to-[#658cff]">
              punto de venta
            </span>
          </h2>
          <p className="relative z-10 text-neutral-400 text-lg font-medium max-w-md mx-auto">
            Gestiona tus recargas, pines, pagos y reportes en una sola plataforma rápida y segura.
          </p>
        </div>
      </div>

      {/* Lado Derecho - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white relative">
        <div className="w-full max-w-md space-y-8 relative z-10">
          
          {/* Logo solo en móvil */}
          <div className="lg:hidden mb-8 flex justify-center">
            <div className="relative h-12 w-40">
              <Image
                src="/logo-muugo.png"
                alt="Muugo"
                fill
                sizes="160px"
                className="object-contain rounded-lg"
                priority
              />
            </div>
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
