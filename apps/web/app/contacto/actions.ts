"use server";

import { Resend } from "resend";
import { contactSchema, type ContactState } from "@/lib/contact-schema";
import { site } from "@/lib/site";

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    company: formData.get("company"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    inquiryType: formData.get("inquiryType"),
    message: formData.get("message"),
    website: formData.get("website"),
  });

  if (!parsed.success) {
    const fieldErrors: ContactState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !(key in fieldErrors)) {
        fieldErrors[key as keyof typeof fieldErrors] = issue.message;
      }
    }
    return { status: "error", message: "Revisa los campos marcados.", fieldErrors };
  }

  const data = parsed.data;

  // Campo trampa lleno: es un bot. Respondemos exito sin enviar nada.
  if (data.website) return { status: "success" };

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL ?? site.email;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !from) {
    console.error("[contacto] Falta RESEND_API_KEY o CONTACT_FROM_EMAIL.");
    return {
      status: "error",
      message: `No pudimos enviar el mensaje. Escríbenos directo a ${to}.`,
    };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: data.email,
      subject: `[${data.inquiryType}] ${data.name} — ${data.company}`,
      text: [
        `Nombre:   ${data.name}`,
        `Empresa:  ${data.company}`,
        `Correo:   ${data.email}`,
        `Teléfono: ${data.phone || "—"}`,
        `Tipo:     ${data.inquiryType}`,
        "",
        data.message,
      ].join("\n"),
    });

    if (error) {
      console.error("[contacto] Resend devolvió error:", error);
      return { status: "error", message: `No pudimos enviar el mensaje. Escríbenos a ${to}.` };
    }

    return { status: "success" };
  } catch (cause) {
    console.error("[contacto] Fallo al enviar:", cause);
    return { status: "error", message: `No pudimos enviar el mensaje. Escríbenos a ${to}.` };
  }
}
