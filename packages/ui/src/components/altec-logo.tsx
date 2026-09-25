import Image from "next/image";
import { cn } from "../cn";
import logoDark from "../assets/altec-logo-dark.png";
import logoLight from "../assets/altec-logo-light.png";
import voDark from "../assets/altec-vo-dark.png";
import voLight from "../assets/altec-vo-light.png";

type Tone = "dark" | "light";

/**
 * Logotipo oficial de ALTEC (docs/WEB.md §2.3).
 * `tone="dark"` es la version para fondo oscuro (texto cream);
 * `tone="light"` la de fondo claro (texto negro).
 *
 * El tamano se controla por altura: `className="h-7 w-auto"`. Los archivos
 * vienen recortados al contenido, asi que la altura que pidas es la altura
 * real del logotipo.
 */
export function AltecLogo({
  tone = "dark",
  className,
  alt = "ALTEC Group",
  priority = false,
}: {
  tone?: Tone;
  className?: string;
  alt?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={tone === "dark" ? logoDark : logoLight}
      alt={alt}
      priority={priority}
      aria-hidden={alt === "" ? true : undefined}
      className={cn("w-auto", className)}
    />
  );
}

/**
 * Variante Altec VO, la unica que usa el gradiente (docs/ALTEC-VO.md §9.1).
 * Reservada para ALTEC VO y productos de IA.
 */
export function AltecVOLogo({
  tone = "dark",
  className,
  alt = "ALTEC VO",
  priority = false,
}: {
  tone?: Tone;
  className?: string;
  alt?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={tone === "dark" ? voDark : voLight}
      alt={alt}
      priority={priority}
      className={cn("w-auto", className)}
    />
  );
}

/**
 * Bloque de logo con la razon social debajo (docs/WEB.md §2.3).
 */
export function AltecLockup({ tone = "dark", className }: { tone?: Tone; className?: string }) {
  return (
    <span className={cn("inline-flex flex-col items-start gap-2", className)}>
      <AltecLogo tone={tone} className="h-7" />
      <span
        className={cn(
          "text-[0.6rem] tracking-[0.18em] uppercase",
          tone === "dark" ? "text-altec-cream/65" : "text-altec-black/60",
        )}
      >
        ALTEC Group SAPI de CV
      </span>
    </span>
  );
}
