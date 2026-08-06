"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

const adminPaths = ['/admin'];

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = !!user?.roles?.includes('admin');

  useEffect(() => {
    // Esperamos a que Zustand termine de rehidratar desde localStorage antes de
    // decidir si redirigir: en una carga dura (ej. redirect de vuelta de una
    // pasarela de pago), isAuthenticated arranca en false por un instante y
    // dispara un redirect a /login seguido de un segundo redirect a /, aunque
    // la sesión sí exista.
    if (!hasHydrated) return;

    // Definimos las rutas públicas que no requieren autenticación
    const publicPaths = ['/login', '/register'];
    const isPublicPath = publicPaths.includes(pathname);

    if (!isAuthenticated && !isPublicPath) {
      router.replace('/login');
    } else if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
      router.replace('/'); // Si ya está logueado, redirigir al dashboard
    } else if (isAuthenticated && adminPaths.includes(pathname) && !isAdmin) {
      // El backend ya bloquea /admin/* a no-admins; esto solo evita que la UI
      // se muestre antes de que llegue el 403.
      router.replace('/');
    }
  }, [hasHydrated, isAuthenticated, isAdmin, pathname, router]);

  // Mientras resolvemos (hidratación pendiente, no autenticado en ruta privada,
  // o usuario sin rol admin en una ruta de admin), spinner
  const publicPaths = ['/login', '/register'];
  const isPublicPath = publicPaths.includes(pathname);
  const isBlockedAdminPath = isAuthenticated && adminPaths.includes(pathname) && !isAdmin;

  if (!hasHydrated || (!isAuthenticated && !isPublicPath) || isBlockedAdminPath) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
         <div className="w-12 h-12 border-4 border-neutral-200 border-t-[#eb0028] rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
