import type { Metadata } from "next";
import { AltecVOLogo, Container, Section } from "@altec/ui";
import { AccessForm } from "@/components/camila/access-form";
import { CamilaConsole } from "@/components/camila/camila-console";
import { hasAccess, isConfigured } from "@/lib/camila/access";

export const metadata: Metadata = {
  title: "Camila Fuentes · Senior Partner AI",
  description:
    "La Senior Partner AI de ALTEC presenta ALTEC VO y responde preguntas en vivo.",
  // No debe indexarse: maneja informacion confidencial del grupo.
  robots: { index: false, follow: false },
};

/** El acceso se evalua en cada visita. */
export const dynamic = "force-dynamic";

const capabilities = [
  {
    title: "Presenta sola",
    text: "Genera y expone una presentación de cinco a siete minutos sobre ALTEC VO, bloque por bloque, sin que nadie la conduzca.",
  },
  {
    title: "Responde en vivo",
    text: "Conoce las cinco empresas, el gobierno corporativo, los números del grupo y la estructura. Si no sabe algo, lo dice.",
  },
  {
    title: "Es transparente",
    text: "Si le preguntan si es humana, responde que es un agente de inteligencia artificial. No finge lo que no es.",
  },
];

export default async function CamilaPage() {
  const configured = isConfigured();
  const allowed = configured && (await hasAccess());

  return (
    <>
      <section className="bg-surface pt-24 pb-10 md:pt-32">
        <Container>
          <AltecVOLogo className="h-8 md:h-10" priority />

          <h1 className="font-display text-ink mt-6 max-w-3xl text-4xl leading-[1.05] font-extrabold md:text-6xl">
            Camila Fuentes.
          </h1>
          <p className="text-accent-ink mt-3 font-mono text-xs tracking-[0.2em] uppercase">
            Senior Partner AI
          </p>
          <p className="text-muted mt-6 max-w-2xl text-base md:text-lg">
            La agente de mayor rango de ALTEC VO. Presenta la firma, responde preguntas y reconoce
            lo que no sabe.
          </p>
        </Container>
      </section>

      <Section tone="base" className="pt-6 pb-16">
        {allowed ? <CamilaConsole /> : <AccessForm configured={configured} />}
      </Section>

      <Section tone="alt">
        <h2 className="font-display text-ink text-2xl font-extrabold md:text-4xl">
          Qué hace Camila
        </h2>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {capabilities.map((item, index) => (
            <article key={item.title} className="border-line bg-card rounded-card border p-6">
              <span aria-hidden="true" className="text-muted font-mono text-sm">
                {`0${index + 1}`}
              </span>
              <h3 className="font-display text-ink mt-3 text-lg font-extrabold">
                {item.title}
              </h3>
              <p className="text-muted mt-3 text-sm leading-relaxed">{item.text}</p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
