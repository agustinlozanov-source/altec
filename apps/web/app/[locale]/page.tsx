import type { Metadata } from "next";
import {
  AltecVOLogo,
  ArrowButton,
  CardButton,
  CompanyLogo,
  Container,
  GradientHeading,
  PillLabel,
  Section,
  SonarGrid,
} from "@altec/ui";
import { AltCycle } from "@/components/alt-cycle";
import { Reveal } from "@/components/reveal";
import { StatCounter } from "@/components/stat-counter";
import { companies } from "@/lib/companies";
import { getDictionary, path, type Locale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale).home.meta;
  return {
    title: { absolute: t.title },
    description: t.description,
    openGraph: { title: t.title, description: t.description, locale },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = getDictionary(locale);

  const stats = [
    { value: 12000, prefix: "+", label: t.home.stats.assets },
    { value: 1300, prefix: "+", label: t.home.stats.automations },
    { value: 60, prefix: "+", label: t.home.stats.agents },
    { value: 40, prefix: "+", label: t.home.stats.systems },
    { value: 32, label: t.home.stats.states },
    { value: 5, label: t.home.stats.companies },
  ];

  const [line1, line2] = t.home.displayLines;

  return (
    <>
      {/* --- Portada: display gigante, segunda línea desplazada --- */}
      <SonarGrid
        as="section"
        className="surface-base bg-surface flex min-h-svh items-center pt-32 pb-24 md:pt-40"
        spacing={32}
        dotRadius={1.3}
        baseOpacity={0.12}
        /* Decoración, no texto: se queda en el verde de marca también en claro,
           donde el acento de texto baja a una versión oscurecida. */
        color="var(--color-altec-green)"
        pingEvery={3.6}
        speed={240}
        ringWidth={110}
        amplitude={2.4}
        pingArea={[0.5, 0.15, 0.95, 0.85]}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_70%_at_30%_45%,var(--color-surface)_15%,transparent_100%)]"
        />

        <Container className="relative">
          <div className="flex items-center gap-4">
            <span aria-hidden="true" className="bg-ink h-px w-12 opacity-40" />
            <p className="text-muted font-mono text-xs tracking-[0.25em] uppercase">
              {t.home.eyebrow}
            </p>
          </div>

          <h1 className="font-display text-ink mt-8 text-[clamp(3rem,11vw,9.375rem)] leading-[0.95] font-semibold tracking-[0.02em] uppercase">
            <span className="block">{line1}</span>
            <span className="block md:pl-[18%]">{line2}</span>
          </h1>

          <div className="border-line mt-16 grid gap-10 border-t pt-10 lg:grid-cols-[1.1fr_1fr]">
            <p className="text-ink max-w-lg text-xl leading-snug font-semibold md:text-2xl">
              {t.home.title}
            </p>

            <div className="flex flex-col items-start gap-8">
              <p className="text-muted max-w-md text-base leading-relaxed">{t.home.subtitle}</p>
              <ArrowButton href="#companies">{t.home.ctaPrimary}</ArrowButton>
            </div>
          </div>
        </Container>
      </SonarGrid>

      {/* --- Diferenciador --- */}
      <Section tone="alt" id="category">
        <Reveal>
          <PillLabel>{t.home.companies.eyebrow}</PillLabel>
          <GradientHeading className="mt-6 max-w-[14ch]">
            {t.home.differentiator.title}
          </GradientHeading>
          <p className="text-muted max-w-text mt-8 text-[17px] leading-[1.7]">
            {t.home.differentiator.body}
          </p>
        </Reveal>

        <AltCycle dictionary={t} className="mt-16" />
      </Section>

      {/* --- Empresas como tarjetas de servicio --- */}
      <Section tone="base" id="companies">
        <Reveal className="flex flex-col items-center text-center">
          <PillLabel>{t.home.companies.eyebrow}</PillLabel>
          <h2 className="font-display text-ink mt-6 text-[clamp(2rem,4vw,3.5rem)] leading-[1.15] font-semibold">
            {t.home.companies.title}
          </h2>
          <p className="text-muted mt-5 max-w-xl text-[17px] leading-[1.7]">
            {t.home.companies.body}
          </p>
        </Reveal>

        <div className="mt-16 grid gap-[30px] md:grid-cols-2">
          {companies.map((company, index) => (
            <Reveal
              as="article"
              key={company.key}
              delay={index * 70}
              className="rounded-card border-line flex flex-col border bg-[linear-gradient(180deg,var(--color-card)_0%,color-mix(in_srgb,var(--color-card)_70%,white_6%)_100%)] p-10 transition-transform duration-300 hover:-translate-y-1.5 md:p-12"
            >
              <CompanyLogo company={company.key} className="h-8 md:h-9" />

              <h3 className="text-ink mt-10 text-[27px] leading-tight font-semibold">
                {t.companies[company.key].industry}
              </h3>

              <p className="text-muted mt-4 text-[17px] leading-[1.7]">
                {t.companies[company.key].metric}
              </p>

              <div className="mt-10">
                <CardButton href={company.url} target="_blank" rel="noreferrer noopener">
                  {t.home.companies.visit}
                </CardButton>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* --- ALTEC VO --- */}
      <Section tone="alt" id="altec-vo">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <Reveal>
            <AltecVOLogo className="h-9 md:h-11" />

            <h2 className="text-ink mt-8 text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.15] font-semibold">
              {t.home.virtualOffice.title}
            </h2>

            <p className="text-muted mt-6 text-[17px] leading-[1.7]">{t.home.virtualOffice.body}</p>

            <div className="mt-10">
              <ArrowButton href={path(locale, "virtualOffice")}>
                {t.home.virtualOffice.cta}
              </ArrowButton>
            </div>
          </Reveal>

          <Reveal delay={90}>
            <div className="rounded-card border-line overflow-hidden border">
              <div className="border-line flex items-center gap-2.5 border-b px-6 py-4">
                <span className="bg-altec-green h-2 w-2 rounded-full" />
                <span className="text-muted font-mono text-[11px] tracking-wide uppercase">
                  {t.home.virtualOffice.liveLabel}
                </span>
              </div>
              <dl className="grid grid-cols-2">
                {[
                  ["10", t.home.virtualOffice.stats.rooms],
                  ["12", t.home.virtualOffice.stats.agents],
                  ["80/20", t.home.virtualOffice.stats.ratio],
                  ["1", t.home.virtualOffice.stats.inbox],
                ].map(([value, label]) => (
                  <div key={label} className="border-line border-r border-b p-8 last:border-r-0">
                    <dt className="font-display text-accent-ink text-4xl leading-none font-bold">
                      {value}
                    </dt>
                    <dd className="text-muted mt-2 text-sm">{label}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* --- Números --- */}
      <Section tone="base" id="numbers">
        <Reveal className="flex flex-col items-center text-center">
          <PillLabel>{t.home.stats.eyebrow}</PillLabel>
          <GradientHeading className="mt-6">{t.home.stats.title}</GradientHeading>
        </Reveal>

        <div className="mt-16 grid grid-cols-2 gap-x-8 gap-y-14 lg:grid-cols-3">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 60}>
              <StatCounter
                value={stat.value}
                prefix={stat.prefix}
                label={stat.label}
                locale={locale}
              />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* --- Visión --- */}
      <Section tone="alt" id="vision">
        <Reveal className="mx-auto max-w-4xl text-center">
          <PillLabel>{t.home.vision.eyebrow}</PillLabel>
          <p className="text-ink mt-8 text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.3] font-semibold">
            {t.home.vision.body}
          </p>
        </Reveal>
      </Section>
    </>
  );
}
