"use client";

import React from "react";
import { Hourglass } from "lucide-react";

interface ComingSoonContentProps {
  title: string;
}

export function ComingSoonContent({ title }: ComingSoonContentProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-6xl">
        <h2 className="text-2xl font-black text-neutral-800 mb-20">{title}</h2>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-16 px-10">
          {/* Hourglass Illustration Container */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#eb0028] to-[#658cff] rounded-[3rem] blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" />
            
            <div className="relative bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-neutral-200/50 border border-neutral-50 flex items-center justify-center overflow-hidden">
               <div className="relative z-10 animate-float">
                  <div className="w-40 h-40 bg-neutral-900 rounded-2xl flex items-center justify-center shadow-xl">
                    <Hourglass className="w-24 h-24 text-yellow-400 animate-spin-slow" style={{ animationDuration: '10s' }} />
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-1 h-20 bg-yellow-400/20 blur-[1px] animate-pulse" />
               </div>
               
               <div className="absolute top-4 left-4 w-12 h-12 bg-[#eb0028]/10 rounded-2xl rotate-12 blur-lg" />
               <div className="absolute bottom-10 right-4 w-8 h-8 bg-[#658cff]/20 rounded-full blur-md" />
            </div>
          </div>

          {/* Text Content */}
          <div className="max-w-md text-center md:text-left space-y-4">
            <h3 className="text-5xl font-black text-neutral-800 leading-tight">
              Lo bueno se hace <br />
              <span className="text-[#eb0028]">esperar</span>
            </h3>
            <p className="text-xl text-neutral-400 font-medium leading-relaxed">
              Estamos trabajando para traer pronto todos estos beneficios para ti.
            </p>
            
            <div className="pt-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 rounded-full text-xs font-bold text-neutral-400 uppercase tracking-widest">
                Próximamente
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
