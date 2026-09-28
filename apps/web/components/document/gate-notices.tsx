import Link from "next/link";
import { CircleAlert, Lock } from "lucide-react";
import { AltecLogo } from "@altec/ui";

/**
 * Las dos pantallas de "no puedes pasar".
 *
 * Ninguna de las dos dice nada del contenido ni de quien mas tiene acceso: una
 * pantalla de denegacion habladora es una forma de averiguar cosas sin entrar.
 */

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="surface-base bg-surface flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <AltecLogo className="mx-auto h-8 w-auto" priority />
        <div className="border-line bg-card/50 mt-10 rounded-2xl border p-7 text-center md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

/** Falta configurar Supabase. Se dice, en vez de fingir una puerta que no hay. */
export function NotConfigured() {
  return (
    <Frame>
      <span className="text-attention flex justify-center" aria-hidden>
        <CircleAlert size={22} />
      </span>
      <h1 className="font-display text-ink mt-5 text-2xl font-extrabold">Acceso sin configurar</h1>
      <p className="text-muted mt-3 text-sm leading-relaxed">
        Faltan <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
        <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> en el entorno. Sin ellas no
        hay a quién preguntarle si esta persona puede pasar.
      </p>
    </Frame>
  );
}

/**
 * Sesion valida, pero sin permiso.
 *
 * `missing` cubre el caso raro de tener el ambito y que el contenido no este
 * cargado todavia. Para quien lee es la misma pared; el matiz sirve para no
 * volverse loco depurando.
 */
export function NotAuthorized({ email, missing = false }: { email: string; missing?: boolean }) {
  return (
    <Frame>
      <span className="text-accent-ink flex justify-center" aria-hidden>
        <Lock size={22} />
      </span>
      <h1 className="font-display text-ink mt-5 text-2xl font-extrabold">
        {missing ? "Todavía no hay nada aquí" : "Sin acceso a este documento"}
      </h1>
      <p className="text-muted mt-3 text-sm leading-relaxed">
        {missing
          ? "Tu acceso es correcto, pero el contenido aún no se ha cargado. Avisa a quien te compartió el enlace."
          : "Tu sesión es válida, pero esta dirección no está autorizada para ver este documento."}
      </p>
      <p className="text-muted mt-6 font-mono text-xs break-all">{email}</p>

      <form action="/auth/sign-out" method="post" className="mt-6">
        <button
          type="submit"
          className="text-muted hover:text-ink text-sm underline underline-offset-4"
        >
          Cerrar sesión y entrar con otra dirección
        </button>
      </form>

      <Link
        href="/"
        className="text-muted hover:text-accent-ink mt-4 inline-block text-sm underline underline-offset-4"
      >
        Volver al sitio
      </Link>
    </Frame>
  );
}
