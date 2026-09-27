"use client";

import { useActionState } from "react";
import { Button, cn } from "@altec/ui";
import { inquiryTypes, type ContactState } from "@/lib/contact-schema";
import { submitContact } from "./actions";

const initialState: ContactState = { status: "idle" };

const fieldClass =
  "w-full rounded-card border border-line bg-card px-4 py-3 text-sm " +
  "text-ink placeholder:text-muted focus:border-altec-green focus:outline-none";

function Field({
  label,
  name,
  error,
  children,
  optional = false,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-ink text-sm">
        {label}
        {optional ? <span className="text-muted"> (opcional)</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${name}-error`} role="alert" className="text-xs text-attention">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, initialState);
  const errors = state.fieldErrors ?? {};

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="border-altec-green/40 bg-altec-green/5 rounded-card border p-8 text-center"
      >
        <p className="font-display text-ink text-xl font-extrabold">
          Mensaje enviado.
        </p>
        <p className="text-muted mt-2 text-sm">
          Gracias por escribirnos. Te respondemos en breve.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      {/* Campo trampa para bots: invisible y fuera del orden de tabulacion. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Nombre" name="name" error={errors.name}>
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={fieldClass}
          />
        </Field>

        <Field label="Empresa" name="company" error={errors.company}>
          <input
            id="company"
            name="company"
            required
            autoComplete="organization"
            aria-invalid={Boolean(errors.company)}
            aria-describedby={errors.company ? "company-error" : undefined}
            className={fieldClass}
          />
        </Field>

        <Field label="Correo electrónico" name="email" error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={fieldClass}
          />
        </Field>

        <Field label="Teléfono" name="phone" error={errors.phone} optional>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className={fieldClass}
          />
        </Field>
      </div>

      <Field label="Tipo de consulta" name="inquiryType" error={errors.inquiryType}>
        <select
          id="inquiryType"
          name="inquiryType"
          required
          defaultValue=""
          aria-invalid={Boolean(errors.inquiryType)}
          aria-describedby={errors.inquiryType ? "inquiryType-error" : undefined}
          className={cn(fieldClass, "appearance-none")}
        >
          <option value="" disabled>
            Elige una opción
          </option>
          {inquiryTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Mensaje" name="message" error={errors.message}>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
          className={cn(fieldClass, "resize-y")}
        />
      </Field>

      {state.status === "error" && state.message ? (
        <p role="alert" className="text-sm text-attention">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Enviando…" : "Enviar mensaje"}
      </Button>
    </form>
  );
}
