import { clsx, type ClassValue } from 'clsx';

/**
 * クラス名を結合するユーティリティ
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * 音楽理論関連のユーティリティ
 */
export class MusicUtils {
  static get SEMITONES(): readonly string[] {
    return ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  }

  static get FLAT_EQUIVALENTS(): Readonly<Record<string, string>> {
    return {
      'C#': 'Db',
      'D#': 'Eb',
      'F#': 'Gb',
      'G#': 'Ab',
      'A#': 'Bb',
    } as const;
  }

  /**
   * ルートノートを正規化
   */
  static normalizeRoot(root: string): string {
    const up = root.toUpperCase();
    if (this.SEMITONES.includes(up)) return up;
    if (this.FLAT_EQUIVALENTS[up]) return this.FLAT_EQUIVALENTS[up];
    return up;
  }

  /**
   * ルートノートをトランスポーズ
   */
  static transposeRoot(root: string, interval: number): string {
    const normalized = this.normalizeRoot(root);
    const idx = this.SEMITONES.indexOf(normalized);
    if (idx < 0) return root;
    const next = (idx + interval + 120) % 12;
    return this.SEMITONES[next];
  }

  /**
   * 2つのキー間のインターバルを計算
   */
  static computeInterval(fromKey: string, toKey: string): number {
    const fromIdx = this.SEMITONES.indexOf(this.normalizeRoot(fromKey));
    const toIdx = this.SEMITONES.indexOf(this.normalizeRoot(toKey));
    if (fromIdx < 0 || toIdx < 0) return 0;
    return (toIdx - fromIdx + 12) % 12;
  }

  /**
   * コードシンボルをパース
   */
  static parseChordSymbol(symbol: string): {
    root: string;
    quality: string;
    bass: string | null;
  } {
    const [base, bass] = symbol.split('/');
    const match = base.match(/^([A-Ga-g][#b]?)(.*)$/);
    if (!match) return { root: symbol, quality: '', bass: bass || null };
    const root = this.normalizeRoot(match[1]);
    const quality = (match[2] || '').trim();
    return { root, quality, bass: bass ? this.normalizeRoot(bass) : null };
  }

  /**
   * コードをトランスポーズ
   */
  static transposeChord(symbol: string, interval: number): string {
    if (!interval) return symbol;
    const { root, quality, bass } = this.parseChordSymbol(symbol);
    const transposedRoot = this.transposeRoot(root, interval);
    const transposedBass = bass ? this.transposeRoot(bass, interval) : null;
    return transposedRoot + quality + (transposedBass ? '/' + transposedBass : '');
  }
}

/**
 * パフォーマンス関連のユーティリティ
 */
export class PerformanceUtils {
  /**
   * デバウンス関数
   */
  static debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: Parameters<T>) {
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
   */
  static throttle<T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return function executedFunction(...args: Parameters<T>) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * requestAnimationFrame を使った最適化された更新
   */
  static scheduleUpdate(callback: () => void): Promise<void> {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        callback();
        resolve();
      });
    });
  }
}

/**
 * ローカルストレージユーティリティ
 */
export class StorageUtils {
  /**
   * データを安全に保存
   */
  static setItem(key: string, value: unknown): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  }

  /**
   * データを安全に取得
   */
  static getItem<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return defaultValue || null;
    }
  }

  /**
   * データを削除
   */
  static removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
      return false;
    }
  }
}

/**
 * ファイル操作ユーティリティ
 */
export class FileUtils {
  /**
   * JSONファイルとしてダウンロード
   */
  static downloadAsJSON(data: unknown, filename: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * ファイルを読み込み
   */
  static readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }
}

/**
 * 色操作ユーティリティ
 */
export class ColorUtils {
  /**
   * HEX色をRGBに変換
   */
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  /**
   * RGB色をHEXに変換
   */
  static rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
  }

  /**
   * 色のコントラスト比を計算
   */
  static getContrastRatio(color1: string, color2: string): number {
    const getLuminance = (hex: string) => {
      const rgb = this.hexToRgb(hex);
      if (!rgb) return 0;
      const { r, g, b } = rgb;
      const [rs, gs, bs] = [r, g, b].map((c) => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  }
}
