"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type Direction = "up" | "left" | "right" | "none";

const HIDDEN: Record<Direction, string> = {
  up: "opacity-0 translate-y-8",
  left: "opacity-0 -translate-x-8",
  right: "opacity-0 translate-x-8",
  none: "opacity-0",
};

/** Animates its children into view the first time they enter the viewport. */
export function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: Direction;
  as?: "div" | "section" | "li" | "span";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Component = Tag as "div";

  return (
    <Component
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-all duration-700 ease-out will-change-transform",
        visible ? "translate-x-0 translate-y-0 opacity-100" : HIDDEN[direction],
        className,
      )}
    >
      {children}
    </Component>
  );
}
