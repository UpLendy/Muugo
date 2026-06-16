"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Definimos las rutas públicas que no requieren autenticación
    const publicPaths = ['/login', '/register', '/coming-soon'];
    const isPublicPath = publicPaths.includes(pathname);

    if (!isAuthenticated && !isPublicPath) {
      router.replace('/login');
    } else if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
      router.replace('/'); // Si ya está logueado, redirigir al dashboard
    }
  }, [isAuthenticated, pathname, router]);

  // Mientras resolvemos, no renderizamos el contenido si no está autenticado
  const publicPaths = ['/login', '/register', '/coming-soon'];
  const isPublicPath = publicPaths.includes(pathname);

  if (!isAuthenticated && !isPublicPath) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
         <div className="w-12 h-12 border-4 border-neutral-200 border-t-[#eb0028] rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
