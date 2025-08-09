/**
 * コード選択・コピー機能
 * A4プレビューからコードを選択してクリップボードにコピー
 */

export class ChordCopyManager {
  constructor() {
    this.isSelecting = false;
    this.selectedChords = new Set();
    this.selectionBox = null;
    this.startPoint = null;

    this.init();
  }

  init() {
    this.createSelectionBox();
    this.setupEventListeners();
    this.addToolbarButtons();
  }

  createSelectionBox() {
    this.selectionBox = document.createElement('div');
    this.selectionBox.className = 'chord-selection-box';
    this.selectionBox.style.display = 'none';
    document.body.appendChild(this.selectionBox);
  }

  setupEventListeners() {
    const previewWrap = document.querySelector('.preview-wrap');
    if (!previewWrap) return;

    // マウスダウン - 選択開始
    previewWrap.addEventListener('mousedown', (e) => {
      // CtrlキーまたはCmd（Mac）キーが押されている時のみ選択モード
      if (!e.ctrlKey && !e.metaKey) return;

      e.preventDefault();
      this.startSelection(e);
    });

    // マウスムーブ - 選択範囲更新
    document.addEventListener('mousemove', (e) => {
      if (this.isSelecting) {
        e.preventDefault();
        this.updateSelection(e);
      }
    });

    // マウスアップ - 選択終了
    document.addEventListener('mouseup', (e) => {
      if (this.isSelecting) {
        e.preventDefault();
        this.endSelection(e);
      }
    });

    // キーボードショートカット
    document.addEventListener('keydown', (e) => {
      // Ctrl+C または Cmd+C でコピー
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === 'c' &&
        this.selectedChords.size > 0
      ) {
        e.preventDefault();
        this.copySelectedChords();
      }

      // Escapeで選択解除
      if (e.key === 'Escape') {
        this.clearSelection();
      }
    });
  }

  addToolbarButtons() {
    const toolbar = document.querySelector('.toolbar');
    if (!toolbar) return;

    // コピーボタンを追加
    const copyBtn = document.createElement('button');
    copyBtn.id = 'btn-copy-chords';
    copyBtn.className = 'ghost';
    copyBtn.setAttribute('aria-label', '選択したコードをコピー');
    copyBtn.innerHTML = '<span aria-hidden="true">📋</span> コピー';
    copyBtn.disabled = true;
    copyBtn.addEventListener('click', () => this.copySelectedChords());

    // 選択解除ボタンを追加
    const clearBtn = document.createElement('button');
    clearBtn.id = 'btn-clear-selection';
    clearBtn.className = 'ghost';
    clearBtn.setAttribute('aria-label', '選択を解除');
    clearBtn.innerHTML = '<span aria-hidden="true">✕</span> 選択解除';
    clearBtn.disabled = true;
    clearBtn.addEventListener('click', () => this.clearSelection());

    // ツールバーに追加
    const loadBtn = document.getElementById('btn-load');
    if (loadBtn) {
      toolbar.insertBefore(copyBtn, loadBtn.nextSibling);
      toolbar.insertBefore(clearBtn, copyBtn.nextSibling);
    }
  }

  startSelection(e) {
    this.isSelecting = true;
    this.selectedChords.clear();
    this.updateButtonStates();

    const rect = document
      .querySelector('.preview-wrap')
      .getBoundingClientRect();
    this.startPoint = {
      x:
        e.clientX -
        rect.left +
        document.querySelector('.preview-wrap').scrollLeft,
      y:
        e.clientY -
        rect.top +
        document.querySelector('.preview-wrap').scrollTop,
    };

    this.selectionBox.style.left =
      e.clientX - rect.left + window.scrollX + 'px';
    this.selectionBox.style.top = e.clientY - rect.top + window.scrollY + 'px';
    this.selectionBox.style.width = '0px';
    this.selectionBox.style.height = '0px';
    this.selectionBox.style.display = 'block';
  }

  updateSelection(e) {
    if (!this.isSelecting || !this.startPoint) return;

    const rect = document
      .querySelector('.preview-wrap')
      .getBoundingClientRect();
    const currentPoint = {
      x:
        e.clientX -
        rect.left +
        document.querySelector('.preview-wrap').scrollLeft,
      y:
        e.clientY -
        rect.top +
        document.querySelector('.preview-wrap').scrollTop,
    };

    const minX = Math.min(this.startPoint.x, currentPoint.x);
    const minY = Math.min(this.startPoint.y, currentPoint.y);
    const maxX = Math.max(this.startPoint.x, currentPoint.x);
    const maxY = Math.max(this.startPoint.y, currentPoint.y);

    // 選択ボックスの位置とサイズを更新
    this.selectionBox.style.left = minX + rect.left + window.scrollX + 'px';
    this.selectionBox.style.top = minY + rect.top + window.scrollY + 'px';
    this.selectionBox.style.width = maxX - minX + 'px';
    this.selectionBox.style.height = maxY - minY + 'px';

    // 選択範囲内のコードを検索
    this.findChordsInSelection(minX, minY, maxX, maxY);
  }

  findChordsInSelection(minX, minY, maxX, maxY) {
    this.selectedChords.clear();

    const chordElements = document.querySelectorAll('.chord');
    const previewWrap = document.querySelector('.preview-wrap');
    const previewRect = previewWrap.getBoundingClientRect();

    chordElements.forEach((chord) => {
      const chordRect = chord.getBoundingClientRect();
      const chordX = chordRect.left - previewRect.left + previewWrap.scrollLeft;
      const chordY = chordRect.top - previewRect.top + previewWrap.scrollTop;
      const chordWidth = chordRect.width;
      const chordHeight = chordRect.height;

      // コード要素が選択範囲と重なっているかチェック
      if (
        chordX < maxX &&
        chordX + chordWidth > minX &&
        chordY < maxY &&
        chordY + chordHeight > minY
      ) {
        this.selectedChords.add(chord.textContent.trim());
        chord.classList.add('chord-selected');
      } else {
        chord.classList.remove('chord-selected');
      }
    });

    this.updateButtonStates();
  }

  endSelection(_e) {
    this.isSelecting = false;
    this.selectionBox.style.display = 'none';
    this.startPoint = null;

    // 選択されたコードをハイライト表示のまま保持
    if (this.selectedChords.size > 0) {
      this.showSelectionInfo();
    }
  }

  showSelectionInfo() {
    const count = this.selectedChords.size;
    const chordList = Array.from(this.selectedChords).join(', ');

    // 一時的な通知を表示
    const notification = document.createElement('div');
    notification.className = 'chord-selection-notification';
    notification.innerHTML = `
      <div><strong>${count}個のコード</strong>を選択しました</div>
      <div class="selected-chords">${chordList}</div>
      <div class="selection-hint">Ctrl+C でコピー、Esc で解除</div>
    `;

    document.body.appendChild(notification);

    // 3秒後に自動削除
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  copySelectedChords() {
    if (this.selectedChords.size === 0) return;

    const chordsArray = Array.from(this.selectedChords);
    const chordsText = chordsArray.join(' ');

    // クリップボードにコピー
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(chordsText)
        .then(() => {
          this.showCopySuccess(chordsArray.length);
        })
        .catch((err) => {
          console.warn('クリップボードへのコピーに失敗:', err);
          this.fallbackCopy(chordsText);
        });
    } else {
      this.fallbackCopy(chordsText);
    }
  }

  fallbackCopy(text) {
    // フォールバック: テキストエリアを作成してコピー
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        this.showCopySuccess(this.selectedChords.size);
      } else {
        this.showCopyError();
      }
    } catch (err) {
      console.warn('フォールバックコピーに失敗:', err);
      this.showCopyError();
    } finally {
      document.body.removeChild(textArea);
    }
  }

  showCopySuccess(count) {
    const notification = document.createElement('div');
    notification.className = 'copy-success-notification';
    notification.innerHTML = `✅ ${count}個のコードをコピーしました`;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 2000);
  }

  showCopyError() {
    const notification = document.createElement('div');
    notification.className = 'copy-error-notification';
    notification.innerHTML = '❌ コピーに失敗しました';

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 2000);
  }

  clearSelection() {
    this.selectedChords.clear();
    this.isSelecting = false;
    this.selectionBox.style.display = 'none';

    // 全てのコードのハイライトを解除
    document.querySelectorAll('.chord-selected').forEach((chord) => {
      chord.classList.remove('chord-selected');
    });

    this.updateButtonStates();
  }

  updateButtonStates() {
    const copyBtn = document.getElementById('btn-copy-chords');
    const clearBtn = document.getElementById('btn-clear-selection');

    const hasSelection = this.selectedChords.size > 0;

    if (copyBtn) {
      copyBtn.disabled = !hasSelection;
      copyBtn.textContent = hasSelection
        ? `📋 コピー (${this.selectedChords.size})`
        : '📋 コピー';
    }

    if (clearBtn) {
      clearBtn.disabled = !hasSelection;
    }
  }
}

// グローバル初期化
let chordCopyManager = null;

export function initChordCopy() {
  if (!chordCopyManager) {
    chordCopyManager = new ChordCopyManager();
  }
  return chordCopyManager;
}
