"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { AltecLogo, Button } from "@altec/ui";

/**
 * La puerta del Documento Maestro.
 *
 * Cuando el codigo no esta configurado en el entorno, no se finge una puerta
 * que no existe: se dice que falta configurarla. Fingirla haria creer que el
 * documento esta protegido cuando no lo estaria.
 */
export function DocumentAccessForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!code.trim()) return;
    setState("sending");

    const response = await fetch("/api/document/access", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (response.ok) {
      router.refresh();
      return;
    }

    setState("error");
  }

  return (
    <div className="surface-base bg-surface flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <AltecLogo className="mx-auto h-8 w-auto" priority />

        <div className="border-line bg-card/50 mt-10 rounded-2xl border p-7 md:p-8">
          <span className="text-accent-ink flex justify-center" aria-hidden>
            <Lock size={22} />
          </span>

          <h1 className="font-display text-ink mt-5 text-center text-2xl font-extrabold">
            Documento Oficial del Holding
          </h1>
          <p className="text-muted mt-3 text-center text-sm leading-relaxed">
            Contiene información confidencial y propietaria de ALTEC Group SAPI de CV. Su
            distribución está restringida a socios accionistas e inversionistas autorizados.
          </p>

          {configured ? (
            <form onSubmit={submit} className="mt-7">
              <label htmlFor="doc-code" className="sr-only">
                Código de acceso
              </label>
              <input
                id="doc-code"
                type="password"
                autoComplete="off"
                value={code}
                onChange={(event) => {
                  setCode(event.target.value);
                  if (state === "error") setState("idle");
                }}
                placeholder="Código de acceso"
                className="border-line bg-surface text-ink placeholder:text-muted focus:border-accent-ink w-full rounded-lg border px-4 py-3 text-center font-mono text-sm tracking-widest outline-none"
              />

              {state === "error" ? (
                <p className="text-attention mt-3 text-center text-sm" role="alert">
                  El código no es correcto.
                </p>
              ) : null}

              <Button
                type="submit"
                className="mt-4 w-full justify-center"
                disabled={state === "sending" || code.trim() === ""}
              >
                {state === "sending" ? "Comprobando…" : "Entrar"}
              </Button>
            </form>
          ) : (
            <p className="border-attention/40 bg-attention/8 text-read mt-7 rounded-lg border p-4 text-sm leading-relaxed">
              Falta configurar el acceso. Define <code className="font-mono">DOC_ACCESS_CODE</code>{" "}
              y <code className="font-mono">DOC_COOKIE_SECRET</code> en el entorno para que esta
              puerta funcione.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
