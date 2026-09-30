/**
 * El contrato de la base de datos de ALTEC.
 *
 * Aqui viven los tipos y nada mas: ni cliente, ni llaves, ni consultas. Lo
 * importan tanto el servidor de `apps/web` como los scripts de administracion,
 * y ninguno de los dos deberia tener que adivinar la forma de una fila.
 *
 * El esquema real esta en `migrations/`. Si cambias una tabla alli, cambia el
 * tipo aqui: son el mismo contrato escrito dos veces, en SQL y en TypeScript.
 */

/** Que hay detras de la puerta. Coincide con el enum `altec_scope`. */
export const scopes = ["document", "camila", "memorandum"] as const;
export type Scope = (typeof scopes)[number];

export function isScope(value: string): value is Scope {
  return (scopes as readonly string[]).includes(value);
}

/** Una persona de la lista de invitados. */
export type Viewer = {
  id: string;
  email: string;
  full_name: string | null;
  organization: string | null;
  scopes: Scope[];
  invited_by: string | null;
  note: string | null;
  /** Con fecha, el acceso esta revocado. La fila se queda para el historial. */
  revoked_at: string | null;
  created_at: string;
};

/** Contenido confidencial: el Documento Maestro y el expediente de Camila. */
export type DocumentRow = {
  slug: string;
  title: string;
  body: string;
  scope: Scope;
  updated_at: string;
};

export type AccessAction = "open" | "denied";

/**
 * La firma del convenio de confidencialidad.
 *
 * `version` es el hash del texto aceptado. Un "acepto" solo vale contra el
 * texto que esa persona tuvo delante: si el convenio cambia, la aceptacion
 * anterior deja de contar y se vuelve a pedir.
 */
export type AcceptanceRow = {
  id: number;
  email: string;
  scope: Scope;
  version: string;
  signed_name: string;
  company: string | null;
  phone: string | null;
  ip: string | null;
  user_agent: string | null;
  accepted_at: string;
};

export type AccessLogRow = {
  id: number;
  email: string;
  scope: Scope;
  action: AccessAction;
  detail: string | null;
  at: string;
};

/** Las claves con las que se guarda cada contenido. */
export const CONTENT = {
  masterDocument: "documento-maestro",
  camilaDossier: "expediente-camila",
  memorandum: "memorandum",
  /** El convenio de confidencialidad que se firma antes de leer. */
  confidentiality: "convenio-confidencialidad",
} as const;

/**
 * El esquema, en la forma que espera `@supabase/supabase-js`.
 *
 * Con esto, `from("viewers").select()` sabe lo que devuelve y un nombre de
 * columna mal escrito no compila.
 */
export type Database = {
  public: {
    Tables: {
      viewers: {
        Row: Viewer;
        Insert: Omit<Viewer, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Viewer>;
        // Ninguna tabla tiene claves foraneas entre si: `Relationships` va
        // vacio, pero tiene que estar — supabase-js lo exige para poder tipar
        // los `select` con joins.
        Relationships: [];
      };
      documents: {
        Row: DocumentRow;
        Insert: Omit<DocumentRow, "updated_at"> & { updated_at?: string };
        Update: Partial<DocumentRow>;
        Relationships: [];
      };
      access_log: {
        Row: AccessLogRow;
        Insert: Omit<AccessLogRow, "id" | "at"> & { at?: string };
        Update: Partial<AccessLogRow>;
        Relationships: [];
      };
      acceptances: {
        Row: AcceptanceRow;
        Insert: Omit<AcceptanceRow, "id" | "accepted_at"> & { accepted_at?: string };
        Update: Partial<AcceptanceRow>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      has_scope: {
        Args: { target: Scope };
        Returns: boolean;
      };
    };
    Enums: {
      altec_scope: Scope;
    };
    CompositeTypes: Record<never, never>;
  };
};
