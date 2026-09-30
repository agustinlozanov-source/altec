"use client";

import { useActionState, useState } from "react";
import { FileLock2 } from "lucide-react";
import { AltecLogo, Button } from "@altec/ui";
import type { Block } from "@/lib/document/markdown";
import { DocBlocks } from "./prose";

/**
 * El convenio de confidencialidad, antes de dejar leer.
 *
 * Firmar es escribir el nombre completo y marcar la casilla. Es un acuerdo por
 * clic: no sustituye a un contrato firmado ante notario, pero deja constancia
 * de quien acepto, cuando y contra que texto exactamente — que es lo que se le
 * puede pedir a una pantalla.
 *
 * El boton no se habilita hasta que hay nombre y casilla marcada. No es un
 * tramite que se pueda pasar de largo dandole a Enter.
 */
export function ConfidentialityGate({
  blocks,
  email,
  action,
}: {
  blocks: Block[];
  email: string;
  action: (
    previous: { error: string | null },
    formData: FormData,
  ) => Promise<{ error: string | null }>;
}) {
  const [state, submit, pending] = useActionState(action, { error: null });
  const [name, setName] = useState("");
  const [agreed, setAgreed] = useState(false);

  const ready = name.trim().length >= 5 && agreed;

  return (
    <div className="surface-base bg-surface min-h-screen px-5 py-12 md:py-16">
      <div className="mx-auto max-w-[46rem]">
        <AltecLogo className="mx-auto h-8 w-auto" priority />

        <div className="mt-10 text-center">
          <span className="text-accent-ink flex justify-center" aria-hidden>
            <FileLock2 size={22} />
          </span>
          <h1 className="font-display text-ink mt-5 text-2xl font-extrabold md:text-3xl">
            Convenio de confidencialidad
          </h1>
          <p className="text-muted mt-3 text-sm leading-relaxed">
            Antes de acceder al documento hace falta leer y aceptar este convenio. Tu aceptación
            queda registrada.
          </p>
        </div>

        <div className="border-line bg-card/40 doc-scroll mt-8 max-h-[50vh] overflow-y-auto rounded-xl border p-6 md:p-8">
          <DocBlocks blocks={blocks} />
        </div>

        <form action={submit} className="border-line bg-card/50 mt-6 rounded-xl border p-6">
          <label htmlFor="signed-name" className="text-ink block text-sm font-semibold">
            Nombre completo
          </label>
          <p className="text-muted mt-1 text-xs">
            Escribe tu nombre tal como aparece en tu identificación. Equivale a tu firma.
          </p>
          <input
            id="signed-name"
            name="signed_name"
            required
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="border-line bg-surface text-ink placeholder:text-muted focus:border-accent-ink mt-3 w-full rounded-lg border px-4 py-3 text-sm outline-none"
          />

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="company" className="text-ink block text-sm font-semibold">
                Empresa y cargo
              </label>
              <input
                id="company"
                name="company"
                autoComplete="organization"
                placeholder="Opcional"
                className="border-line bg-surface text-ink placeholder:text-muted focus:border-accent-ink mt-2 w-full rounded-lg border px-4 py-3 text-sm outline-none"
              />
            </div>
            <div>
              <label htmlFor="phone" className="text-ink block text-sm font-semibold">
                Teléfono
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="Opcional"
                className="border-line bg-surface text-ink placeholder:text-muted focus:border-accent-ink mt-2 w-full rounded-lg border px-4 py-3 text-sm outline-none"
              />
            </div>
          </div>

          <label className="mt-5 flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="agreed"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
              className="accent-altec-green mt-1 h-4 w-4 shrink-0"
            />
            <span className="text-read text-sm leading-relaxed">
              He leído el convenio y acepto sus términos. Entiendo que la información es
              confidencial y que no puedo divulgarla ni reproducirla.
            </span>
          </label>

          <p className="text-muted mt-5 font-mono text-xs break-all">
            Firmando como {email}
          </p>

          {state.error ? (
            <p className="text-attention mt-3 text-sm" role="alert">
              {state.error}
            </p>
          ) : null}

          <Button type="submit" className="mt-5 w-full justify-center" disabled={!ready || pending}>
            {pending ? "Registrando…" : "Acepto y continúo"}
          </Button>
        </form>

        <form action="/auth/sign-out" method="post" className="mt-6 text-center">
          <button
            type="submit"
            className="text-muted hover:text-ink text-sm underline underline-offset-4"
          >
            No acepto — cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
