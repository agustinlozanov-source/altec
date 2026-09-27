import Image, { type StaticImageData } from "next/image";
import { cn } from "../cn";

import avalluoDark from "../assets/companies/avalluo-dark.webp";
import avalluoLight from "../assets/companies/avalluo-light.webp";
import bostonDark from "../assets/companies/boston-dark.webp";
import bostonLight from "../assets/companies/boston-light.webp";
import flowhubDark from "../assets/companies/flowhub-dark.webp";
import flowhubLight from "../assets/companies/flowhub-light.webp";
import photocanDark from "../assets/companies/photocan-dark.webp";
import photocanLight from "../assets/companies/photocan-light.webp";
import scalexDark from "../assets/companies/scalex-dark.webp";
import scalexLight from "../assets/companies/scalex-light.webp";

/**
 * Logotipos de las cinco empresas del grupo.
 *
 * Cada una trae dos versiones y el CSS muestra la que corresponde al contexto
 * de superficie, igual que el logotipo de ALTEC: sobre negro va el arte claro,
 * sobre cream el oscuro. Asi una tarjeta se puede mover de seccion sin que
 * nadie tenga que acordarse de cambiar la imagen.
 */

const LOGOS = {
  flowhub: { dark: flowhubDark, light: flowhubLight, name: "Flow Hub" },
  scalex: { dark: scalexDark, light: scalexLight, name: "ScaleX Latam" },
  avalluo: { dark: avalluoDark, light: avalluoLight, name: "Avalluo" },
  boston: { dark: bostonDark, light: bostonLight, name: "Boston Skilling Center" },
  photocan: { dark: photocanDark, light: photocanLight, name: "Photocan" },
} satisfies Record<string, { dark: StaticImageData; light: StaticImageData; name: string }>;

export type CompanyKey = keyof typeof LOGOS;

export function CompanyLogo({
  company,
  className,
  alt,
}: {
  company: CompanyKey;
  className?: string;
  /** Vacío cuando el nombre ya aparece en texto al lado. */
  alt?: string;
}) {
  const logo = LOGOS[company];
  const label = alt ?? logo.name;
  const classes = cn("w-auto object-contain object-left", className);

  return (
    <>
      <Image
        src={logo.dark}
        alt={label}
        aria-hidden={label === "" ? true : undefined}
        className={classes}
        style={{ display: "var(--logo-dark, block)" }}
      />
      <Image
        src={logo.light}
        alt=""
        aria-hidden
        className={classes}
        style={{ display: "var(--logo-light, none)" }}
      />
    </>
  );
}

export const companyLogoKeys = Object.keys(LOGOS) as CompanyKey[];
