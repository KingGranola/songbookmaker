'use client';

import { useState } from 'react';
import { Save, FolderOpen, FileText, Settings, Music } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { FileUtils } from '@/lib/utils';
import { Button } from './ui/button';

/**
 * アプリケーションヘッダー
 */
export function Header() {
  const { state, exportProject, loadProject, toggleEditMode, toggleEraserMode } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);

  // プロジェクト保存
  const handleSave = () => {
    const data = exportProject();
    const filename = `${state.title || 'untitled'}_songbook.json`;
    FileUtils.downloadAsJSON(data, filename);
  };

  // プロジェクト読み込み
  const handleLoad = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const content = await FileUtils.readFile(file);
      const data = JSON.parse(content);
      loadProject(data);
    } catch (error) {
      console.error('プロジェクトの読み込みに失敗しました:', error);
      alert('プロジェクトの読み込みに失敗しました。');
    } finally {
      setIsLoading(false);
      // input をリセット
      event.target.value = '';
    }
  };

  // PDF印刷
  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between shadow-sm">
      {/* ロゴ・タイトル */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Music className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">SONGBOOK MAKER</h1>
          <p className="text-xs text-muted-foreground">
            {state.title ? `${state.title} - ${state.artist}` : '弾き語り向け歌本メーカー'}
          </p>
        </div>
      </div>

      {/* 中央のタイトル表示 */}
      <div className="flex-1 text-center">
        {state.title && (
          <div className="text-sm">
            <span className="font-medium">{state.title}</span>
            {state.artist && <span className="text-muted-foreground ml-2">by {state.artist}</span>}
          </div>
        )}
      </div>

      {/* 右側のツールバー */}
      <div className="flex items-center gap-2">
        {/* モード切り替え */}
        <div className="flex gap-1 mr-4">
          <Button
            variant={state.isEditMode ? 'default' : 'outline'}
            size="sm"
            onClick={toggleEditMode}
            className="text-xs"
          >
            編集
          </Button>
          <Button
            variant={state.isEraserMode ? 'default' : 'outline'}
            size="sm"
            onClick={toggleEraserMode}
            className="text-xs"
          >
            消去
          </Button>
        </div>

        {/* ファイル操作 */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={isLoading}
          className="gap-1"
        >
          <Save className="w-4 h-4" />
          保存
        </Button>

        <label className="relative">
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="gap-1 cursor-pointer"
            asChild
          >
            <span>
              <FolderOpen className="w-4 h-4" />
              開く
            </span>
          </Button>
          <input
            type="file"
            accept=".json"
            onChange={handleLoad}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={isLoading}
          />
        </label>

        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          disabled={isLoading}
          className="gap-1"
        >
          <FileText className="w-4 h-4" />
          PDF
        </Button>

        {/* 設定（将来的に実装） */}
        <Button
          variant="ghost"
          size="sm"
          disabled
          className="gap-1"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
