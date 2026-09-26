import Image from "next/image";
import { cn } from "../cn";
import heroSrc from "../assets/altec-vo-hero.webp";

/**
 * Ilustracion de portada de ALTEC VO: el equipo de agentes con el logotipo en
 * la pared. Va de fondo, detras del titular.
 *
 * Lleva un velo oscuro encima porque el texto es cream y sin el no alcanza el
 * contraste AA que exige CLAUDE.md. El velo es mas denso abajo, que es donde
 * se apoya el texto, y deja respirar la parte alta, donde esta el logotipo.
 */
export function AltecVOHero({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      <Image
        src={heroSrc}
        alt=""
        priority
        fill
        sizes="100vw"
        className="object-cover object-[center_28%]"
      />
      {/* velo vertical: deja ver la ilustracion arriba, asienta el texto abajo */}
      <div className="from-altec-black via-altec-black/75 to-altec-black/25 absolute inset-0 bg-gradient-to-t" />
      {/* refuerzo lateral, para que el titular no compita con las figuras */}
      <div className="from-altec-black/85 absolute inset-0 bg-gradient-to-r to-transparent md:to-60%" />
    </div>
  );
}
