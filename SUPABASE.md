# Supabase

Este projeto usa Supabase para duas coisas:

1. **Auth**: login por e-mail e senha.
2. **Database**: sincronizacao do estado compartilhado da agenda na tabela `guild_state`.

## Criar usuarios

No painel do Supabase:

1. Abra o projeto.
2. Va em **Authentication > Users**.
3. Clique em **Add user**.
4. Informe e-mail e senha de cada pessoa.
5. Envie o e-mail e senha para o jogador.

Se o login nao funcionar por confirmacao de e-mail pendente, confira em **Authentication > Sign In / Providers > Email** se a confirmacao de e-mail esta adequada para o seu uso, ou crie usuarios ja confirmados pelo painel.

## Policies obrigatorias

Rode o SQL de `database/supabase.sql` no **SQL Editor** do Supabase. Ele deixa a tabela acessivel apenas para usuarios autenticados.

## Variaveis do frontend

O arquivo `supabase-config.js` contem:

- `url`: URL publica do projeto Supabase.
- `anonKey`: chave publica/publishable.

Nao coloque secret key/service role no frontend.
