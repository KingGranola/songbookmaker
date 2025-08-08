import { setupState } from './state.js';
import { setupUI } from './ui.js';
import { renderPage, enableChordPlacement } from './placement.js';
import { updatePresetList } from './presets.js';

export function initApp() {
  const ctx = setupState();
  setupUI(ctx);
  updatePresetList(ctx);
  renderPage(ctx);
  enableChordPlacement(ctx);
}


