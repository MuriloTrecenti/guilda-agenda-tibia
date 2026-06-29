# Configuração do Supabase

A versão online precisa de um banco central para todos verem as mesmas alterações.

## Passo a passo

1. Crie um projeto em https://supabase.com
2. Abra **SQL Editor**.
3. Rode o conteúdo de `database/supabase.sql`.
4. Vá em **Project Settings > API**.
5. Copie:
   - Project URL
   - anon public key
6. No projeto, crie um arquivo `supabase-config.js` baseado em `supabase-config.example.js`:

```js
window.SUPABASE_CONFIG = {
  url: 'https://SEU-PROJETO.supabase.co',
  anonKey: 'SUA_ANON_PUBLIC_KEY'
};
```

7. Faça commit e push.
8. A Vercel publica automaticamente.

## Segurança

Esta primeira integração sincroniza os dados, mas ainda usa uma política ampla para leitura/escrita do estado compartilhado. É boa para colocar o grupo funcionando rapidamente.

A etapa seguinte recomendada é trocar o login local por Supabase Auth e restringir as policies por usuário autenticado.
