"use client";

import { cn } from "@/lib/utils";

interface PillToggleProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export function PillToggle({
  active,
  onClick,
  children,
  className,
}: PillToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors cursor-pointer whitespace-nowrap",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-white text-secondary-foreground hover:border-primary/40",
        className
      )}
    >
      {children}
    </button>
  );
}
