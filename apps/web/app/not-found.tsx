import { AltecMark, Button, Container } from "@altec/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100svh-4rem)] items-center py-20">
      <Container className="flex flex-col items-start gap-6">
        <AltecMark className="h-8" />

        <p className="text-muted font-mono text-sm">Error 404</p>

        <h1 className="font-display text-ink text-3xl leading-tight font-extrabold italic md:text-5xl">
          Esta página no existe.
        </h1>

        <p className="text-muted max-w-lg">
          Puede que la hayamos movido, o que todavía no la publiquemos. El sitio se está
          construyendo por fases.
        </p>

        <Button href="/">Volver al inicio</Button>
      </Container>
    </div>
  );
}
