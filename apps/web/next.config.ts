import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // El paquete de marca se publica como fuente TS, no compilado.
  transpilePackages: ["@altec/ui"],
  // Next genera su propio CLAUDE.md / AGENTS.md. Las reglas del repositorio
  // viven en el CLAUDE.md de la raiz y son las que manda, asi que se desactiva.
  agentRules: false,
};

export default nextConfig;
