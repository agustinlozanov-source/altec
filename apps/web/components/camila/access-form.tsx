"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@altec/ui";

/** Puerta de entrada. El contexto de Camila es confidencial. */
export function AccessForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!configured) {
    return (
      <div className="border-line rounded-card border p-6">
        <p className="text-ink text-sm font-semibold">Camila no está configurada.</p>
        <p className="text-muted mt-2 text-xs leading-relaxed">
          Faltan <code className="font-mono">CAMILA_ACCESS_CODE</code> y{" "}
          <code className="font-mono">CAMILA_COOKIE_SECRET</code> en el entorno. Sin ellas la
          consola no abre, porque su contexto incluye el cap table.
        </p>
      </div>
    );
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const res = await fetch("/api/camila/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo validar el código.");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="border-line rounded-card max-w-sm border p-6">
      <label htmlFor="code" className="text-ink block text-sm">
        Código de acceso
      </label>
      <p className="text-muted mt-1 text-xs">
        Camila maneja información confidencial del grupo.
      </p>

      <input
        id="code"
        type="password"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        autoComplete="off"
        className="border-line bg-card text-ink focus:border-accent-ink rounded-card mt-4 w-full border px-3 py-2 text-sm focus:outline-none"
      />

      {error ? (
        <p role="alert" className="text-attention mt-2 text-xs">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={busy || !code} size="sm" className="mt-4">
        {busy ? "Validando…" : "Entrar"}
      </Button>
    </form>
  );
}
