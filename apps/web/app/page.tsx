import { AltecLogo, Button, Container, Section } from "@altec/ui";
import { AltCycle } from "@/components/alt-cycle";
import { CompanyCard } from "@/components/company-card";
import { StatCounter } from "@/components/stat-counter";
import { companies } from "@/lib/companies";
import { site } from "@/lib/site";

/** Numeros del grupo (docs/WEB.md §4.1). */
const stats = [
  { value: 12000, prefix: "+", label: "activos valuados" },
  { value: 1300, prefix: "+", label: "automatizaciones creadas" },
  { value: 60, prefix: "+", label: "agentes de IA construidos" },
  { value: 40, prefix: "+", label: "sistemas entregados" },
  { value: 5, label: "empresas integradas" },
  { value: 32, label: "estados con presencia" },
];

export default function HomePage() {
  return (
    <>
      {/* --- Hero (docs/WEB.md §4.1) --- */}
      <section className="bg-surface flex min-h-[calc(100svh-4rem)] items-center py-20">
        <Container className="flex flex-col items-start gap-8">
          <AltecLogo className="h-14 md:h-20 wide:h-24" priority />

          <h1 className="font-display text-ink max-w-3xl text-3xl leading-[1.1] font-extrabold italic md:text-5xl wide:text-6xl">
            Advisory · Learning · Technology
          </h1>

          <p className="text-muted max-w-2xl text-base md:text-lg">
            El grupo empresarial que integra consultoría, educación y tecnología para escalar PyMEs
            en Latinoamérica.
          </p>

          <div className="flex flex-col gap-3 md:flex-row">
            <Button href="#empresas">Conoce nuestras empresas</Button>
            <Button href={site.investorPortalUrl} variant="secondary">
              Portal del Inversionista
            </Button>
          </div>
        </Container>
      </section>

      {/* --- La categoria ALT (docs/WEB.md §4.1) --- */}
      <Section tone="alt" id="categoria">
        <h2 className="font-display text-ink max-w-2xl text-3xl leading-tight font-extrabold italic md:text-5xl">
          No somos una categoría existente.
        </h2>

        <p className="text-muted mt-6 max-w-2xl text-base md:text-lg">
          ALTEC opera en la intersección de tres industrias que históricamente se venden por
          separado. Nosotros las integramos en un ciclo donde cada una alimenta a las demás.
        </p>

        <AltCycle className="mt-12" />
      </Section>

      {/* --- Nuestras empresas (docs/WEB.md §4.1) --- */}
      <Section tone="base" id="empresas">
        <h2 className="font-display text-ink text-3xl leading-tight font-extrabold italic md:text-5xl">
          Nuestras empresas
        </h2>

        <p className="text-muted mt-4 max-w-2xl text-base">
          Cinco empresas con operación propia, integradas bajo un holding. Cada una mantiene su
          marca y su dominio; ALTEC las conecta.
        </p>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {companies.map((company) => (
            <CompanyCard key={company.key} company={company} />
          ))}
        </div>
      </Section>

      {/* --- Numeros del grupo (docs/WEB.md §4.1) --- */}
      <Section tone="alt" id="numeros">
        <h2 className="font-display text-ink text-3xl leading-tight font-extrabold italic md:text-5xl">
          Números del grupo
        </h2>

        <div className="mt-12 grid grid-cols-2 gap-10 lg:grid-cols-3">
          {stats.map((stat) => (
            <StatCounter
              key={stat.label}
              value={stat.value}
              prefix={stat.prefix}
              label={stat.label}
            />
          ))}
        </div>
      </Section>

      {/* --- BHAG (docs/WEB.md §4.1) --- */}
      <Section tone="base" id="vision">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-accent-ink font-mono text-xs tracking-[0.2em] uppercase">
            Visión a 10 años
          </p>

          <p className="font-display text-ink mt-8 text-2xl leading-[1.25] font-extrabold italic md:text-4xl">
            Para 2035, ALTEC será el grupo de referencia en la categoría ALT en Latinoamérica, con
            presencia en 5+ países, una red de +500 consultores certificados y un portafolio de
            empresas que genere más de $500M MXN anuales.
          </p>
        </div>
      </Section>
    </>
  );
}
