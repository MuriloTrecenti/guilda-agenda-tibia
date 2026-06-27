# Guilda Agenda • Tibia

App estático para montar rotinas semanais de Tibia e reaproveitar presets como **BOSSES DE ITEM**, **GT / GD**, semanas de hunt ou rotinas mistas.

## O que existe nesta versão

- Biblioteca de rotinas semanais salvas.
- Seleção de rotina ativa da semana.
- Dias com boss, hunt, monstros/criaturas, locais de hunt, horário, refis e observações.
- Catálogo local gerado via TibiaData com 109 bosses boostáveis e 697 criaturas com imagens oficiais.
- Lista inicial com 53 locais de hunt populares, além de inclusão manual.
- Participantes por rotina.
- Ausência com motivo obrigatório.
- Registro de drops, quem dropou e origem.
- Estatística simples de frequência de drops por rotina.
- Bostiary com contador por jogador e por boss usando botões `-` e `+`.
- Compartilhamento por link com cópia do estado atual.

## Como usar

1. Abra `index.html` no navegador.
2. Selecione ou crie uma rotina no menu lateral.
3. Edite cada dia da semana e escolha bosses, criaturas e locais de hunt.
4. Defina participantes da rotina.
5. Registre ausências, drops e bostiary ao longo das semanas.
6. Clique em **Compartilhar** para gerar um link com uma cópia da agenda.

## Deploy

O projeto está pronto para GitHub + Vercel. Importe o repositório na Vercel como projeto estático usando Framework Preset **Other**.

Mais detalhes em [DEPLOY.md](DEPLOY.md).

## Observações

- Os dados ficam salvos no navegador via `localStorage`.
- O link compartilhado carrega uma cópia da agenda; ele não sincroniza em tempo real entre todos.
- Para edição simultânea por várias pessoas, o próximo passo é conectar o app a um backend como Supabase ou Firebase.
- O TibiaWiki bloqueou coleta automatizada via Cloudflare, então o catálogo principal foi gerado via API pública TibiaData/Tibia.com.
