# 🧩 コンポーネントカタログ

## 📋 目次

1. [ボタンバリエーション](#ボタンバリエーション)
2. [フォームコンポーネント](#フォームコンポーネント)
3. [ナビゲーション](#ナビゲーション)
4. [データ表示](#データ表示)
5. [モーダル・オーバーレイ](#モーダル・オーバーレイ)
6. [ツールバー](#ツールバー)
7. [レイアウトコンポーネント](#レイアウトコンポーネント)

---

## ボタンバリエーション

### 🔘 基本ボタン

#### プライマリボタン

```html
<button class="primary">保存</button> <button class="primary">適用</button>
```

**用途**: 主要なアクション（保存、適用、開始など）

#### セカンダリボタン（ゴースト）

```html
<button class="ghost">キャンセル</button>
<button class="ghost">元に戻す</button>
```

**用途**: 副次的なアクション（キャンセル、戻る、設定など）

#### 危険ボタン

```html
<button class="danger ghost">消しゴム</button>
<button class="danger ghost">セクション削除</button>
```

**用途**: 削除や危険なアクション

### 🏷️ チップボタン

#### 通常チップ

```html
<button class="chip">C</button>
<button class="chip">Am</button>
<button class="chip">F</button>
```

**用途**: コード選択、カテゴリ選択

#### セクションチップ

```html
<button class="section-chip" data-section="INTRO">INTRO</button>
<button class="section-chip" data-section="VERSE">VERSE</button>
```

**用途**: セクション選択

#### 特殊チップ

```html
<button id="btn-sep" class="chip">｜</button>
```

**用途**: 区切り線、特殊記号

---

## フォームコンポーネント

### 📝 フィールド

#### 基本フィールド

```html
<label class="field">
  <span>ラベル</span>
  <input type="text" value="値" />
</label>
```

#### 選択フィールド

```html
<label class="field">
  <span>キー</span>
  <select>
    <option value="C">C</option>
    <option value="G">G</option>
  </select>
</label>
```

#### レンジフィールド

```html
<label class="field">
  <span>歌詞サイズ</span>
  <input type="range" min="10" max="28" value="16" />
</label>
```

#### カラーフィールド

```html
<label class="field">
  <span>コード色</span>
  <input type="color" value="#b00020" />
</label>
```

### 📄 テキストエリア

```html
<textarea
  id="lyrics-input"
  placeholder="歌詞を入力してください&#10;改行で行が分割されます"
  aria-label="歌詞テキスト"
  aria-describedby="lyrics-help"
></textarea>
```

---

## ナビゲーション

### 🎛️ ツールバー

```html
<div class="toolbar" role="toolbar">
  <button id="btn-help" class="ghost">ヘルプ</button>
  <button id="btn-print" class="ghost">印刷</button>
  <button id="btn-save" class="ghost">保存</button>
  <button id="btn-load" class="ghost">読込</button>
  <div class="version-badge">v0.5</div>
</div>
```

### 📑 タブナビゲーション

```html
<div class="help-tabs" role="tablist">
  <button class="help-tab active" role="tab" data-target="basic">
    基本操作
  </button>
  <button class="help-tab" role="tab" data-target="shortcuts">
    ショートカット
  </button>
  <button class="help-tab" role="tab" data-target="features">機能説明</button>
  <button class="help-tab" role="tab" data-target="faq">FAQ</button>
</div>
```

---

## データ表示

### 📃 履歴リスト

```html
<div id="history-list" class="history-list" role="list">
  <!-- 動的に生成される履歴アイテム -->
</div>
```

### 🎼 プリセットリスト

```html
<div id="preset-list" class="chip-row" role="group">
  <!-- 動的に生成されるコードチップ -->
</div>
```

### 🏆 バージョン表示

```html
<div class="version-badge" id="version-badge">v0.5</div>
```

---

## モーダル・オーバーレイ

### 💬 ヘルプモーダル

```html
<div id="help-modal" class="modal-overlay" style="display: none;">
  <div class="help-modal" role="dialog" aria-labelledby="help-title">
    <div class="modal-header">
      <h2 id="help-title">操作ガイド</h2>
      <button id="help-close" class="modal-close" aria-label="閉じる">×</button>
    </div>

    <div class="modal-body">
      <!-- タブとコンテンツ -->
    </div>

    <footer class="modal-footer">
      <p>
        💡 <strong>ヒント:</strong> F1キーでいつでもこのヘルプを表示できます
      </p>
    </footer>
  </div>
</div>
```

### 📊 行削減プレビューモーダル

```html
<div id="reduce-lines-modal" class="modal-overlay" style="display: none;">
  <div class="reduce-lines-modal">
    <div class="modal-header">
      <h2>行削減プレビュー</h2>
      <button id="reduce-lines-close" class="modal-close" aria-label="閉じる">
        ×
      </button>
    </div>

    <div class="modal-content">
      <div class="preview-comparison">
        <div class="preview-section">
          <h3>変更前</h3>
          <div id="reduce-lines-before" class="lyrics-preview"></div>
        </div>
        <div class="preview-section">
          <h3>変更後</h3>
          <div id="reduce-lines-after" class="lyrics-preview"></div>
        </div>
      </div>

      <!-- 設定セクション -->
    </div>

    <div class="modal-footer">
      <button id="reduce-lines-apply" class="primary">適用</button>
      <button id="reduce-lines-cancel" class="ghost">キャンセル</button>
    </div>
  </div>
</div>
```

---

## ツールバー

### 🛠️ ページツールボタン

```html
<div class="tool-buttons">
  <button id="btn-eraser-page" class="tool-btn danger">🗑️</button>
  <button id="btn-edit-mode-page" class="tool-btn">✏️</button>
</div>
```

### 🔧 コントロールボタン

```html
<button id="btn-eraser-controls" class="danger ghost">消しゴム</button>
<button id="btn-section-eraser" class="danger ghost">セクション削除</button>
<button id="btn-edit-mode-controls" class="ghost">編集モード</button>
```

---

## レイアウトコンポーネント

### 📐 メインレイアウト

```html
<div class="app-container">
  <header class="app-header" role="banner">
    <div class="brand">
      <h1>🎵 Songbook Maker</h1>
    </div>
    <div class="toolbar" role="toolbar">
      <!-- ツールバーコンテンツ -->
    </div>
  </header>

  <main class="app-main">
    <section class="left-panel" role="complementary">
      <!-- 歌詞エディタ -->
    </section>

    <section class="right-panel" role="main">
      <!-- A4プレビュー -->
    </section>
  </main>
</div>
```

### 📄 A4プレビューレイアウト

```html
<div class="right-content">
  <div class="preview-wrap">
    <div class="tool-buttons">
      <!-- ページツールボタン -->
    </div>

    <div id="page-content" class="page-content">
      <div class="page-title">
        <!-- タイトル・メタ情報 -->
      </div>

      <div class="lyrics-container">
        <!-- 歌詞行とコード -->
      </div>
    </div>
  </div>
</div>
```

### 🏗️ パレット構造

```html
<div class="palette">
  <div class="palette-row">
    <div class="palette-title">セクション</div>
    <div class="chip-row">
      <!-- セクションチップ -->
    </div>
  </div>

  <div class="palette-row">
    <div class="palette-title">プリセット</div>
    <div id="preset-list" class="chip-row">
      <!-- プリセットチップ -->
    </div>
  </div>
</div>
```

---

## 🎨 スタイル例

### ボタンの状態

```css
/* 通常状態 */
.chip {
  background: var(--chip);
  border: 1px solid var(--border);
}

/* ホバー状態 */
.chip:hover {
  outline: 2px solid rgba(59, 130, 246, 0.5);
  transform: translateY(-1px);
}

/* アクティブ状態 */
.chip.active {
  outline: 2px solid rgba(59, 130, 246, 0.9);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2) inset;
}
```

### アニメーション例

```css
/* フェードイン */
.help-panel {
  animation: fadeIn 0.3s ease;
}

/* コード配置アニメーション */
.chord {
  animation: chord-placed 0.3s ease;
}

/* 削除アニメーション */
.chord-deleted {
  animation: chord-deleted 0.3s ease;
}
```

---

## 📱 レスポンシブバリエーション

### モバイル対応

```css
@media (max-width: 900px) {
  .chip {
    min-height: 44px;
    min-width: 44px;
    padding: 8px 12px;
  }

  .tool-btn {
    min-height: 44px;
    min-width: 44px;
  }
}
```

---

このカタログを参考に、新しいコンポーネントを作成する際は既存のパターンを踏襲し、デザインシステムの一貫性を保ってください。
