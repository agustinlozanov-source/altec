-- ---------------------------------------------------------------------------
-- Aceptacion de confidencialidad
--
-- Antes de ver el Memorandum, quien entra lee el convenio y lo acepta. Queda
-- registrado quien fue, cuando y que version del texto acepto.
--
-- La version importa: un "acepto" solo vale contra el texto que esa persona
-- tuvo delante. Si el convenio cambia, la aceptacion anterior deja de servir y
-- se vuelve a pedir — por eso la clave unica incluye la version y no solo el
-- correo.
-- ---------------------------------------------------------------------------

create table if not exists public.acceptances (
  id          bigint generated always as identity primary key,
  email       text not null,
  scope       altec_scope not null,
  /** Hash del texto que se acepto. Cambia el texto, cambia la version. */
  version     text not null,
  /** Nombre que la persona escribio al aceptar. Es la firma. */
  signed_name text not null,
  /** Los demas datos que pide el bloque "Datos del Receptor" del convenio. */
  company     text,
  phone       text,
  /** La clausula 12(f) se compromete a conservarla. Por eso esta aqui. */
  ip          text,
  user_agent  text,
  accepted_at timestamptz not null default now()
);

create unique index if not exists acceptances_unique
  on public.acceptances (email, scope, version);

create index if not exists acceptances_at_idx on public.acceptances (accepted_at desc);

comment on table public.acceptances is
  'Quien acepto el convenio de confidencialidad, cuando y contra que version del texto.';

alter table public.acceptances enable row level security;

-- Cada quien firma por si mismo y solo puede anadir.
drop policy if exists acceptances_insert_own on public.acceptances;
create policy acceptances_insert_own
  on public.acceptances
  for insert
  to authenticated
  with check (email = lower(coalesce(auth.jwt() ->> 'email', '')));

-- Y puede ver lo que el mismo firmo — es lo que hace falta para saber si ya
-- acepto. Lo de los demas no lo ve nadie desde el cliente.
drop policy if exists acceptances_read_own on public.acceptances;
create policy acceptances_read_own
  on public.acceptances
  for select
  to authenticated
  using (email = lower(coalesce(auth.jwt() ->> 'email', '')));
