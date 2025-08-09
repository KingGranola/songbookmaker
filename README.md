# 📖 Songbook Maker Next

弾き語り向けのA4サイズ歌詞＋コードネーム一体型歌本メーカー。Next.js + React + TypeScriptで開発されたモダンなPWA（Progressive Web App）です。

![Songbook Maker Screenshot](https://via.placeholder.com/800x400/3b82f6/ffffff?text=Songbook+Maker+Next)

## ✨ 主な機能

### 🎵 音楽機能
- **楽曲情報管理**: タイトル、アーティスト、作曲者の記録
- **歌詞＋コード配置**: 直感的なドラッグ&ドロップでコード配置
- **自動コード生成**: キーとモードに基づくダイアトニックコード自動生成
- **移調機能**: 簡単なキー変更でコード自動変換
- **プリセット機能**: トライアド、セブンス、テンション等の複数プリセット

### 🎨 デザイン・レイアウト
- **A4プレビュー**: 印刷に最適化されたリアルタイムプレビュー
- **カスタマイズ機能**: フォント、色、サイズ、余白の詳細設定
- **レスポンシブデザイン**: デスクトップ・タブレット・モバイル対応
- **アクセシビリティ**: WCAG 2.1 AA準拠のバリアフリー設計

### 💾 データ管理
- **プロジェクト保存**: ローカルストレージによる自動保存
- **履歴機能**: 編集履歴の管理と復元
- **PDF出力**: 印刷可能なPDF書き出し
- **PWA対応**: オフライン利用・アプリインストール可能

## 🚀 開発環境のセットアップ

### 必要な環境
- Node.js 18.0.0以上
- npm 9.0.0以上

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/[your-username]/songbook-maker-next.git
cd songbook-maker-next

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認してください。

### 利用可能なスクリプト

```bash
npm run dev      # 開発サーバーを起動（Turbopack使用）
npm run build    # 本番用ビルドを作成
npm run start    # 本番モードでサーバーを起動
npm run lint     # ESLintによるコード品質チェック
```

## 🏗️ 技術スタック

### フロントエンド
- **Next.js 15**: React フレームワーク（App Router使用）
- **React 19**: UIライブラリ
- **TypeScript**: 型安全な開発
- **TailwindCSS 4**: ユーティリティファーストCSS
- **Zustand**: 軽量状態管理ライブラリ

### UI・UX
- **Radix UI**: アクセシブルなUIコンポーネント
- **Lucide React**: モダンなアイコンセット
- **Framer Motion**: アニメーション・モーション
- **React DnD**: ドラッグ&ドロップ機能

### 開発・ビルド
- **ESLint**: コード品質・統一性の維持
- **PostCSS**: CSS処理・最適化
- **PWA**: Service Worker・Manifest対応

## 📁 プロジェクト構成

```
songbook-maker-next/
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── layout.tsx      # ルートレイアウト
│   │   ├── page.tsx        # メインページ
│   │   └── globals.css     # グローバルスタイル
│   ├── components/         # Reactコンポーネント
│   │   ├── ui/             # 再利用可能UIコンポーネント
│   │   ├── songbook-app.tsx # メインアプリケーション
│   │   ├── header.tsx      # ヘッダーコンポーネント
│   │   ├── left-panel.tsx  # 左パネル（入力エリア）
│   │   ├── preview-area.tsx # プレビューエリア
│   │   └── right-panel.tsx # 右パネル（設定エリア）
│   ├── stores/             # 状態管理
│   │   └── app-store.ts    # Zustandストア
│   ├── lib/                # ユーティリティ・ヘルパー
│   │   ├── utils.ts        # 共通ユーティリティ
│   │   └── presets.ts      # 音楽理論・プリセット
│   └── types/              # TypeScript型定義
│       └── index.ts        # 型定義
├── docs/                   # ドキュメント
│   ├── SPECIFICATION.md    # 技術仕様書
│   ├── USER_GUIDE.md       # ユーザーガイド
│   └── DESIGN_SYSTEM.md    # デザインシステム
└── public/                 # 静的アセット
    ├── manifest.json       # PWA マニフェスト
    └── icons/              # アプリアイコン
```

## 🎯 音楽理論の実装

### サポートされている機能
- **キー**: C, C#, D, D#, E, F, F#, G, G#, A, A#, B
- **モード**: メジャー（長調）、マイナー（短調）
- **コードタイプ**: トライアド、セブンス、テンション、sus系
- **機能和声**: ダイアトニックコード、セカンダリードミナント、サブドミナントマイナー

### コード表記ルール [[memory:5651397]]
- 異名同音の表記: 調号に基づく適切な表記（例：Fキーでは`BbM7`、`A#M7`ではなく）
- 正規化: `Cm7b5` → `Cm7(b5)`、`CM7` → `C△7` など

## 🔧 設定・カスタマイズ

### デザイン設定
- **フォント**: システムフォント、セリフ、サンセリフから選択
- **フォントサイズ**: 歌詞（12-24px）、コード（10-20px）
- **色設定**: コード色、背景色のカスタマイズ
- **レイアウト**: 余白、行間、文字間隔の調整

### 表示設定
- **プレビューモード**: A4印刷プレビュー
- **ズーム機能**: 50%-200%のスケーリング
- **グリッド表示**: コード配置支援

## 📱 PWA機能

- **オフライン対応**: Service Workerによるキャッシュ
- **アプリインストール**: ホーム画面に追加可能
- **レスポンシブ**: 全デバイスサイズ対応
- **高パフォーマンス**: 2秒以下の初回読み込み

## 🤝 コントリビューション

1. リポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 🙏 謝辞

- [Next.js](https://nextjs.org/) - 素晴らしいReactフレームワーク
- [TailwindCSS](https://tailwindcss.com/) - ユーティリティファーストCSS
- [Radix UI](https://www.radix-ui.com/) - アクセシブルなUIコンポーネント
- [Zustand](https://github.com/pmndrs/zustand) - シンプルな状態管理

---

**Version**: 0.5.0  
**Last Updated**: 2025年1月
