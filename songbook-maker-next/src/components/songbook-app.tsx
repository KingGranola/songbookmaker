'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Header } from './header';
import { EditorPanel } from './editor-panel';
import { PreviewArea } from './preview-area';
import { PresetPanel } from './preset-panel';

/**
 * メインのSongbook Makerアプリケーション
 */
export function SongbookApp() {
  const { loadFromStorage } = useAppStore();

  // 初期化時にローカルストレージから状態を復元
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <Header />
      
      {/* メインコンテンツ */}
      <main className="flex h-[calc(100vh-4rem)]">
        {/* 左パネル: エディター */}
        <div className="w-1/3 min-w-[400px] border-r border-border editor-panel">
          <EditorPanel />
        </div>
        
        {/* 中央: プレビューエリア */}
        <div className="flex-1 relative preview-area">
          <PreviewArea />
        </div>
        
        {/* 右パネル: プリセット */}
        <div className="w-1/4 min-w-[300px] border-l border-border preset-panel">
          <PresetPanel />
        </div>
      </main>
    </div>
  );
}
