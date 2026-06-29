import { cn } from "@/lib/utils";

const FACES = [
  "[transform:translateZ(22px)]",
  "[transform:rotateY(180deg)_translateZ(22px)]",
  "[transform:rotateY(90deg)_translateZ(22px)]",
  "[transform:rotateY(-90deg)_translateZ(22px)]",
  "[transform:rotateX(90deg)_translateZ(22px)]",
  "[transform:rotateX(-90deg)_translateZ(22px)]",
];

/**
 * Branded, lightweight (pure-CSS) loader: a floating, rotating 3D wireframe cube
 * with a pulsing glow and a shimmering label. Suspense fallback for route-level
 * loading.tsx files.
 */
export function PageLoader({
  screen = false,
  className,
}: {
  screen?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center gap-7",
        screen ? "min-h-svh" : "min-h-[60vh]",
        className,
      )}
    >
      <div className="relative grid place-items-center">
        {/* pulsing glow */}
        <div className="animate-loader-pulse pointer-events-none absolute size-24 rounded-full bg-primary/20 blur-2xl" />

        {/* floating + spinning cube */}
        <div className="perspective animate-float">
          <div className="preserve-3d animate-spin-3d relative size-11">
            {FACES.map((face, i) => (
              <div
                key={i}
                className={cn(
                  "absolute inset-0 rounded-md border border-primary/45 bg-gradient-to-br from-primary/15 to-primary/5 backdrop-blur-sm",
                  face,
                )}
              >
                <div className="absolute inset-1.5 rounded-sm border border-primary/25" />
                <div className="absolute left-1/2 top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/70" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <span className="text-brand-gradient text-sm font-semibold tracking-wide">Loading…</span>
        <div className="h-0.5 w-32 overflow-hidden rounded-full bg-muted">
          <div className="animate-bar-sweep h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>
      </div>
    </div>
  );
}
