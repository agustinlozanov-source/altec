import { z } from "zod";

/**
 * Validación del formulario (docs/WEB.md §4.5).
 *
 * El servidor devuelve CLAVES de error, no textos: quien conoce el idioma del
 * visitante es el cliente, y así no hay que pasarle el diccionario a la acción.
 */

export const inquiryTypes = ["investment", "consulting", "partnership", "press", "other"] as const;
export type InquiryType = (typeof inquiryTypes)[number];

export const contactSchema = z.object({
  name: z.string().trim().min(2, "name"),
  company: z.string().trim().min(2, "company"),
  email: z.email("email"),
  phone: z.string().trim().max(30, "phone").optional().or(z.literal("")),
  inquiryType: z.enum(inquiryTypes, { message: "inquiryType" }),
  message: z.string().trim().min(10, "message"),
  /** Campo trampa para bots: debe llegar vacío. */
  website: z.string().max(0).optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;

export type ContactErrorKey = "review" | "send";

export type ContactState = {
  status: "idle" | "success" | "error";
  /** Clave del mensaje general, no el texto. */
  errorKey?: ContactErrorKey;
  /** Claves por campo: { name: "name", email: "email" }. */
  fieldErrors?: Partial<Record<keyof ContactInput, string>>;
};
