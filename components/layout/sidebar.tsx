"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Tag,
  HandCoins,
  PlusSquare,
  BarChart3,
  Settings,
  User,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuthStore } from "@/store/auth-store";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const menuItems = [
  { icon: Home, label: "Inicio", href: "/" },
  { icon: Tag, label: "Vender", href: "/vender" },
  { icon: HandCoins, label: "Cobrar", href: "/cobrar" },
  { icon: PlusSquare, label: "Cargar", href: "/cargar" },
  { icon: BarChart3, label: "Reportes", href: "/reportes" },
  { icon: Settings, label: "Administración", href: "/admin" },
  { icon: User, label: "Mi cuenta", href: "/cuenta" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const isAdmin = !!user?.roles?.includes('admin');
  const [isOpen, setIsOpen] = React.useState(false);

  const visibleMenuItems = menuItems.filter(
    (item) => item.href !== '/admin' || isAdmin
  );

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Mobile top bar with hamburger toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between px-4 z-40">
        <div className="relative h-8 w-28">
          <Image
            src="/logo-muugo.jpeg"
            alt="Muugo"
            fill
            sizes="112px"
            className="object-contain rounded-md"
          />
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-neutral-600 hover:text-neutral-900"
          aria-label="Abrir menú"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-neutral-900/40 z-50"
          onClick={closeMenu}
        />
      )}

      <aside
        className={cn(
          "w-64 h-screen bg-neutral-50 border-r border-neutral-100 flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="p-8 flex items-center justify-between">
          <div className="relative h-9 w-32">
            <Image
              src="/logo-muugo.jpeg"
              alt="Muugo"
              fill
              sizes="128px"
              className="object-contain rounded-md"
            />
          </div>
          <button
            onClick={closeMenu}
            className="lg:hidden p-1 text-neutral-400 hover:text-neutral-900"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {visibleMenuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeMenu}
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
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-neutral-500 hover:bg-red-50 hover:text-red-600 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>
          <div className="px-4 mt-4">
            <span className="text-[10px] text-neutral-400 font-mono">versión: 1.0.0-alpha.1</span>
          </div>
        </div>
      </aside>
    </>
  );
}

