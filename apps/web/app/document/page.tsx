import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CONTENT } from "@altec/db";
import { DocumentReader } from "@/components/document/document-reader";
import { masterRegistry } from "@/components/document/document-body";
import { NotAuthorized, NotConfigured } from "@/components/document/gate-notices";
import { checkScope, logAccess } from "@/lib/access";
import { loadParsed } from "@/lib/document/source";

export const metadata: Metadata = {
  title: "Documento Oficial del Holding",
  description: "Documento oficial del holding ALTEC Group SAPI de CV.",
  // Confidencial: no se indexa ni se sigue.
  robots: { index: false, follow: false, nocache: true },
};

/** El acceso se evalua en cada visita. */
export const dynamic = "force-dynamic";

export default async function DocumentPage() {
  const access = await checkScope("document");

  if (access.state === "unconfigured") return <NotConfigured />;
  if (access.state === "anonymous") redirect("/acceso?next=%2Fdocument");

  if (access.state === "denied") {
    await logAccess("document", "denied", access.email);
    return <NotAuthorized email={access.email} />;
  }

  const doc = await loadParsed(CONTENT.masterDocument);
  if (!doc) return <NotAuthorized email={access.email} missing />;

  await logAccess("document", "open", access.email);

  return <DocumentReader doc={doc} registry={masterRegistry} email={access.email} />;
}
