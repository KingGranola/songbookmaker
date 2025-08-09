/**
 * 音楽理論関連の型定義
 */
export type Key = 
  | 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E' | 'F' 
  | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab' | 'A' | 'A#' | 'Bb' | 'B';

export type Mode = 'major' | 'minor';

export type PresetType = 'triad' | 'seventh' | 'secondary' | 'all';

export type FontFamily = 'serif' | 'sans' | 'rounded' | 'mono' | 'mincho';

/**
 * コード配置情報
 */
export interface ChordPlacement {
  id: string;
  chord: string;
  x: number;
  y: number;
  lineIndex: number;
  isSection?: boolean;
}

/**
 * アプリケーション状態
 */
export interface AppState {
  // 楽曲情報
  title: string;
  artist: string;
  composer: string;
  lyrics: string;

  // 音楽設定
  key: Key;
  mode: Mode;
  presetType: PresetType;

  // 表示設定
  fontSizeLyrics: number;
  fontSizeChord: number;
  chordColor: string;
  lyricsFontFamily: FontFamily;
  chordFontFamily: FontFamily;

  // レイアウト設定
  marginMm: number;
  lineGap: number;
  letterSpacing: number;
  lineOffsetPx: number;
  chordOffsetPx: number;

  // インタラクション状態
  selectedChord: string | null;
  history: string[];
  lyricsHistory: string[];
  
  // コード配置
  chordPlacements: ChordPlacement[];
  
  // UI状態
  isEditMode: boolean;
  isEraserMode: boolean;
  transposeAll: boolean;
}

/**
 * プリセットコード
 */
export interface PresetChords {
  diatonic: string[];
  secondary?: string[];
  subDomMinor?: string[];
  twoFiveOne?: string[];
  tritone?: string[];
  suspended?: string[];
}

/**
 * プロジェクトデータ形式
 */
export interface ProjectData {
  version: number;
  project: {
    metadata: {
      title: string;
      artist: string;
      composer: string;
      createdAt: string;
      updatedAt: string;
    };
    content: {
      lyrics: string;
      chords: ChordPlacement[][];
    };
    settings: Omit<AppState, 'title' | 'artist' | 'composer' | 'lyrics' | 'chordPlacements'>;
  };
}

/**
 * コンポーネントのProps型
 */
export interface ChordChipProps {
  chord: string;
  isSelected?: boolean;
  onClick: (chord: string) => void;
  category?: string;
}

export interface LyricsEditorProps {
  lyrics: string;
  onChange: (lyrics: string) => void;
  fontSize: number;
  fontFamily: FontFamily;
  lineGap: number;
  letterSpacing: number;
}

export interface PreviewAreaProps {
  state: AppState;
  onChordPlace: (x: number, y: number, chord: string) => void;
  onChordEdit: (id: string, newChord: string) => void;
  onChordDelete: (id: string) => void;
}

export interface SettingsProps {
  state: AppState;
  onUpdate: (updates: Partial<AppState>) => void;
}

/**
 * カスタムフック型
 */
export interface UseKeyboardShortcuts {
  (callbacks: {
    onSave?: () => void;
    onLoad?: () => void;
    onPrint?: () => void;
    onUndo?: () => void;
    onToggleEdit?: () => void;
    onToggleEraser?: () => void;
    onFontSizeIncrease?: () => void;
    onFontSizeDecrease?: () => void;
    onEscape?: () => void;
  }): void;
}

/**
 * ストア型
 */
export interface AppStore {
  state: AppState;
  
  // アクション
  updateState: (updates: Partial<AppState>) => void;
  resetState: () => void;
  
  // 楽曲情報
  setTitle: (title: string) => void;
  setArtist: (artist: string) => void;
  setComposer: (composer: string) => void;
  setLyrics: (lyrics: string) => void;
  
  // 音楽設定
  setKey: (key: Key) => void;
  setMode: (mode: Mode) => void;
  setPresetType: (presetType: PresetType) => void;
  
  // コード操作
  addChordToHistory: (chord: string) => void;
  clearHistory: () => void;
  setSelectedChord: (chord: string | null) => void;
  
  // コード配置
  addChordPlacement: (placement: Omit<ChordPlacement, 'id'>) => void;
  updateChordPlacement: (id: string, updates: Partial<ChordPlacement>) => void;
  removeChordPlacement: (id: string) => void;
  clearChordPlacements: () => void;
  
  // UI状態
  toggleEditMode: () => void;
  toggleEraserMode: () => void;
  
  // プロジェクト管理
  loadProject: (data: ProjectData) => void;
  exportProject: () => ProjectData;
  
  // 永続化
  saveToStorage: () => void;
  loadFromStorage: () => void;
}
