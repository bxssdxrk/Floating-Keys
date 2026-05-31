(() => {
  'use strict';

  // ── Storage keys ──────────────────────────────────────────────────────────

  const SK = {
    POSITION:       'floatkeys_position',
    LAYOUT:         'floatkeys_active_layout',
    SIZE:           'floatkeys_size',
    RESIZE_ENABLED: 'floatkeys_resize_enabled',
    VISIBLE:        'floatkeys_visible',
    SPLIT_MODE:     'floatkeys_split_mode',
  };

  const DEFAULT_POSITION = { x: 20, y: 120 };
  const DEFAULT_SIZE     = { cellW: 44, cellH: 44 };
  const MIN_CELL         = 24;
  const MAX_CELL         = 140;

  const DEFAULT_LAYOUT = {
    id: 'default', name: 'Default', cols: 3,
    rows: [
      [ {keyId:'',colSpan:1,rowSpan:1}, {keyId:'ArrowUp',colSpan:1,rowSpan:1}, {keyId:'',colSpan:1,rowSpan:1} ],
      [ {keyId:'ArrowLeft',colSpan:1,rowSpan:1}, {keyId:'ArrowDown',colSpan:1,rowSpan:1}, {keyId:'ArrowRight',colSpan:1,rowSpan:1} ],
      [ {keyId:'Space',colSpan:3,rowSpan:1} ],
    ],
  };

  // ── Key definitions ────────────────────────────────────────────────────────

  const ARROW_SVG = {
    ArrowUp:    `<svg class="fk-arrow-icon" viewBox="0 0 24 24"><path d="M12 5l-7 7h4v7h6v-7h4z"/></svg>`,
    ArrowDown:  `<svg class="fk-arrow-icon" viewBox="0 0 24 24"><path d="M12 19l7-7h-4V5h-6v7H5z"/></svg>`,
    ArrowLeft:  `<svg class="fk-arrow-icon" viewBox="0 0 24 24"><path d="M5 12l7-7v4h7v6h-7v4z"/></svg>`,
    ArrowRight: `<svg class="fk-arrow-icon" viewBox="0 0 24 24"><path d="M19 12l-7 7v-4H5v-6h7V5z"/></svg>`,
  };

  const KEY_DEFS = {
    Escape:{key:'Escape',keyCode:27,code:'Escape',defaultLabel:'Esc'},
    F1:{key:'F1',keyCode:112,code:'F1',defaultLabel:'F1'},F2:{key:'F2',keyCode:113,code:'F2',defaultLabel:'F2'},
    F3:{key:'F3',keyCode:114,code:'F3',defaultLabel:'F3'},F4:{key:'F4',keyCode:115,code:'F4',defaultLabel:'F4'},
    F5:{key:'F5',keyCode:116,code:'F5',defaultLabel:'F5'},F6:{key:'F6',keyCode:117,code:'F6',defaultLabel:'F6'},
    F7:{key:'F7',keyCode:118,code:'F7',defaultLabel:'F7'},F8:{key:'F8',keyCode:119,code:'F8',defaultLabel:'F8'},
    F9:{key:'F9',keyCode:120,code:'F9',defaultLabel:'F9'},F10:{key:'F10',keyCode:121,code:'F10',defaultLabel:'F10'},
    F11:{key:'F11',keyCode:122,code:'F11',defaultLabel:'F11'},F12:{key:'F12',keyCode:123,code:'F12',defaultLabel:'F12'},
    PrintScreen:{key:'PrintScreen',keyCode:44,code:'PrintScreen',defaultLabel:'PrtSc'},
    ScrollLock:{key:'ScrollLock',keyCode:145,code:'ScrollLock',defaultLabel:'ScrLk'},
    Pause:{key:'Pause',keyCode:19,code:'Pause',defaultLabel:'Pause'},
    Backquote:{key:'`',keyCode:192,code:'Backquote',defaultLabel:'`'},
    Digit1:{key:'1',keyCode:49,code:'Digit1',defaultLabel:'1'},Digit2:{key:'2',keyCode:50,code:'Digit2',defaultLabel:'2'},
    Digit3:{key:'3',keyCode:51,code:'Digit3',defaultLabel:'3'},Digit4:{key:'4',keyCode:52,code:'Digit4',defaultLabel:'4'},
    Digit5:{key:'5',keyCode:53,code:'Digit5',defaultLabel:'5'},Digit6:{key:'6',keyCode:54,code:'Digit6',defaultLabel:'6'},
    Digit7:{key:'7',keyCode:55,code:'Digit7',defaultLabel:'7'},Digit8:{key:'8',keyCode:56,code:'Digit8',defaultLabel:'8'},
    Digit9:{key:'9',keyCode:57,code:'Digit9',defaultLabel:'9'},Digit0:{key:'0',keyCode:48,code:'Digit0',defaultLabel:'0'},
    Minus:{key:'-',keyCode:189,code:'Minus',defaultLabel:'-'},Equal:{key:'=',keyCode:187,code:'Equal',defaultLabel:'='},
    Backspace:{key:'Backspace',keyCode:8,code:'Backspace',defaultLabel:'⌫'},
    Tab:{key:'Tab',keyCode:9,code:'Tab',defaultLabel:'Tab'},
    KeyQ:{key:'q',keyCode:81,code:'KeyQ',defaultLabel:'Q'},KeyW:{key:'w',keyCode:87,code:'KeyW',defaultLabel:'W'},
    KeyE:{key:'e',keyCode:69,code:'KeyE',defaultLabel:'E'},KeyR:{key:'r',keyCode:82,code:'KeyR',defaultLabel:'R'},
    KeyT:{key:'t',keyCode:84,code:'KeyT',defaultLabel:'T'},KeyY:{key:'y',keyCode:89,code:'KeyY',defaultLabel:'Y'},
    KeyU:{key:'u',keyCode:85,code:'KeyU',defaultLabel:'U'},KeyI:{key:'i',keyCode:73,code:'KeyI',defaultLabel:'I'},
    KeyO:{key:'o',keyCode:79,code:'KeyO',defaultLabel:'O'},KeyP:{key:'p',keyCode:80,code:'KeyP',defaultLabel:'P'},
    BracketLeft:{key:'[',keyCode:219,code:'BracketLeft',defaultLabel:'['},
    BracketRight:{key:']',keyCode:221,code:'BracketRight',defaultLabel:']'},
    Backslash:{key:'\\',keyCode:220,code:'Backslash',defaultLabel:'\\'},
    CapsLock:{key:'CapsLock',keyCode:20,code:'CapsLock',defaultLabel:'Caps'},
    KeyA:{key:'a',keyCode:65,code:'KeyA',defaultLabel:'A'},KeyS:{key:'s',keyCode:83,code:'KeyS',defaultLabel:'S'},
    KeyD:{key:'d',keyCode:68,code:'KeyD',defaultLabel:'D'},KeyF:{key:'f',keyCode:70,code:'KeyF',defaultLabel:'F'},
    KeyG:{key:'g',keyCode:71,code:'KeyG',defaultLabel:'G'},KeyH:{key:'h',keyCode:72,code:'KeyH',defaultLabel:'H'},
    KeyJ:{key:'j',keyCode:74,code:'KeyJ',defaultLabel:'J'},KeyK:{key:'k',keyCode:75,code:'KeyK',defaultLabel:'K'},
    KeyL:{key:'l',keyCode:76,code:'KeyL',defaultLabel:'L'},
    Semicolon:{key:';',keyCode:186,code:'Semicolon',defaultLabel:';'},
    Quote:{key:"'",keyCode:222,code:'Quote',defaultLabel:"'"},
    Enter:{key:'Enter',keyCode:13,code:'Enter',defaultLabel:'Enter'},
    ShiftLeft:{key:'Shift',keyCode:16,code:'ShiftLeft',defaultLabel:'Shift'},
    KeyZ:{key:'z',keyCode:90,code:'KeyZ',defaultLabel:'Z'},KeyX:{key:'x',keyCode:88,code:'KeyX',defaultLabel:'X'},
    KeyC:{key:'c',keyCode:67,code:'KeyC',defaultLabel:'C'},KeyV:{key:'v',keyCode:86,code:'KeyV',defaultLabel:'V'},
    KeyB:{key:'b',keyCode:66,code:'KeyB',defaultLabel:'B'},KeyN:{key:'n',keyCode:78,code:'KeyN',defaultLabel:'N'},
    KeyM:{key:'m',keyCode:77,code:'KeyM',defaultLabel:'M'},
    Comma:{key:',',keyCode:188,code:'Comma',defaultLabel:','},
    Period:{key:'.',keyCode:190,code:'Period',defaultLabel:'.'},
    Slash:{key:'/',keyCode:191,code:'Slash',defaultLabel:'/'},
    ShiftRight:{key:'Shift',keyCode:16,code:'ShiftRight',defaultLabel:'Shift'},
    ControlLeft:{key:'Control',keyCode:17,code:'ControlLeft',defaultLabel:'Ctrl'},
    MetaLeft:{key:'Meta',keyCode:91,code:'MetaLeft',defaultLabel:'Win'},
    AltLeft:{key:'Alt',keyCode:18,code:'AltLeft',defaultLabel:'Alt'},
    Space:{key:' ',keyCode:32,code:'Space',defaultLabel:'Space'},
    AltRight:{key:'Alt',keyCode:18,code:'AltRight',defaultLabel:'AltGr'},
    MetaRight:{key:'Meta',keyCode:92,code:'MetaRight',defaultLabel:'Win'},
    ContextMenu:{key:'ContextMenu',keyCode:93,code:'ContextMenu',defaultLabel:'Menu'},
    ControlRight:{key:'Control',keyCode:17,code:'ControlRight',defaultLabel:'Ctrl'},
    Insert:{key:'Insert',keyCode:45,code:'Insert',defaultLabel:'Ins'},
    Home:{key:'Home',keyCode:36,code:'Home',defaultLabel:'Home'},
    PageUp:{key:'PageUp',keyCode:33,code:'PageUp',defaultLabel:'PgUp'},
    Delete:{key:'Delete',keyCode:46,code:'Delete',defaultLabel:'Del'},
    End:{key:'End',keyCode:35,code:'End',defaultLabel:'End'},
    PageDown:{key:'PageDown',keyCode:34,code:'PageDown',defaultLabel:'PgDn'},
    ArrowUp:{key:'ArrowUp',keyCode:38,code:'ArrowUp',defaultLabel:ARROW_SVG.ArrowUp},
    ArrowLeft:{key:'ArrowLeft',keyCode:37,code:'ArrowLeft',defaultLabel:ARROW_SVG.ArrowLeft},
    ArrowDown:{key:'ArrowDown',keyCode:40,code:'ArrowDown',defaultLabel:ARROW_SVG.ArrowDown},
    ArrowRight:{key:'ArrowRight',keyCode:39,code:'ArrowRight',defaultLabel:ARROW_SVG.ArrowRight},
    NumLock:{key:'NumLock',keyCode:144,code:'NumLock',defaultLabel:'Num'},
    Numpad0:{key:'0',keyCode:96,code:'Numpad0',defaultLabel:'N0'},
    Numpad1:{key:'1',keyCode:97,code:'Numpad1',defaultLabel:'N1'},Numpad2:{key:'2',keyCode:98,code:'Numpad2',defaultLabel:'N2'},
    Numpad3:{key:'3',keyCode:99,code:'Numpad3',defaultLabel:'N3'},Numpad4:{key:'4',keyCode:100,code:'Numpad4',defaultLabel:'N4'},
    Numpad5:{key:'5',keyCode:101,code:'Numpad5',defaultLabel:'N5'},Numpad6:{key:'6',keyCode:102,code:'Numpad6',defaultLabel:'N6'},
    Numpad7:{key:'7',keyCode:103,code:'Numpad7',defaultLabel:'N7'},Numpad8:{key:'8',keyCode:104,code:'Numpad8',defaultLabel:'N8'},
    Numpad9:{key:'9',keyCode:105,code:'Numpad9',defaultLabel:'N9'},
    NumpadAdd:{key:'+',keyCode:107,code:'NumpadAdd',defaultLabel:'N+'},
    NumpadSubtract:{key:'-',keyCode:109,code:'NumpadSubtract',defaultLabel:'N-'},
    NumpadMultiply:{key:'*',keyCode:106,code:'NumpadMultiply',defaultLabel:'N*'},
    NumpadDivide:{key:'/',keyCode:111,code:'NumpadDivide',defaultLabel:'N/'},
    NumpadDecimal:{key:'.',keyCode:110,code:'NumpadDecimal',defaultLabel:'N.'},
    NumpadEnter:{key:'Enter',keyCode:13,code:'NumpadEnter',defaultLabel:'N↵'},
  };

  // keyCode → first matching KEY_DEFS entry (for combo dispatch)
  const KEYCODE_TO_DEF = {};
  Object.values(KEY_DEFS).forEach(d => {
    if (!KEYCODE_TO_DEF[d.keyCode]) KEYCODE_TO_DEF[d.keyCode] = d;
  });

  // ── Guard ──────────────────────────────────────────────────────────────────

  if (document.getElementById('float-keys-root')) return;

  // ── Global State ───────────────────────────────────────────────────────────
  let isLocked = false;
  let isSplit = false;
  let mainWidgetRoot = null;
  let splitWidgetRoots = [];

  // ── Control Bar ────────────────────────────────────────────────────────────

  const controlBar = document.createElement('div');
  controlBar.id = 'float-keys-control-bar';
  controlBar.innerHTML = `
    <button class="fk-bar-btn" id="fk-btn-settings">Settings</button>
    <button class="fk-bar-btn" id="fk-btn-split">Split</button>
    <button class="fk-bar-btn" id="fk-btn-lock">Lock</button>
  `;
  document.documentElement.appendChild(controlBar);

  const lockBtn = controlBar.querySelector('#fk-btn-lock');
  lockBtn.addEventListener('click', () => {
    isLocked = !isLocked;
    lockBtn.classList.toggle('fk-locked', isLocked);
    lockBtn.textContent = isLocked ? 'Unlock' : 'Lock';
  });

  const splitBtn = controlBar.querySelector('#fk-btn-split');
  splitBtn.addEventListener('click', () => {
    toggleSplit();
  });

  function toggleSplit() {
      isSplit = !isSplit;
      chromeSet({ [SK.SPLIT_MODE]: isSplit });
      updateUIState();
  }

  function updateUIState() {
      if (isSplit) {
          mainWidgetRoot.style.display = 'none';
          currentLayout.rows.forEach((row, ri) => {
              row.forEach((cell, ci) => {
                  if(cell.keyId) {
                      const singleKeyLayout = {
                          id: `split-${ri}-${ci}`,
                          name: 'Split',
                          cols: 1,
                          rows: [[cell]]
                      };
                      const { root } = createWidget(() => singleKeyLayout, { x: 50 + (ci * 80), y: 100 + (ri * 80) });
                      splitWidgetRoots.push(root);
                  }
              });
          });
          splitBtn.textContent = 'Merge';
      } else {
          splitWidgetRoots.forEach(root => root.remove());
          splitWidgetRoots = [];
          mainWidgetRoot.style.display = '';
          splitBtn.textContent = 'Split';
      }
  }

  // ── DOM ────────────────────────────────────────────────────────────────────

  // ── Widget Instance Management ──────────────────────────────────────────────

  function setupWidget(root, widget, handle, gridEl, resizeHandle, getLayout, cellSize) {
    
    // Position
    function applyPosition(pos) {
      const maxX = window.innerWidth  - root.offsetWidth  - 8;
      const maxY = window.innerHeight - root.offsetHeight - 8;
      root.style.left = `${Math.max(8, Math.min(pos.x, maxX))}px`;
      root.style.top  = `${Math.max(8, Math.min(pos.y, maxY))}px`;
    }

    // Drag
    let dragging   = false;
    let dragOffset = { x: 0, y: 0 };
    const dragOverlay = document.createElement('div');
    dragOverlay.style.cssText = 'position:fixed;inset:0;z-index:2147483647;cursor:grabbing;background:transparent;user-select:none;';

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      dragOverlay.remove();
      widget.classList.add('fk-idle');
    }

    function initDrag(e) {
      if (isLocked || (e.type === 'mousedown' && e.button !== 0)) return;
      e.preventDefault();
      e.stopPropagation();
      dragging = true;
      const rect = root.getBoundingClientRect();
      const coords = getEventCoords(e);
      dragOffset = { x: coords.x - rect.left, y: coords.y - rect.top };
      widget.classList.remove('fk-idle');
      document.documentElement.appendChild(dragOverlay);
    }

    function handleDragMove(e) {
      if (!dragging) return;
      if (e.type === 'touchmove') e.preventDefault();
      const coords = getEventCoords(e);
      applyPosition({ x: coords.x - dragOffset.x, y: coords.y - dragOffset.y });
    }

    handle.addEventListener('mousedown', initDrag);
    handle.addEventListener('touchstart', initDrag, { passive: false });
    dragOverlay.addEventListener('mousemove', handleDragMove);
    dragOverlay.addEventListener('touchmove', handleDragMove, { passive: false });
    dragOverlay.addEventListener('mouseup', endDrag);
    dragOverlay.addEventListener('touchend', endDrag);
    dragOverlay.addEventListener('touchcancel', endDrag);

    // Resize
    let resizing    = false;
    let resizeStart = { x: 0, y: 0, cellW: 0, cellH: 0 };
    const resizeOverlay = document.createElement('div');
    resizeOverlay.style.cssText = 'position:fixed;inset:0;z-index:2147483647;cursor:se-resize;background:transparent;user-select:none;';

    function endResize() {
      if (!resizing) return;
      resizing = false;
      resizeOverlay.remove();
    }

    function initResize(e) {
      if (isLocked || !resizeEnabled || (e.type === 'mousedown' && e.button !== 0)) return;
      e.preventDefault();
      e.stopPropagation();
      resizing = true;
      const coords = getEventCoords(e);
      resizeStart = { x: coords.x, y: coords.y, cellW: cellSize.cellW, cellH: cellSize.cellH };
      document.documentElement.appendChild(resizeOverlay);
    }

    function handleResizeMove(e) {
      if (!resizing) return;
      if (e.type === 'touchmove') e.preventDefault();
      const coords = getEventCoords(e);
      const layout = getLayout();
      const cols = Math.max(1, layout.cols || 3);
      const rows = Math.max(1, layout.rows.length);
      const newW = Math.max(MIN_CELL, Math.min(MAX_CELL, resizeStart.cellW + Math.round((coords.x - resizeStart.x) / cols)));
      const newH = Math.max(MIN_CELL, Math.min(MAX_CELL, resizeStart.cellH + Math.round((coords.y - resizeStart.y) / rows)));
      if (newW !== cellSize.cellW || newH !== cellSize.cellH) {
        cellSize.cellW = newW;
        cellSize.cellH = newH;
        renderLayout(layout, gridEl, cellSize);
      }
    }

    resizeHandle.addEventListener('mousedown', initResize);
    resizeHandle.addEventListener('touchstart', initResize, { passive: false });
    resizeOverlay.addEventListener('mousemove', handleResizeMove);
    resizeOverlay.addEventListener('touchmove', handleResizeMove, { passive: false });
    resizeOverlay.addEventListener('mouseup', endResize);
    resizeOverlay.addEventListener('touchend', endResize);
    resizeOverlay.addEventListener('touchcancel', endResize);

    // Hover
    widget.addEventListener('mouseenter', () => widget.classList.remove('fk-idle'));
    widget.addEventListener('mouseleave', () => { if (!dragging && !resizing) widget.classList.add('fk-idle'); });
  }

  function createWidget(getLayout, position = DEFAULT_POSITION) {
    const root = document.createElement('div');
    root.id = 'float-keys-root';
    root.style.left = `${position.x}px`;
    root.style.top  = `${position.y}px`;
    root.innerHTML = `
      <div id="float-keys-widget" class="fk-idle">
        <div id="float-keys-handle">
          <span class="fk-handle-dot"></span><span class="fk-handle-dot"></span>
          <span class="fk-handle-dot"></span><span class="fk-handle-dot"></span>
          <span class="fk-handle-dot"></span><span class="fk-handle-dot"></span>
        </div>
        <div id="fk-grid"></div>
        <div id="fk-resize-handle">
          <svg viewBox="0 0 10 10">
            <path d="M2 9L9 2M5.5 9L9 9L9 5.5" stroke="rgba(255,255,255,0.5)"
                  stroke-width="1.5" fill="none" stroke-linecap="round"/>
          </svg>
        </div>
      </div>
    `;
    document.documentElement.appendChild(root);

    const widget       = root.querySelector('#float-keys-widget');
    const handle       = root.querySelector('#float-keys-handle');
    const gridEl       = root.querySelector('#fk-grid');
    const resizeHandle = root.querySelector('#fk-resize-handle');

    let cellSize = { ...DEFAULT_SIZE };
    renderLayout(getLayout(), gridEl, cellSize);
    
    setupWidget(root, widget, handle, gridEl, resizeHandle, getLayout, cellSize);

    return { root, widget, handle, gridEl, resizeHandle };
  }

  let currentLayout = DEFAULT_LAYOUT;
  const { root, widget, handle, gridEl, resizeHandle } = createWidget(() => currentLayout);
  mainWidgetRoot = root;

  // ── State ──────────────────────────────────────────────────────────────────

  let cellSize      = { ...DEFAULT_SIZE };
  let resizeEnabled = true;

  // ── Helpers ────────────────────────────────────────────────────────────────

  function chromeGet(keys) {
    return new Promise(resolve => {
      try { chrome.storage.local.get(keys, resolve); }
      catch (_) { resolve({}); }
    });
  }
  function chromeSet(obj) {
    try { chrome.storage.local.set(obj); } catch (_) {}
  }
  
  function getEventCoords(e) {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  // ── Position ───────────────────────────────────────────────────────────────

  function applyPosition(pos) {
    const maxX = window.innerWidth  - root.offsetWidth  - 8;
    const maxY = window.innerHeight - root.offsetHeight - 8;
    root.style.left = `${Math.max(8, Math.min(pos.x, maxX))}px`;
    root.style.top  = `${Math.max(8, Math.min(pos.y, maxY))}px`;
  }

  // ── Layout render ──────────────────────────────────────────────────────────

  function renderLayout(layout, gridEl, cellSize) {
    gridEl.innerHTML = '';

    const cols = layout.cols || 3;
    gridEl.style.gridTemplateColumns = `repeat(${cols}, ${cellSize.cellW}px)`;
    gridEl.style.gridAutoRows        = `${cellSize.cellH}px`;

    layout.rows.forEach((row, ri) => {
      let lastRealIdx = -1;
      for (let i = row.length - 1; i >= 0; i--) {
        if (row[i].keyId) { lastRealIdx = i; break; }
      }

      let gridCol = 1;

      row.forEach((cell, ci) => {
        const colSpan = cell.colSpan || 1;
        const rowSpan = cell.rowSpan || 1;

        if (!cell.keyId && ci > lastRealIdx) {
          gridCol += colSpan;
          return;
        }

        const btn = document.createElement('button');
        btn.style.gridColumn = `${gridCol} / span ${colSpan}`;
        btn.style.gridRow    = `${ri + 1} / span ${rowSpan}`;

        if (!cell.keyId) {
          btn.className = 'fk-key fk-key-empty';
          btn.setAttribute('tabindex', '-1');
          btn.setAttribute('aria-hidden', 'true');
        } else {
          btn.className = 'fk-key';
          btn.dataset.cellJson = JSON.stringify(cell);
          btn.setAttribute('aria-label', cell.displayName || cell.keyId);
          const def   = KEY_DEFS[cell.keyId];
          const label = cell.displayName || (def ? def.defaultLabel : cell.keyId);
          if (typeof label === 'string' && label.startsWith('<')) {
            btn.innerHTML = label;
          } else {
            btn.textContent = label;
          }
          attachKeyEvents(btn, cell);
        }

        gridEl.appendChild(btn);
        gridCol += colSpan;
      });
    });
  }

  // ── Key dispatch ───────────────────────────────────────────────────────────

  function dispatchKeyEvent(cell, type) {
    const def = KEY_DEFS[cell.keyId];
    if (!def) return;

    const combo    = Array.isArray(cell.combo) ? cell.combo : [];
    const ctrlKey  = combo.includes(17);
    const shiftKey = combo.includes(16);
    const altKey   = combo.includes(18);
    const metaKey  = combo.includes(91) || combo.includes(92);

    const target = (document.activeElement && document.activeElement !== document.body)
      ? document.activeElement
      : document.documentElement;

    if (type === 'keydown') {
      combo.forEach(kc => {
        const d = KEYCODE_TO_DEF[kc];
        target.dispatchEvent(new KeyboardEvent('keydown', {
          key: d?.key || '', code: d?.code || '', keyCode: kc, which: kc,
          bubbles: true, cancelable: true,
        }));
      });
    }

    target.dispatchEvent(new KeyboardEvent(type, {
      key: def.key, code: def.code, keyCode: def.keyCode, which: def.keyCode,
      ctrlKey, shiftKey, altKey, metaKey,
      bubbles: true, cancelable: true,
    }));

    if (type === 'keyup') {
      combo.slice().reverse().forEach(kc => {
        const d = KEYCODE_TO_DEF[kc];
        target.dispatchEvent(new KeyboardEvent('keyup', {
          key: d?.key || '', code: d?.code || '', keyCode: kc, which: kc,
          bubbles: true, cancelable: true,
        }));
      });
    }
  }

  // ── Key hold ───────────────────────────────────────────────────────────────

  const REPEAT_INITIAL_MS = 400;
  const REPEAT_RATE_MS    = 60;
  const activeKeys        = new Map();

  function startKey(btn, cell) {
    const uid = btn.dataset.cellJson;
    if (activeKeys.has(uid)) return;
    dispatchKeyEvent(cell, 'keydown');
    btn.classList.add('fk-pressed');
    const entry = { btn, cell, initialTimeoutId: null, intervalId: null };
    activeKeys.set(uid, entry);
    entry.initialTimeoutId = setTimeout(() => {
      entry.initialTimeoutId = null;
      entry.intervalId = setInterval(() => dispatchKeyEvent(cell, 'keydown'), REPEAT_RATE_MS);
    }, REPEAT_INITIAL_MS);
  }

  function stopKey(uid) {
    const entry = activeKeys.get(uid);
    if (!entry) return;
    if (entry.initialTimeoutId !== null) clearTimeout(entry.initialTimeoutId);
    if (entry.intervalId       !== null) clearInterval(entry.intervalId);
    entry.btn.classList.remove('fk-pressed');
    dispatchKeyEvent(entry.cell, 'keyup');
    activeKeys.delete(uid);
  }

  function stopAllKeys() { activeKeys.forEach((_, uid) => stopKey(uid)); }

  function attachKeyEvents(btn, cell) {
    btn.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      e.preventDefault();
      startKey(btn, cell);
    });
    btn.addEventListener('touchstart', e => {
      e.preventDefault();
      startKey(btn, cell);
    }, { passive: false });
    btn.addEventListener('touchend',    () => stopKey(btn.dataset.cellJson));
    btn.addEventListener('touchcancel', () => stopKey(btn.dataset.cellJson));
  }

  document.addEventListener('mouseup', stopAllKeys);
  window.addEventListener('blur', stopAllKeys);

  // ── Idle opacity ───────────────────────────────────────────────────────────

  // ── Messages & init ────────────────────────────────────────────────────────

  // ── Messages & init ────────────────────────────────────────────────────────

  function applySettings(result) {
    if (root) {
      root.style.display = result[SK.VISIBLE] !== false ? '' : 'none';
      if (result[SK.SIZE]) {
        cellSize.cellW = result[SK.SIZE].cellW ?? DEFAULT_SIZE.cellW;
        cellSize.cellH = result[SK.SIZE].cellH ?? DEFAULT_SIZE.cellH;
      }
      resizeEnabled = result[SK.RESIZE_ENABLED] !== false;
      resizeHandle.classList.toggle('fk-hidden', !resizeEnabled);
      
      currentLayout = result[SK.LAYOUT] ?? DEFAULT_LAYOUT;
      renderLayout(currentLayout, gridEl, cellSize);
      applyPosition(result[SK.POSITION] ?? DEFAULT_POSITION);
      
      isSplit = result[SK.SPLIT_MODE] ?? false;
      if (isSplit) {
          updateUIState();
      }
    }
  }

  try { chrome.storage.local.get(Object.values(SK), applySettings); }
  catch (_) { applySettings({}); }

  try {
    chrome.runtime.onMessage.addListener(msg => {
      if (!msg?.type || !root) return;
      switch (msg.type) {
        case 'SET_VISIBLE':
          root.style.display = msg.visible ? '' : 'none';
          break;
        case 'SET_LAYOUT':
          currentLayout = msg.layout;
          renderLayout(currentLayout, gridEl, cellSize);
          applyPosition({ x: root.getBoundingClientRect().left, y: root.getBoundingClientRect().top });
          if (isSplit) {
            // Re-run updateUIState to refresh the split widgets
            splitWidgetRoots.forEach(r => r.remove());
            splitWidgetRoots = [];
            updateUIState();
          }
          break;
        case 'SET_SIZE':
          cellSize = msg.size;
          renderLayout(currentLayout, gridEl, cellSize);
          break;
        case 'SET_RESIZE_ENABLED':
          resizeEnabled = msg.enabled;
          resizeHandle.classList.toggle('fk-hidden', !resizeEnabled);
          break;
      }
    });
  } catch (_) {}

})();
