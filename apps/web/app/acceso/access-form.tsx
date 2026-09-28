"use client";

import { useActionState } from "react";
import { MailCheck, Lock } from "lucide-react";
import { Button } from "@altec/ui";
import { sendLink } from "./actions";

/**
 * Pedir el enlace de acceso.
 *
 * No hay contrasena que recordar ni que reponer: se escribe el correo y llega
 * un enlace. Para alguien que entra tres veces al ano a leer un documento, es
 * la forma con menos friccion y sin contrasenas que acaben apuntadas en algun
 * sitio.
 */
export function AccessForm({ next, expired }: { next: string; expired: boolean }) {
  const [state, action, pending] = useActionState(sendLink, { sent: false, error: null });

  if (state.sent) {
    return (
      <div className="text-center">
        <span className="text-accent-ink flex justify-center" aria-hidden>
          <MailCheck size={24} />
        </span>
        <h1 className="font-display text-ink mt-5 text-2xl font-extrabold">Revisa tu correo</h1>
        <p className="text-muted mt-3 text-sm leading-relaxed">
          Si esa dirección está autorizada, acabas de recibir un enlace de acceso. Caduca en una
          hora y solo sirve una vez.
        </p>
        <p className="text-muted mt-6 text-xs leading-relaxed">
          ¿No llega? Revisa la carpeta de correo no deseado. Si sigue sin aparecer, escribe a quien
          te compartió el documento — puede que tu dirección no esté en la lista.
        </p>
      </div>
    );
  }

  return (
    <>
      <span className="text-accent-ink flex justify-center" aria-hidden>
        <Lock size={22} />
      </span>

      <h1 className="font-display text-ink mt-5 text-center text-2xl font-extrabold">
        Acceso a documentación confidencial
      </h1>
      <p className="text-muted mt-3 text-center text-sm leading-relaxed">
        Contenido de ALTEC Group SAPI de CV con distribución restringida a socios accionistas e
        inversionistas autorizados.
      </p>

      {expired ? (
        <p
          className="border-attention/40 bg-attention/8 text-read mt-6 rounded-lg border p-3 text-sm"
          role="alert"
        >
          Ese enlace ya no sirve — había caducado o ya se había usado. Pide uno nuevo.
        </p>
      ) : null}

      <form action={action} className="mt-7">
        <input type="hidden" name="next" value={next} />
        <label htmlFor="email" className="sr-only">
          Correo electrónico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="tu@correo.com"
          className="border-line bg-surface text-ink placeholder:text-muted focus:border-accent-ink w-full rounded-lg border px-4 py-3 text-center text-sm outline-none"
        />

        {state.error ? (
          <p className="text-attention mt-3 text-center text-sm" role="alert">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" className="mt-4 w-full justify-center" disabled={pending}>
          {pending ? "Enviando…" : "Enviarme el enlace"}
        </Button>
      </form>
    </>
  );
}
