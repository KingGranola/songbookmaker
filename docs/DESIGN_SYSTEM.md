# 🎨 Songbook Maker - デザインシステム

## 📋 目次

1. [概要](#概要)
2. [カラーパレット](#カラーパレット)
3. [タイポグラフィ](#タイポグラフィ)
4. [スペーシング](#スペーシング)
5. [コンポーネント](#コンポーネント)
6. [レイアウト](#レイアウト)
7. [アニメーション・エフェクト](#アニメーション・エフェクト)
8. [レスポンシブデザイン](#レスポンシブデザイン)
9. [実装ガイドライン](#実装ガイドライン)

---

## 概要

Songbook Makerは、**ダークテーマ**を基調とした、**プロフェッショナルな音楽アプリケーション**のデザイン言語を採用しています。

### デザイン原則

- **直感的な操作性**: 音楽制作者にとって分かりやすいUI
- **視覚的な階層**: 重要な情報とツールを明確に区別
- **一貫性**: 全体を通じて統一されたデザイン言語
- **アクセシビリティ**: 適切なコントラスト比と操作性

---

## カラーパレット

### 🎨 メインカラー（CSS変数）

| 変数名            | 値                          | 用途                   | 例                   |
| ----------------- | --------------------------- | ---------------------- | -------------------- |
| `--surface`       | `#0b1220`                   | メイン背景色           | アプリ全体の背景     |
| `--surface-2`     | `rgba(15, 23, 42, 0.75)`    | パネル背景色           | サイドパネル、カード |
| `--text`          | `#e6e9ef`                   | メインテキスト色       | 基本テキスト         |
| `--muted`         | `#9aa3b2`                   | 補助テキスト色         | ラベル、説明文       |
| `--primary`       | `#3b82f6`                   | プライマリアクセント色 | 主要ボタン、選択状態 |
| `--primary-light` | `#60a5fa`                   | プライマリライト色     | ホバー効果           |
| `--primary-dark`  | `#2563eb`                   | プライマリダーク色     | プレス効果           |
| `--danger`        | `#ef4444`                   | 危険色                 | 削除ボタン、警告     |
| `--chip`          | `#0f172a`                   | チップ背景色           | コードチップ         |
| `--border`        | `rgba(148, 163, 184, 0.18)` | ボーダー色             | 境界線               |

### 🌈 カラー使用ガイドライン

#### プライマリブルー系統

```css
/* 通常状態 */
background: var(--primary); /* #3b82f6 */

/* ホバー状態 */
background: var(--primary-light); /* #60a5fa */

/* アクティブ/プレス状態 */
background: var(--primary-dark); /* #2563eb */
```

#### 状態別カラー

- **成功**: `#10b981` (グリーン系)
- **警告**: `#f59e0b` (オレンジ系)
- **エラー**: `var(--danger)` (レッド系)
- **情報**: `var(--primary)` (ブルー系)

---

## タイポグラフィ

### 📝 フォントファミリー

```css
/* システムフォント */
font-family:
  system-ui,
  -apple-system,
  Segoe UI,
  Roboto,
  Helvetica,
  Arial,
  'Apple Color Emoji',
  'Segoe UI Emoji';

/* 日本語対応フォント */
.ff-sans {
  font-family:
    ui-sans-serif,
    system-ui,
    -apple-system,
    Segoe UI,
    Roboto,
    'Noto Sans JP',
    Helvetica,
    Arial;
}

.ff-serif {
  font-family: ui-serif, 'Hiragino Mincho ProN', 'Noto Serif JP', serif;
}

.ff-rounded {
  font-family:
    'Hiragino Maru Gothic ProN', 'Rounded Mplus 1c', 'Yu Gothic UI',
    'Meiryo UI', sans-serif;
}
```

### 📏 フォントサイズスケール

| 用途             | サイズ | 行高   | 例             |
| ---------------- | ------ | ------ | -------------- |
| ヘッダータイトル | `18px` | `1.2`  | アプリタイトル |
| ページタイトル   | `20px` | `1.25` | 楽曲タイトル   |
| 本文             | `16px` | `1.35` | 歌詞テキスト   |
| UI小テキスト     | `12px` | `1.4`  | ラベル、ボタン |
| コードテキスト   | `14px` | `1.0`  | コード名       |

---

## スペーシング

### 📐 スペーシングスケール

```css
/* 基本単位: 4px */
--spacing-1: 4px; /* 細かい間隔 */
--spacing-2: 6px; /* 小さい間隔 */
--spacing-3: 8px; /* 標準間隔 */
--spacing-4: 10px; /* 中間隔 */
--spacing-5: 12px; /* 大きい間隔 */
--spacing-6: 14px; /* パネル内パディング */
--spacing-7: 16px; /* セクション間隔 */
--spacing-8: 24px; /* 大きなセクション間隔 */
```

### 📦 パディング・マージンガイドライン

- **パネル内パディング**: `14px`
- **ボタン内パディング**: `6px 10px`
- **フィールド内パディング**: `4px 6px`
- **コンポーネント間ギャップ**: `6px - 8px`
- **セクション間隔**: `12px - 24px`

---

## コンポーネント

### 🔘 ボタン

#### プライマリボタン

```css
.button.primary {
  background: linear-gradient(180deg, var(--primary-light), var(--primary));
  border: 1px solid var(--primary);
  color: white;
  padding: 6px 10px;
  border-radius: 8px;
  transition: all 0.2s ease;
}
```

#### ゴーストボタン

```css
.button.ghost {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
}
```

#### 危険ボタン

```css
.button.danger {
  background: var(--danger);
  border: 1px solid #dc2626;
  color: white;
}
```

### 🏷️ チップ（Chip）

```css
.chip {
  background: var(--chip);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  transition: all 0.2s ease;
}

.chip:hover {
  outline: 2px solid rgba(59, 130, 246, 0.5);
  transform: translateY(-1px);
}
```

### 📝 フィールド（Field）

```css
.field {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(31, 41, 55, 0.5);
  padding: 4px 6px;
  border-radius: 999px;
}
```

### 📱 モーダル

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
}

.modal {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  border: 2px solid #e2e8f0;
}
```

---

## レイアウト

### 🏗️ グリッドシステム

#### メインレイアウト

```css
.app-main {
  display: grid;
  grid-template-columns: 0.7fr 1fr; /* 左パネル:右パネル = 0.7:1 */
  gap: 0px;
}
```

#### レスポンシブブレークポイント

- **モバイル**: `<= 900px`
- **タブレット**: `901px - 1200px`
- **デスクトップ**: `> 1200px`

### 📐 パネル設計

```css
.panel {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(8px);
}
```

---

## アニメーション・エフェクト

### ⚡ トランジション

```css
/* 標準トランジション */
transition: all 0.2s ease;

/* ホバー効果 */
transform: translateY(-1px);
filter: brightness(1.1);

/* プレス効果 */
transform: scale(0.98);
```

### 🎭 アニメーション

#### フェードイン

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### チップ配置

```css
@keyframes chord-placed {
  0% {
    transform: scale(1.2) translateY(-5px);
    opacity: 0.8;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}
```

---

## レスポンシブデザイン

### 📱 モバイル対応

```css
@media (max-width: 900px) {
  .app-main {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .left-panel {
    order: 2;
  }
  .right-panel {
    order: 1;
  }

  .chip {
    min-height: 44px;
    min-width: 44px;
  }
}
```

### 🖥️ デスクトップ対応

```css
@media (min-width: 901px) {
  .app-main {
    grid-template-columns: minmax(300px, 0.7fr) minmax(650px, 1fr);
  }
}
```

---

## 実装ガイドライン

### ✅ 推奨事項

1. **CSS変数の使用**: 常にCSS変数を使用してカラーを指定
2. **一貫したスペーシング**: スペーシングスケールに従う
3. **トランジションの追加**: インタラクティブ要素には適切なトランジション
4. **アクセシビリティ**: 適切なARIAラベルとフォーカス管理

### ❌ 避けるべき事項

1. **ハードコードされたカラー**: 直接的なHEXコードの使用を避ける
2. **不適切なz-index**: 階層管理を適切に行う
3. **過度なアニメーション**: パフォーマンスに影響する重いアニメーション
4. **一貫性のないスペーシング**: 独自の間隔値の使用

### 🔧 開発時のチェックリスト

- [ ] CSS変数を使用しているか
- [ ] レスポンシブ対応されているか
- [ ] アクセシビリティに配慮されているか
- [ ] 一貫したスペーシングを使用しているか
- [ ] 適切なアニメーション効果があるか

---

## 🚀 更新履歴

- **v0.5.0**: 初回デザインシステム策定
- 今後のアップデートはこちらに記録

---

## 📞 サポート

デザインシステムに関する質問や提案は、プロジェクトのIssueで報告してください。
