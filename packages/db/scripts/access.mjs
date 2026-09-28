#!/usr/bin/env node
/**
 * Administra quien puede ver que.
 *
 *   pnpm --filter @altec/db access grant  correo@x.com document,camila "Nombre" "Empresa"
 *   pnpm --filter @altec/db access revoke correo@x.com
 *   pnpm --filter @altec/db access list
 *   pnpm --filter @altec/db access log [n]
 *
 * Da de alta la cuenta ademas de la fila: el inicio de sesion usa
 * `shouldCreateUser: false`, asi que quien no exista aqui no recibe enlace
 * aunque escriba su correo en el formulario. Es lo que evita que la puerta
 * sirva para mandar correos a cualquiera.
 */
import { admin, die } from "./lib.mjs";

const SCOPES = ["document", "camila"];
const [command, ...args] = process.argv.slice(2);
const supabase = admin();

const email = (value) => String(value ?? "").trim().toLowerCase();

switch (command) {
  case "grant": {
    const who = email(args[0]);
    if (!who.includes("@")) die("Uso: access grant <correo> <ambitos> [nombre] [organizacion]");

    const scopes = String(args[1] ?? "document")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const unknown = scopes.filter((s) => !SCOPES.includes(s));
    if (unknown.length) die(`Ámbitos desconocidos: ${unknown.join(", ")}. Válidos: ${SCOPES.join(", ")}`);

    // La cuenta primero. `email_confirm` evita el correo de confirmacion: el
    // enlace de acceso lo pide la persona cuando entra, no ahora.
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email: who,
      email_confirm: true,
    });

    if (createError && !/already been registered|already exists/i.test(createError.message)) {
      die(`No se pudo crear la cuenta: ${createError.message}`);
    }
    if (created?.user) console.log(`  cuenta creada`);
    else console.log(`  la cuenta ya existía`);

    const { error } = await supabase
      .from("viewers")
      .upsert(
        {
          email: who,
          scopes,
          full_name: args[2] ?? null,
          organization: args[3] ?? null,
          invited_by: process.env.USER ?? null,
          revoked_at: null,
        },
        { onConflict: "email" },
      );

    if (error) die(`No se pudo guardar el acceso: ${error.message}`);
    console.log(`✓ ${who} → ${scopes.join(", ")}`);
    console.log(`  Dile que entre en /acceso y pida su enlace.`);
    break;
  }

  case "link": {
    const who = email(args[0]);
    if (!who.includes("@")) die("Uso: access link <correo> [ruta]");

    const next = args[1] ?? "/document";
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    // Genera el enlace sin mandar correo. Sirve para dos cosas: probar sin
    // depender del proveedor de correo, y dar acceso a alguien en una reunion
    // sin esperar a que le llegue nada.
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: who,
    });

    if (error) die(`No se pudo generar el enlace: ${error.message}`);

    // Se apunta a NUESTRO callback con el token, no al `action_link` que
    // devuelve Supabase.
    //
    // Ese `action_link` pasa por /auth/v1/verify, que usa el flujo implicito y
    // devuelve la sesion en el fragmento de la URL — despues del `#`. El
    // navegador no manda el fragmento al servidor, asi que un callback que
    // corre en el servidor no puede verla, y el enlace parece caducado aunque
    // la sesion se haya creado. Con el token en la query, `verifyOtp` la monta
    // del lado del servidor y las cookies quedan puestas.
    const url = new URL(`${site}/auth/callback`);
    url.searchParams.set("token_hash", data.properties.hashed_token);
    url.searchParams.set("type", "magiclink");
    url.searchParams.set("next", next);

    console.log(`Enlace para ${who} — caduca en una hora y solo sirve una vez:\n`);
    console.log(url.toString());
    console.log(`\nTrátalo como una contraseña: quien lo tenga, entra.`);
    break;
  }

  case "revoke": {
    const who = email(args[0]);
    if (!who.includes("@")) die("Uso: access revoke <correo>");

    // Se marca, no se borra: interesa saber que tuvo acceso y hasta cuando.
    const { error, count } = await supabase
      .from("viewers")
      .update({ revoked_at: new Date().toISOString() }, { count: "exact" })
      .eq("email", who);

    if (error) die(`No se pudo revocar: ${error.message}`);
    if (!count) die(`${who} no está en la lista.`);
    console.log(`✓ Acceso revocado para ${who}`);
    console.log(`  Su sesión abierta caduca en menos de una hora.`);
    break;
  }

  case "list": {
    const { data, error } = await supabase
      .from("viewers")
      .select("email, full_name, organization, scopes, revoked_at, created_at")
      .order("created_at", { ascending: true });

    if (error) die(`No se pudo leer la lista: ${error.message}`);
    if (!data.length) {
      console.log("La lista está vacía. Empieza con: access grant <correo> document");
      break;
    }

    for (const v of data) {
      const state = v.revoked_at ? "REVOCADO" : v.scopes.join(", ");
      const who = [v.full_name, v.organization].filter(Boolean).join(" · ");
      console.log(`${v.revoked_at ? "✗" : "✓"} ${v.email.padEnd(34)} ${state}${who ? `   (${who})` : ""}`);
    }
    break;
  }

  case "log": {
    const limit = Number(args[0] ?? 30);
    const { data, error } = await supabase
      .from("access_log")
      .select("at, email, scope, action")
      .order("at", { ascending: false })
      .limit(Number.isFinite(limit) ? limit : 30);

    if (error) die(`No se pudo leer la bitácora: ${error.message}`);
    if (!data.length) {
      console.log("Todavía no hay accesos registrados.");
      break;
    }

    for (const row of data) {
      const when = new Date(row.at).toLocaleString("es-MX");
      const mark = row.action === "open" ? "·" : "✗";
      console.log(`${mark} ${when.padEnd(22)} ${row.email.padEnd(34)} ${row.scope}`);
    }
    break;
  }

  default:
    console.log(
      [
        "Administra el acceso al contenido confidencial.",
        "",
        "  access grant  <correo> <ambitos> [nombre] [organizacion]",
        "  access link   <correo> [ruta]     enlace de entrada, sin mandar correo",
        "  access revoke <correo>",
        "  access list",
        "  access log [n]",
        "",
        `Ámbitos: ${SCOPES.join(", ")}`,
      ].join("\n"),
    );
}
