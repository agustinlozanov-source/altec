import { cn } from "../cn";
import { AltecMark } from "./altec-mark";

type Tone = "dark" | "light";

/**
 * Logotipo "Altec" con las tres diagonales (docs/WEB.md §2.3).
 * `tone="dark"` es la version para fondo negro (texto cream);
 * `tone="light"` la de fondo claro (texto negro).
 *
 * PROVISIONAL: el wordmark se compone tipograficamente con Open Sans
 * Extrabold italico, que es la fuente del logo. Cuando lleguen los SVG
 * oficiales (packages/ui/brand/logo/), este componente los monta en lugar
 * del texto y ninguna app se entera.
 */
export function AltecLogo({
  tone = "dark",
  className,
  withMark = true,
}: {
  tone?: Tone;
  className?: string;
  withMark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-baseline gap-[0.18em]", className)}>
      <span
        className={cn(
          "font-display text-[1em] leading-none font-extrabold italic tracking-[-0.02em]",
          tone === "dark" ? "text-altec-cream" : "text-altec-black",
        )}
      >
        Altec
      </span>
      {withMark ? <AltecMark className="h-[0.62em] w-auto self-start" /> : null}
    </span>
  );
}

/**
 * Bloque de logo con la razon social debajo, como aparece en el brandbook
 * (docs/WEB.md §2.3: subtexto corporativo sobre el logo limpio, sin diagonales).
 */
export function AltecLockup({ tone = "dark", className }: { tone?: Tone; className?: string }) {
  return (
    <span className={cn("inline-flex flex-col gap-1", className)}>
      <AltecLogo tone={tone} withMark={false} className="text-2xl" />
      <span className="text-altec-mid-gray text-[0.6rem] tracking-[0.18em] uppercase">
        ALTEC Group SAPI de CV
      </span>
    </span>
  );
}
