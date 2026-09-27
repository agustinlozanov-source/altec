import type { Metadata } from "next";
import { AltecVOHero, AltecVOLogo, Container, Section } from "@altec/ui";
import { Reveal } from "@/components/reveal";
import { OfficeViewer } from "@/components/office/office-viewer";
import { getDictionary, type Locale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale).virtualOffice.meta;
  return { title: t.title, description: t.description };
}

export default async function VirtualOfficePage({ params }: Props) {
  const { locale } = await params;
  const t = getDictionary(locale).virtualOffice;

  return (
    <>
      <section className="surface-invert bg-surface relative flex min-h-[62svh] items-end overflow-hidden pt-24 pb-14 md:min-h-[72svh] md:pt-32 md:pb-20">
        <AltecVOHero />

        <Container className="relative">
          <h1 className="font-editorial text-ink max-w-3xl text-4xl leading-[1.05] md:text-6xl wide:text-7xl">
            {t.title}
          </h1>
          <p className="text-muted mt-6 max-w-2xl text-base md:text-lg">{t.subtitle}</p>
        </Container>
      </section>

      <Section tone="base" className="pt-10 pb-16">
        <div className="border-line mb-8 flex items-center gap-5 border-b pb-8">
          <AltecVOLogo className="h-8 shrink-0 md:h-10" />
          <p className="text-muted hidden text-xs md:block">{t.hinge}</p>
        </div>

        <OfficeViewer />

        <p className="text-muted mt-4 font-mono text-[11px]">{t.disclaimer}</p>
      </Section>

      <Section tone="alt">
        <Reveal>
          <h2 className="font-display text-ink text-2xl font-extrabold md:text-4xl">
            {t.whyTitle}
          </h2>
          <p className="text-muted max-w-text mt-4">{t.whyBody}</p>
        </Reveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {t.principles.map((item, index) => (
            <Reveal
              as="article"
              key={item.title}
              delay={index * 70}
              className="border-line bg-card rounded-card border p-6"
            >
              <span aria-hidden="true" className="text-muted font-mono text-sm">
                {`0${index + 1}`}
              </span>
              <h3 className="font-display text-ink mt-3 text-lg font-extrabold">{item.title}</h3>
              <p className="text-muted mt-3 text-sm leading-relaxed">{item.text}</p>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
