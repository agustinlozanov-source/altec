/**
 * Verifica que tokens.ts y theme.css declaren exactamente los mismos colores.
 * Si alguien cambia uno y olvida el otro, esto falla antes del despliegue.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(here, "../src/styles/theme.css"), "utf8");
const ts = readFileSync(join(here, "../src/tokens.ts"), "utf8");

const cssVars = new Map();
for (const [, name, value] of css.matchAll(/--color-([a-z-]+):\s*(#[0-9a-fA-F]{6});/g)) {
  cssVars.set(name, value.toLowerCase());
}

const tsVars = new Map();
for (const [, key, value] of ts.matchAll(/^\s{2}([a-zA-Z]+):\s*"(#[0-9a-fA-F]{6})",/gm)) {
  tsVars.set(key, value.toLowerCase());
}

const expected = [
  ["black", "altec-black"],
  ["cream", "altec-cream"],
  ["green", "altec-green"],
  ["darkGray", "altec-dark-gray"],
  ["midGray", "altec-mid-gray"],
  ["white", "altec-white"],
  ["working", "vo-working"],
  ["meeting", "vo-meeting"],
  ["collab", "vo-collab"],
  ["awaiting", "vo-awaiting"],
  ["idle", "vo-idle"],
];

const problems = [];
for (const [tsKey, cssKey] of expected) {
  const a = tsVars.get(tsKey);
  const b = cssVars.get(cssKey);
  if (!a) problems.push(`tokens.ts no declara "${tsKey}"`);
  else if (!b) problems.push(`theme.css no declara "--color-${cssKey}"`);
  else if (a !== b) problems.push(`"${tsKey}" es ${a} en tokens.ts pero ${b} en theme.css`);
}

if (problems.length) {
  console.error("Los tokens de marca no coinciden:\n" + problems.map((p) => "  - " + p).join("\n"));
  process.exit(1);
}

console.log(`Tokens de marca alineados (${expected.length} colores).`);
