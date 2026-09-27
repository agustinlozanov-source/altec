import type { Metadata } from "next";
import { AltecVOLogo, Button, Container, Section, SonarGrid } from "@altec/ui";
import { AltCycle } from "@/components/alt-cycle";
import { CompanyCard } from "@/components/company-card";
import { Reveal } from "@/components/reveal";
import { StatCounter } from "@/components/stat-counter";
import { companies } from "@/lib/companies";
import { getDictionary, path, type Locale } from "@/lib/i18n";
import { site } from "@/lib/site";

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

  return (
    <>
      {/* --- Portada --- */}
      <SonarGrid
        as="section"
        className="surface-base bg-surface flex min-h-[85svh] items-center py-24 md:py-32"
        spacing={30}
        dotRadius={1.3}
        baseOpacity={0.16}
        pingEvery={3.6}
        speed={240}
        ringWidth={110}
        amplitude={2.4}
        pingArea={[0.55, 0.15, 0.95, 0.85]}
      >
        <div
          aria-hidden="true"
          className={[
            "pointer-events-none absolute inset-0 -z-10",
            "bg-[radial-gradient(ellipse_95%_60%_at_40%_50%,var(--color-surface)_25%,transparent_100%)]",
            "md:bg-[radial-gradient(ellipse_62%_58%_at_22%_50%,var(--color-surface)_0%,transparent_100%)]",
          ].join(" ")}
        />

        <Container className="relative">
          <p className="text-accent-ink font-mono text-xs tracking-[0.2em] uppercase">
            {t.home.eyebrow}
          </p>

          <h1 className="font-editorial text-ink mt-6 max-w-[16ch] text-5xl leading-[1.03] tracking-[-0.02em] md:text-7xl wide:text-8xl">
            {t.home.title}
          </h1>

          <p className="text-muted max-w-text-sm mt-8 text-base leading-relaxed md:text-lg">
            {t.home.subtitle}
          </p>

          <div className="mt-10 flex flex-col gap-3 md:flex-row">
            <Button href="#companies">{t.home.ctaPrimary}</Button>
            <Button href={site.investorPortalUrl} variant="secondary">
              {t.home.ctaSecondary}
            </Button>
          </div>
        </Container>
      </SonarGrid>

      {/* --- Diferenciador --- */}
      <Section tone="alt" id="category">
        <Reveal>
          <h2 className="font-display text-ink max-w-[18ch] text-3xl leading-tight font-extrabold md:text-5xl">
            {t.home.differentiator.title}
          </h2>

          <p className="text-muted max-w-text mt-6 text-base md:text-lg">
            {t.home.differentiator.body}
          </p>
        </Reveal>

        <AltCycle dictionary={t} className="mt-14" />
      </Section>

      {/* --- Empresas --- */}
      <Section tone="base" id="companies">
        <Reveal>
          <p className="text-accent-ink font-mono text-xs tracking-[0.2em] uppercase">
            {t.home.companies.eyebrow}
          </p>
          <h2 className="font-display text-ink mt-4 text-3xl leading-tight font-extrabold md:text-5xl">
            {t.home.companies.title}
          </h2>
          <p className="text-muted max-w-text mt-4 text-base">{t.home.companies.body}</p>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {companies.map((company, index) => (
            <CompanyCard
              key={company.key}
              company={company}
              industry={t.companies[company.key].industry}
              metric={t.companies[company.key].metric}
              visitLabel={t.home.companies.visit}
              delay={index * 70}
            />
          ))}
        </div>
      </Section>

      {/* --- ALTEC VO --- */}
      <Section tone="alt" id="altec-vo">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <AltecVOLogo className="h-8 md:h-10" />

            <h2 className="font-display text-ink mt-6 text-3xl leading-tight font-extrabold md:text-4xl">
              {t.home.virtualOffice.title}
            </h2>

            <p className="text-muted mt-5 text-base leading-relaxed">{t.home.virtualOffice.body}</p>

            <div className="mt-8">
              <Button href={path(locale, "virtualOffice")} variant="secondary">
                {t.home.virtualOffice.cta}
              </Button>
            </div>
          </Reveal>

          <Reveal delay={90}>
            <div className="border-line rounded-card bg-card overflow-hidden border">
              <div className="border-line flex items-center gap-2 border-b px-4 py-3">
                <span className="bg-vo-working h-2 w-2 rounded-full" />
                <span className="text-muted font-mono text-[11px]">
                  {t.home.virtualOffice.liveLabel}
                </span>
              </div>
              <dl className="grid grid-cols-2 gap-px">
                {[
                  ["10", t.home.virtualOffice.stats.rooms],
                  ["12", t.home.virtualOffice.stats.agents],
                  ["80/20", t.home.virtualOffice.stats.ratio],
                  ["1", t.home.virtualOffice.stats.inbox],
                ].map(([value, label]) => (
                  <div key={label} className="bg-surface px-5 py-6">
                    <dt className="font-display text-accent-ink text-2xl font-extrabold">
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
      <Section tone="base" id="numbers">
        <Reveal>
          <p className="text-accent-ink font-mono text-xs tracking-[0.2em] uppercase">
            {t.home.stats.eyebrow}
          </p>
          <h2 className="font-display text-ink mt-4 text-3xl leading-tight font-extrabold md:text-5xl">
            {t.home.stats.title}
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-10 lg:grid-cols-3">
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
          <p className="text-accent-ink font-mono text-xs tracking-[0.2em] uppercase">
            {t.home.vision.eyebrow}
          </p>

          <p className="font-editorial text-ink mt-8 text-3xl leading-[1.15] tracking-[-0.01em] md:text-5xl">
            {t.home.vision.body}
          </p>
        </Reveal>
      </Section>
    </>
  );
}
