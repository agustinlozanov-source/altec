import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Los paquetes del monorepo se publican como fuente TS, no compilados.
  transpilePackages: ["@altec/ui", "@altec/events", "@altec/agents", "@altec/office3d"],
  // Next genera su propio CLAUDE.md / AGENTS.md. Las reglas del repositorio
  // viven en el CLAUDE.md de la raiz y son las que manda, asi que se desactiva.
  agentRules: false,
};

export default nextConfig;
