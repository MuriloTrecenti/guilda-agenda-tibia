-- Supabase SQL Editor
-- Cria uma tabela simples para sincronizar o estado inteiro do app entre todos os usuários.

create table if not exists public.guild_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.guild_state enable row level security;

drop policy if exists "guild_state_select" on public.guild_state;
drop policy if exists "guild_state_insert" on public.guild_state;
drop policy if exists "guild_state_update" on public.guild_state;

-- Versão inicial: permite que o app publicado leia e grave o estado compartilhado usando a anon key.
-- Isso sincroniza os dados para todos rapidamente, mas ainda não é controle de acesso forte.
create policy "guild_state_select"
  on public.guild_state for select
  using (true);

create policy "guild_state_insert"
  on public.guild_state for insert
  with check (id = 'main');

create policy "guild_state_update"
  on public.guild_state for update
  using (id = 'main')
  with check (id = 'main');


-- Opcional para realtime: no painel do Supabase, habilite Realtime para a tabela guild_state
-- em Database > Replication / Realtime, se disponível no seu plano/painel.
