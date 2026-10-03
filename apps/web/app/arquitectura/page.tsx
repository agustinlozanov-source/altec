import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CONTENT } from "@altec/db";
import { DocumentReader } from "@/components/document/document-reader";
import { ARCH_ICONS, architectureRegistry } from "@/components/document/document-body";
import { NotAuthorized, NotConfigured } from "@/components/document/gate-notices";
import { checkScope, logAccess } from "@/lib/access";
import { loadParsed } from "@/lib/document/source";

export const metadata: Metadata = {
  title: "Arquitectura de ALTEC VO",
  description: "Decisiones de arquitectura de ALTEC VO como producto.",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

/**
 * Documento tecnico interno.
 *
 * Va con el ambito `document` y no con uno propio: quien tiene acceso al
 * expediente completo del holding es socio, y es a los socios a quienes les
 * toca esta decision. Un ambito mas no compraria nada y habria que mantenerlo.
 */
export default async function ArquitecturaPage() {
  const access = await checkScope("document");

  if (access.state === "unconfigured") return <NotConfigured />;
  if (access.state === "anonymous") redirect("/acceso?next=%2Farquitectura");

  if (access.state === "denied") {
    await logAccess("document", "denied", access.email);
    return <NotAuthorized email={access.email} />;
  }

  const doc = await loadParsed(CONTENT.architecture);
  if (!doc) return <NotAuthorized email={access.email} missing />;

  await logAccess("document", "open", access.email, "arquitectura");

  return (
    <DocumentReader
      doc={doc}
      registry={architectureRegistry}
      icons={ARCH_ICONS}
      email={access.email}
    />
  );
}
