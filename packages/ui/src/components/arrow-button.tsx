import type { AnchorHTMLAttributes } from "react";
import { cn } from "../cn";

/**
 * Botón de la referencia: texto en mayúsculas con un círculo de borde fino
 * detrás del arranque. Al pasar el cursor el círculo se llena de acento y
 * crece hasta cubrir el texto, que pasa a negro.
 */
export function ArrowButton({
  href,
  children,
  className,
  ...rest
}: { href: string; children: React.ReactNode; className?: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      href={href}
      className={cn(
        "group relative inline-flex items-center gap-4 py-2 pr-2 pl-2",
        "text-ink text-base font-semibold tracking-[0.06em] uppercase",
        className,
      )}
      {...rest}
    >
      <span
        aria-hidden="true"
        className={cn(
          "border-line-strong absolute left-0 h-[60px] w-[60px] rounded-full border",
          "transition-[width,background-color,border-color] duration-500 ease-out",
          "group-hover:bg-altec-green group-hover:border-altec-green group-hover:w-full",
        )}
      />
      <span className="group-hover:text-on-accent relative pl-[70px] transition-colors duration-300">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="group-hover:text-on-accent relative pr-6 transition-transform duration-300 group-hover:translate-x-1"
      >
        ↗
      </span>
    </a>
  );
}

/**
 * Botón de ancho completo para el pie de una tarjeta: texto a la izquierda,
 * círculo con flecha a la derecha.
 */
export function CardButton({
  href,
  children,
  className,
  ...rest
}: { href: string; children: React.ReactNode; className?: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      href={href}
      className={cn(
        "group border-line rounded-pill flex w-full items-center justify-between border",
        "py-[3px] pr-[3px] pl-7 transition-colors duration-300",
        "hover:bg-altec-green hover:border-altec-green",
        className,
      )}
      {...rest}
    >
      <span className="text-ink group-hover:text-on-accent text-sm font-medium tracking-[0.06em] uppercase transition-colors">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="bg-card text-ink group-hover:bg-altec-black group-hover:text-altec-green flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full transition-colors"
      >
        ↗
      </span>
    </a>
  );
}
