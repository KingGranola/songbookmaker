import { setupState } from './state.js';
import { setupUI } from './ui.js';
import { renderPage, enableChordPlacement } from './placement.js';
import { updatePresetList } from './presets.js';
import { KeyboardShortcutManager } from './keyboard-shortcuts.js';
import { TouchGestureManager } from './touch-gestures.js';
import { PerformanceOptimizer } from './performance.js';

export function initApp() {
  // コア機能の初期化
  const ctx = setupState();
  setupUI(ctx);
  updatePresetList(ctx);
  renderPage(ctx);
  enableChordPlacement(ctx);
  
  // 拡張機能の初期化
  const keyboardManager = new KeyboardShortcutManager(ctx);
  const touchManager = new TouchGestureManager(ctx);
  const performanceOptimizer = new PerformanceOptimizer(ctx);
  
  // パフォーマンス最適化を適用
  performanceOptimizer.setupLazyLoading();
  
  // デバッグ情報（開発時のみ）
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.__DEBUG__ = {
      ctx,
      keyboardManager,
      touchManager,
      performanceOptimizer,
      getStats: () => performanceOptimizer.getPerformanceStats()
    };
  }
  
  // アプリケーション初期化完了のイベント
  document.dispatchEvent(new CustomEvent('app-initialized', {
    detail: { ctx, keyboardManager, touchManager, performanceOptimizer }
  }));
  
  console.log('🎵 Songbook Maker initialized successfully');
}


