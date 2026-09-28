-- ---------------------------------------------------------------------------
-- ALTEC — acceso a contenido confidencial
--
-- Tres tablas y una funcion:
--   viewers     quien puede ver que
--   documents   el contenido confidencial, fuera del repositorio
--   access_log  quien abrio que y cuando
--
-- El modelo es lista de invitados, no registro abierto: el Documento Oficial
-- del Holding dice en su primera linea que su distribucion esta restringida a
-- socios accionistas e inversionistas autorizados, asi que nadie se da de alta
-- solo. Las altas las hace scripts/invite.mjs con la llave de servicio.
-- ---------------------------------------------------------------------------

create extension if not exists pgcrypto;

-- Que hay detras de la puerta. Anadir un ambito nuevo es anadir un valor aqui.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'altec_scope') then
    create type altec_scope as enum ('document', 'camila');
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- Quien puede ver que
-- ---------------------------------------------------------------------------

create table if not exists public.viewers (
  id            uuid primary key default gen_random_uuid(),
  -- Siempre en minusculas: es la clave contra la que se compara el correo del
  -- token, y "Agustin@" y "agustin@" son la misma persona.
  email         text not null unique check (email = lower(email)),
  full_name     text,
  organization  text,
  scopes        altec_scope[] not null default '{}',
  invited_by    text,
  note          text,
  -- Revocar no borra: interesa saber que esa persona tuvo acceso y cuando
  -- dejo de tenerlo.
  revoked_at    timestamptz,
  created_at    timestamptz not null default now()
);

comment on table public.viewers is
  'Lista de invitados. Revocar se hace poniendo revoked_at, no borrando la fila.';

-- ---------------------------------------------------------------------------
-- El contenido confidencial
-- ---------------------------------------------------------------------------

create table if not exists public.documents (
  slug        text primary key,
  title       text not null,
  -- Markdown para el Documento Maestro; texto plano para el expediente que
  -- consume Camila. En los dos casos, el servidor lo lee y lo transforma.
  body        text not null,
  scope       altec_scope not null,
  updated_at  timestamptz not null default now()
);

comment on table public.documents is
  'Contenido confidencial. Vive aqui y no en el repositorio: el repositorio lo lee cualquiera con acceso al codigo, esto solo quien esta en viewers.';

-- ---------------------------------------------------------------------------
-- Bitacora
-- ---------------------------------------------------------------------------

create table if not exists public.access_log (
  id      bigint generated always as identity primary key,
  email   text not null,
  scope   altec_scope not null,
  -- 'open' abrio el contenido · 'denied' entro pero no tenia ese ambito
  action  text not null check (action in ('open', 'denied')),
  detail  text,
  at      timestamptz not null default now()
);

create index if not exists access_log_at_idx on public.access_log (at desc);
create index if not exists access_log_email_idx on public.access_log (email);

comment on table public.access_log is
  'Quien abrio que y cuando. Es lo que un inversionista espera poder preguntar.';

-- ---------------------------------------------------------------------------
-- La comprobacion de acceso
-- ---------------------------------------------------------------------------

-- `security definer` a proposito: la funcion tiene que poder leer `viewers`,
-- que esta cerrada a todo el mundo. Es la unica via por la que un usuario
-- normal toca esa tabla, y solo puede preguntar por si mismo — el correo sale
-- de su propio token, no de un parametro.
create or replace function public.has_scope(target altec_scope)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.viewers v
    where v.email = lower(coalesce(auth.jwt() ->> 'email', ''))
      and v.revoked_at is null
      and target = any(v.scopes)
  );
$$;

revoke all on function public.has_scope(altec_scope) from public;
grant execute on function public.has_scope(altec_scope) to authenticated;

-- ---------------------------------------------------------------------------
-- Politicas
--
-- Sin politica, RLS niega. Lo que no aparece aqui esta cerrado a cal y canto
-- para cualquiera que no use la llave de servicio, y la llave de servicio no
-- sale del servidor.
-- ---------------------------------------------------------------------------

alter table public.viewers    enable row level security;
alter table public.documents  enable row level security;
alter table public.access_log enable row level security;

-- `viewers` no lleva ninguna politica: la lista de invitados no la lee nadie
-- desde el cliente. Se administra con la llave de servicio.

drop policy if exists documents_read on public.documents;
create policy documents_read
  on public.documents
  for select
  to authenticated
  using (public.has_scope(scope));

-- Cada quien solo puede escribir su propia linea de bitacora, y solo anadir.
drop policy if exists access_log_insert_own on public.access_log;
create policy access_log_insert_own
  on public.access_log
  for insert
  to authenticated
  with check (email = lower(coalesce(auth.jwt() ->> 'email', '')));

-- Nadie lee la bitacora desde el cliente. Se consulta desde el panel.
