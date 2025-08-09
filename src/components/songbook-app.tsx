'use client';

import { useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useAppStore } from '@/stores/app-store';
import { Header } from './header';
import { LeftPanel } from './left-panel';
import { PreviewArea } from './preview-area';
import { RightPanel } from './right-panel';

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
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-background">
        {/* ヘッダー */}
        <div className="no-print">
          <Header />
        </div>
        
        {/* メインコンテンツ - Apple風レイアウト */}
        <main className="flex h-[calc(100vh-4rem)] relative bg-gray-50">
          {/* 左カラム: 音楽入力エリア */}
          <div className="w-80 xl:w-80 lg:w-72 md:w-64 music-left-panel no-print hidden md:flex flex-col">
            <LeftPanel />
          </div>
          
          {/* 中央: プレビューエリア */}
          <div className="flex-1 relative preview-area p-6">
            <div className="h-full preview-container">
              <PreviewArea />
            </div>
          </div>
          
          {/* 右カラム: 設定エリア */}
          <div className="w-72 xl:w-72 lg:w-64 md:w-60 settings-right-panel no-print hidden lg:flex flex-col">
            <RightPanel />
          </div>

          {/* モバイル用フローティングパネル */}
          <div className="md:hidden lg:hidden fixed bottom-6 left-4 right-4 z-50 no-print">
            <div className="card-apple shadow-xl">
              <div className="text-sm font-semibold text-gray-700 mb-3">クイック設定</div>
              <div className="flex gap-3 overflow-x-auto">
                {/* モバイル用簡易設定 */}
              </div>
            </div>
          </div>
        </main>
      </div>
    </DndProvider>
  );
}
