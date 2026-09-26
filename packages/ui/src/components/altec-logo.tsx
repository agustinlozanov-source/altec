import Image, { type StaticImageData } from "next/image";
import { cn } from "../cn";
import logoDark from "../assets/altec-logo-dark.png";
import logoLight from "../assets/altec-logo-light.png";
import voDark from "../assets/altec-vo-dark.png";
import voLight from "../assets/altec-vo-light.png";

type Tone = "dark" | "light" | "auto";

/**
 * Par de imagenes que se alternan segun el contexto de superficie.
 *
 * Con `tone="auto"` (lo normal) se montan las dos y el CSS muestra la que toca
 * via `--logo-dark` / `--logo-light`. Eso resuelve a la vez el modo claro y las
 * secciones que alternan de color, sin JavaScript y sin parpadeo al cargar.
 */
function ThemedLogo({
  dark,
  light,
  tone,
  className,
  alt,
  priority,
}: {
  dark: StaticImageData;
  light: StaticImageData;
  tone: Tone;
  className?: string;
  alt: string;
  priority: boolean;
}) {
  const classes = cn("w-auto", className);
  const hidden = alt === "" ? true : undefined;

  if (tone !== "auto") {
    return (
      <Image
        src={tone === "dark" ? dark : light}
        alt={alt}
        priority={priority}
        aria-hidden={hidden}
        className={classes}
      />
    );
  }

  return (
    <>
      <Image
        src={dark}
        alt={alt}
        priority={priority}
        aria-hidden={hidden}
        className={classes}
        style={{ display: "var(--logo-dark, block)" }}
      />
      <Image
        src={light}
        alt=""
        priority={priority}
        aria-hidden
        className={classes}
        style={{ display: "var(--logo-light, none)" }}
      />
    </>
  );
}

/**
 * Logotipo oficial de ALTEC (docs/WEB.md §2.3).
 * El tamano se controla por altura: `className="h-7"`. Los archivos vienen
 * recortados al contenido, asi que la altura pedida es la altura real.
 */
export function AltecLogo({
  tone = "auto",
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
    <ThemedLogo
      dark={logoDark}
      light={logoLight}
      tone={tone}
      {...(className ? { className } : {})}
      alt={alt}
      priority={priority}
    />
  );
}

/**
 * Variante Altec VO, la unica que usa el gradiente (docs/ALTEC-VO.md §9.1).
 * Reservada para ALTEC VO y productos de IA.
 */
export function AltecVOLogo({
  tone = "auto",
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
    <ThemedLogo
      dark={voDark}
      light={voLight}
      tone={tone}
      {...(className ? { className } : {})}
      alt={alt}
      priority={priority}
    />
  );
}

/** Bloque de logo con la razon social debajo (docs/WEB.md §2.3). */
export function AltecLockup({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex flex-col items-start gap-2", className)}>
      <AltecLogo className="h-7" />
      <span className="text-muted text-[0.6rem] tracking-[0.18em] uppercase">
        ALTEC Group SAPI de CV
      </span>
    </span>
  );
}
