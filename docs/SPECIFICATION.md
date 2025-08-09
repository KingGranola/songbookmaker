# SONGBOOK MAKER NEXT 技術仕様書 (ver0.6.0)

## 📋 概要

弾き語り向けのA4サイズ歌詞＋コードネーム一体型歌本メーカー。Next.js + React + TypeScriptで開発されたモダンなPWA（Progressive Web App）として設計されています。

## 🏗️ アーキテクチャ

### システム構成

```
Frontend (Next.js App)
├── UI Layer (React Components + TailwindCSS)
├── Application Layer (TypeScript + React Hooks)
├── State Management (Zustand Store)
├── Service Worker (PWA)
└── Local Storage (localStorage + IndexedDB)
```

### 設計原則

- **コンポーネントベース設計**: React コンポーネントによる UI 分離
- **型安全性**: TypeScript による静的型チェック
- **リアクティブ状態管理**: Zustand による軽量状態管理
- **アクセシビリティファースト**: Radix UI による包括的なユーザー体験

## 🛠️ 技術スタック

### フロントエンド

- **Next.js 15**: React フレームワーク（App Router使用）
- **React 19**: UIライブラリ（Concurrent Features対応）
- **TypeScript**: 型安全な開発環境
- **TailwindCSS 4**: ユーティリティファーストCSS
- **Zustand**: 軽量状態管理ライブラリ

### UI・UX

- **Radix UI**: アクセシブルなUIコンポーネント
- **Lucide React**: モダンなアイコンセット
- **Framer Motion**: アニメーション・モーション
- **React DnD**: ドラッグ&ドロップ機能

### 開発環境

- **Turbopack**: 高速ビルドツール（Next.js 15統合）
- **ESLint**: 静的解析・コード品質
- **PostCSS**: CSS処理・最適化

### PWA機能

- **Service Worker**: キャッシュ戦略・オフライン対応
- **Web App Manifest**: インストール可能化
- **Background Sync**: データ同期

## 📦 コンポーネント設計

### コアコンポーネント

#### `app/page.tsx` - エントリーポイント

```typescript
import { SongbookApp } from '@/components/songbook-app';

export default function Home() {
  return <SongbookApp />;
}
```

#### `components/songbook-app.tsx` - メインアプリケーション

```typescript
'use client';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useAppStore } from '@/stores/app-store';

export function SongbookApp() {
  const { loadFromStorage } = useAppStore();
  // アプリケーション初期化・レンダリング
}
```

#### `stores/app-store.ts` - Zustand状態管理

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // 楽曲情報
  title: string;
  artist: string;
  lyrics: string;
  // 設定情報
  key: string;
  mode: 'major' | 'minor';
  // アクション
  updateSong: (updates: Partial<SongInfo>) => void;
  loadFromStorage: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 状態とアクション定義
    }),
    { name: 'songbook-storage' }
  )
);
```

#### `components/ui/` - 再利用可能UIコンポーネント

```typescript
// Radix UI ベースのコンポーネント
// button.tsx, input.tsx, select.tsx, etc.
```

### UI・レンダリング

#### `components/left-panel.tsx` - 左パネル（入力エリア）

- 楽曲情報入力フォーム
- 歌詞テキストエリア
- プリセットチューダ選択
- 編集履歴管理

#### `components/preview-area.tsx` - プレビューエリア

- A4サイズプレビューレンダリング
- コード配置・ドラッグ&ドロップ（React DnD使用）
- リアルタイムプレビュー更新
- 印刷レイアウト表示

#### `components/right-panel.tsx` - 右パネル（設定エリア）

- フォント・色・サイズ設定
- レイアウト調整
- プリセット設定
- エクスポート機能

#### `lib/presets.ts` - プリセット生成

- ダイアトニックコード計算
- セカンダリードミナント生成
- サブドミナントマイナー対応
- キー変換・移調処理

### 高度な機能

#### キーボードショートカット

```typescript
// useEffect フックでキーボードイベント処理
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 's':
          event.preventDefault();
          saveProject();
          break;
        case 'z':
          event.preventDefault();
          undo();
          break;
      }
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

#### タッチジェスチャー（React DnD）

```typescript
import { useDrag, useDrop } from 'react-dnd';

function ChordComponent({ chord }: { chord: ChordData }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'chord',
    item: { id: chord.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return <div ref={drag} className={isDragging ? 'opacity-50' : ''}>{chord.name}</div>;
}
```

#### パフォーマンス最適化（React Hooks）

```typescript
import { useMemo, useCallback, useDebounce } from 'react';

// メモ化
const diatonicChords = useMemo(() => 
  generateDiatonicChords(key, mode), [key, mode]
);

// コールバック最適化
const updateLyrics = useCallback(
  (newLyrics: string) => setLyrics(newLyrics),
  []
);

// デバウンス処理
const debouncedSearch = useDebounce(searchTerm, 300);
```

## 🎨 スタイルシート設計

### TailwindCSS アーキテクチャ

- **ユーティリティファースト**: 事前定義されたクラスによる高速開発
- **コンポーネント単位**: Reactコンポーネント内でのスタイル管理
- **デザインシステム**: 一貫したデザイントークン
- **レスポンシブデザイン**: モバイルファーストアプローチ

### ファイル構成

```
src/
├── app/
│   └── globals.css        # TailwindCSS基本設定・カスタムスタイル
├── components/
│   ├── ui/               # Radix UI + TailwindCSSスタイル
│   │   ├── button.tsx    # ボタンコンポーネント
│   │   ├── input.tsx     # 入力フィールド
│   │   └── card.tsx      # カードレイアウト
│   └── *.tsx             # 各コンポーネントでTailwindクラス使用
└── styles/               # カスタムCSSが必要な場合
```

### TailwindCSS設定

```javascript
// tailwind.config.ts
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
```

### カスタムCSSクラス

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .card-apple {
    @apply bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-xl;
  }
  
  .music-panel {
    @apply bg-gray-50/90 backdrop-blur-sm border-r border-gray-200;
  }
}

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
