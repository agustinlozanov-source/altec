import type { Metadata } from "next";
import { Container, Section } from "@altec/ui";
import { Reveal } from "@/components/reveal";
import { getDictionary, type Locale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale).about.meta;
  return { title: t.title, description: t.description };
}

/** Iniciales como avatar mientras no haya fotos reales del equipo. */
function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const t = getDictionary(locale).about;

  return (
    <>
      <section className="surface-base bg-surface pt-24 pb-12 md:pt-32">
        <Container>
          <h1 className="font-editorial text-ink max-w-3xl text-4xl leading-[1.05] md:text-6xl">
            {t.title}
          </h1>
        </Container>
      </section>

      <Section tone="base" id="history" className="pt-8">
        <Reveal>
          <h2 className="font-display text-ink text-2xl font-extrabold md:text-4xl">
            {t.history.title}
          </h2>
        </Reveal>

        <ol className="border-line mt-12 flex flex-col border-l">
          {t.history.items.map((item, index) => (
            <Reveal as="li" key={item.year} delay={index * 60} className="relative pb-10 pl-8 last:pb-0">
              <span
                aria-hidden="true"
                className="bg-altec-green absolute top-1.5 -left-[5px] h-2.5 w-2.5 rounded-full"
              />
              <span className="text-accent-ink font-mono text-sm">{item.year}</span>
              <p className="text-ink mt-2 max-w-xl text-base">{item.text}</p>
            </Reveal>
          ))}
        </ol>
      </Section>

      <Section tone="alt" id="thesis">
        <Reveal>
          <h2 className="font-display text-ink text-2xl font-extrabold md:text-4xl">
            {t.thesis.title}
          </h2>

          <div className="max-w-text mt-8 flex flex-col gap-6">
            <p className="text-ink text-lg leading-relaxed md:text-2xl">
              {t.thesis.lead}{" "}
              <span className="font-display font-extrabold">{t.thesis.emphasis}</span>
            </p>

            <p className="text-muted text-base md:text-lg">{t.thesis.body}</p>
          </div>
        </Reveal>
      </Section>

      <Section tone="base" id="team">
        <Reveal>
          <h2 className="font-display text-ink text-2xl font-extrabold md:text-4xl">
            {t.team.title}
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {t.team.members.map((person, index) => (
            <Reveal
              as="article"
              key={person.name}
              delay={index * 70}
              className="border-line bg-card rounded-card flex gap-5 border p-6"
            >
              <div
                aria-hidden="true"
                className="border-line text-muted font-display flex h-14 w-14 shrink-0 items-center justify-center rounded-full border text-lg font-extrabold"
              >
                {initials(person.name)}
              </div>

              <div>
                <h3 className="font-display text-ink text-lg font-extrabold">{person.name}</h3>
                <p className="text-accent-ink mt-0.5 font-mono text-xs">{person.role}</p>
                <p className="text-muted mt-3 text-sm leading-relaxed">{person.bio}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="alt" id="governance">
        <Reveal>
          <h2 className="font-display text-ink text-2xl font-extrabold md:text-4xl">
            {t.governance.title}
          </h2>
          <p className="text-muted max-w-text mt-4">{t.governance.body}</p>
        </Reveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {t.governance.pillars.map((pillar, index) => (
            <Reveal
              as="article"
              key={pillar.name}
              delay={index * 70}
              className="border-line bg-card rounded-card border p-6"
            >
              <span aria-hidden="true" className="text-muted font-mono text-sm">
                {`0${index + 1}`}
              </span>
              <h3 className="font-display text-ink mt-3 text-xl font-extrabold">{pillar.name}</h3>
              <p className="text-muted mt-1 text-xs tracking-wide uppercase">{pillar.full}</p>
              <p className="text-muted mt-3 text-sm leading-relaxed">{pillar.text}</p>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
