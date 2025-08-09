/**
 * キーボードショートカット管理クラス
 */
export class KeyboardShortcutManager {
  constructor(ctx) {
    this.ctx = ctx;
    this.shortcuts = new Map();
    this.isEnabled = true;
    this.setupDefaultShortcuts();
    this.bindEventListeners();
  }

  /**
   * デフォルトのショートカットを設定
   */
  setupDefaultShortcuts() {
    // ファイル操作
    this.addShortcut('ctrl+s', () => this.saveProject());
    this.addShortcut('cmd+s', () => this.saveProject());
    this.addShortcut('ctrl+o', () => this.openProject());
    this.addShortcut('cmd+o', () => this.openProject());
    this.addShortcut('ctrl+p', () => this.printProject());
    this.addShortcut('cmd+p', () => this.printProject());

    // 編集操作
    this.addShortcut('ctrl+z', () => this.undo());
    this.addShortcut('cmd+z', () => this.undo());
    this.addShortcut('delete', () => this.deleteSelected());
    this.addShortcut('backspace', () => this.deleteSelected());

    // 表示操作
    this.addShortcut('ctrl+=', () => this.increaseFontSize());
    this.addShortcut('cmd+=', () => this.increaseFontSize());
    this.addShortcut('ctrl+-', () => this.decreaseFontSize());
    this.addShortcut('cmd+-', () => this.decreaseFontSize());
    this.addShortcut('ctrl+0', () => this.resetFontSize());
    this.addShortcut('cmd+0', () => this.resetFontSize());

    // その他
    this.addShortcut('escape', () => this.cancelCurrentAction());
    this.addShortcut('ctrl+|', () => this.insertSeparator());
    this.addShortcut('cmd+|', () => this.insertSeparator());
  }

  /**
   * ショートカットを追加
   */
  addShortcut(combination, callback) {
    const normalizedKey = this.normalizeKeyCombo(combination);
    this.shortcuts.set(normalizedKey, callback);
  }

  /**
   * キーの組み合わせを正規化
   */
  normalizeKeyCombo(combo) {
    return combo.toLowerCase()
      .replace(/\s+/g, '')
      .split('+')
      .sort()
      .join('+');
  }

  /**
   * イベントリスナーをバインド
   */
  bindEventListeners() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  /**
   * キーダウンイベントハンドラー
   */
  handleKeyDown(event) {
    if (!this.isEnabled) return;

    const target = event.target;
    const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true';

    if (isInputField && !this.isGlobalShortcut(event)) {
      return;
    }

    const combo = this.getKeyComboFromEvent(event);
    const normalizedCombo = this.normalizeKeyCombo(combo);
    const callback = this.shortcuts.get(normalizedCombo);

    if (callback) {
      event.preventDefault();
      event.stopPropagation();
      callback();
    }
  }

  /**
   * イベントからキーの組み合わせを取得
   */
  getKeyComboFromEvent(event) {
    const keys = [];

    if (event.ctrlKey) keys.push('ctrl');
    if (event.metaKey) keys.push('cmd');
    if (event.altKey) keys.push('alt');
    if (event.shiftKey) keys.push('shift');

    let key = event.key.toLowerCase();
    if (key === ' ') key = 'space';
    if (key === 'escape') key = 'escape';
    if (key === 'delete') key = 'delete';
    if (key === 'backspace') key = 'backspace';

    keys.push(key);
    return keys.join('+');
  }

  /**
   * グローバルショートカットかどうか判定
   */
  isGlobalShortcut(event) {
    const globalShortcuts = ['ctrl+s', 'cmd+s', 'ctrl+p', 'cmd+p', 'ctrl+o', 'cmd+o', 'escape'];
    const combo = this.getKeyComboFromEvent(event);
    const normalizedCombo = this.normalizeKeyCombo(combo);
    return globalShortcuts.some(shortcut => this.normalizeKeyCombo(shortcut) === normalizedCombo);
  }

  // ========== ショートカット実装 ==========

  saveProject() {
    this.ctx.el.btnSave?.click();
  }

  openProject() {
    this.ctx.el.btnLoad?.click();
  }

  printProject() {
    this.ctx.el.btnPrint?.click();
  }

  undo() {
    this.ctx.el.btnUndo?.click();
  }

  deleteSelected() {
    if (this.ctx.state.selectedChord && this.ctx.setCurrentChord) {
      this.ctx.setCurrentChord('__ERASE__');
    }
  }

  increaseFontSize() {
    if (this.ctx.el.lyricsFont) {
      const currentSize = parseInt(this.ctx.el.lyricsFont.value);
      const newSize = Math.min(28, currentSize + 1);
      this.ctx.el.lyricsFont.value = newSize.toString();
      this.ctx.el.lyricsFont.dispatchEvent(new Event('input'));
    }
  }

  decreaseFontSize() {
    if (this.ctx.el.lyricsFont) {
      const currentSize = parseInt(this.ctx.el.lyricsFont.value);
      const newSize = Math.max(10, currentSize - 1);
      this.ctx.el.lyricsFont.value = newSize.toString();
      this.ctx.el.lyricsFont.dispatchEvent(new Event('input'));
    }
  }

  resetFontSize() {
    if (this.ctx.el.lyricsFont) {
      this.ctx.el.lyricsFont.value = '16';
      this.ctx.el.lyricsFont.dispatchEvent(new Event('input'));
    }
  }

  cancelCurrentAction() {
    // 編集モード・消しゴムモードを解除
    this.exitEditAndEraserModes();
    
    if (this.ctx.setCurrentChord) {
      this.ctx.setCurrentChord(null);
    }
    
    const activeElement = document.activeElement;
    if (activeElement && activeElement.blur) {
      activeElement.blur();
    }
  }

  /**
   * 編集モード・消しゴムモードを解除してA4プレビューの明るさを元に戻す
   */
  exitEditAndEraserModes() {
    const pageContent = document.getElementById('page-content');
    if (!pageContent) return;

    // 編集モード・消しゴムモードのクラスを削除（明るさを元に戻す）
    pageContent.classList.remove('edit-mode', 'eraser-mode');
    
    // 編集モードボタンの状態をリセット
    const btnEditMode = document.getElementById('btn-edit-mode');
    if (btnEditMode) {
      btnEditMode.textContent = '編集モード';
      btnEditMode.classList.remove('primary');
      btnEditMode.classList.add('ghost');
    }
    
    // 編集モード状態をリセット
    window.isEditModeActive = false;
    
    // コントロールボタンの状態もリセット
    const btnEditModeControls = document.getElementById('btn-edit-mode-controls');
    const btnEraserControls = document.getElementById('btn-eraser-controls');
    
    if (btnEditModeControls) btnEditModeControls.classList.remove('active');
    if (btnEraserControls) btnEraserControls.classList.remove('active');
  }

  insertSeparator() {
    if (this.ctx.setCurrentChord) {
      this.ctx.setCurrentChord('|');
    }
  }

  /**
   * ショートカットの有効/無効を切り替え
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }
}
