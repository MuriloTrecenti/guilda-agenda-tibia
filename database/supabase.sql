-- Supabase SQL Editor
-- Cria uma tabela simples para sincronizar o estado inteiro do app entre todos os usuarios autenticados.

create table if not exists public.guild_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.guild_state enable row level security;

drop policy if exists "guild_state_select" on public.guild_state;
drop policy if exists "guild_state_insert" on public.guild_state;
drop policy if exists "guild_state_update" on public.guild_state;

-- O app usa Supabase Auth. Apenas usuarios logados conseguem ler/gravar o estado compartilhado.
create policy "guild_state_select"
  on public.guild_state for select
  to authenticated
  using (true);

create policy "guild_state_insert"
  on public.guild_state for insert
  to authenticated
  with check (id = 'main');

create policy "guild_state_update"
  on public.guild_state for update
  to authenticated
  using (id = 'main')
  with check (id = 'main');

-- Opcional para realtime: no painel do Supabase, habilite Realtime para a tabela guild_state
-- em Database > Replication / Realtime, se disponivel no seu plano/painel.
