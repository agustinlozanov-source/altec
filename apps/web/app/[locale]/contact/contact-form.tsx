"use client";

import { useActionState } from "react";
import { Button, cn } from "@altec/ui";
import { inquiryTypes, type ContactState } from "@/lib/contact-schema";
import type { Dictionary } from "@/lib/i18n";
import { submitContact } from "./actions";

const initialState: ContactState = { status: "idle" };

const fieldClass =
  "w-full rounded-card border border-line bg-card px-4 py-3 text-sm " +
  "text-ink placeholder:text-muted focus:border-accent-ink focus:outline-none";

function Field({
  label,
  name,
  error,
  children,
  optional,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
  optional?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-ink text-sm">
        {label}
        {optional ? <span className="text-muted"> {optional}</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${name}-error`} role="alert" className="text-attention text-xs">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ContactForm({ dictionary }: { dictionary: Dictionary }) {
  const t = dictionary.contact.form;
  const [state, formAction, pending] = useActionState(submitContact, initialState);
  const keys = state.fieldErrors ?? {};

  /** Traduce la clave que devolvió el servidor. */
  const msg = (key?: string) =>
    key ? (t.errors[key as keyof typeof t.errors] as string | undefined) : undefined;

  if (state.status === "success") {
    return (
      <div role="status" className="border-accent-ink/40 bg-card rounded-card border p-8 text-center">
        <p className="font-display text-ink text-xl font-extrabold">{t.successTitle}</p>
        <p className="text-muted mt-2 text-sm">{t.successBody}</p>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div className="grid gap-5 md:grid-cols-2">
        <Field label={t.name} name="name" error={msg(keys.name)}>
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            aria-invalid={Boolean(keys.name)}
            className={fieldClass}
          />
        </Field>

        <Field label={t.company} name="company" error={msg(keys.company)}>
          <input
            id="company"
            name="company"
            required
            autoComplete="organization"
            aria-invalid={Boolean(keys.company)}
            className={fieldClass}
          />
        </Field>

        <Field label={t.email} name="email" error={msg(keys.email)}>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            aria-invalid={Boolean(keys.email)}
            className={fieldClass}
          />
        </Field>

        <Field label={t.phone} name="phone" error={msg(keys.phone)} optional={t.optional}>
          <input id="phone" name="phone" type="tel" autoComplete="tel" className={fieldClass} />
        </Field>
      </div>

      <Field label={t.inquiryType} name="inquiryType" error={msg(keys.inquiryType)}>
        <select
          id="inquiryType"
          name="inquiryType"
          required
          defaultValue=""
          aria-invalid={Boolean(keys.inquiryType)}
          className={cn(fieldClass, "appearance-none")}
        >
          <option value="" disabled>
            {t.choose}
          </option>
          {inquiryTypes.map((type) => (
            <option key={type} value={type}>
              {t.types[type]}
            </option>
          ))}
        </select>
      </Field>

      <Field label={t.message} name="message" error={msg(keys.message)}>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          aria-invalid={Boolean(keys.message)}
          className={cn(fieldClass, "resize-y")}
        />
      </Field>

      {state.status === "error" && state.errorKey ? (
        <p role="alert" className="text-attention text-sm">
          {t.errors[state.errorKey]}
          {state.errorKey === "send" ? " contacto@altec.mx." : null}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? t.sending : t.submit}
      </Button>
    </form>
  );
}
