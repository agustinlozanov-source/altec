import type { Metadata } from "next";
import { AltecVOHero, AltecVOLogo, Container, Section } from "@altec/ui";
import { OfficeViewer } from "@/components/office/office-viewer";

export const metadata: Metadata = {
  title: "ALTEC VO · Oficina Virtual",
  description:
    "La firma de consultoría de ALTEC operada por agentes de IA, representada como una oficina en tiempo real. El 80% de la operación pasa por agentes; el 20% humano se reserva para el criterio.",
};

const principles = [
  {
    title: "El 80% que no te quita tiempo",
    text: "La operación analítica, estratégica y táctica pasa por agentes y automatizaciones. Cada tarea queda registrada con su dueño, su cliente y su evidencia.",
  },
  {
    title: "El 20% que sí es tuyo",
    text: "Criterio, relación con el cliente, decisiones que comprometen a la firma y presencia en campo. Nada que comprometa dinero o reputación sale sin aprobación.",
  },
  {
    title: "El humano es un paso del flujo",
    text: "Cuando un agente necesita una decisión, camina a la oficina del socio y espera en ámbar. Su trabajo se pausa y se reanuda con tu instrucción como contexto.",
  },
];

export default function VirtualOfficePage() {
  return (
    <>
      {/* --- portada --- */}
      <section className="surface-invert bg-surface relative flex min-h-[62svh] items-end overflow-hidden pt-24 pb-14 md:min-h-[72svh] md:pt-32 md:pb-20">
        <AltecVOHero />

        <Container className="relative">
          <h1 className="font-display text-ink max-w-3xl text-4xl leading-[1.05] font-extrabold italic md:text-6xl wide:text-7xl">
            Una firma que puedes ver trabajar.
          </h1>
          <p className="text-muted mt-6 max-w-2xl text-base md:text-lg">
            Cada rol de la consultoría es un agente con personalidad, método y contexto. Trabajan,
            se reúnen, se pasan trabajo y, cuando algo requiere criterio humano, te lo traen.
          </p>
        </Container>
      </section>

      <Section tone="base" className="pt-10 pb-16">
        {/* El logotipo hace de bisagra entre el relato y la aplicacion. */}
        <div className="border-line mb-8 flex items-center gap-5 border-b pb-8">
          <AltecVOLogo className="h-8 shrink-0 md:h-10" />
          <p className="text-muted hidden text-xs md:block">
            La oficina corre en vivo. Elige una vista, haz clic en cualquier agente o abre la
            bandeja cuando alguien espere tu decisión.
          </p>
        </div>

        <OfficeViewer />
        <p className="text-muted mt-4 font-mono text-[11px]">
          Simulación de una jornada completa. Clientes y cifras son de ejemplo.
        </p>
      </Section>

      <Section tone="alt">
        <h2 className="font-display text-ink text-2xl font-extrabold italic md:text-4xl">
          Por qué una oficina y no un tablero
        </h2>
        <p className="text-muted mt-4 max-w-2xl">
          La oficina no es decoración. Es la forma de ver de un vistazo quién está haciendo qué,
          dónde se atoró el trabajo y qué necesita de una persona.
        </p>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {principles.map((item, index) => (
            <article
              key={item.title}
              className="border-line bg-card rounded-card border p-6"
            >
              <span aria-hidden="true" className="text-ink/25 font-mono text-sm">
                {`0${index + 1}`}
              </span>
              <h3 className="font-display text-ink mt-3 text-lg font-extrabold italic">
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
