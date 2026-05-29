'use strict';

const STORAGE_KEY = 'floatkeys_visible';

const toggle = document.getElementById('toggle-visible');

// Load saved state
chrome.storage.local.get([STORAGE_KEY], (result) => {
    const visible = result[STORAGE_KEY] !== false; // default: true
    toggle.checked = visible;
});

// Toggle visibility in active tab
toggle.addEventListener('change', () => {
    const visible = toggle.checked;

    chrome.storage.local.set({ [STORAGE_KEY]: visible });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]?.id) return;
        chrome.tabs.sendMessage(tabs[0].id, { type: 'SET_VISIBLE', visible });
    });
});
