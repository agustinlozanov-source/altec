import type { Metadata } from "next";
import { AltecLogo } from "@altec/ui";
import { AccessForm } from "./access-form";

export const metadata: Metadata = {
  title: "Acceso",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AccesoPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; estado?: string }>;
}) {
  const { next, estado } = await searchParams;

  // Solo rutas internas: lo que llega por la URL no manda a donde quiera.
  const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/document";

  return (
    <div className="surface-base bg-surface flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <AltecLogo className="mx-auto h-8 w-auto" priority />
        <div className="border-line bg-card/50 mt-10 rounded-2xl border p-7 md:p-8">
          <AccessForm next={target} expired={estado === "caducado"} />
        </div>
      </div>
    </div>
  );
}
