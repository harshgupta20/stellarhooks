import { cn } from "@/lib/utils";

/** Animated aurora glow + perspective grid backdrop. Purely decorative. */
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)} aria-hidden>
      <div className="bg-grid bg-grid-fade animate-grid absolute inset-0 opacity-60" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="animate-aurora absolute -left-32 -top-40 size-[34rem] rounded-full bg-[radial-gradient(circle,_oklch(0.72_0.16_250_/_0.35),_transparent_60%)] blur-3xl" />
      <div className="animate-aurora absolute -right-24 top-10 size-[30rem] rounded-full bg-[radial-gradient(circle,_oklch(0.7_0.17_162_/_0.28),_transparent_60%)] blur-3xl [animation-delay:-6s]" />
      <div className="animate-aurora absolute bottom-0 left-1/3 size-[26rem] rounded-full bg-[radial-gradient(circle,_oklch(0.65_0.2_300_/_0.22),_transparent_60%)] blur-3xl [animation-delay:-12s]" />
    </div>
  );
}
