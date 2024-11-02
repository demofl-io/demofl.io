// js/popup/index.js
import { loadDemoList } from './list.js';
import { initializeImport } from './import.js';

document.addEventListener('DOMContentLoaded', () => {
  loadDemoList();
  initializeImport();
});