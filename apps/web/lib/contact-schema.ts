import { z } from "zod";

/** Tipos de consulta del formulario (docs/WEB.md §4.5). */
export const inquiryTypes = [
  "Inversión",
  "Consultoría",
  "Alianza estratégica",
  "Prensa",
  "Otro",
] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre."),
  company: z.string().trim().min(2, "Escribe el nombre de tu empresa."),
  email: z.email("Revisa el correo electrónico."),
  phone: z.string().trim().max(30, "El teléfono es demasiado largo.").optional().or(z.literal("")),
  inquiryType: z.enum(inquiryTypes, { message: "Elige un tipo de consulta." }),
  message: z.string().trim().min(10, "Cuéntanos un poco más (mínimo 10 caracteres)."),
  // Campo trampa para bots: debe llegar vacio.
  website: z.string().max(0).optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof ContactInput, string>>;
};
