import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/features/marketing/components/reveal";
import { Cube3D } from "@/features/marketing/components/cube-3d";

export function CtaSection({ authed }: { authed: boolean }) {
  return (
    <section className="px-6 py-24">
      <Reveal direction="none">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border bg-card/40 px-6 py-20 text-center">
          <div className="bg-grid bg-grid-fade absolute inset-0 opacity-40" />
          <div className="animate-aurora absolute -left-20 top-0 size-96 rounded-full bg-[radial-gradient(circle,_oklch(0.72_0.16_250_/_0.3),_transparent_60%)] blur-3xl" />
          <div className="animate-aurora absolute -right-20 bottom-0 size-96 rounded-full bg-[radial-gradient(circle,_oklch(0.7_0.17_162_/_0.25),_transparent_60%)] blur-3xl [animation-delay:-7s]" />

          <Cube3D className="animate-float absolute right-8 top-8 hidden opacity-80 lg:block" />

          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Ship Stellar payment notifications <span className="text-brand-gradient">today</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-muted-foreground">
              Wire a webhook. Get back to building.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="group rounded-full px-6 text-base">
                <Link href={authed ? "/dashboard" : "/register"}>
                  {authed ? "Go to dashboard" : "Start free"}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-6 text-base">
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
