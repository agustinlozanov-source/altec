import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CONTENT } from "@altec/db";
import { DocumentReader } from "@/components/document/document-reader";
import { MEMO_ICONS, memorandumRegistry } from "@/components/document/document-body";
import { NotAuthorized, NotConfigured } from "@/components/document/gate-notices";
import { checkScope, logAccess } from "@/lib/access";
import { loadParsed } from "@/lib/document/source";

export const metadata: Metadata = {
  title: "Memorándum de Inversión",
  description: "Memorándum de inversión de ALTEC Group SAPI de CV.",
  // Confidencial: no se indexa ni se sigue.
  robots: { index: false, follow: false, nocache: true },
};

/** El acceso se evalua en cada visita. */
export const dynamic = "force-dynamic";

/**
 * El primer documento que ve un prospecto, despues del sales pitch.
 *
 * Es el escalon anterior al Documento Maestro: aqui van los numeros y la
 * estructura de la inversion; el expediente completo del holding se habilita
 * despues. Por eso son dos ambitos y no uno — a la misma persona se le abre
 * el segundo sin que tenga que volver a registrarse.
 */
export default async function MemorandumPage() {
  const access = await checkScope("memorandum");

  if (access.state === "unconfigured") return <NotConfigured />;
  if (access.state === "anonymous") redirect("/acceso?next=%2Fmemorandum");

  if (access.state === "denied") {
    await logAccess("memorandum", "denied", access.email);
    return <NotAuthorized email={access.email} />;
  }

  const doc = await loadParsed(CONTENT.memorandum);
  if (!doc) return <NotAuthorized email={access.email} missing />;

  await logAccess("memorandum", "open", access.email);

  return (
    <DocumentReader
      doc={doc}
      registry={memorandumRegistry}
      icons={MEMO_ICONS}
      email={access.email}
      note="Este documento es informativo y no constituye una oferta pública de valores ni asesoría financiera. Las proyecciones se basan en supuestos razonables pero no garantizan resultados. Toda inversión conlleva riesgo. Se recomienda consultar con un asesor financiero independiente antes de tomar una decisión de inversión."
    />
  );
}
