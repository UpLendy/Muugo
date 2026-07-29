"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Esperamos a que Zustand termine de rehidratar desde localStorage antes de
    // decidir si redirigir: en una carga dura (ej. redirect de vuelta de una
    // pasarela de pago), isAuthenticated arranca en false por un instante y
    // dispara un redirect a /login seguido de un segundo redirect a /, aunque
    // la sesión sí exista.
    if (!hasHydrated) return;

    // Definimos las rutas públicas que no requieren autenticación
    const publicPaths = ['/login', '/register', '/coming-soon'];
    const isPublicPath = publicPaths.includes(pathname);

    if (!isAuthenticated && !isPublicPath) {
      router.replace('/login');
    } else if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
      router.replace('/'); // Si ya está logueado, redirigir al dashboard
    }
  }, [hasHydrated, isAuthenticated, pathname, router]);

  // Mientras resolvemos (hidratación pendiente, o no autenticado en ruta privada), spinner
  const publicPaths = ['/login', '/register', '/coming-soon'];
  const isPublicPath = publicPaths.includes(pathname);

  if (!hasHydrated || (!isAuthenticated && !isPublicPath)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
         <div className="w-12 h-12 border-4 border-neutral-200 border-t-[#eb0028] rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
