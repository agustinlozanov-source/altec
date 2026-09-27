import { AltecVOLogo, Button, Container, Section } from "@altec/ui";
import { AltCycle } from "@/components/alt-cycle";
import { CompanyCard } from "@/components/company-card";
import { Reveal } from "@/components/reveal";
import { StatCounter } from "@/components/stat-counter";
import { companies } from "@/lib/companies";
import { site } from "@/lib/site";

/**
 * Cifras del grupo (docs/WEB.md §4.1).
 * Solo las que sostienen una conversación con un inversionista.
 */
const stats = [
  { value: 12000, prefix: "+", label: "activos valuados" },
  { value: 1300, prefix: "+", label: "automatizaciones creadas" },
  { value: 60, prefix: "+", label: "agentes de IA construidos" },
  { value: 40, prefix: "+", label: "sistemas entregados" },
  { value: 32, label: "estados con presencia" },
  { value: 5, label: "empresas integradas" },
];

export default function HomePage() {
  return (
    <>
      {/* --- Portada --- */}
      <section className="surface-base bg-surface flex min-h-[85svh] items-center py-24 md:py-32">
        <Container>
          <p className="text-accent-ink font-mono text-xs tracking-[0.2em] uppercase">
            ALTEC Group
          </p>

          <h1 className="font-editorial text-ink mt-6 max-w-[16ch] text-5xl leading-[1.03] tracking-[-0.02em] md:text-7xl wide:text-8xl">
            Consultoría, educación y tecnología como un solo sistema.
          </h1>

          <p className="text-muted mt-8 max-w-text-sm text-base leading-relaxed md:text-lg">
            El grupo empresarial que integra las tres industrias que escalan PyMEs en
            Latinoamérica.
          </p>

          <div className="mt-10 flex flex-col gap-3 md:flex-row">
            <Button href="#empresas">Conoce el grupo</Button>
            <Button href={site.investorPortalUrl} variant="secondary">
              Portal del Inversionista
            </Button>
          </div>
        </Container>
      </section>

      {/* --- Diferenciador --- */}
      <Section tone="alt" id="categoria">
        <Reveal>
          <h2 className="font-display text-ink max-w-[18ch] text-3xl leading-tight font-extrabold italic md:text-5xl">
            No somos una categoría existente.
          </h2>

          <p className="text-muted max-w-text mt-6 text-base md:text-lg">
            ALTEC opera en la intersección de tres industrias que históricamente se venden por
            separado. Nosotros las integramos en un ciclo donde cada una alimenta a las demás.
          </p>
        </Reveal>

        <AltCycle className="mt-14" />
      </Section>

      {/* --- Empresas --- */}
      <Section tone="base" id="empresas">
        <Reveal>
          <p className="text-accent-ink font-mono text-xs tracking-[0.2em] uppercase">
            Nuestras empresas
          </p>
          <h2 className="font-display text-ink mt-4 text-3xl leading-tight font-extrabold italic md:text-5xl">
            Cinco compañías. Un ecosistema.
          </h2>
          <p className="text-muted max-w-text mt-4 text-base">
            Cada una mantiene su marca, su operación y su dominio. ALTEC las conecta.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {companies.map((company, index) => (
            <CompanyCard key={company.key} company={company} delay={index * 70} />
          ))}
        </div>
      </Section>

      {/* --- ALTEC VO --- */}
      <Section tone="alt" id="altec-vo">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <AltecVOLogo className="h-8 md:h-10" />

            <h2 className="font-display text-ink mt-6 text-3xl leading-tight font-extrabold italic md:text-4xl">
              Una firma que puedes ver trabajar.
            </h2>

            <p className="text-muted mt-5 text-base leading-relaxed">
              Cada rol de la consultoría es un agente con personalidad, método y contexto.
              Trabajan, se reúnen, se pasan trabajo y, cuando algo requiere criterio humano, lo
              traen a una persona. El ochenta por ciento de la operación pasa por agentes; el
              veinte restante es donde tú creas valor.
            </p>

            <div className="mt-8">
              <Button href="/oficina-virtual" variant="secondary">
                Conocer ALTEC VO
              </Button>
            </div>
          </Reveal>

          <Reveal delay={90}>
            <div className="border-line rounded-card bg-card overflow-hidden border">
              <div className="border-line flex items-center gap-2 border-b px-4 py-3">
                <span className="bg-vo-working h-2 w-2 rounded-full" />
                <span className="text-muted font-mono text-[11px]">
                  Oficina en vivo · 12 agentes
                </span>
              </div>
              <dl className="grid grid-cols-2 gap-px">
                {[
                  ["10", "salas"],
                  ["12", "agentes"],
                  ["80/20", "agentes / humano"],
                  ["1", "bandeja de decisiones"],
                ].map(([value, label]) => (
                  <div key={label} className="bg-surface px-5 py-6">
                    <dt className="font-display text-accent-ink text-2xl font-extrabold italic">
                      {value}
                    </dt>
                    <dd className="text-muted mt-1 text-xs">{label}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* --- Números --- */}
      <Section tone="base" id="numeros">
        <Reveal>
          <p className="text-accent-ink font-mono text-xs tracking-[0.2em] uppercase">
            Tracción
          </p>
          <h2 className="font-display text-ink mt-4 text-3xl leading-tight font-extrabold italic md:text-5xl">
            Números del grupo
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-10 lg:grid-cols-3">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 60}>
              <StatCounter value={stat.value} prefix={stat.prefix} label={stat.label} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* --- Visión --- */}
      <Section tone="alt" id="vision">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="text-accent-ink font-mono text-xs tracking-[0.2em] uppercase">
            Visión a 10 años
          </p>

          <p className="font-editorial text-ink mt-8 text-3xl leading-[1.15] tracking-[-0.01em] md:text-5xl">
            Para 2035, ALTEC será el grupo de referencia en la categoría ALT en Latinoamérica,
            con presencia en cinco países, una red de más de quinientos consultores certificados
            y un portafolio que genere más de quinientos millones de pesos anuales.
          </p>
        </Reveal>
      </Section>
    </>
  );
}
