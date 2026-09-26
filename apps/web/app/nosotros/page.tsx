import type { Metadata } from "next";
import { Container, Section } from "@altec/ui";
import { founders, governance, timeline } from "@/lib/about";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "La historia, el equipo y el gobierno corporativo detrás del grupo ALTEC. Desde Monterrey hasta CDMX, construyendo la categoría ALT.",
};

/** Iniciales como avatar mientras no haya fotos reales del equipo (docs/WEB.md §2.4). */
function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

export default function AboutPage() {
  return (
    <>
      <section className="bg-surface pt-20 pb-12 md:pt-28">
        <Container>
          <h1 className="font-display text-ink max-w-3xl text-4xl leading-[1.1] font-extrabold italic md:text-6xl">
            Cinco empresas, una tesis.
          </h1>
        </Container>
      </section>

      {/* --- La historia (docs/WEB.md §4.2) --- */}
      <Section tone="base" id="historia" className="pt-8">
        <h2 className="font-display text-ink text-2xl font-extrabold italic md:text-4xl">
          La historia
        </h2>

        <ol className="border-line mt-10 flex flex-col border-l">
          {timeline.map((item) => (
            <li key={item.year} className="relative pb-10 pl-8 last:pb-0">
              <span
                aria-hidden="true"
                className="bg-altec-green absolute top-1.5 -left-[5px] h-2.5 w-2.5 rounded-full"
              />
              <span className="text-accent-ink font-mono text-sm">{item.year}</span>
              <p className="text-ink mt-2 max-w-xl text-base">{item.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* --- Tesis del grupo (docs/WEB.md §4.2) --- */}
      <Section tone="alt" id="tesis">
        <h2 className="font-display text-ink text-2xl font-extrabold italic md:text-4xl">
          Tesis del grupo
        </h2>

        <div className="mt-8 flex max-w-3xl flex-col gap-6">
          <p className="text-ink text-lg leading-relaxed md:text-2xl">
            Las PyMEs en Latinoamérica enfrentan tres problemas simultáneos: no saben vender bien
            (advisory), no actualizan sus competencias (learning) y no adoptan tecnología a tiempo
            (technology).{" "}
            <span className="font-display font-extrabold italic">
              Estos problemas no se resuelven uno a la vez. Se resuelven juntos.
            </span>
          </p>

          <p className="text-muted text-base md:text-lg">
            ALTEC existe porque creemos que un grupo empresarial integrado — no una sola empresa —
            es la estructura correcta para atacar estos tres frentes al mismo tiempo.
          </p>
        </div>
      </Section>

      {/* --- Equipo fundador (docs/WEB.md §4.2) --- */}
      <Section tone="base" id="equipo">
        <h2 className="font-display text-ink text-2xl font-extrabold italic md:text-4xl">
          Equipo fundador
        </h2>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {founders.map((person) => (
            <article
              key={person.name}
              className="border-line bg-card rounded-card flex gap-5 border p-6"
            >
              <div
                aria-hidden="true"
                className="border-line text-muted font-display flex h-14 w-14 shrink-0 items-center justify-center rounded-full border text-lg font-extrabold italic"
              >
                {initials(person.name)}
              </div>

              <div>
                <h3 className="font-display text-ink text-lg font-extrabold italic">
                  {person.name}
                </h3>
                <p className="text-accent-ink mt-0.5 font-mono text-xs">{person.role}</p>
                <p className="text-muted mt-3 text-sm leading-relaxed">{person.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* --- Gobierno corporativo (docs/WEB.md §4.2) --- */}
      <Section tone="alt" id="gobierno">
        <h2 className="font-display text-ink text-2xl font-extrabold italic md:text-4xl">
          Gobierno corporativo
        </h2>

        <p className="text-muted mt-4 max-w-2xl">
          Tres pilares que operan en todas las empresas del grupo.
        </p>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {governance.map((pillar, index) => (
            <article
              key={pillar.key}
              className="border-line bg-card rounded-card border p-6"
            >
              <span aria-hidden="true" className="text-ink/25 font-mono text-sm">
                {`0${index + 1}`}
              </span>
              <h3 className="font-display text-ink mt-3 text-xl font-extrabold italic">
                {pillar.name}
              </h3>
              <p className="text-muted mt-1 text-xs tracking-wide uppercase">
                {pillar.full}
              </p>
              <p className="text-muted mt-3 text-sm leading-relaxed">{pillar.text}</p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
