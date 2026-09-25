import type { Metadata } from "next";
import { AltecVOLogo, Container, Section } from "@altec/ui";
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
      <section className="bg-altec-black pt-20 pb-10 md:pt-28">
        <Container>
          <AltecVOLogo className="h-9 md:h-12" priority />

          <h1 className="font-display text-altec-cream mt-6 max-w-3xl text-4xl leading-[1.1] font-extrabold italic md:text-6xl">
            Una firma que puedes ver trabajar.
          </h1>
          <p className="text-altec-cream/65 mt-6 max-w-2xl text-base md:text-lg">
            Cada rol de la consultoría es un agente con personalidad, método y contexto. Trabajan,
            se reúnen, se pasan trabajo y, cuando algo requiere criterio humano, te lo traen.
          </p>
        </Container>
      </section>

      <Section tone="dark" className="pt-4 pb-16">
        <OfficeViewer />
        <p className="text-altec-cream/40 mt-4 font-mono text-[11px]">
          Vista previa en construcción. Los agentes ya están en sus lugares; el día de trabajo con
          guion, la bandeja de decisiones y el motor de automatización llegan enseguida.
        </p>
      </Section>

      <Section tone="light">
        <h2 className="font-display text-altec-black text-2xl font-extrabold italic md:text-4xl">
          Por qué una oficina y no un tablero
        </h2>
        <p className="text-altec-black/70 mt-4 max-w-2xl">
          La oficina no es decoración. Es la forma de ver de un vistazo quién está haciendo qué,
          dónde se atoró el trabajo y qué necesita de una persona.
        </p>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {principles.map((item, index) => (
            <article
              key={item.title}
              className="border-altec-black/15 bg-altec-white/60 rounded-card border p-6"
            >
              <span aria-hidden="true" className="text-altec-black/25 font-mono text-sm">
                {`0${index + 1}`}
              </span>
              <h3 className="font-display text-altec-black mt-3 text-lg font-extrabold italic">
                {item.title}
              </h3>
              <p className="text-altec-black/70 mt-3 text-sm leading-relaxed">{item.text}</p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
