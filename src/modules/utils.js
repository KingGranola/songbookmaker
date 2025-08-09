/**
 * 共通ユーティリティ関数
 * 重複実装を避けるための統一モジュール
 */

/**
 * フォントファミリーをCSSクラス名に変換
 * @param {string} fontFamily - フォントファミリー名
 * @returns {string} CSSクラス名
 */
export function getFontClass(fontFamily) {
  switch (fontFamily) {
    case 'serif':
      return 'ff-serif';
    case 'sans':
      return 'ff-sans';
    case 'rounded':
      return 'ff-rounded';
    case 'mono':
      return 'ff-mono';
    case 'mincho':
      return 'ff-mincho';
    default:
      return 'ff-sans';
  }
}

/**
 * DOM要素のCSSクラスを安全に管理するユーティリティ
 */
export class CSSClassManager {
  /**
   * 複数のクラスを一括で削除し、新しいクラスを追加
   * @param {Element} element - 対象要素
   * @param {string[]} removeClasses - 削除するクラス配列
   * @param {string} addClass - 追加するクラス
   */
  static replaceClasses(element, removeClasses, addClass) {
    if (!element) return;
    
    removeClasses.forEach(cls => element.classList.remove(cls));
    if (addClass) {
      element.classList.add(addClass);
    }
  }

  /**
   * フォントクラスを適用（既存のフォントクラスを削除してから）
   * @param {Element} element - 対象要素
   * @param {string} fontFamily - フォントファミリー名
   */
  static applyFontClass(element, fontFamily) {
    const fontClasses = ['ff-serif', 'ff-sans', 'ff-rounded', 'ff-mono', 'ff-mincho'];
    this.replaceClasses(element, fontClasses, getFontClass(fontFamily));
  }

  /**
   * アクティブ状態を切り替え
   * @param {Element} element - 対象要素
   * @param {boolean} isActive - アクティブ状態
   */
  static toggleActive(element, isActive) {
    if (!element) return;
    element.classList.toggle('active', isActive);
  }

  /**
   * ボタンのスタイル状態を切り替え
   * @param {Element} element - 対象要素
   * @param {boolean} isPrimary - プライマリ状態
   */
  static toggleButtonStyle(element, isPrimary) {
    if (!element) return;
    element.classList.toggle('primary', isPrimary);
    element.classList.toggle('ghost', !isPrimary);
  }
}

/**
 * 音楽理論関連のユーティリティ
 */
export class MusicUtils {
  static get SEMITONES() {
    return ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  }
  
  static get FLAT_EQUIVALENTS() {
    return {
      'C#': 'Db',
      'D#': 'Eb',
      'F#': 'Gb',
      'G#': 'Ab',
      'A#': 'Bb'
    };
  }

  /**
   * ルートノートを正規化
   * @param {string} root - ルートノート
   * @returns {string} 正規化されたルートノート
   */
  static normalizeRoot(root) {
    const up = root.toUpperCase();
    if (this.SEMITONES.includes(up)) return up;
    if (this.FLAT_EQUIVALENTS[up]) return this.FLAT_EQUIVALENTS[up];
    return up;
  }

  /**
   * ルートノートをトランスポーズ
   * @param {string} root - ルートノート
   * @param {number} interval - 移調インターバル
   * @returns {string} トランスポーズされたルートノート
   */
  static transposeRoot(root, interval) {
    const normalized = this.normalizeRoot(root);
    const idx = this.SEMITONES.indexOf(normalized);
    if (idx < 0) return root;
    const next = (idx + interval + 120) % 12;
    return this.SEMITONES[next];
  }

  /**
   * 2つのキー間のインターバルを計算
   * @param {string} fromKey - 元のキー
   * @param {string} toKey - 目標のキー
   * @returns {number} インターバル（半音単位）
   */
  static computeInterval(fromKey, toKey) {
    const fromIdx = this.SEMITONES.indexOf(this.normalizeRoot(fromKey));
    const toIdx = this.SEMITONES.indexOf(this.normalizeRoot(toKey));
    if (fromIdx < 0 || toIdx < 0) return 0;
    return (toIdx - fromIdx + 12) % 12;
  }
}

/**
 * DOM要素作成のヘルパー
 */
export class DOMUtils {
  /**
   * 要素を作成し、クラス名とテキストを設定
   * @param {string} tagName - タグ名
   * @param {string} className - クラス名
   * @param {string} textContent - テキスト内容
   * @returns {Element} 作成された要素
   */
  static createElement(tagName, className = '', textContent = '') {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (textContent) element.textContent = textContent;
    return element;
  }

  /**
   * 要素を作成し、複数の属性を設定
   * @param {string} tagName - タグ名
   * @param {Object} attributes - 属性オブジェクト
   * @returns {Element} 作成された要素
   */
  static createElementWithAttributes(tagName, attributes = {}) {
    const element = document.createElement(tagName);
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'textContent') {
        element.textContent = value;
      } else if (key === 'innerHTML') {
        element.innerHTML = value;
      } else {
        element.setAttribute(key, value);
      }
    });
    return element;
  }
}

/**
 * パフォーマンス関連のユーティリティ
 */
export class PerformanceUtils {
  /**
   * デバウンス関数
   * @param {Function} func - デバウンスする関数
   * @param {number} wait - 待機時間（ミリ秒）
   * @returns {Function} デバウンスされた関数
   */
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * スロットル関数
   * @param {Function} func - スロットルする関数
   * @param {number} limit - 制限時間（ミリ秒）
   * @returns {Function} スロットルされた関数
   */
  static throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * requestAnimationFrame を使った最適化された更新
   * @param {Function} callback - 実行するコールバック
   */
  static scheduleUpdate(callback) {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        callback();
        resolve();
      });
    });
  }
}
