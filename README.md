# Guilda Agenda • Tibia

App para montar rotinas semanais de Tibia e reaproveitar presets como **BOSSES DE ITEM**, **GT / GD**, semanas de hunt ou rotinas mistas.

## O que existe nesta versão

- Biblioteca de rotinas semanais salvas.
- Criação, edição, duplicação e exclusão de rotinas.
- Modo da rotina: recorrente para próximas semanas ou semana específica.
- Dias com boss, hunt, monstros/criaturas, locais de hunt, horário, refis e observações.
- Catálogo local gerado via TibiaData com bosses, criaturas e imagens oficiais.
- Participantes por rotina.
- Ausência com motivo obrigatório.
- Registro de drops, quem dropou e origem.
- Estatística simples de frequência de drops por rotina.
- Bostiary com contador por jogador e por boss usando botões `-` e `+`.
- Sincronização opcional via Supabase para todos verem as mesmas atualizações.

## Sincronização compartilhada

Para todos verem as mesmas alterações, configure o Supabase seguindo [SUPABASE.md](SUPABASE.md).

Sem Supabase configurado, o app continua funcionando em modo local no navegador.

## Deploy

O projeto está pronto para GitHub + Vercel. Importe o repositório na Vercel como projeto estático usando Framework Preset **Other**.

Mais detalhes em [DEPLOY.md](DEPLOY.md).
