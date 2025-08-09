import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AppState, AppStore, ProjectData, ChordPlacement } from '@/types';
import { StorageUtils } from '@/lib/utils';

/**
 * デフォルト状態
 */
const defaultState: AppState = {
  // 楽曲情報
  title: '',
  artist: '',
  composer: '',
  lyrics: '',

  // 音楽設定
  key: 'C',
  mode: 'major',
  presetType: 'triad',

  // 表示設定
  fontSizeLyrics: 16,
  fontSizeChord: 14,
  chordColor: '#b00020',
  lyricsFontFamily: 'sans',
  chordFontFamily: 'sans',

  // レイアウト設定
  marginMm: 15,
  lineGap: 8,
  letterSpacing: 0,
  lineOffsetPx: 0,
  chordOffsetPx: -18,

  // インタラクション状態
  selectedChord: null,
  history: [],
  lyricsHistory: [],
  
  // コード配置
  chordPlacements: [],
  
  // UI状態
  transposeAll: false,
};

/**
 * メインアプリケーションストア
 */
export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        state: defaultState,

        // 基本更新
        updateState: (updates) =>
          set((store) => ({
            state: { ...store.state, ...updates }
          })),

        resetState: () =>
          set(() => ({
            state: { ...defaultState }
          })),

        // 楽曲情報
        setTitle: (title) =>
          set((store) => ({
            state: { ...store.state, title }
          })),

        setArtist: (artist) =>
          set((store) => ({
            state: { ...store.state, artist }
          })),

        setComposer: (composer) =>
          set((store) => ({
            state: { ...store.state, composer }
          })),

        setLyrics: (lyrics) =>
          set((store) => ({
            state: { ...store.state, lyrics }
          })),

        // 音楽設定
        setKey: (key) =>
          set((store) => ({
            state: { ...store.state, key }
          })),

        setMode: (mode) =>
          set((store) => ({
            state: { ...store.state, mode }
          })),

        setPresetType: (presetType) =>
          set((store) => ({
            state: { ...store.state, presetType }
          })),

        // コード操作
        addChordToHistory: (chord) =>
          set((store) => {
            // 重複を避けて履歴に追加
            const history = store.state.history.filter((h) => h !== chord);
            history.push(chord);
            // 履歴の上限を20に制限
            if (history.length > 20) {
              history.shift();
            }
            return {
              state: { ...store.state, history }
            };
          }),

        clearHistory: () =>
          set((store) => ({
            state: { ...store.state, history: [] }
          })),

        setSelectedChord: (chord) =>
          set((store) => ({
            state: { ...store.state, selectedChord: chord }
          })),

        // コード配置
        addChordPlacement: (placement) =>
          set((store) => {
            const newPlacement: ChordPlacement = {
              ...placement,
              id: `chord-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            };
            return {
              state: {
                ...store.state,
                chordPlacements: [...store.state.chordPlacements, newPlacement]
              }
            };
          }),

        updateChordPlacement: (id, updates) =>
          set((store) => {
            const chordPlacements = store.state.chordPlacements.map(p =>
              p.id === id ? { ...p, ...updates } : p
            );
            return {
              state: { ...store.state, chordPlacements }
            };
          }),

        removeChordPlacement: (id) =>
          set((store) => {
            const chordPlacements = store.state.chordPlacements.filter(p => p.id !== id);
            return {
              state: { ...store.state, chordPlacements }
            };
          }),

        clearChordPlacements: () =>
          set((store) => ({
            state: { ...store.state, chordPlacements: [] }
          })),

        // UI状態
        // UI操作は今後実装

        // プロジェクト管理
        loadProject: (data) =>
          set(() => {
            const { metadata, content, settings } = data.project;
            
            return {
              state: {
                ...settings,
                title: metadata.title,
                artist: metadata.artist,
                composer: metadata.composer,
                lyrics: content.lyrics,
                chordPlacements: content.chords.flat(),
              }
            };
          }),

        exportProject: (): ProjectData => {
          const state = get().state;
          return {
            version: 1,
            project: {
              metadata: {
                title: state.title,
                artist: state.artist,
                composer: state.composer,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              content: {
                lyrics: state.lyrics,
                chords: [state.chordPlacements], // 1つのセクションとして保存
              },
              settings: {
                key: state.key,
                mode: state.mode,
                presetType: state.presetType,
                fontSizeLyrics: state.fontSizeLyrics,
                fontSizeChord: state.fontSizeChord,
                chordColor: state.chordColor,
                lyricsFontFamily: state.lyricsFontFamily,
                chordFontFamily: state.chordFontFamily,
                marginMm: state.marginMm,
                lineGap: state.lineGap,
                letterSpacing: state.letterSpacing,
                lineOffsetPx: state.lineOffsetPx,
                chordOffsetPx: state.chordOffsetPx,
                selectedChord: state.selectedChord,
                history: state.history,
                lyricsHistory: state.lyricsHistory,

                transposeAll: state.transposeAll,
              },
            },
          };
        },

        // 永続化（Zustandのpersist以外の方法）
        saveToStorage: () => {
          const state = get().state;
          StorageUtils.setItem('songbook-app-state', state);
        },

        loadFromStorage: () => {
          const saved = StorageUtils.getItem<AppState>('songbook-app-state');
          if (saved) {
            set(() => ({
              state: { ...defaultState, ...saved }
            }));
          }
        },
      }),
      {
        name: 'songbook-storage', // localStorage key
        partialize: (state) => ({ state: state.state }), // 永続化する部分を指定
      }
    ),
    {
      name: 'songbook-store', // DevTools名
    }
  )
);

/**
 * 状態管理に関連するヘルパーフック
 */
export const useAppState = () => {
  const store = useAppStore();
  return store.state;
};

export const useAppActions = () => {
  const store = useAppStore();
  return {
    updateState: store.updateState,
    resetState: store.resetState,
    setTitle: store.setTitle,
    setArtist: store.setArtist,
    setComposer: store.setComposer,
    setLyrics: store.setLyrics,
    setKey: store.setKey,
    setMode: store.setMode,
    setPresetType: store.setPresetType,
    addChordToHistory: store.addChordToHistory,
    clearHistory: store.clearHistory,
    setSelectedChord: store.setSelectedChord,
    addChordPlacement: store.addChordPlacement,
    updateChordPlacement: store.updateChordPlacement,
    removeChordPlacement: store.removeChordPlacement,
    clearChordPlacements: store.clearChordPlacements,

    loadProject: store.loadProject,
    exportProject: store.exportProject,
    saveToStorage: store.saveToStorage,
    loadFromStorage: store.loadFromStorage,
  };
};
