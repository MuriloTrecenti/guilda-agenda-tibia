# Deploy da Guilda Agenda • Tibia

Este app é estático: `index.html`, `app.js` e `catalogs.js`. Para o fluxo GitHub + Vercel, a raiz do repositório já está pronta para deploy.

## Fluxo recomendado: GitHub + Vercel

### 1. Criar repositório no GitHub

Crie um repositório no GitHub, por exemplo:

```text
guilda-agenda-tibia
```

Pode ser privado ou público. Privado é uma boa escolha enquanto vocês ainda estão ajustando o app.

### 2. Conectar este projeto ao GitHub

Depois de criar o repositório vazio, rode na raiz deste projeto:

```bash
git remote add origin https://github.com/SEU_USUARIO/guilda-agenda-tibia.git
git push -u origin main
```

### 3. Importar na Vercel

1. Acesse https://vercel.com/new
2. Escolha **Import Git Repository**.
3. Selecione `guilda-agenda-tibia`.
4. Framework Preset: **Other**.
5. Build Command: deixe vazio.
6. Output Directory: deixe vazio.
7. Deploy.

A Vercel vai servir o `index.html` da raiz.

## Como atualizar depois

Sempre que eu fizer alterações aqui:

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

## Observação importante

O app ainda salva dados no navegador via `localStorage` e compartilha uma cópia pelo link. Para várias pessoas editarem a mesma agenda em tempo real, o próximo passo é adicionar backend, como Supabase ou Firebase.
