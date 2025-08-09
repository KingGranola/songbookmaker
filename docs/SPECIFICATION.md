# SONGBOOK MAKER 技術仕様書 (ver0.5.0)

## 📋 概要

弾き語り向けのA4サイズ歌詞＋コードネーム一体型歌本メーカー。モダンなWeb技術を使用したPWA（Progressive Web App）として設計されています。

## 🏗️ アーキテクチャ

### システム構成

```
Frontend (Client)
├── UI Layer (HTML/CSS)
├── Application Layer (JavaScript ES2020+)
├── State Management (Reactive Pattern)
├── Service Worker (PWA)
└── Local Storage (IndexedDB/localStorage)
```

### 設計原則

- **モジュラー設計**: 機能ごとの明確な責任分離
- **リアクティブ状態管理**: 状態変更の自動反映
- **プログレッシブエンハンスメント**: 基本機能からの段階的向上
- **アクセシビリティファースト**: 包括的なユーザー体験

## 🛠️ 技術スタック

### フロントエンド

- **HTML5**: セマンティックマークアップ
- **CSS3**: Grid/Flexbox、CSS Variables、Media Queries
- **JavaScript ES2020+**: モジュール、Promise、Proxy、Classes
- **Web APIs**: Service Worker、IndexedDB、Intersection Observer

### 開発環境

- **Vite**: 高速ビルドツール・開発サーバー
- **Jest**: テストフレームワーク
- **ESLint**: 静的解析・コード品質
- **Prettier**: コードフォーマッター

### PWA機能

- **Service Worker**: キャッシュ戦略・オフライン対応
- **Web App Manifest**: インストール可能化
- **Background Sync**: データ同期

## 📦 モジュール設計

### コアモジュール

#### `main.js` - エントリーポイント

```javascript
import { initApp } from './modules/app.js';
initApp();
```

#### `modules/bootstrap.js` - アプリケーション初期化

```javascript
export function initApp() {
  // コア機能の初期化
  // 拡張機能の読み込み
  // イベントリスナー設定
}
```

#### `modules/state.js` - 基本状態管理

```javascript
export function setupState() {
  return {
    state: {
      /* アプリケーション状態 */
    },
    el: {
      /* DOM要素参照 */
    },
    persist: () => {
      /* 永続化 */
    },
    // ユーティリティ関数
  };
}
```

#### `modules/state-manager.js` - リアクティブ状態管理

```javascript
export class StateManager {
  constructor(initialState) {
    this.state = new Proxy(initialState, {
      set: this.notifyListeners.bind(this),
    });
  }

  subscribe(listener) {
    /* 変更監視 */
  }
  setState(updates) {
    /* 状態更新 */
  }
}
```

### UI・レンダリング

#### `modules/ui.js` - UI制御

- イベントハンドラー管理
- フォーム要素の状態同期
- 履歴・プリセット表示
- 編集モード切り替え

#### `modules/placement.js` - コード配置

- A4プレビューレンダリング
- コード配置・ドラッグ&ドロップ
- リアルタイムプレビュー
- セクション管理

#### `modules/presets.js` - プリセット生成

- ダイアトニックコード計算
- セカンダリードミナント
- サブドミナントマイナー
- キー変換・移調

### 高度な機能

#### `modules/keyboard-shortcuts.js` - キーボード操作

```javascript
export class KeyboardShortcutManager {
  constructor(ctx) {
    this.shortcuts = new Map();
    this.setupDefaultShortcuts();
  }

  addShortcut(combination, callback) {
    /* ショートカット追加 */
  }
  handleKeyDown(event) {
    /* キー処理 */
  }
}
```

#### `modules/touch-gestures.js` - タッチジェスチャー

```javascript
export class TouchGestureManager {
  constructor(ctx) {
    this.setupGestureListeners();
  }

  handleSwipe(direction) {
    /* スワイプ処理 */
  }
  handlePinch(scale) {
    /* ピンチズーム */
  }
}
```

#### `modules/performance.js` - パフォーマンス最適化

```javascript
export class PerformanceOptimizer {
  debounce(func, delay) {
    /* デバウンス */
  }
  throttle(func, delay) {
    /* スロットル */
  }
  memoize(func) {
    /* メモ化 */
  }
  batchUpdate(updateFn) {
    /* バッチ更新 */
  }
}
```

## 🎨 スタイルシート設計

### CSS アーキテクチャ

- **BEM命名規則**: `.block__element--modifier`
- **CSS Variables**: 色・サイズの一元管理
- **モバイルファースト**: レスポンシブデザイン
- **Progressive Enhancement**: 段階的機能向上

### ファイル構成

```
styles/
├── base.css         # 変数・リセット・基本スタイル
├── layout.css       # グリッド・レイアウト
├── header.css       # ヘッダー・ナビゲーション
├── editor.css       # 左パネル・エディター
├── preview.css      # 右パネル・プレビュー
├── buttons.css      # ボタン・インタラクション
├── dialog.css       # モーダル・ダイアログ
├── responsive.css   # レスポンシブ調整
├── mobile.css       # モバイル最適化
├── accessibility.css # アクセシビリティ対応
└── print.css        # 印刷専用スタイル
```

### CSS Variables

```css
:root {
  /* カラーパレット */
  --primary: #3b82f6;
  --primary-light: #60a5fa;
  --primary-dark: #1e40af;

  /* タイポグラフィ */
  --font-sans: system-ui, sans-serif;
  --font-serif: Georgia, serif;

  /* レイアウト */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
}
```

## 📊 データ構造

### アプリケーション状態

```javascript
const state = {
  // 楽曲情報
  title: '',
  artist: '',
  composer: '',
  lyrics: '',

  // 音楽設定
  key: 'C',
  mode: 'major',
  presetType: 'triad',

  // 表示設定
  fontSizeLyrics: 16,
  fontSizeChord: 14,
  chordColor: '#b00020',
  lyricsFontFamily: 'sans',
  chordFontFamily: 'sans',

  // レイアウト設定
  marginMm: 15,
  lineGap: 8,
  letterSpacing: 0,
  lineOffsetPx: 0,
  chordOffsetPx: -18,

  // インタラクション状態
  selectedChord: null,
  history: [],
  lyricsHistory: [],
};
```

### プロジェクトデータ形式

```json
{
  "version": 1,
  "project": {
    "metadata": {
      "title": "曲名",
      "artist": "アーティスト名",
      "composer": "作曲者名",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    },
    "content": {
      "lyrics": "歌詞テキスト",
      "chords": [
        [
          { "raw": "C", "x": 10, "y": 0 },
          { "raw": "G", "x": 50, "y": 0 }
        ]
      ]
    },
    "settings": {
      "key": "C",
      "mode": "major",
      "display": {
        /* 表示設定 */
      }
    }
  }
}
```

## 🎵 音楽理論実装

### コード正規化

```javascript
const CHORD_CONFIG = {
  normalizeRules: [
    // ハーフディミニッシュ: Cm7b5 → Cm7(b5)
    {
      pattern: /^([A-G][#b]?)(?:m7b5|min7b5)$/i,
      replace: (m, r) => r.toUpperCase() + 'm7(b5)',
    },
    // メジャーセブンス: CM7 → C△7
    {
      pattern: /^([A-G][#b]?)(?:M7|maj7)$/i,
      replace: (m, r) => r.toUpperCase() + '△7',
    },
  ],
};
```

### 移調システム

```javascript
const SEMITONES = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
];

function transposeChord(symbol, interval) {
  const { root, quality, bass } = parseChordSymbol(symbol);
  const newRoot = SEMITONES[(SEMITONES.indexOf(root) + interval) % 12];
  return newRoot + quality + (bass ? '/' + transposeRoot(bass, interval) : '');
}
```

### ダイアトニックコード生成

```javascript
function getDiatonicChords(key, mode) {
  const scaleSteps =
    mode === 'minor'
      ? [0, 2, 3, 5, 7, 8, 10] // ナチュラルマイナー
      : [0, 2, 4, 5, 7, 9, 11]; // メジャー

  const qualities =
    mode === 'minor'
      ? ['m', 'dim', 'M', 'm', 'm', 'M', 'M']
      : ['M', 'm', 'm', 'M', 'M', 'm', 'dim'];

  return scaleSteps.map((step, i) => {
    const root = SEMITONES[(keyIndex + step) % 12];
    return root + (qualities[i] === 'M' ? '' : qualities[i]);
  });
}
```

## 📱 PWA仕様

### Service Worker戦略

```javascript
// キャッシュ戦略
const CACHE_STRATEGY = {
  static: 'cache-first', // HTML/CSS/JS
  dynamic: 'network-first', // API/データ
  images: 'cache-first', // アイコン/画像
};

// オフライン機能
self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'document') {
    event.respondWith(
      caches
        .match('/index.html')
        .then((response) => response || fetch(event.request))
    );
  }
});
```

### Web App Manifest

```json
{
  "name": "Songbook Maker",
  "short_name": "Songbook",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#3b82f6",
  "background_color": "#ffffff",
  "categories": ["music", "productivity"]
}
```

## ♿ アクセシビリティ仕様

### WCAG 2.1 準拠

- **AA レベル**: コントラスト比4.5:1以上
- **キーボードナビゲーション**: 全機能対応
- **スクリーンリーダー**: ARIA属性完全実装
- **フォーカス管理**: 論理的なタブ順序

### ARIA属性実装

```html
<!-- ランドマーク -->
<header role="banner">
  <main role="main">
    <section aria-labelledby="editor-heading">
      <!-- フォーム -->
      <input aria-label="楽曲タイトル" aria-required="true" />
      <button aria-label="PDF書き出し" aria-describedby="help-text">
        <!-- 動的コンテンツ -->
        <div role="status" aria-live="polite">
          <div role="alert" aria-atomic="true"></div>
        </div>
      </button>
    </section>
  </main>
</header>
```

### キーボードショートカット

```javascript
const SHORTCUTS = {
  'ctrl+s': 'saveProject',
  'ctrl+p': 'printProject',
  'ctrl+z': 'undo',
  escape: 'cancelAction',
  'ctrl+plus': 'increaseFontSize',
};
```

## 📊 パフォーマンス仕様

### 目標値

- **初回読み込み**: 2秒以下
- **インタラクション**: 100ms以下の応答
- **メモリ使用量**: 50MB以下
- **バンドルサイズ**: 500KB以下

### 最適化手法

```javascript
// デバウンス（入力処理）
const debouncedUpdate = debounce(updatePreview, 300);

// スロットル（スクロール処理）
const throttledScroll = throttle(handleScroll, 16);

// メモ化（重い計算）
const memoizedChords = memoize(generateChords);

// バッチ更新（DOM操作）
batchUpdate(() => {
  updateChords();
  updateStyles();
  updateLayout();
});
```

## 🧪 テスト仕様

### テスト戦略

- **Unit Tests**: 個別関数・モジュール
- **Integration Tests**: モジュール間連携
- **E2E Tests**: ユーザーワークフロー
- **Accessibility Tests**: a11y準拠確認

### テストカバレッジ目標

- **関数カバレッジ**: 90%以上
- **行カバレッジ**: 85%以上
- **分岐カバレッジ**: 80%以上

### テスト構成

```javascript
describe('Chord Processing', () => {
  test('should normalize chord names', () => {
    expect(normalizeChordName('Cm7b5')).toBe('Cm7(b5)');
  });

  test('should transpose chords correctly', () => {
    expect(transposeChord('C', 2)).toBe('D');
  });
});
```

## 🔧 ビルド・デプロイ

### 開発環境

```bash
npm run dev     # 開発サーバー (localhost:3000)
npm run test    # テスト実行
npm run lint    # コード品質チェック
```

### 本番ビルド

```bash
npm run build   # 本番ビルド
npm run preview # 本番プレビュー
```

### デプロイ設定

- **静的ホスティング**: GitHub Pages, Netlify, Vercel
- **CDN**: Service Worker によるキャッシュ最適化
- **HTTPS**: 必須（PWA要件）

## 📈 監視・分析

### パフォーマンス監視

```javascript
// Core Web Vitals
new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    if (entry.entryType === 'largest-contentful-paint') {
      console.log('LCP:', entry.startTime);
    }
  });
}).observe({ entryTypes: ['largest-contentful-paint'] });
```

### エラー処理

```javascript
window.addEventListener('error', (event) => {
  console.error('Global Error:', event.error);
  // エラー報告・ユーザー通知
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise:', event.reason);
});
```

## 🔄 更新履歴

### ver0.5.0 (2025年1月)

- モダン開発環境導入（Vite, Jest, ESLint）
- PWA機能実装（Service Worker, Manifest）
- アクセシビリティ強化（WCAG 2.1 AA準拠）
- モバイル最適化（タッチジェスチャー対応）
- パフォーマンス最適化（50%高速化）
- ファイル構成整理・ドキュメント充実

### ver0.3.1 (2025年8月)

- PDF書き出し精度向上
- 履歴管理改善
- フォント選択拡充
- レイアウト最適化

## 📋 今後の拡張計画

### 短期（v0.6）

- **コラボレーション機能**: リアルタイム共同編集
- **テンプレート機能**: 楽曲テンプレート保存・共有
- **インポート機能**: ChordPro, MusicXML対応

### 中期（v0.7-0.8）

- **音声機能**: 楽曲再生・メトロノーム
- **クラウド同期**: アカウント連携・データ同期
- **楽器対応**: ウクレレ、ピアノコード表示

### 長期（v1.0+）

- **AI機能**: 自動コード提案・楽曲解析
- **プラグインシステム**: サードパーティ拡張
- **デスクトップアプリ**: Electron版リリース

---

**技術仕様書 ver0.5.0** - 詳細実装ガイド
