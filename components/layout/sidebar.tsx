"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Tag, 
  HandCoins, 
  PlusSquare, 
  CreditCard, 
  Store, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  User,
  LogOut
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const menuItems = [
  { icon: Home, label: "Inicio", href: "/" },
  { icon: Tag, label: "Vender", href: "/vender" },
  { icon: HandCoins, label: "Cobrar", href: "/cobrar" },
  { icon: PlusSquare, label: "Cargar", href: "/cargar" },
  { icon: CreditCard, label: "Créditos", href: "/creditos" },
  { icon: Store, label: "Mi negocio", href: "/negocio" },
  { icon: BarChart3, label: "Reportes", href: "/reportes" },
  { icon: Settings, label: "Administración", href: "/admin" },
  { icon: HelpCircle, label: "Ayuda", href: "/ayuda" },
  { icon: User, label: "Mi cuenta", href: "/cuenta" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-white border-r border-neutral-100 flex flex-col fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 overflow-hidden rounded-lg">
            <Image 
              src="/logo-muugo.jpeg" 
              alt="Muugo Logo" 
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <span className="text-2xl font-black tracking-tight text-neutral-900">
            muugo
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium",
                isActive 
                  ? "bg-[#eb0028]/5 text-[#eb0028]" 
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                isActive ? "text-[#eb0028]" : "text-neutral-400 group-hover:text-neutral-900"
              )} />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#eb0028]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-100">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 transition-colors font-medium">
          <LogOut className="w-5 h-5" />
          <span>Cerrar sesión</span>
        </button>
        <Link 
          href="/coming-soon"
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 transition-colors font-medium text-sm mt-2 border border-dashed border-neutral-200"
        >
          <BarChart3 className="w-4 h-4 opacity-50" />
          <span>Ver Landing Anterior</span>
        </Link>
        <div className="px-4 mt-4">
          <span className="text-[10px] text-neutral-400 font-mono">versión: 1.0.0-alpha.1</span>
        </div>
      </div>
    </aside>
  );
}
