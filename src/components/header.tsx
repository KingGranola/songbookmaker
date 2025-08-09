'use client';

import { useState } from 'react';
import { Save, FolderOpen, FileText, Settings, Music } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { FileUtils } from '@/lib/utils';

/**
 * アプリケーションヘッダー
 */
export function Header() {
  const { state, exportProject, loadProject } = useAppStore();
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
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm">
      {/* ロゴ・タイトル - Apple風デザイン */}
      <div className="flex items-center gap-4">
        <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm">
          <Music className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">SONGBOOK MAKER</h1>
          <p className="text-xs text-gray-600 leading-tight">
            {state.title ? `${state.title}${state.artist ? ` - ${state.artist}` : ''}` : '弾き語り向け歌本メーカー'}
          </p>
        </div>
      </div>

      {/* 中央のタイトル表示（省略してシンプルに） */}
      <div className="flex-1"></div>

      {/* 右側のツールバー - Apple風ボタン */}
      <div className="flex items-center gap-3">


        {/* ファイル操作 - Apple風デザイン */}
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="btn-secondary text-sm h-10 px-4 min-w-[80px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4 mr-2" />
          保存
        </button>

        <label className="cursor-pointer">
          <input
            type="file"
            accept=".json"
            onChange={handleLoad}
            className="hidden"
            disabled={isLoading}
          />
          <span className={`btn-secondary text-sm h-10 px-4 min-w-[80px] inline-flex items-center justify-center ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <FolderOpen className="w-4 h-4 mr-2" />
            開く
          </span>
        </label>

        <button
          onClick={handlePrint}
          disabled={isLoading}
          className="btn-primary text-sm h-10 px-4 min-w-[80px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className="w-4 h-4 mr-2" />
          印刷
        </button>

        {/* 設定ボタン（アイコンのみ） */}
        <button 
          disabled
          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </header>
  );
}
