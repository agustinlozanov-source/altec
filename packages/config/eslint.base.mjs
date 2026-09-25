import js from "@eslint/js";
import tseslint from "typescript-eslint";

/**
 * Reglas comunes del monorepo. Cada app o paquete extiende de aqui.
 */
export default tseslint.config(
  { ignores: ["**/.next/**", "**/dist/**", "**/node_modules/**", "**/.turbo/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // `consistent-type-imports` queda fuera a proposito: necesita informacion
      // de tipos y el parser de Next no la reenvia. Prettier y la revision
      // cubren ese estilo sin pelearse con la cadena de herramientas.
    },
  },
  {
    // Scripts de build y configuracion: corren en Node, no en el navegador.
    files: ["**/*.mjs", "**/*.cjs", "**/scripts/**"],
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
        __dirname: "readonly",
        URL: "readonly",
      },
    },
  },
);
