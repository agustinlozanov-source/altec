import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Los paquetes del monorepo se publican como fuente TS, no compilados.
  transpilePackages: ["@altec/ui", "@altec/events", "@altec/agents", "@altec/office3d"],
  // El Documento Maestro se lee del disco en tiempo de ejecucion. Sin esto, el
  // trazado de Next no lo incluye en el bundle desplegado y en produccion la
  // pagina encuentra la carpeta vacia.
  outputFileTracingIncludes: {
    "/document": ["./content/**"],
  },
  // Next genera su propio CLAUDE.md / AGENTS.md. Las reglas del repositorio
  // viven en el CLAUDE.md de la raiz y son las que manda, asi que se desactiva.
  agentRules: false,
};

export default nextConfig;
