const DAYS = ['Domingo','Segunda-feira','Terca-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sabado'];
const C = window.TIBIA_CATALOGS || {};
const BOSSES = C.bosses || [
  { name: 'Grand Master Oberon', image_url: 'https://static.tibia.com/images/library/grandmasteroberon.gif' },
  { name: 'Scarlett Etzel', image_url: 'https://static.tibia.com/images/library/scarlettetzelstill.gif' },
  { name: 'Drume', image_url: 'https://static.tibia.com/images/library/drume.gif' }
];
const CREATURES = C.creatures || [
  { name: 'Adult Goannas', image_url: 'https://static.tibia.com/images/library/adultgoanna.gif' },
  { name: 'Young Goannas', image_url: 'https://static.tibia.com/images/library/younggoanna.gif' }
];
const HUNTS = C.hunts || ['Goannas - Cobra Bastion','Gnomprona','Nagas - Marapur','Cobras - Cobra Bastion'];
const $ = id => document.getElementById(id);
const uid = () => crypto.randomUUID?.() || String(Date.now() + Math.random());

let day = new Date().getDay();
let editingTemplate = null;
let editingDay = null;
let pickerMode = 'bosses';
let draft = { bosses: [], monsters: [], locations: [] };
let tempBestiary = {};
let supa = null;
let cloudReady = false;
let applyingRemote = false;
let saveTimer = null;
let lastCloudJson = '';

const img = (type, name) => {
  const list = type === 'bosses' ? BOSSES : CREATURES;
  return (list.find(x => x.name === name) || {}).image_url || '';
};

const makeDays = mode => DAYS.map((_, i) => {
  if (mode === 'gt') {
    return {
      kind: i ? 'Bosses' : 'Livre',
      title: i ? 'GT/GD em party' : 'Descanso / ajuste',
      time: '20:45',
      desc: i ? 'Rodada fixa de bosses em equipe.' : 'Dia aberto para combinar reposicao.',
      bosses: i ? ['The Time Guardian','The Last Lore Keeper','Lady Tenebris'] : [],
      monsters: [],
      locations: i ? ['Ferumbras Ascendant Seals'] : ['A definir'],
      hunt: i ? 'GT/GD em party' : 'A definir',
      refills: 0,
      notes: 'Checar acesso e cooldown antes de sair'
    };
  }
  if (i === 1) {
    return {
      kind: 'Misto',
      title: 'Bosses + Goannas',
      time: '20:30',
      desc: 'Limpar bosses de item e fechar com uma hunt curta.',
      bosses: ['Grand Master Oberon','Scarlett Etzel','Drume'],
      monsters: ['Adult Goannas','Young Goannas'],
      locations: ['Goannas - Cobra Bastion'],
      hunt: 'Goannas - Cobra Bastion',
      refills: 1,
      notes: 'Supplies para 1h; imbuements prontos'
    };
  }
  return {
    kind: i % 2 ? 'Bosses' : 'Livre',
    title: i % 2 ? 'Rodada de bosses' : 'Noite livre',
    time: '21:00',
    desc: 'Ajustar conforme a party online.',
    bosses: i % 2 ? ['Grand Master Oberon','Scarlett Etzel'] : [],
    monsters: [],
    locations: ['A definir'],
    hunt: 'A definir',
    refills: 0,
    notes: 'Pode ser alterado antes da call'
  };
});

const defaults = {
  version: 6,
  players: [],
  current: '',
  activeTemplateId: 'rotina_inicial',
  templates: [
    {
      id: 'rotina_inicial',
      mode: 'recorrente',
      name: 'Nova rotina',
      description: 'Configure a rotina da semana.',
      participants: [],
      days: DAYS.map(() => ({
        kind: 'Livre',
        title: 'A definir',
        time: '21:00',
        desc: '',
        bosses: [],
        monsters: [],
        locations: [],
        hunt: 'A definir',
        refills: 0,
        notes: ''
      }))
    }
  ],
  attendance: {},
  drops: [],
  bestiary: {}
};

const clone = obj => structuredClone ? structuredClone(obj) : JSON.parse(JSON.stringify(obj));

function normalizeDay(d = {}) {
  return {
    kind: d.kind || 'Misto',
    title: d.title || 'A definir',
    time: d.time || '21:00',
    desc: d.desc || '',
    bosses: Array.isArray(d.bosses) ? d.bosses : [],
    monsters: Array.isArray(d.monsters) ? d.monsters : [],
    locations: Array.isArray(d.locations) ? d.locations : (d.hunt ? [d.hunt] : []),
    hunt: d.hunt || 'A definir',
    refills: Number(d.refills || 0),
    notes: d.notes || ''
  };
}

function normalizeTemplate(t = {}) {
  return {
    id: t.id || uid(),
    mode: t.mode || 'recorrente',
    name: t.name || 'Nova rotina',
    description: t.description || '',
    participants: Array.isArray(t.participants) ? t.participants : [],
    days: (t.days || makeDays('boss')).map(normalizeDay)
  };
}

function migrate(data) {
  if (!data || typeof data !== 'object') return null;
  const migrated = {
    ...clone(defaults),
    ...data,
    version: 6,
    players: Array.isArray(data.players) && data.players.length ? data.players : defaults.players,
    templates: Array.isArray(data.templates) && data.templates.length ? data.templates.map(normalizeTemplate) : clone(defaults.templates),
    attendance: data.attendance && typeof data.attendance === 'object' ? data.attendance : {},
    drops: Array.isArray(data.drops) ? data.drops : [],
    bestiary: data.bestiary && typeof data.bestiary === 'object' ? data.bestiary : {}
  };
  if (!migrated.templates.some(t => t.id === migrated.activeTemplateId)) migrated.activeTemplateId = migrated.templates[0].id;
  if (!migrated.players.includes(migrated.current)) migrated.current = migrated.players[0] || '';
  return migrated;
}

function loadLocal() {
  try {
    const encoded = new URLSearchParams(location.hash.slice(1)).get('agenda');
    if (encoded) {
      history.replaceState(0, '', location.pathname);
      return migrate(JSON.parse(decodeURIComponent(escape(atob(encoded)))));
    }
    return migrate(JSON.parse(localStorage.guildAgendaV5 || localStorage.guildAgendaV3 || 'null'));
  } catch {
    return null;
  }
}

let state = loadLocal() || clone(defaults);

function save() {
  state = migrate(state) || clone(defaults);
  localStorage.guildAgendaV5 = JSON.stringify(state);
  if (cloudReady && !applyingRemote) scheduleCloudSave();
}

function modeLabel(t) { return (t.mode || 'recorrente') === 'especifica' ? 'SEMANA ESPECIFICA' : 'ROTINA RECORRENTE'; }
function active() { return state.templates.find(t => t.id === state.activeTemplateId) || state.templates[0]; }
function plan() { const t = active(); t.days[day] = normalizeDay(t.days[day]); return t.days[day]; }
function key(player = state.current) { return `${active().id}:${day}:${player}`; }
function toast(msg) { $('toast').textContent = msg; $('toast').classList.add('show'); setTimeout(() => $('toast').classList.remove('show'), 2300); }
function setSync(text, kind = 'warn') { const el = $('syncStatus'); if (el) { el.textContent = text; el.className = 'sync ' + kind; } }

function chips(arr, type) {
  if (!arr.length) return '<span class="sub">Nada selecionado.</span>';
  return arr.map(x => {
    const src = img(type, x);
    return `<div class="boss">${src ? `<img src="${src}" onerror="this.style.display='none'">` : ''}<b>${x}</b></div>`;
  }).join('');
}

function render() {
  state = migrate(state) || clone(defaults);
  const t = active();
  const p = plan();
  $('nav').innerHTML = DAYS.map((d, i) => `<button class="${i === day ? 'active' : ''}" onclick="day=${i};render()">${d}<small>${normalizeDay(t.days[i]).kind}</small></button>`).join('');
  $('templateSelect').innerHTML = state.templates.map(x => `<option value="${x.id}" ${x.id === t.id ? 'selected' : ''}>${x.name}</option>`).join('');
  $('player').innerHTML = state.players.length ? state.players.map(x => `<option ${x === state.current ? 'selected' : ''}>${x}</option>`).join('') : '<option>Sem jogadores</option>';
  $('routineName').textContent = t.name;
  $('routineDesc').textContent = t.description;
  $('routineMode').textContent = modeLabel(t);
  $('day').textContent = DAYS[day];
  $('title').textContent = p.title;
  $('kind').textContent = p.kind;
  $('time').textContent = 'Horario: ' + p.time;
  $('desc').textContent = p.desc || 'Sem descricao.';
  $('bossCount').textContent = ` - ${p.bosses.length} alvo(s)`;
  $('monsterCount').textContent = ` - ${p.monsters.length} criatura(s)`;
  $('bossList').innerHTML = chips(p.bosses, 'bosses');
  $('monsterList').innerHTML = chips(p.monsters, 'monsters');
  $('locationList').innerHTML = p.locations.length ? p.locations.map(x => `<span class="huntchip">${x}</span>`).join('') : '<span class="sub">Nenhum local selecionado.</span>';
  $('hunt').textContent = p.hunt || p.locations[0] || 'A definir';
  $('notes').textContent = p.notes || 'Sem observacoes';
  $('refills').textContent = p.refills || 0;
  $('next').textContent = DAYS[day] + ' - ' + p.time;
  $('nextName').textContent = t.name;
  const absence = state.attendance[key()];
  $('notice').hidden = !absence;
  $('notice').textContent = absence ? `Sua ausencia esta registrada: "${absence.reason}"` : '';
  $('members').innerHTML = t.participants.map(x => {
    const a = state.attendance[`${t.id}:${day}:${x}`];
    return `<div class="member"><div class="avatar">${x.slice(0,2).toUpperCase()}</div><div><b>${x}</b><small>${a ? a.reason : 'Confirmado na rotina'}</small></div><span class="status ${a ? 'no' : ''}">${a ? 'NAO VAI' : 'VAI'}</span></div>`;
  }).join('') || '<p class="sub">Nenhum participante definido.</p>';
  renderDrops();
  renderBestiary();
  renderStats();
}

function renderDrops() {
  const t = active();
  const drops = state.drops.filter(d => d.templateId === t.id);
  $('drops').innerHTML = drops.length ? drops.slice().reverse().map(d => `<div class="drop"><b>${d.item}</b><span>${DAYS[d.day]} - ${d.by} - ${d.source || 'origem nao informada'}</span><small>${new Date(d.date).toLocaleDateString('pt-BR')}${d.note ? ' - ' + d.note : ''}</small></div>`).join('') : '<p class="sub">Nenhum drop registrado nessa rotina ainda.</p>';
}

function routineBosses() { return [...new Set(active().days.flatMap(d => normalizeDay(d).bosses))]; }
function getBestiary() { const raw = state.bestiary[active().id] || {}; return Object.values(raw)[0] && typeof Object.values(raw)[0] === 'object' ? raw : {}; }
function renderBestiary() {
  const map = getBestiary();
  const bosses = routineBosses();
  $('bestiary').innerHTML = active().participants.map(p => `<div class="bestiary"><b>${p}</b><span>${bosses.length ? bosses.map(b => `${b}: ${(map[p] || {})[b] || 0}`).join(' | ') : 'Adicione bosses na rotina para contar.'}</span></div>`).join('') || '<p class="sub">Defina participantes para registrar o bostiary.</p>';
}
function renderStats() {
  const t = active();
  const drops = state.drops.filter(d => d.templateId === t.id);
  const runs = t.days.filter(d => normalizeDay(d).kind !== 'Livre').length || 1;
  const items = {};
  drops.forEach(d => items[d.item] = (items[d.item] || 0) + 1);
  $('stats').innerHTML = `<b>${drops.length}</b><span>drops registrados</span><b>${(drops.length / runs).toFixed(2)}</b><span>drops por dia ativo da rotina</span><small>${Object.entries(items).map(([k,v]) => `${k}: ${v}`).join(' | ') || 'Sem itens para medir frequencia ainda.'}</small>`;
}

function wireEvents() {
  $('templateSelect').onchange = e => { state.activeTemplateId = e.target.value; save(); render(); toast('Rotina selecionada'); };
  $('player').onchange = e => { state.current = e.target.value; save(); render(); };
  $('share').onclick = async () => {
    const u = location.origin + location.pathname + '#agenda=' + btoa(unescape(encodeURIComponent(JSON.stringify(state))));
    try { await navigator.clipboard.writeText(u); toast('Link copiado'); } catch { prompt('Copie o link:', u); }
  };
  $('newTemplate').onclick = () => openTemplate();
  $('editTemplate').onclick = () => openTemplate(active());
  $('duplicateTemplate').onclick = () => { const base = clone(active()); base.id = uid(); base.name += ' - copia'; state.templates.push(base); state.activeTemplateId = base.id; save(); render(); toast('Rotina duplicada'); };
  $('deleteTemplate').onclick = deleteActiveTemplate;
  if ($('deleteTemplateTop')) $('deleteTemplateTop').onclick = deleteActiveTemplate;
  $('edit').onclick = openDayEditor;
  $('chooseBosses').onclick = () => openPicker('bosses');
  $('chooseMonsters').onclick = () => openPicker('monsters');
  $('chooseLocations').onclick = () => openPicker('locations');
  $('pickerSearch').oninput = renderPicker;
  $('addEntity').onclick = () => { const x = $('manualEntity').value.trim(); if (x && !draft[pickerMode].includes(x)) draft[pickerMode].push(x); $('manualEntity').value = ''; renderPicker(); renderDraft(); };
  $('confirmPicker').onclick = () => $('pickerDlg').close();
  $('absent').onclick = () => { $('reason').value = state.attendance[key()]?.reason || ''; $('absenceDlg').showModal(); };
  $('manage').onclick = openMembers;
  $('addPlayer').onclick = () => { state.players.push('Novo jogador'); $('membersDlg').close(); openMembers(); };
  $('addDrop').onclick = openDrop;
  $('editBestiary').onclick = openBestiary;
  $('access').onclick = () => toast('Acesso real sera feito na proxima etapa com Supabase Auth.');
  $('logout').onclick = () => toast('Login local removido neste deploy limpo.');
}

function openTemplate(t) {
  editingTemplate = t || null;
  $('tplTitle').textContent = t ? 'Editar rotina salva' : 'Criar rotina salva';
  $('tplName').value = t?.name || 'Nova rotina';
  $('tplDesc').value = t?.description || '';
  $('tplMode').value = t?.mode || 'recorrente';
  $('tplParticipants').value = (t?.participants || state.players).join(', ');
  $('templateDlg').showModal();
}
$('templateForm').onsubmit = e => {
  e.preventDefault();
  const participants = $('tplParticipants').value.split(',').map(x => x.trim()).filter(Boolean);
  if (editingTemplate) {
    editingTemplate.name = $('tplName').value.trim();
    editingTemplate.description = $('tplDesc').value.trim();
    editingTemplate.mode = $('tplMode').value;
    editingTemplate.participants = participants;
  } else {
    const base = clone(active());
    base.id = uid();
    base.name = $('tplName').value.trim();
    base.description = $('tplDesc').value.trim();
    base.mode = $('tplMode').value;
    base.participants = participants;
    state.templates.push(base);
    state.activeTemplateId = base.id;
  }
  save(); render(); $('templateDlg').close(); toast('Rotina salva');
};
async function deleteActiveTemplate() {
  const t = active();
  if (state.templates.length <= 1) return toast('Mantenha ao menos uma rotina');
  if (!confirm(`Excluir a rotina "${t.name}" para todos?`)) return;
  state.templates = state.templates.filter(x => x.id !== t.id);
  delete state.bestiary[t.id];
  state.drops = state.drops.filter(d => d.templateId !== t.id);
  Object.keys(state.attendance).filter(k => k.startsWith(t.id + ':')).forEach(k => delete state.attendance[k]);
  state.activeTemplateId = state.templates[0].id;
  save(); render(); toast('Rotina excluida');
  if (cloudReady) await pushCloud(true);
}

function openDayEditor() {
  const p = plan();
  editingDay = day;
  draft = { bosses: [...p.bosses], monsters: [...p.monsters], locations: [...p.locations] };
  $('fKind').value = p.kind; $('fTitle').value = p.title; $('fTime').value = p.time; $('fDesc').value = p.desc; $('fHunt').value = p.hunt; $('fNotes').value = p.notes; $('fRefills').value = p.refills;
  renderDraft(); $('routineDlg').showModal();
}
function renderDraft() {
  $('draftBosses').innerHTML = draft.bosses.map(x => `<span class="chip">${x}</span>`).join('') || '<span class="chip">Nenhum</span>';
  $('draftMonsters').innerHTML = draft.monsters.map(x => `<span class="chip">${x}</span>`).join('') || '<span class="chip">Nenhum</span>';
  $('draftLocations').innerHTML = draft.locations.map(x => `<span class="chip">${x}</span>`).join('') || '<span class="chip">Nenhum</span>';
}
$('routineForm').onsubmit = e => {
  e.preventDefault();
  active().days[editingDay] = { kind: $('fKind').value, title: $('fTitle').value, time: $('fTime').value, desc: $('fDesc').value, hunt: $('fHunt').value || draft.locations[0] || 'A definir', notes: $('fNotes').value, refills: +$('fRefills').value, bosses: [...draft.bosses], monsters: [...draft.monsters], locations: [...draft.locations] };
  save(); render(); $('routineDlg').close(); toast('Dia salvo');
};

function listForMode() { return pickerMode === 'bosses' ? BOSSES : pickerMode === 'monsters' ? CREATURES : HUNTS.map(name => ({ name })); }
function openPicker(mode) { pickerMode = mode; $('pickerTitle').textContent = mode === 'bosses' ? 'Escolha os bosses' : mode === 'monsters' ? 'Escolha monstros/criaturas' : 'Escolha locais de hunt'; $('pickerSearch').value = ''; renderPicker(); $('pickerDlg').showModal(); }
function renderPicker() {
  const q = $('pickerSearch').value.toLowerCase();
  const selected = draft[pickerMode];
  $('pickerCount').textContent = selected.length + ' selecionado(s)';
  $('pickerCatalog').innerHTML = listForMode().filter(x => x.name.toLowerCase().includes(q)).slice(0,260).map(x => `<button class="option ${selected.includes(x.name) ? 'on' : ''}" onclick="toggleEntity('${x.name.replaceAll("'", "\\'")}')">${x.image_url ? `<img src="${x.image_url}" onerror="this.style.opacity='.15'">` : ''}<b>${x.name}</b></button>`).join('');
}
window.toggleEntity = name => { const arr = draft[pickerMode]; draft[pickerMode] = arr.includes(name) ? arr.filter(x => x !== name) : [...arr, name]; renderPicker(); renderDraft(); };

$('absenceForm').onsubmit = e => { e.preventDefault(); state.attendance[key()] = { reason: $('reason').value.trim() }; save(); render(); $('absenceDlg').close(); toast('Ausencia registrada'); };
function openMembers() { $('editor').innerHTML = state.players.map((x,i) => `<div class="manual"><input value="${x}"><button class="btn red" type="button" onclick="state.players.splice(${i},1);openMembers()">x</button></div>`).join(''); $('membersDlg').showModal(); }
$('membersForm').onsubmit = e => { e.preventDefault(); state.players = [...$('editor').querySelectorAll('input')].map(x => x.value.trim()).filter(Boolean); if (!state.players.includes(state.current)) state.current = state.players[0] || ''; active().participants = active().participants.filter(x => state.players.includes(x)); save(); render(); $('membersDlg').close(); toast('Grupo atualizado'); };
function openDrop() { $('dropBy').innerHTML = active().participants.length ? active().participants.map(x => `<option>${x}</option>`).join('') : '<option>Sem participante</option>'; $('dropSource').value = plan().bosses[0] || plan().locations[0] || plan().hunt || ''; $('dropItem').value = ''; $('dropNote').value = ''; $('dropDlg').showModal(); }
$('dropForm').onsubmit = e => { e.preventDefault(); state.drops.push({ id: uid(), date: new Date().toISOString(), templateId: active().id, day, item: $('dropItem').value.trim(), by: $('dropBy').value, source: $('dropSource').value.trim(), note: $('dropNote').value.trim() }); save(); render(); $('dropDlg').close(); toast('Drop registrado'); };
function openBestiary() { tempBestiary = clone(getBestiary()); const bosses = routineBosses(); $('bestiaryEditor').innerHTML = bosses.length ? active().participants.map(p => `<div class="bestiaryBlock"><h3>${p}</h3>${bosses.map(b => { const v = (tempBestiary[p] || {})[b] || 0; return `<div class="counter"><span>${b}</span><button type="button" onclick="bestiaryInc('${p.replaceAll("'", "\\'")}','${b.replaceAll("'", "\\'")}',-1)">-</button><output>${v}</output><button type="button" onclick="bestiaryInc('${p.replaceAll("'", "\\'")}','${b.replaceAll("'", "\\'")}',1)">+</button></div>`; }).join('')}</div>`).join('') : '<p class="sub">Adicione bosses nos dias da rotina para contar bostiary.</p>'; $('bestiaryDlg').showModal(); }
window.bestiaryInc = (p,b,delta) => { tempBestiary[p] = tempBestiary[p] || {}; tempBestiary[p][b] = Math.max(0, (tempBestiary[p][b] || 0) + delta); [...bestiaryEditor.querySelectorAll('.bestiaryBlock')].forEach(block => { if (block.querySelector('h3')?.textContent !== p) return; [...block.querySelectorAll('.counter')].forEach(row => { if (row.children[0].textContent === b) row.querySelector('output').textContent = tempBestiary[p][b]; }); }); };
$('bestiaryForm').onsubmit = e => { e.preventDefault(); state.bestiary[active().id] = tempBestiary; save(); render(); $('bestiaryDlg').close(); toast('Bostiary salvo'); };

function cloudConfig() { return window.SUPABASE_CONFIG || {}; }
function cloudEnabled() { const cfg = cloudConfig(); return !!(cfg.url && cfg.anonKey && window.supabase); }
async function initCloud() {
  if (!cloudEnabled()) { cloudReady = false; setSync('local', 'warn'); render(); return; }
  try {
    const cfg = cloudConfig();
    supa = window.supabase.createClient(cfg.url, cfg.anonKey);
    setSync('sincronizando', 'warn');
    const { data, error } = await supa.from('guild_state').select('data,updated_at').eq('id','main').maybeSingle();
    if (error) throw error;
    if (data && data.data && data.data.templates) {
      applyingRemote = true; state = migrate(data.data) || clone(defaults); localStorage.guildAgendaV5 = JSON.stringify(state); applyingRemote = false; lastCloudJson = JSON.stringify(state);
    } else {
      applyingRemote = true; state = clone(defaults); localStorage.guildAgendaV5 = JSON.stringify(state); applyingRemote = false; await pushCloud(true);
    }
    cloudReady = true; setSync('online', 'ok'); render();
    if (supa.channel) supa.channel('guild-state').on('postgres_changes', { event: '*', schema: 'public', table: 'guild_state', filter: 'id=eq.main' }, () => pullCloud()).subscribe();
    setInterval(() => pullCloud(), 5000);
    window.addEventListener('focus', () => pullCloud());
  } catch (e) { console.error(e); cloudReady = false; setSync('erro sync', 'warn'); toast('Erro ao conectar no Supabase'); render(); }
}
async function pullCloud() {
  if (!supa || applyingRemote) return;
  const { data, error } = await supa.from('guild_state').select('data,updated_at').eq('id','main').maybeSingle();
  if (error || !data?.data?.templates) { if (error) console.error(error); return setSync('erro sync', 'warn'); }
  const remote = migrate(data.data) || clone(defaults);
  const json = JSON.stringify(remote);
  if (json !== lastCloudJson && json !== JSON.stringify(state)) {
    applyingRemote = true; state = remote; localStorage.guildAgendaV5 = json; applyingRemote = false; lastCloudJson = json; render(); toast('Agenda atualizada');
  }
  setSync('online', 'ok');
}
function scheduleCloudSave() { clearTimeout(saveTimer); saveTimer = setTimeout(() => pushCloud(false), 450); }
async function pushCloud(force = false) {
  if (!supa) return;
  state = migrate(state) || clone(defaults);
  const json = JSON.stringify(state);
  if (!force && json === lastCloudJson) return;
  setSync('salvando', 'warn');
  const { error } = await supa.from('guild_state').upsert({ id: 'main', data: state, updated_at: new Date().toISOString() });
  if (error) { console.error(error); setSync('erro sync', 'warn'); toast('Erro ao sincronizar'); return; }
  lastCloudJson = json; setSync('online', 'ok');
}

wireEvents();
render();
initCloud();
