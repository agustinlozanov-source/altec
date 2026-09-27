"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@altec/ui";
import { locales, localeShort, LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";

/** Recuerda la elección. Va fuera del componente: el compilador de React no
 *  permite escribir sobre valores capturados en el render. */
function remember(locale: Locale) {
  try {
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  } catch {
    // Sin cookies el cambio vale solo para esta navegación.
  }
}

/**
 * Selector de idioma de la barra superior.
 *
 * Cambia el primer segmento de la URL y recuerda la elección en una cookie,
 * para que la próxima visita entre directo al idioma correcto.
 */
export function LanguageSwitcher({
  locale,
  label,
  className,
}: {
  locale: Locale;
  label: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const switchTo = (next: Locale) => {
    if (next === locale) return;
    remember(next);
    const segments = pathname.split("/");
    segments[1] = next;
    router.push(segments.join("/") || `/${next}`);
    router.refresh();
  };

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "border-line rounded-pill flex items-center overflow-hidden border",
        className,
      )}
    >
      {locales.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => switchTo(option)}
          aria-pressed={option === locale}
          lang={option}
          className={cn(
            "px-2.5 py-1.5 font-mono text-[10px] tracking-wide transition-colors",
            option === locale
              ? "bg-altec-green text-on-accent"
              : "text-muted hover:text-ink",
          )}
        >
          {localeShort[option]}
        </button>
      ))}
    </div>
  );
}
