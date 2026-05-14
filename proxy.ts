import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Se activa si la variable es 'true' O si estamos en el entorno de producción de Vercel
  const maintenanceMode = 
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true' || 
    process.env.VERCEL_ENV === 'production';
  
  const { pathname } = request.nextUrl;

  // Si el modo mantenimiento está activo y no estamos en la página de coming-soon
  // ni accediendo a archivos estáticos o api
  if (
    maintenanceMode &&
    pathname !== '/coming-soon' &&
    !pathname.startsWith('/_next') &&
    !pathname.startsWith('/api') &&
    !pathname.includes('.') // Evitar interceptar imágenes, favicon, etc.
  ) {
    return NextResponse.redirect(new URL('/coming-soon', request.url));
  }

  // Si NO estamos en modo mantenimiento y tratamos de entrar a coming-soon manualmente,
  // podríamos querer redirigir al dashboard, pero por ahora lo dejamos así para pruebas.
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
