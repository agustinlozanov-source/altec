import type { Metadata } from "next";
import { Container, Section } from "@altec/ui";
import { site } from "@/lib/site";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Contáctanos para inversión, consultoría o alianzas estratégicas. Reforma 445, CDMX, México.",
};

const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(site.address)}&output=embed`;

export default function ContactPage() {
  return (
    <>
      <section className="bg-surface pt-20 pb-12 md:pt-28">
        <Container>
          <h1 className="font-display text-ink max-w-3xl text-4xl leading-[1.1] font-extrabold md:text-6xl">
            Hablemos.
          </h1>
          <p className="text-muted mt-5 max-w-xl">
            Inversión, consultoría, alianzas o prensa. Escríbenos y te respondemos.
          </p>
        </Container>
      </section>

      <Section tone="base" className="pt-8">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr]">
          <ContactForm />

          <aside className="flex flex-col gap-8">
            <div>
              <h2 className="text-ink text-xs tracking-[0.18em] uppercase">Oficina</h2>
              <p className="text-muted mt-3 text-sm">{site.address}</p>
              <a
                href={`mailto:${site.email}`}
                className="text-accent-ink hover:text-accent-ink/80 mt-1 block text-sm"
              >
                {site.email}
              </a>
            </div>

            <iframe
              src={mapSrc}
              title={`Mapa de ${site.address}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-card border-line h-64 w-full border"
            />

            <p className="text-muted border-line border-t pt-6 text-xs leading-relaxed">
              {site.legalName}. Toda la información de este sitio es confidencial y propiedad del
              grupo.
            </p>
          </aside>
        </div>
      </Section>
    </>
  );
}
