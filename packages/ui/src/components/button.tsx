import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

/**
 * El tamano y la visibilidad NO se sobreescriben por className: Tailwind
 * resuelve los conflictos por el orden de la hoja de estilos, no por el orden
 * del atributo, asi que las clases base ganarian. Para tamano existe `size`;
 * para ocultar el boton en cierto breakpoint, envuelvelo en un elemento con
 * las clases de display.
 */
const base =
  "inline-flex items-center justify-center gap-2 rounded-pill font-semibold " +
  "transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50";

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
};

const variants: Record<Variant, string> = {
  // El verde de marca sobre negro: el unico CTA de acento del sitio.
  primary: "bg-altec-green text-altec-black hover:bg-altec-green/85",
  secondary:
    "border border-altec-cream/30 text-altec-cream hover:border-altec-cream hover:bg-altec-cream/5",
  ghost: "text-altec-cream hover:text-altec-green",
};

type ButtonAsButton = { href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>;
type ButtonAsLink = { href: string } & AnchorHTMLAttributes<HTMLAnchorElement>;

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
} & (ButtonAsButton | ButtonAsLink)) {
  const classes = cn(base, sizes[size], variants[variant], className);

  if (typeof props.href === "string") {
    const { href, ...rest } = props as ButtonAsLink;
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...(props as ButtonAsButton)}>
      {children}
    </button>
  );
}
