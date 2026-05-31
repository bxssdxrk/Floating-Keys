'use strict';

// ── Storage keys ───────────────────────────────────────────────────────────────

const SK = {
  POSITION:       'floatkeys_position',
  LAYOUT:         'floatkeys_active_layout',
  SIZE:           'floatkeys_size',
  RESIZE_ENABLED: 'floatkeys_resize_enabled',
  VISIBLE:        'floatkeys_visible',
  SAVED_LAYOUTS:  'floatkeys_saved_layouts',
  EDITOR_STATE:   'floatkeys_editor_state',
};

const DEFAULT_LAYOUT = {
  id: 'default', name: 'Default', cols: 3,
  rows: [
    [ {keyId:'',colSpan:1,rowSpan:1}, {keyId:'ArrowUp',colSpan:1,rowSpan:1}, {keyId:'',colSpan:1,rowSpan:1} ],
    [ {keyId:'ArrowLeft',colSpan:1,rowSpan:1}, {keyId:'ArrowDown',colSpan:1,rowSpan:1}, {keyId:'ArrowRight',colSpan:1,rowSpan:1} ],
    [ {keyId:'Space',colSpan:3,rowSpan:1} ],
  ],
};

// ── Full keyboard catalogue ────────────────────────────────────────────────────

const KEY_CATALOGUE = [
  { group: 'Function', keys: [
    {id:'Escape',label:'Esc'},{id:'F1',label:'F1'},{id:'F2',label:'F2'},{id:'F3',label:'F3'},
    {id:'F4',label:'F4'},{id:'F5',label:'F5'},{id:'F6',label:'F6'},{id:'F7',label:'F7'},
    {id:'F8',label:'F8'},{id:'F9',label:'F9'},{id:'F10',label:'F10'},{id:'F11',label:'F11'},
    {id:'F12',label:'F12'},{id:'PrintScreen',label:'PrtSc'},{id:'ScrollLock',label:'ScrLk'},{id:'Pause',label:'Pause'},
  ]},
  { group: 'Number row', keys: [
    {id:'Backquote',label:'`'},{id:'Digit1',label:'1'},{id:'Digit2',label:'2'},{id:'Digit3',label:'3'},
    {id:'Digit4',label:'4'},{id:'Digit5',label:'5'},{id:'Digit6',label:'6'},{id:'Digit7',label:'7'},
    {id:'Digit8',label:'8'},{id:'Digit9',label:'9'},{id:'Digit0',label:'0'},{id:'Minus',label:'-'},
    {id:'Equal',label:'='},{id:'Backspace',label:'⌫'},
  ]},
  { group: 'Top row', keys: [
    {id:'Tab',label:'Tab'},{id:'KeyQ',label:'Q'},{id:'KeyW',label:'W'},{id:'KeyE',label:'E'},
    {id:'KeyR',label:'R'},{id:'KeyT',label:'T'},{id:'KeyY',label:'Y'},{id:'KeyU',label:'U'},
    {id:'KeyI',label:'I'},{id:'KeyO',label:'O'},{id:'KeyP',label:'P'},{id:'BracketLeft',label:'['},
    {id:'BracketRight',label:']'},{id:'Backslash',label:'\\'},
  ]},
  { group: 'Home row', keys: [
    {id:'CapsLock',label:'Caps'},{id:'KeyA',label:'A'},{id:'KeyS',label:'S'},{id:'KeyD',label:'D'},
    {id:'KeyF',label:'F'},{id:'KeyG',label:'G'},{id:'KeyH',label:'H'},{id:'KeyJ',label:'J'},
    {id:'KeyK',label:'K'},{id:'KeyL',label:'L'},{id:'Semicolon',label:';'},{id:'Quote',label:"'"},
    {id:'Enter',label:'Enter'},
  ]},
  { group: 'Bottom row', keys: [
    {id:'ShiftLeft',label:'Shift'},{id:'KeyZ',label:'Z'},{id:'KeyX',label:'X'},{id:'KeyC',label:'C'},
    {id:'KeyV',label:'V'},{id:'KeyB',label:'B'},{id:'KeyN',label:'N'},{id:'KeyM',label:'M'},
    {id:'Comma',label:','},{id:'Period',label:'.'},{id:'Slash',label:'/'},{id:'ShiftRight',label:'Shift▸'},
  ]},
  { group: 'Modifiers & Space', keys: [
    {id:'ControlLeft',label:'Ctrl'},{id:'MetaLeft',label:'Win'},{id:'AltLeft',label:'Alt'},
    {id:'Space',label:'Space'},{id:'AltRight',label:'AltGr'},{id:'MetaRight',label:'Win▸'},
    {id:'ContextMenu',label:'Menu'},{id:'ControlRight',label:'Ctrl▸'},
  ]},
  { group: 'Navigation', keys: [
    {id:'Insert',label:'Ins'},{id:'Home',label:'Home'},{id:'PageUp',label:'PgUp'},
    {id:'Delete',label:'Del'},{id:'End',label:'End'},{id:'PageDown',label:'PgDn'},
    {id:'ArrowUp',label:'↑'},{id:'ArrowLeft',label:'←'},{id:'ArrowDown',label:'↓'},{id:'ArrowRight',label:'→'},
  ]},
  { group: 'Numpad', keys: [
    {id:'NumLock',label:'Num'},{id:'NumpadDivide',label:'N/'},{id:'NumpadMultiply',label:'N*'},{id:'NumpadSubtract',label:'N-'},
    {id:'Numpad7',label:'N7'},{id:'Numpad8',label:'N8'},{id:'Numpad9',label:'N9'},{id:'NumpadAdd',label:'N+'},
    {id:'Numpad4',label:'N4'},{id:'Numpad5',label:'N5'},{id:'Numpad6',label:'N6'},
    {id:'Numpad1',label:'N1'},{id:'Numpad2',label:'N2'},{id:'Numpad3',label:'N3'},{id:'NumpadEnter',label:'N↵'},
    {id:'Numpad0',label:'N0'},{id:'NumpadDecimal',label:'N.'},
  ]},
];

const KEY_LABEL = {};
KEY_CATALOGUE.forEach(g => g.keys.forEach(k => { KEY_LABEL[k.id] = k.label; }));

// ── Helpers ────────────────────────────────────────────────────────────────────

const chromeGet = keys => new Promise(res => chrome.storage.local.get(keys, res));
const chromeSet = obj  => chrome.storage.local.set(obj);

function saveEditorState() {
  chromeSet({ [SK.EDITOR_STATE]: { cols: edCols, rows: edData } });
}

function sendToTab(msg) {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs[0]?.id) chrome.tabs.sendMessage(tabs[0].id, msg).catch(() => {});
  });
}

let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
}

const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

// Parse a raw combo string like "17, 16, 67" → [17, 16, 67]
function parseCombo(raw) {
  if (!raw || !raw.trim()) return [];
  return raw.split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter(n => !isNaN(n) && n > 0 && n < 256);
}

// Format a combo array back to display string
function formatCombo(arr) {
  if (!arr || !arr.length) return '';
  return arr.join(', ');
}

// ── Tab navigation ─────────────────────────────────────────────────────────────

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
    if (tab.dataset.tab === 'layouts') renderSavedList();
  });
});

// ── Settings tab ───────────────────────────────────────────────────────────────

const tglVisible = document.getElementById('tgl-visible');
const tglResize  = document.getElementById('tgl-resize');

chromeGet([SK.VISIBLE, SK.RESIZE_ENABLED]).then(r => {
  tglVisible.checked = r[SK.VISIBLE] !== false;
  tglResize.checked  = r[SK.RESIZE_ENABLED] !== false;
});

tglVisible.addEventListener('change', () => {
  chromeSet({ [SK.VISIBLE]: tglVisible.checked });
  sendToTab({ type: 'SET_VISIBLE', visible: tglVisible.checked });
});

tglResize.addEventListener('change', () => {
  chromeSet({ [SK.RESIZE_ENABLED]: tglResize.checked });
  sendToTab({ type: 'SET_RESIZE_ENABLED', enabled: tglResize.checked });
});

document.getElementById('btn-reset').addEventListener('click', () => {
  activateLayout(DEFAULT_LAYOUT);
  toast('Reset to default');
});

// ── Layouts tab ────────────────────────────────────────────────────────────────

async function getSaved() {
  const r = await chromeGet([SK.SAVED_LAYOUTS, SK.LAYOUT]);
  return { saved: r[SK.SAVED_LAYOUTS] ?? [], active: r[SK.LAYOUT] ?? DEFAULT_LAYOUT };
}

async function renderSavedList() {
  const { saved, active } = await getSaved();
  const list = document.getElementById('saved-list');
  list.innerHTML = '';

  [DEFAULT_LAYOUT, ...saved].forEach(layout => {
    const isActive = layout.id === active.id;
    const item = document.createElement('div');
    item.className = `sitem${isActive ? ' active-layout' : ''}`;
    item.innerHTML = `
      <div>
        <div class="sitem-name">${esc(layout.name)}</div>
        <div class="sitem-info">${layout.cols} cols · ${layout.rows.length} rows</div>
      </div>
      <div class="sitem-acts">
        <button class="sitem-btn" data-a="edit" title="Load in editor">✏️</button>
        ${layout.id !== 'default' ? `<button class="sitem-btn del" data-a="del" title="Delete">🗑</button>` : ''}
      </div>`;

    item.addEventListener('click', e => {
      if (e.target.closest('[data-a]')) return;
      activateLayout(layout); toast(`Activated: ${layout.name}`); renderSavedList();
    });
    item.querySelector('[data-a="edit"]').addEventListener('click', () => {
      loadIntoEditor(layout);
      document.querySelector('[data-tab="editor"]').click();
    });
    item.querySelector('[data-a="del"]')?.addEventListener('click', async () => {
      const { saved: s } = await getSaved();
      chromeSet({ [SK.SAVED_LAYOUTS]: s.filter(l => l.id !== layout.id) });
      renderSavedList(); toast('Deleted');
    });
    list.appendChild(item);
  });
}

function activateLayout(layout) {
  chromeSet({ [SK.LAYOUT]: layout });
  sendToTab({ type: 'SET_LAYOUT', layout });
}

// ── Editor state ───────────────────────────────────────────────────────────────

let edCols = 3;
let edData = [
  [{keyId:'',colSpan:1,rowSpan:1},{keyId:'ArrowUp',colSpan:1,rowSpan:1},{keyId:'',colSpan:1,rowSpan:1}],
  [{keyId:'ArrowLeft',colSpan:1,rowSpan:1},{keyId:'ArrowDown',colSpan:1,rowSpan:1},{keyId:'ArrowRight',colSpan:1,rowSpan:1}],
];

function loadIntoEditor(layout) {
  edCols = layout.cols;
  edData = layout.rows.map(row => row.map(cell => ({ ...cell })));
  document.getElementById('ed-cols').value = edCols;
  document.getElementById('ed-rows').value = edData.length;
  const nameEl = document.getElementById('ed-name');
  nameEl.value = layout.name !== 'Default' ? layout.name : '';
  renderEditorGrid();
}

function applyGridSize() {
  const newCols = Math.max(1, Math.min(12, parseInt(document.getElementById('ed-cols').value, 10) || 3));
  const newRows = Math.max(1, Math.min(12, parseInt(document.getElementById('ed-rows').value, 10) || 2));
  edCols = newCols;
  while (edData.length < newRows) {
    edData.push(Array.from({ length: newCols }, () => ({ keyId:'', colSpan:1, rowSpan:1 })));
  }
  edData = edData.slice(0, newRows).map(row => {
    while (row.length < newCols) row.push({ keyId:'', colSpan:1, rowSpan:1 });
    return row.slice(0, newCols);
  });
  renderEditorGrid();
  saveEditorState();
}

document.getElementById('btn-ed-apply').addEventListener('click', applyGridSize);
['ed-cols','ed-rows'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', e => { if (e.key === 'Enter') applyGridSize(); });
});

// ── Editor grid render ─────────────────────────────────────────────────────────
//
// FIX: Use explicit grid-column + grid-row placement for each cell, mirroring
// the fix in content.js. This prevents CSS auto-placement from flowing cells
// from one logical row into leftover columns of the previous row.

function renderEditorGrid() {
  const grid = document.getElementById('editor-grid');
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = `repeat(${edCols}, 1fr)`;

  edData.forEach((row, ri) => {
    // Index of last cell in this row that has a real key
    let lastRealIdx = -1;
    for (let i = row.length - 1; i >= 0; i--) {
      if (row[i].keyId) { lastRealIdx = i; break; }
    }

    let gridCol = 1; // 1-based running column

    row.forEach((cell, ci) => {
      const colSpan = cell.colSpan || 1;
      const rowSpan = cell.rowSpan || 1;

      // Skip trailing empty cells (we render them as a single "+" below)
      if (!cell.keyId && ci > lastRealIdx) { gridCol += colSpan; return; }

      const el = document.createElement('div');
      // Explicit placement — the key fix
      el.style.gridColumn = `${gridCol} / span ${colSpan}`;
      el.style.gridRow    = `${ri + 1} / span ${rowSpan}`;
      el.className = `ec${cell.keyId ? ' has-key' : ''}`;
      el.dataset.ri = ri;
      el.dataset.ci = ci;

      if (cell.keyId) {
        el.textContent = cell.displayName || KEY_LABEL[cell.keyId] || cell.keyId;
        if (cell.combo?.length) {
          const b = document.createElement('span');
          b.className = 'ec-badge';
          b.textContent = cell.combo.join(', ');
          el.appendChild(b);
        }
        if (colSpan > 1 || rowSpan > 1) {
          const b = document.createElement('span');
          b.className = 'ec-badge-left';
          b.textContent = `${colSpan}\u00d7${rowSpan}`;
          el.appendChild(b);
        }
      } else {
        el.textContent = '+';
      }

      el.addEventListener('click', () => openCellModal(ri, ci));
      grid.appendChild(el);
      gridCol += colSpan;
    });

    // Render a single consolidated "+" for all trailing empty space in this row
    const usedCols = row
      .slice(0, lastRealIdx + 1)
      .reduce((s, c) => s + (c.colSpan || 1), 0);
    const remaining = edCols - usedCols;
    if (remaining > 0) {
      const addEl = document.createElement('div');
      addEl.className = 'ec';
      addEl.style.gridColumn = `${usedCols + 1} / span ${remaining}`;
      addEl.style.gridRow    = `${ri + 1}`;
      addEl.textContent = '+';
      addEl.addEventListener('click', () => {
        const firstEmpty = row.findIndex(c => !c.keyId);
        if (firstEmpty !== -1) openCellModal(ri, firstEmpty);
      });
      grid.appendChild(addEl);
    }
  });
}

// ── Save / Preview ─────────────────────────────────────────────────────────────

document.getElementById('btn-ed-save').addEventListener('click', async () => {
  const name = document.getElementById('ed-name').value.trim() || 'Untitled';
  const layout = {
    id: `layout_${Date.now()}`, name, cols: edCols,
    rows: edData.map(r => r.map(c => ({ ...c }))),
  };
  const { saved } = await getSaved();
  saved.push(layout);
  chromeSet({ [SK.SAVED_LAYOUTS]: saved });
  toast(`Saved: "${name}"`);
  document.getElementById('ed-name').value = '';
});

document.getElementById('btn-ed-preview').addEventListener('click', () => {
  activateLayout({
    id: `preview_${Date.now()}`, name: 'Preview', cols: edCols,
    rows: edData.map(r => r.map(c => ({ ...c }))),
  });
  toast('Previewing…');
});

// ── Cell modal ─────────────────────────────────────────────────────────────────

let modalCell  = null;
let pendingKey = '';
let pendingCombo = [];

const modal      = document.getElementById('cell-modal');
const kpSearch   = document.getElementById('kp-search');
const kpGroups   = document.getElementById('kp-groups');
const comboInput = document.getElementById('combo-input');
const cellDisp   = document.getElementById('cell-display');
const cellCS     = document.getElementById('cell-colspan');
const cellRS     = document.getElementById('cell-rowspan');

function openCellModal(ri, ci) {
  modalCell    = { ri, ci };
  const cell   = edData[ri][ci];
  pendingKey   = cell.keyId || '';
  pendingCombo = cell.combo ? [...cell.combo] : [];

  comboInput.value = formatCombo(pendingCombo);
  cellDisp.value   = cell.displayName || '';
  cellCS.value     = cell.colSpan  || 1;
  cellRS.value     = cell.rowSpan  || 1;

  kpSearch.value = '';
  buildKeyPicker('');
  modal.classList.add('open');

  // Focus search after a tick so the modal is visible
  setTimeout(() => kpSearch.focus(), 50);
}

function closeModal() {
  modal.classList.remove('open');
  modalCell = null;
}

function buildKeyPicker(filter) {
  kpGroups.innerHTML = '';
  const f = filter.toLowerCase();
  KEY_CATALOGUE.forEach(group => {
    const keys = f
      ? group.keys.filter(k => k.label.toLowerCase().includes(f) || k.id.toLowerCase().includes(f))
      : group.keys;
    if (!keys.length) return;

    const div = document.createElement('div');
    div.className = 'kp-group';
    div.innerHTML = `<div class="kp-group-label">${esc(group.group)}</div><div class="kp-keys"></div>`;
    const keysEl = div.querySelector('.kp-keys');

    keys.forEach(k => {
      const btn = document.createElement('button');
      btn.className = `kp-key${pendingKey === k.id ? ' selected' : ''}`;
      btn.textContent = k.label;
      btn.dataset.kid = k.id;
      btn.addEventListener('mousedown', e => e.preventDefault()); // keep modal focus
      btn.addEventListener('click', () => {
        pendingKey = k.id;
        buildKeyPicker(kpSearch.value);
      });
      keysEl.appendChild(btn);
    });
    kpGroups.appendChild(div);
  });
}

kpSearch.addEventListener('input', () => buildKeyPicker(kpSearch.value));

// Validate combo input on blur: keep only valid numbers
comboInput.addEventListener('blur', () => {
  const parsed = parseCombo(comboInput.value);
  comboInput.value = formatCombo(parsed);
});

// Clear cell
document.getElementById('btn-cell-clear').addEventListener('click', () => {
  if (!modalCell) return;
  const { ri, ci } = modalCell;
  edData[ri][ci] = {
    keyId: '', colSpan: parseInt(cellCS.value,10)||1, rowSpan: parseInt(cellRS.value,10)||1,
  };
  renderEditorGrid();
  saveEditorState();
  closeModal();
});

document.getElementById('btn-cell-cancel').addEventListener('click', closeModal);

document.getElementById('btn-cell-ok').addEventListener('click', () => {
  if (!modalCell) return;
  const { ri, ci } = modalCell;
  const combo = parseCombo(comboInput.value);

  edData[ri][ci] = {
    keyId:       pendingKey || '',
    combo:       combo.length ? combo : undefined,
    displayName: cellDisp.value.trim() || undefined,
    colSpan:     Math.max(1, parseInt(cellCS.value,  10) || 1),
    rowSpan:     Math.max(1, parseInt(cellRS.value, 10) || 1),
  };
  renderEditorGrid();
  saveEditorState();
  closeModal();
});

// Close on backdrop click
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

// ── Init ──────────────────────────────────────────────────────────────────────

chromeGet([SK.EDITOR_STATE]).then(r => {
  if (r[SK.EDITOR_STATE]) {
    edCols = r[SK.EDITOR_STATE].cols;
    edData = r[SK.EDITOR_STATE].rows;
    document.getElementById('ed-cols').value = edCols;
    document.getElementById('ed-rows').value = edData.length;
  }
  renderEditorGrid();
});
