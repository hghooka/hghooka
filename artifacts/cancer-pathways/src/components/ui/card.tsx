import { type ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-white/10 bg-white/5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
export function CardHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`p-6 pb-2 ${className}`}>{children}</div>;
}
export function CardTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h3 className={`text-lg font-semibold text-white ${className}`}>{children}</h3>;
}
export function CardDescription({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`mt-1 text-sm text-white/60 ${className}`}>{children}</p>;
}
export function CardContent({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`p-6 pt-4 ${className}`}>{children}</div>;
}
