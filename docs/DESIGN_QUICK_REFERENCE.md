# ⚡ デザインクイックリファレンス

新機能追加や修正時に素早く参照できるデザインガイド

---

## 🎨 CSS変数チートシート

```css
/* 背景 */
--surface: #0b1220; /* メイン背景 */
--surface-2: rgba(15, 23, 42, 0.75); /* パネル背景 */

/* テキスト */
--text: #e6e9ef; /* メインテキスト */
--muted: #9aa3b2; /* サブテキスト */

/* アクセント */
--primary: #3b82f6; /* メインブルー */
--primary-light: #60a5fa; /* ライトブルー */
--primary-dark: #2563eb; /* ダークブルー */
--danger: #ef4444; /* エラー/削除 */

/* UI要素 */
--chip: #0f172a; /* チップ背景 */
--border: rgba(148, 163, 184, 0.18); /* ボーダー */
```

---

## 🔘 ボタンクラス

| クラス     | 外観             | 用途           |
| ---------- | ---------------- | -------------- |
| `.primary` | 青グラデーション | 主要アクション |
| `.ghost`   | 透明背景         | 副次アクション |
| `.danger`  | 赤背景           | 削除系         |
| `.chip`    | 小さなピル状     | 選択系         |

---

## 📐 スペーシング

```css
padding: 6px 10px; /* ボタン */
padding: 4px 6px; /* フィールド */
padding: 14px; /* パネル */
gap: 6px; /* 小さい間隔 */
gap: 8px; /* 標準間隔 */
margin-top: 12px; /* セクション間 */
```

---

## 🏗️ レイアウトパターン

### 基本パネル

```css
.panel {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}
```

### フィールド

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

### チップ行

```css
.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
```

---

## ⚡ アニメーション

### 標準トランジション

```css
transition: all 0.2s ease;
```

### ホバー効果

```css
:hover {
  transform: translateY(-1px);
  filter: brightness(1.1);
}
```

### 配置アニメーション

```css
animation: chord-placed 0.3s ease;
```

---

## 📱 レスポンシブ

### ブレークポイント

- **モバイル**: `<= 900px`
- **デスクトップ**: `> 900px`

### モバイル調整

```css
@media (max-width: 900px) {
  .chip {
    min-height: 44px;
    min-width: 44px;
  }
}
```

---

## 🆔 主要ID/クラス

### レイアウト

- `.app-main` - メイングリッド
- `.left-panel` - 歌詞エディタ
- `.right-panel` - プレビューエリア
- `#page-content` - A4プレビュー

### UI要素

- `.chip` - コード選択ボタン
- `.section-chip` - セクション選択
- `.field` - フォームフィールド
- `.helpers` - ヘルパーボタン群

### モーダル

- `.modal-overlay` - モーダル背景
- `.modal-header` - モーダルヘッダー
- `.modal-footer` - モーダルフッター

---

## 🎯 開発時チェックリスト

新しいコンポーネント追加時：

- [ ] CSS変数を使用している
- [ ] 適切なスペーシングを使用
- [ ] トランジション効果を追加
- [ ] レスポンシブ対応済み
- [ ] アクセシビリティ対応済み
- [ ] 既存パターンと一貫性がある

---

## 🔧 よく使うコードスニペット

### 新しいボタン

```html
<button class="primary" id="btn-new">新機能</button>
```

### 新しいフィールド

```html
<label class="field">
  <span>設定名</span>
  <input type="text" value="デフォルト値" />
</label>
```

### 新しいチップ

```html
<button class="chip" data-value="値">表示名</button>
```

### 新しいモーダル

```html
<div id="new-modal" class="modal-overlay" style="display: none;">
  <div class="modal" role="dialog">
    <div class="modal-header">
      <h2>タイトル</h2>
      <button class="modal-close">×</button>
    </div>
    <div class="modal-content">
      <!-- コンテンツ -->
    </div>
    <div class="modal-footer">
      <button class="primary">実行</button>
      <button class="ghost">キャンセル</button>
    </div>
  </div>
</div>
```

---

このリファレンスを使って、デザインシステムに準拠した一貫性のあるUIを素早く実装してください。
