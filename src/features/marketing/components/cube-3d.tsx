import { cn } from "@/lib/utils";

const FACES = [
  "[transform:translateZ(40px)]",
  "[transform:rotateY(180deg)_translateZ(40px)]",
  "[transform:rotateY(90deg)_translateZ(40px)]",
  "[transform:rotateY(-90deg)_translateZ(40px)]",
  "[transform:rotateX(90deg)_translateZ(40px)]",
  "[transform:rotateX(-90deg)_translateZ(40px)]",
];

/** A slowly rotating wireframe cube — a lightweight "blockchain" 3D accent. */
export function Cube3D({ className }: { className?: string }) {
  return (
    <div className={cn("perspective", className)} aria-hidden>
      <div className="preserve-3d animate-spin-3d relative size-20">
        {FACES.map((face, i) => (
          <div
            key={i}
            className={cn(
              "absolute inset-0 rounded-md border border-primary/30 bg-primary/5 backdrop-blur-sm",
              face,
            )}
          >
            <div className="absolute inset-2 rounded-sm border border-primary/20" />
            <div className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
