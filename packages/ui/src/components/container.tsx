import type { ReactNode } from "react";
import { cn } from "../cn";

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-[1200px] px-5 md:px-8 wide:px-10", className)}>
      {children}
    </div>
  );
}
