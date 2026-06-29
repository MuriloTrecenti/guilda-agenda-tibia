# Guilda Agenda • Tibia

App estático para montar rotinas semanais de Tibia e reaproveitar presets como **BOSSES DE ITEM**, **GT / GD**, semanas de hunt ou rotinas mistas.

## O que existe nesta versão

- Biblioteca de rotinas semanais salvas.
- Criação, edição, duplicação e exclusão de rotinas.
- Modo da rotina: recorrente para próximas semanas ou semana específica.
- Dias com boss, hunt, monstros/criaturas, locais de hunt, horário, refis e observações.
- Catálogo local gerado via TibiaData com 109 bosses boostáveis e 697 criaturas com imagens oficiais.
- Lista inicial com 53 locais de hunt populares, além de inclusão manual.
- Participantes por rotina.
- Ausência com motivo obrigatório.
- Registro de drops, quem dropou e origem.
- Estatística simples de frequência de drops por rotina.
- Bostiary com contador por jogador e por boss usando botões `-` e `+`.
- Camada inicial de login/admin local para desenhar o fluxo de acesso.
- Compartilhamento por link com cópia do estado atual.

## Acesso

No primeiro acesso, o app pede a criação de um administrador local. O admin pode adicionar usuários e senhas temporárias no painel **Acessos**.

Importante: esta camada é local/provisória. Em um app estático, senha no navegador não é segurança real. Para publicar com controle de acesso confiável, o próximo passo é conectar autenticação com backend, como Supabase Auth, Firebase Auth ou API própria na Vercel.

## Deploy

O projeto está pronto para GitHub + Vercel. Importe o repositório na Vercel como projeto estático usando Framework Preset **Other**.

Mais detalhes em [DEPLOY.md](DEPLOY.md).
