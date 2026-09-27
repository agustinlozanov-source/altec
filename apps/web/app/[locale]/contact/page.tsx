import type { Metadata } from "next";
import { Container, Section } from "@altec/ui";
import { getDictionary, type Locale } from "@/lib/i18n";
import { site } from "@/lib/site";
import { ContactForm } from "./contact-form";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale).contact.meta;
  return { title: t.title, description: t.description };
}

const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent("Reforma 445, CDMX, México")}&output=embed`;

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const dictionary = getDictionary(locale);
  const t = dictionary.contact;

  return (
    <>
      <section className="surface-base bg-surface pt-24 pb-12 md:pt-32">
        <Container>
          <h1 className="font-editorial text-ink max-w-3xl text-4xl leading-[1.05] md:text-6xl">
            {t.title}
          </h1>
          <p className="text-muted mt-6 max-w-xl">{t.subtitle}</p>
        </Container>
      </section>

      <Section tone="base" className="pt-8">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr]">
          <ContactForm dictionary={dictionary} />

          <aside className="flex flex-col gap-8">
            <div>
              <h2 className="text-ink text-xs tracking-[0.18em] uppercase">{t.office}</h2>
              <p className="text-muted mt-3 text-sm">{site.address}</p>
              <a
                href={`mailto:${site.email}`}
                className="text-accent-ink mt-1 block text-sm"
              >
                {site.email}
              </a>
            </div>

            <iframe
              src={mapSrc}
              title={site.address}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-card border-line h-64 w-full border"
            />

            <p className="text-muted border-line border-t pt-6 text-xs leading-relaxed">
              {site.legalName}. {t.legal}
            </p>
          </aside>
        </div>
      </Section>
    </>
  );
}
