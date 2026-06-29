# Deploy da Guilda Agenda • Tibia

Este app é estático: `index.html`, `app.js` e `catalogs.js`. Para o fluxo GitHub + Vercel, a raiz do repositório já está pronta para deploy.

## Fluxo recomendado: GitHub + Vercel

1. Acesse https://vercel.com/new
2. Escolha **Import Git Repository**.
3. Selecione `MuriloTrecenti/guilda-agenda-tibia`.
4. Framework Preset: **Other**.
5. Build Command: deixe vazio.
6. Output Directory: deixe vazio.
7. Deploy.

A Vercel vai servir o `index.html` da raiz.

## Como atualizar depois

Sempre que houver alterações:

```bash
git add .
git commit -m "Descreve a alteração"
git push
```

A Vercel detecta o push e publica uma nova versão automaticamente.

## Teste local

```bash
npm run check
npm run start
```

Depois abra:

```text
http://localhost:4173
```

## Sobre gestão de acessos

A versão atual tem um fluxo inicial de login/admin salvo no navegador. Ele serve para validar usabilidade, mas não é segurança real para produção porque o app ainda é estático e roda no cliente.

Para autenticação real antes de liberar para mais pessoas, use uma destas opções:

- Supabase Auth: recomendado para evoluir também para banco compartilhado de rotinas, drops e presença.
- Firebase Auth + Firestore.
- API própria no Vercel com banco externo.

Quando essa etapa for escolhida, o app deve parar de salvar usuários/senhas no `localStorage` e passar a autenticar no backend.
