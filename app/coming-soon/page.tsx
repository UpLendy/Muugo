import Image from "next/image";

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-12 overflow-hidden bg-black selection:bg-[#eb0028] selection:text-white">
      {/* ===== BACKGROUND EFFECTS (Predominantly Black/Red) ===== */}
      {/* Strong Red glow in the center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-25 blur-[100px] animate-pulse-glow pointer-events-none"
        style={{
          background: "radial-gradient(circle, #eb0028, transparent 60%)",
        }}
      />

      {/* Gentle Red glow top right */}
      <div
        className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-20 blur-[120px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, #eb0028, transparent 70%)",
        }}
      />

      {/* Very faint Blue glow bottom left (max 15% rule) */}
      <div
        className="absolute -bottom-40 -left-40 w-[300px] h-[300px] rounded-full opacity-15 blur-[120px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, #658cff, transparent 70%)",
        }}
      />

      {/* ===== GRID PATTERN ===== */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ===== MAIN CONTENT ===== */}
      <div className="relative z-10 flex flex-col items-center gap-10 max-w-2xl text-center">
        {/* Animated Brand "D" Icon Mockup */}
        <div
          className="animate-fade-in-up animate-float"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="relative">
            {/* Outer ring in Red */}
            <div className="absolute inset-0 rounded-full border border-[#eb0028]/30 animate-spin-slow" />
            
            {/* Inner box holding the icon */}
            <div className="bg-[#eb0028] border border-white/10 shadow-[0_0_50px_rgba(235,0,40,0.3)] p-1 rounded-full flex items-center justify-center overflow-hidden">
              <Image 
                src="/logo-muugo.jpeg" 
                alt="Muugo Logo" 
                width={120} 
                height={120} 
                priority
                sizes="(max-width: 640px) 96px, 128px"
                className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Badge - Pure Red */}
        <div
          className="animate-fade-in-up opacity-0"
          style={{ animationDelay: "0.3s" }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-heading font-bold tracking-widest uppercase rounded-full bg-[#eb0028]/10 border border-[#eb0028]/30 text-[#eb0028]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#eb0028] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#eb0028]" />
            </span>
            En desarrollo
          </span>
        </div>

        {/* Title */}
        <div
          className="animate-fade-in-up opacity-0"
          style={{ animationDelay: "0.5s" }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-black tracking-tight leading-tight text-white">
            Estamos construyendo
            <br />
            {/* Solid Red instead of a gradient to respect the brand color */}
            <span className="text-[#eb0028]">algo increíble</span>
          </h1>
        </div>

        {/* Description */}
        <div
          className="animate-fade-in-up opacity-0"
          style={{ animationDelay: "0.7s" }}
        >
          <p className="text-base sm:text-lg text-neutral-300 max-w-lg leading-relaxed">
            Nuestro equipo está trabajando arduamente para ofrecerte la mejor
            experiencia. Muy pronto estaremos listos.
          </p>
        </div>

        {/* Loading dots */}
        <div
          className="animate-fade-in-up opacity-0 flex items-center gap-2 mt-4"
          style={{ animationDelay: "0.9s" }}
        >
          <span className="text-sm text-neutral-500 font-heading tracking-wider uppercase">
            Cargando
          </span>
          <span className="flex gap-1.5 ml-2">
            <span className="dot-pulse-1 w-2 h-2 bg-[#eb0028] rounded-full" />
            <span className="dot-pulse-2 w-2 h-2 bg-[#eb0028] rounded-full" />
            {/* The last dot is blue, adhering to the 15% rule */}
            <span className="dot-pulse-3 w-2 h-2 bg-[#658cff] rounded-full" />
          </span>
        </div>

        {/* Divider */}
        <div
          className="animate-fade-in-up opacity-0 w-full max-w-xs mt-2"
          style={{ animationDelay: "1.1s" }}
        >
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#eb0028]/50 to-transparent" />
        </div>

        <div
          className="animate-fade-in-up opacity-0"
          style={{ animationDelay: "1.3s" }}
        >
          <p className="text-2xl text-white font-heading font-black tracking-[0.2em] uppercase">
            Muugo
          </p>
          {!(process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true' || process.env.VERCEL_ENV === 'production') ? (
            <div className="mt-8">
              <a 
                href="/" 
                className="px-6 py-2 rounded-full border border-white/10 text-white/40 text-xs hover:text-white hover:border-white/30 transition-all font-medium"
              >
                Ir al Dashboard (Demo)
              </a>
            </div>
          ) : null}
        </div>
      </div>

      {/* ===== BOTTOM SHIMMER BAR (Red) ===== */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#eb0028]/20">
        <div className="absolute inset-0 w-1/3 bg-[#eb0028] blur-sm animate-shimmer" />
      </div>
    </main>
  );
}
