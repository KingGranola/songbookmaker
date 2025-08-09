'use client';

import { useRef, useState, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { useAppStore } from '@/stores/app-store';
import { ChordDisplay } from './chord-display';

/**
 * 中央: プレビューエリア
 */
export function PreviewArea() {
  const { state, addChordPlacement, removeChordPlacement, updateChordPlacement } = useAppStore();
  const previewRef = useRef<HTMLDivElement>(null);
  const [isPlacingChord, setIsPlacingChord] = useState(false);

  // ドロップエリアの設定
  const [{ isOver }, drop] = useDrop({
    accept: 'chord',
    drop: (item, monitor) => {
      if (!previewRef.current) return;
      
      const offset = monitor.getClientOffset();
      const rect = previewRef.current.getBoundingClientRect();
      
      if (offset) {
        const x = offset.x - rect.left + previewRef.current.scrollLeft;
        const y = offset.y - rect.top + previewRef.current.scrollTop;
        return { x, y };
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // クリック位置でのコード配置
  const handlePreviewClick = useCallback((event: React.MouseEvent) => {
    if (!state.selectedChord || !previewRef.current) return;

    const rect = previewRef.current.getBoundingClientRect();
    const scrollTop = previewRef.current.scrollTop;
    const scrollLeft = previewRef.current.scrollLeft;

    const x = event.clientX - rect.left + scrollLeft;
    const y = event.clientY - rect.top + scrollTop;

    // ヘッダー部分（タイトルエリア）を避ける
    if (y < 120) return;

    addChordPlacement({
      chord: state.selectedChord,
      x,
      y,
      lineIndex: Math.floor((y - 120) / (state.fontSizeLyrics * (state.lineGap * 0.1 + 1.2))),
    });

    setIsPlacingChord(true);
    setTimeout(() => setIsPlacingChord(false), 200);
  }, [state.selectedChord, state.fontSizeLyrics, state.lineGap, addChordPlacement]);

  // コード削除（右クリック時）
  const handleChordClick = useCallback((chordId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    // 右クリックで削除
    if (event.button === 2) {
      removeChordPlacement(chordId);
    }
  }, [removeChordPlacement]);

  // コード移動処理
  const handleChordMove = useCallback((id: string, x: number, y: number) => {
    updateChordPlacement(id, { x, y });
  }, [updateChordPlacement]);

  return (
    <div className="h-full p-4 overflow-auto relative">
      {/* 選択中のコード表示 - Apple風 */}
      {state.selectedChord && (
        <div className="absolute top-4 left-4 z-10 bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm no-print">
          📝 {state.selectedChord} - クリックで配置
        </div>
      )}

      <div 
        ref={(node) => {
          previewRef.current = node;
          drop(node);
        }}
        className={`max-w-[210mm] mx-auto bg-white shadow-lg p-8 min-h-[297mm] relative cursor-${
          state.selectedChord ? 'crosshair' : 'default'
        } transition-all duration-200 ${isPlacingChord ? 'scale-[1.002]' : ''} ${
          isOver ? 'ring-2 ring-blue-300 ring-opacity-50' : ''
        } print-container avoid-break rounded-2xl`}
        onClick={handlePreviewClick}
        style={{
          filter: isPlacingChord ? 'brightness(1.02)' : 'none',
          backgroundColor: isOver ? 'rgba(59, 130, 246, 0.02)' : 'white',
        }}
      >
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
          className="whitespace-pre-wrap relative min-h-[400px]"
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
              {state.selectedChord && (
                <div className="mt-4 text-sm text-gray-600">
                  クリックして「{state.selectedChord}」を配置
                </div>
              )}
            </div>
          )}
        </div>

        {/* 配置されたコード */}
        {state.chordPlacements.map((placement) => (
          <ChordDisplay
            key={placement.id}
            placement={placement}
            fontSize={state.fontSizeChord}
            fontFamily={state.chordFontFamily}
            color={state.chordColor}
            isEraserMode={false}
            onClick={(event) => handleChordClick(placement.id, event)}
            onMove={handleChordMove}
          />
        ))}

        {/* 編集ヘルプテキスト */}
        {state.lyrics && !state.selectedChord && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-medium shadow-sm no-print">
            左のパネルからコードを選択してください
          </div>
        )}
      </div>
    </div>
  );
}
