import Image from "next/image";
import { cn } from "../cn";
import markSrc from "../assets/altec-mark.png";

/**
 * Isotipo: las tres diagonales (docs/WEB.md §2.3).
 * Controla el tamano con la altura: `className="h-6 w-auto"`.
 */
export function AltecMark({
  className,
  alt = "",
  priority = false,
}: {
  className?: string;
  /** Vacio por defecto: normalmente acompana a un texto o enlace ya etiquetado. */
  alt?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={markSrc}
      alt={alt}
      priority={priority}
      aria-hidden={alt === "" ? true : undefined}
      className={cn("w-auto", className)}
    />
  );
}
