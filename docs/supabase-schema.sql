-- 1. CATEGORÍAS (lista fija, la misma para todos)
create table public.categories (
  id   bigint generated always as identity primary key,
  name text not null unique,
  kind text not null check (kind in ('ingreso', 'gasto')),
  unique (id, kind)
);

insert into public.categories (name, kind) values
  ('Nómina', 'ingreso'),
  ('Otros ingresos', 'ingreso'),
  ('Comida', 'gasto'),
  ('Transporte', 'gasto'),
  ('Vivienda', 'gasto'),
  ('Ocio', 'gasto'),
  ('Salud', 'gasto'),
  ('Otros gastos', 'gasto');

-- 2. MOVIMIENTOS (ingresos y gastos de cada usuario)
create table public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid()
              references auth.users (id) on delete cascade,
  type        text not null check (type in ('ingreso', 'gasto')),
  category_id bigint not null,
  amount      numeric(12,2) not null check (amount > 0),
  description text,
  occurred_on date not null default current_date,
  created_at  timestamptz not null default now(),
  foreign key (category_id, type)
    references public.categories (id, kind)
);

create index transactions_user_date_idx
  on public.transactions (user_id, occurred_on desc);

-- 3. SEGURIDAD: categorías (solo lectura para usuarios con sesión)
alter table public.categories enable row level security;
revoke all on table public.categories from anon, authenticated;
grant select on table public.categories to authenticated;

create policy "Usuarios con sesión pueden leer categorías"
  on public.categories for select
  to authenticated
  using (true);

-- 4. SEGURIDAD: movimientos (cada usuario solo ve y toca los suyos)
alter table public.transactions enable row level security;
revoke all on table public.transactions from anon, authenticated;
grant select, insert, delete on table public.transactions to authenticated;

create policy "Ver mis movimientos"
  on public.transactions for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Crear mis movimientos"
  on public.transactions for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Borrar mis movimientos"
  on public.transactions for delete
  to authenticated
  using ((select auth.uid()) = user_id);
