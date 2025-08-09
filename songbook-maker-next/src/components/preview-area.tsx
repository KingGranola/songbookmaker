'use client';

import { useAppStore } from '@/stores/app-store';

/**
 * 中央: プレビューエリア
 */
export function PreviewArea() {
  const { state } = useAppStore();

  return (
    <div className="h-full p-4 overflow-auto">
      <div className="max-w-[210mm] mx-auto bg-white shadow-lg p-8 min-h-[297mm]">
        {/* タイトルエリア */}
        <div className="text-center mb-8">
          <h1 
            className="text-2xl font-bold mb-2"
            style={{ 
              fontFamily: state.lyricsFontFamily === 'serif' ? 'serif' : 'sans-serif',
              color: state.lyrics ? 'inherit' : '#ccc'
            }}
          >
            {state.title || 'タイトルを入力してください'}
          </h1>
          {state.artist && (
            <p className="text-sm text-gray-600">by {state.artist}</p>
          )}
          {state.composer && (
            <p className="text-xs text-gray-500">作曲: {state.composer}</p>
          )}
        </div>

        {/* 歌詞表示エリア */}
        <div 
          className="whitespace-pre-wrap relative"
          style={{
            fontSize: `${state.fontSizeLyrics}px`,
            lineHeight: `${state.lineGap * 0.1 + 1.2}`,
            letterSpacing: `${state.letterSpacing}px`,
            fontFamily: state.lyricsFontFamily === 'serif' ? 'serif' : 'sans-serif',
          }}
        >
          {state.lyrics || (
            <div className="text-gray-400 text-center py-16">
              左のエディターで歌詞を入力してください
            </div>
          )}
        </div>

        {/* コード配置エリア（将来実装） */}
        <div className="absolute inset-0 pointer-events-none">
          {/* コードが配置される場所 */}
        </div>
      </div>
    </div>
  );
}
