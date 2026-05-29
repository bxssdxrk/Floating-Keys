(() => {
  'use strict';

  const STORAGE_KEY = 'floatkeys_position';
  const DEFAULT_POSITION = { x: 20, y: 120 };

  // --- Prevent duplicate injection ---
  if (document.getElementById('float-keys-root')) return;

  // --- SVG arrow icons ---
  const ARROWS = {
    ArrowUp: `<svg class="fk-arrow-icon" viewBox="0 0 24 24"><path d="M12 5l-7 7h4v7h6v-7h4z"/></svg>`,
    ArrowDown: `<svg class="fk-arrow-icon" viewBox="0 0 24 24"><path d="M12 19l7-7h-4V5h-6v7H5z"/></svg>`,
    ArrowLeft: `<svg class="fk-arrow-icon" viewBox="0 0 24 24"><path d="M5 12l7-7v4h7v6h-7v4z"/></svg>`,
    ArrowRight: `<svg class="fk-arrow-icon" viewBox="0 0 24 24"><path d="M19 12l-7 7v-4H5v-6h7V5z"/></svg>`,
  };

  // --- Build DOM ---
  const root = document.createElement('div');
  root.id = 'float-keys-root';

  root.innerHTML = `
                                                <div id="float-keys-widget" class="fk-idle">
                                                      <div id="float-keys-handle">
                                                              <span class="fk-handle-dot"></span>
                                                                      <span class="fk-handle-dot"></span>
                                                                              <span class="fk-handle-dot"></span>
                                                                                      <span class="fk-handle-dot"></span>
                                                                                              <span class="fk-handle-dot"></span>
                                                                                                      <span class="fk-handle-dot"></span>
                                                                                                            </div>

                                                                                                                  <div class="fk-arrow-grid">
                                                                                                                          <!-- Row 1: [empty] [up] [empty] -->
                                                                                                                                  <button class="fk-key fk-key-empty" tabindex="-1" aria-hidden="true"></button>
                                                                                                                                          <button class="fk-key" data-key="ArrowUp"    aria-label="Arrow Up">${ARROWS.ArrowUp}</button>
                                                                                                                                                  <button class="fk-key fk-key-empty" tabindex="-1" aria-hidden="true"></button>

                                                                                                                                                          <!-- Row 2: [left] [down] [right] -->
                                                                                                                                                                  <button class="fk-key" data-key="ArrowLeft"  aria-label="Arrow Left">${ARROWS.ArrowLeft}</button>
                                                                                                                                                                          <button class="fk-key" data-key="ArrowDown"  aria-label="Arrow Down">${ARROWS.ArrowDown}</button>
                                                                                                                                                                                  <button class="fk-key" data-key="ArrowRight" aria-label="Arrow Right">${ARROWS.ArrowRight}</button>
                                                                                                                                                                                        </div>

                                                                                                                                                                                              <!-- Spacebar -->
                                                                                                                                                                                                    <button class="fk-key fk-key-space" data-key=" " aria-label="Space">SPACE</button>
                                                                                                                                                                                                        </div>
                                                                                                                                                                                                          `;

  document.documentElement.appendChild(root);

  const widget = root.querySelector('#float-keys-widget');
  const handle = root.querySelector('#float-keys-handle');

  // ---------------------------------------------------------------------------
  // Position
  // ---------------------------------------------------------------------------

  function applyPosition(pos) {
    const maxX = window.innerWidth - root.offsetWidth - 8;
    const maxY = window.innerHeight - root.offsetHeight - 8;
    const x = Math.max(8, Math.min(pos.x, maxX));
    const y = Math.max(8, Math.min(pos.y, maxY));
    root.style.left = `${x}px`;
    root.style.top = `${y}px`;
  }

  function savePosition(pos) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(pos)); } catch (_) { }
  }

  function loadPosition() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) { }
    return DEFAULT_POSITION;
  }

  applyPosition(loadPosition());

  // ---------------------------------------------------------------------------
  // Drag (handle only — listeners on document to survive mouse leaving the element)
  // ---------------------------------------------------------------------------

  let dragging = false;
  let dragOffset = { x: 0, y: 0 };

  handle.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    dragging = true;
    const rect = root.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    applyPosition({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
  });

  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    const rect = root.getBoundingClientRect();
    savePosition({ x: rect.left, y: rect.top });
  });

  // Touch drag
  handle.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    dragging = true;
    const rect = root.getBoundingClientRect();
    dragOffset.x = touch.clientX - rect.left;
    dragOffset.y = touch.clientY - rect.top;
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    const touch = e.touches[0];
    applyPosition({ x: touch.clientX - dragOffset.x, y: touch.clientY - dragOffset.y });
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('touchend', () => {
    if (!dragging) return;
    dragging = false;
    const rect = root.getBoundingClientRect();
    savePosition({ x: rect.left, y: rect.top });
  });

  // ---------------------------------------------------------------------------
  // Key dispatch
  // ---------------------------------------------------------------------------

  const KEY_MAP = {
    ArrowUp: { key: 'ArrowUp', keyCode: 38, code: 'ArrowUp' },
    ArrowDown: { key: 'ArrowDown', keyCode: 40, code: 'ArrowDown' },
    ArrowLeft: { key: 'ArrowLeft', keyCode: 37, code: 'ArrowLeft' },
    ArrowRight: { key: 'ArrowRight', keyCode: 39, code: 'ArrowRight' },
    ' ': { key: ' ', keyCode: 32, code: 'Space' },
  };

  function dispatchKey(keyValue, type) {
    const info = KEY_MAP[keyValue];
    if (!info) return;

    // Send to whatever is focused, falling back to the document root
    const target = (document.activeElement && document.activeElement !== document.body)
      ? document.activeElement
      : document.documentElement;

    target.dispatchEvent(new KeyboardEvent(type, {
      key: info.key,
      code: info.code,
      keyCode: info.keyCode,
      which: info.keyCode,
      bubbles: true,
      cancelable: true,
    }));
  }

  // ---------------------------------------------------------------------------
  // Key hold logic
  //
  // Design:
  //   • mousedown / touchstart on a button  → startKey()
  //   • mouseup   / touchend   on DOCUMENT  → stopKey()   (survives pointer leaving btn)
  //   • mouseleave does NOT stop the key    (was the original bug)
  //   • Only one active key per keyValue at a time (Map guards re-entry)
  //   • Repeat: initial delay 400 ms, then every 60 ms (mirrors OS key-repeat feel)
  // ---------------------------------------------------------------------------

  const REPEAT_INITIAL_DELAY_MS = 400;
  const REPEAT_INTERVAL_MS = 60;

  // Map<keyValue, { btn: HTMLElement, intervalId: number | null, initialTimeoutId: number | null }>
  const activeKeys = new Map();

  function startKey(btn, keyValue) {
    if (activeKeys.has(keyValue)) return; // already held, ignore re-entry

    // Fire the first keydown immediately
    dispatchKey(keyValue, 'keydown');
    btn.classList.add('fk-pressed');

    const entry = { btn, initialTimeoutId: null, intervalId: null };
    activeKeys.set(keyValue, entry);

    // After the initial delay, start firing at the repeat rate
    entry.initialTimeoutId = setTimeout(() => {
      entry.initialTimeoutId = null;
      entry.intervalId = setInterval(() => {
        dispatchKey(keyValue, 'keydown');
      }, REPEAT_INTERVAL_MS);
    }, REPEAT_INITIAL_DELAY_MS);
  }

  function stopKey(keyValue) {
    const entry = activeKeys.get(keyValue);
    if (!entry) return;

    // Cancel any pending repeat timers
    if (entry.initialTimeoutId !== null) clearTimeout(entry.initialTimeoutId);
    if (entry.intervalId !== null) clearInterval(entry.intervalId);

    entry.btn.classList.remove('fk-pressed');
    dispatchKey(keyValue, 'keyup');
    activeKeys.delete(keyValue);
  }

  function stopAllKeys() {
    activeKeys.forEach((_, keyValue) => stopKey(keyValue));
  }

  // ---------------------------------------------------------------------------
  // Attach events to key buttons
  // mouseup is handled globally on document so it fires even when the pointer
  // drifts outside the button while held — the original source of the bug.
  // ---------------------------------------------------------------------------

  root.querySelectorAll('.fk-key[data-key]').forEach((btn) => {
    const keyValue = btn.dataset.key;

    btn.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault(); // prevent focus steal / text selection
      startKey(btn, keyValue);
    });

    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startKey(btn, keyValue);
    }, { passive: false });

    btn.addEventListener('touchend', () => stopKey(keyValue));
    btn.addEventListener('touchcancel', () => stopKey(keyValue));
  });

  // Global mouseup — stops whichever key is active, regardless of where the
  // pointer is when the button is released.
  document.addEventListener('mouseup', () => stopAllKeys());

  // Safety net: release everything if the page loses focus
  window.addEventListener('blur', stopAllKeys);

  // ---------------------------------------------------------------------------
  // Idle opacity
  // ---------------------------------------------------------------------------

  widget.addEventListener('mouseenter', () => widget.classList.remove('fk-idle'));
  widget.addEventListener('mouseleave', () => {
    if (!dragging) widget.classList.add('fk-idle');
  });

  // ---------------------------------------------------------------------------
  // Visibility control (from popup)
  // ---------------------------------------------------------------------------

  function setWidgetVisible(visible) {
    root.style.display = visible ? '' : 'none';
  }

  try {
    chrome.storage.local.get(['floatkeys_visible'], (result) => {
      setWidgetVisible(result['floatkeys_visible'] !== false);
    });
  } catch (_) { }

  try {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg?.type === 'SET_VISIBLE') setWidgetVisible(msg.visible);
    });
  } catch (_) { }

})();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        