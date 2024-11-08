// js/popup/index.js
import { loadDemoList } from './list.js';
import { initializeImport } from './import.js';

document.addEventListener('DOMContentLoaded', () => {
  loadDemoList();
  initializeImport();
});

document.getElementById('configLogos').addEventListener('click', () => {
    chrome.tabs.create({
        url: chrome.runtime.getURL('html/config.html')
    });
});