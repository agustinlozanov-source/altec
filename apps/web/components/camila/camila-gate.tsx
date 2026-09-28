import Link from "next/link";
import { Lock } from "lucide-react";
import type { Access } from "@/lib/access";

/**
 * La puerta de la consola de Camila, dentro de la pagina.
 *
 * A diferencia del Documento Maestro, aqui no se redirige: la pagina explica
 * quien es Camila y eso puede verlo cualquiera. Lo que esta cerrado es
 * hablarle, porque su contexto lleva el expediente del grupo y cada pregunta
 * gasta credito de la API.
 */
export function CamilaGate({ access }: { access: Access }) {
  const message =
    access.state === "unconfigured"
      ? "El acceso todavía no está configurado en este entorno."
      : access.state === "anonymous"
        ? "Para hablar con Camila hace falta iniciar sesión con una dirección autorizada."
        : "Tu sesión es válida, pero esta dirección no tiene acceso a la consola de Camila.";

  return (
    <div className="border-line bg-card/50 rounded-card border p-7 text-center md:p-10">
      <span className="text-accent-ink flex justify-center" aria-hidden>
        <Lock size={22} />
      </span>
      <h2 className="font-display text-ink mt-5 text-xl font-extrabold md:text-2xl">
        Consola restringida
      </h2>
      <p className="text-muted mx-auto mt-3 max-w-md text-sm leading-relaxed">{message}</p>

      {access.state === "anonymous" ? (
        <Link
          href="/acceso?next=%2Fes%2Fcamila"
          className="bg-altec-green text-on-accent rounded-pill mt-6 inline-flex px-5 py-2.5 text-sm font-semibold"
        >
          Iniciar sesión
        </Link>
      ) : null}

      {access.state === "denied" ? (
        <p className="text-muted mt-6 font-mono text-xs break-all">{access.email}</p>
      ) : null}
    </div>
  );
}
