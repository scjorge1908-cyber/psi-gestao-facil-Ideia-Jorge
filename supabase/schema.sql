-- Psi Gestão Fácil – base SaaS inicial
create extension if not exists pgcrypto;

create table if not exists professionals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique,
  full_name text not null,
  crp text,
  email text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references professionals(id) on delete cascade,
  full_name text not null,
  social_name text,
  cpf text,
  birth_date date,
  phone text,
  email text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists patient_responsibles (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  full_name text not null,
  relationship text,
  cpf text,
  phone text,
  email text,
  is_legal_responsible boolean not null default false
);

create table if not exists fiscal_recipients (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  recipient_type text not null check (recipient_type in ('person','company')),
  full_name_or_company_name text not null,
  cpf_cnpj text,
  email text,
  address_json jsonb,
  is_default boolean not null default true
);

create table if not exists availability_rules (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references professionals(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  session_minutes integer not null default 50,
  interval_minutes integer not null default 10,
  active boolean not null default true
);

create table if not exists availability_exceptions (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references professionals(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  kind text not null check (kind in ('block','extra_opening')),
  reason text
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references professionals(id) on delete cascade,
  patient_id uuid references patients(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'scheduled',
  modality text,
  session_value numeric(12,2),
  notes_admin text,
  created_at timestamptz not null default now()
);

create index if not exists idx_patients_professional on patients(professional_id);
create index if not exists idx_appointments_professional_start on appointments(professional_id, starts_at);
create index if not exists idx_availability_professional on availability_rules(professional_id);
