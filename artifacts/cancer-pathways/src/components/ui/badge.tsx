import { type ReactNode } from "react";

const variants: Record<string, string> = {
  default: "bg-violet-600 text-white",
  secondary: "bg-white/10 text-white/80",
  outline: "border border-white/20 text-white/70",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: ReactNode;
  variant?: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${variants[variant] ?? variants.default} ${className}`}
    >
      {children}
    </span>
  );
}
