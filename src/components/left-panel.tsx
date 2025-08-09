'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/app-store';
import { getPresetChords, getChordCategories } from '@/lib/presets';

/**
 * 左カラム: 歌詞入力エリア + コード選択
 */
export function LeftPanel() {
  const { state, setLyrics, setSelectedChord, addChordToHistory, clearHistory } = useAppStore();
  
  const presetChords = getPresetChords(state.key, state.mode, state.presetType);
  const categories = getChordCategories(state.mode);

  const handleChordClick = (chord: string) => {
    setSelectedChord(chord);
    addChordToHistory(chord);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-blue-50 to-white">
      {/* 歌詞入力エリア - Apple風デザイン */}
      <div className="flex-1 p-6">
        <div className="card-apple h-full flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">歌詞入力</h3>
            <p className="text-sm text-gray-600">楽曲の歌詞を入力してください</p>
          </div>
          <div className="flex-1 flex flex-col">
            <textarea
              value={state.lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="歌詞を入力してください..."
              className="input-apple flex-1 resize-none font-jp text-base"
              style={{
                fontSize: `${Math.max(state.fontSizeLyrics - 2, 14)}px`,
                lineHeight: `${state.lineGap * 0.1 + 1.4}`,
                letterSpacing: `${state.letterSpacing}px`,
              }}
            />
            <div className="mt-3 flex justify-between text-xs text-gray-500">
              <span>文字数: {state.lyrics.length}</span>
              <span>行数: {state.lyrics.split('\n').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 区切り線 */}
      <div className="px-6">
        <div className="h-px bg-gray-200"></div>
      </div>

      {/* コード選択エリア - Apple風デザイン */}
      <div className="h-96 overflow-y-auto p-6 space-y-4">
        {/* 現在選択中のコード - Apple風 */}
        <div className="card-apple">
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-gray-900">選択中のコード</h4>
          </div>
          <div className="text-center py-3">
            {state.selectedChord ? (
              <div className="inline-block px-6 py-3 bg-blue-500 text-white font-semibold text-lg rounded-xl shadow-sm">
                {state.selectedChord}
              </div>
            ) : (
              <span className="text-gray-500 text-sm">コードを選択してください</span>
            )}
          </div>
        </div>

        {/* 履歴 - Apple風 */}
        {state.history.length > 0 && (
          <div className="card-apple">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900">履歴</h4>
              <button
                onClick={clearHistory}
                className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors duration-150"
              >
                クリア
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {state.history.slice(-8).map((chord, index) => (
                <motion.button
                  key={`${chord}-${index}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleChordClick(chord)}
                  className="chord text-xs px-2 py-1.5 min-w-[44px] h-8"
                >
                  {chord}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* キー・モード情報 - Apple風 */}
        <div className="card-apple">
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-gray-900">楽曲設定</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-600">キー</span>
              <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg">{state.key}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-600">モード</span>
              <span className="font-semibold text-gray-900">
                {state.mode === 'major' ? 'メジャー' : 'マイナー'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-600">タイプ</span>
              <span className="font-semibold text-gray-900">
                {state.presetType === 'triad' ? 'トライアド' : 
                 state.presetType === 'seventh' ? 'セブンス' : 'すべて'}
              </span>
            </div>
          </div>
        </div>

        {/* プリセットコード - Apple風デザイン */}
        {categories.map((category, categoryIndex) => {
          const chords = presetChords[category.key];
          if (!chords || chords.length === 0) return null;

          return (
            <motion.div
              key={category.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.05, duration: 0.2 }}
              className="card-apple"
            >
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-gray-900">{category.shortTitle}</h4>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {chords.slice(0, 8).map((chord) => (
                  <motion.button
                    key={chord}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleChordClick(chord)}
                    className={`chord text-xs h-8 w-full px-1 ${
                      state.selectedChord === chord 
                        ? 'bg-blue-500 text-white border-blue-500' 
                        : ''
                    }`}
                  >
                    {chord}
                  </motion.button>
                ))}
              </div>
              {chords.length > 8 && (
                <div className="mt-3 text-center">
                  <span className="text-xs text-gray-500">
                    +{chords.length - 8}個のコード
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
