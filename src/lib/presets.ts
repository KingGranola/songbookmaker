import { Key, Mode, PresetType, PresetChords } from '@/types';
import { MusicUtils } from './utils';

/**
 * 異名同音スケールテーブル
 */
const ENHARMONIC_SCALES: Record<string, string[]> = {
  // メジャーキー
  C: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  'C#': ['C#', 'D#', 'E#', 'F#', 'G#', 'A#', 'B#'],
  Db: ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C'],
  D: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
  'D#': ['D#', 'E#', 'F##', 'G#', 'A#', 'B#', 'C##'],
  Eb: ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'],
  E: ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
  F: ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
  'F#': ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#'],
  Gb: ['Gb', 'Ab', 'Bb', 'Cb', 'Db', 'Eb', 'F'],
  G: ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
  'G#': ['G#', 'A#', 'B#', 'C#', 'D#', 'E#', 'F##'],
  Ab: ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'],
  A: ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
  'A#': ['A#', 'B#', 'C##', 'D#', 'E#', 'F##', 'G##'],
  Bb: ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'],
  B: ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'],
};

/**
 * マイナーキー用異名同音スケールテーブル
 */
const MINOR_ENHARMONIC_SCALES: Record<string, string[]> = {
  C: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'],
  'C#': ['C#', 'D#', 'E', 'F#', 'G#', 'A', 'B'],
  Db: ['Db', 'Eb', 'E', 'Gb', 'Ab', 'A', 'Bb'],
  D: ['D', 'E', 'F', 'G', 'A', 'Bb', 'C'],
  'D#': ['D#', 'E#', 'F#', 'G#', 'A#', 'B', 'C#'],
  Eb: ['Eb', 'F', 'Gb', 'Ab', 'Bb', 'Cb', 'Db'],
  E: ['E', 'F#', 'G', 'A', 'B', 'C', 'D'],
  F: ['F', 'G', 'Ab', 'Bb', 'C', 'Db', 'Eb'],
  'F#': ['F#', 'G#', 'A', 'B', 'C#', 'D', 'E'],
  Gb: ['Gb', 'Ab', 'A', 'Cb', 'Db', 'D', 'Eb'],
  G: ['G', 'A', 'Bb', 'C', 'D', 'Eb', 'F'],
  'G#': ['G#', 'A#', 'B', 'C#', 'D#', 'E', 'F#'],
  Ab: ['Ab', 'Bb', 'Cb', 'Db', 'Eb', 'Fb', 'Gb'],
  A: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  'A#': ['A#', 'B#', 'C#', 'D#', 'E#', 'F#', 'G#'],
  Bb: ['Bb', 'C', 'Db', 'Eb', 'F', 'Gb', 'Ab'],
  B: ['B', 'C#', 'D', 'E', 'F#', 'G', 'A'],
};

/**
 * 相対長調キーを取得
 */
function getRelativeMajorKey(minorKey: Key): Key {
  const minorToMajor: Record<string, Key> = {
    A: 'C',
    'A#': 'C#',
    Bb: 'Db',
    B: 'D',
    C: 'Eb',
    'C#': 'E',
    Db: 'E',
    D: 'F',
    'D#': 'F#',
    Eb: 'Gb',
    E: 'G',
    F: 'Ab',
    'F#': 'A',
    Gb: 'A',
    G: 'Bb',
    'G#': 'B',
  };
  return minorToMajor[minorKey] || 'C';
}

/**
 * ダイアトニックコードを生成
 */
function generateDiatonicChords(
  key: Key,
  mode: Mode,
  useSevenths: boolean = false
): string[] {
  const keyIdx = MusicUtils.SEMITONES.indexOf(key);
  if (keyIdx < 0) return [];

  const scale = ENHARMONIC_SCALES[key];

  if (mode === 'minor') {
    // マイナーキー
    const relativeKey = getRelativeMajorKey(key);
    const relativeScale = ENHARMONIC_SCALES[relativeKey];
    
    if (relativeScale) {
      // 相対長調から6番目を起点とした音階
      const minorScale = [...relativeScale.slice(5), ...relativeScale.slice(0, 5)];
      const triadQualities = ['m', 'dim', '', 'm', 'm', '', ''];
      const seventhQualities = ['m7', 'm7(b5)', '△7', 'm7', 'm7', '△7', '7'];
      
      return useSevenths
        ? minorScale.map((root, i) => root + seventhQualities[i])
        : minorScale.map((root, i) => root + triadQualities[i]);
    }
  } else {
    // メジャーキー
    if (scale) {
      const triadQualities = ['', 'm', 'm', '', '', 'm', 'dim'];
      const seventhQualities = ['△7', 'm7', 'm7', '△7', '7', 'm7', 'm7(b5)'];
      
      return useSevenths
        ? scale.map((root, i) => root + seventhQualities[i])
        : scale.map((root, i) => root + triadQualities[i]);
    }
  }

  // フォールバック：従来の半音ステップ方式
  const steps = mode === 'minor' ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
  const qualities = mode === 'minor' 
    ? ['m', 'dim', '', 'm', 'm', '', '']
    : ['', 'm', 'm', '', '', 'm', 'dim'];
  const sevenths = mode === 'minor'
    ? ['m7', 'm7(b5)', '△7', 'm7', 'm7', '△7', '7']
    : ['△7', 'm7', 'm7', '△7', '7', 'm7', 'm7(b5)'];

  return useSevenths
    ? steps.map((step, i) => {
        const root = MusicUtils.SEMITONES[(keyIdx + step) % 12];
        return root + sevenths[i];
      })
    : steps.map((step, i) => {
        const root = MusicUtils.SEMITONES[(keyIdx + step) % 12];
        return root + qualities[i];
      });
}

/**
 * セカンダリードミナントを生成
 */
function generateSecondaryDominants(key: Key, mode: Mode): string[] {
  const keyIdx = MusicUtils.SEMITONES.indexOf(key);
  if (keyIdx < 0) return [];

  if (mode === 'minor') {
    // マイナーキーのセカンダリードミナント: V/i, V/iv, V/v, V/♭III, V/♭VI
    const minorTargets = [0, 5, 7, 3, 8]; // i, iv, v, ♭III, ♭VI
    return minorTargets.map((target) => {
      const root = MusicUtils.SEMITONES[(keyIdx + target + 7) % 12];
      return root + '7';
    });
  } else {
    // メジャーキーのセカンダリードミナント: V/ii, V/iii, V/IV, V/V, V/vi
    const majorTargets = [2, 4, 5, 7, 9]; // ii, iii, IV, V, vi
    return majorTargets.map((target) => {
      const root = MusicUtils.SEMITONES[(keyIdx + target + 7) % 12];
      return root + '7';
    });
  }
}

/**
 * サブドミナントマイナーを生成
 */
function generateSubdominantMinor(key: Key, mode: Mode): string[] {
  if (mode === 'minor') {
    // マイナーキー既存のサブドミナントマイナー
    const relativeKey = getRelativeMajorKey(key);
    const relativeScale = ENHARMONIC_SCALES[relativeKey];
    
    if (relativeScale) {
      const minorScale = [...relativeScale.slice(5), ...relativeScale.slice(0, 5)];
      const IVm7 = minorScale[3] + 'm7';     // iv
      const IIm7b5 = minorScale[1] + 'm7(b5)'; // ii°
      const bVImaj7 = minorScale[5] + '△7';  // bVI
      const bVII7 = minorScale[6] + '7';     // bVII
      return [IVm7, IIm7b5, bVImaj7, bVII7];
    }
  } else {
    // メジャーキーのサブドミナントマイナー（借用コード）
    const parallelMinorScale = MINOR_ENHARMONIC_SCALES[key];
    if (parallelMinorScale) {
      const IVm7 = parallelMinorScale[3] + 'm7';     // IVm7 (同主短調のiv)
      const IIm7b5 = parallelMinorScale[1] + 'm7(b5)'; // IIm7(♭5) (同主短調のii)
      const bVImaj7 = parallelMinorScale[5] + '△7';   // ♭VImaj7 (同主短調のvi)
      const bVII7 = parallelMinorScale[6] + '7';      // ♭VII7 (同主短調のbVII)
      return [IVm7, IIm7b5, bVImaj7, bVII7];
    }
  }
  
  return [];
}

/**
 * トライトーン代理を生成
 */
function generateTritoneSubstitutes(key: Key, mode: Mode): string[] {
  const keyIdx = MusicUtils.SEMITONES.indexOf(key);
  if (keyIdx < 0) return [];

  // 裏コードの異名同音対応（フラット系を優先）
  const TRITONE_ENHARMONIC: Record<string, string> = {
    'C#': 'Db',
    'D#': 'Eb',
    'F#': 'Gb',
    'G#': 'Ab',
    'A#': 'Bb',
  };

  if (mode === 'minor') {
    // マイナーキー: V7の裏コード（V7 = keyIdx + 7, 裏 = keyIdx + 1）
    const tritoneRoot = MusicUtils.SEMITONES[(keyIdx + 1) % 12];
    const normalizedRoot = TRITONE_ENHARMONIC[tritoneRoot] || tritoneRoot;
    return [normalizedRoot + '7'];
  } else {
    // メジャーキー: V7の裏コード（V7 = keyIdx + 7, 裏 = keyIdx + 1）
    const tritoneRoot = MusicUtils.SEMITONES[(keyIdx + 1) % 12];
    const normalizedRoot = TRITONE_ENHARMONIC[tritoneRoot] || tritoneRoot;
    return [normalizedRoot + '7'];
  }
}

/**
 * II-V-Iパッケージを生成
 */
function generateTwoFiveOne(key: Key, mode: Mode): string[] {
  const keyIdx = MusicUtils.SEMITONES.indexOf(key);
  if (keyIdx < 0) return [];

  if (mode === 'minor') {
    // マイナー II-V-I: IIm7(b5) - V7 - Im7
    const ii = MusicUtils.SEMITONES[(keyIdx + 2) % 12] + 'm7(b5)';
    const V = MusicUtils.SEMITONES[(keyIdx + 7) % 12] + '7';
    const i = MusicUtils.SEMITONES[keyIdx] + 'm7';
    return [ii, V, i];
  } else {
    // メジャー II-V-I: IIm7 - V7 - IM7
    const ii = MusicUtils.SEMITONES[(keyIdx + 2) % 12] + 'm7';
    const V = MusicUtils.SEMITONES[(keyIdx + 7) % 12] + '7';
    const I = MusicUtils.SEMITONES[keyIdx] + '△7';
    return [ii, V, I];
  }
}

/**
 * サスペンドコードを生成
 */
function generateSuspendedChords(key: Key): string[] {
  const keyIdx = MusicUtils.SEMITONES.indexOf(key);
  if (keyIdx < 0) return [];

  const scale = ENHARMONIC_SCALES[key];
  
  if (scale && scale.length >= 5) {
    return [
      scale[0] + 'sus4', // I sus4
      scale[0] + 'sus2', // I sus2
      scale[4] + 'sus4', // V sus4
      scale[4] + 'sus2', // V sus2
    ];
  } else {
    // フォールバック
    return [
      MusicUtils.SEMITONES[keyIdx] + 'sus4',
      MusicUtils.SEMITONES[keyIdx] + 'sus2',
      MusicUtils.SEMITONES[(keyIdx + 7) % 12] + 'sus4',
      MusicUtils.SEMITONES[(keyIdx + 7) % 12] + 'sus2',
    ];
  }
}

/**
 * プリセットコードを生成
 */
export function getPresetChords(
  key: Key,
  mode: Mode,
  presetType: PresetType
): PresetChords {
  const useSevenths = presetType === 'seventh';
  const diatonic = generateDiatonicChords(key, mode, useSevenths);

  const result: PresetChords = {
    diatonic,
  };

  // presetTypeに応じて追加コードを生成
  if (presetType === 'all' || presetType === 'secondary') {
    result.secondary = generateSecondaryDominants(key, mode);
    result.subDomMinor = generateSubdominantMinor(key, mode);
    result.tritone = generateTritoneSubstitutes(key, mode);
    result.twoFiveOne = generateTwoFiveOne(key, mode);
    result.suspended = generateSuspendedChords(key);
  }

  return result;
}

/**
 * カテゴリ情報
 */
export interface ChordCategory {
  key: keyof PresetChords;
  title: string;
  shortTitle: string;
  color: string;
  description: string;
}

export function getChordCategories(mode: Mode): ChordCategory[] {
  return [
    {
      key: 'diatonic',
      title: mode === 'minor' 
        ? 'ダイアトニック (Aeolian/Natural Minor)' 
        : 'ダイアトニック (Ionian/Major)',
      shortTitle: 'ダイアトニック',
      color: 'blue',
      description: '基本的なスケール上のコード'
    },
    {
      key: 'secondary',
      title: 'セカンダリードミナント (V/x)',
      shortTitle: 'セカンダリードミナント',
      color: 'purple',
      description: '一時的転調のドミナントコード'
    },
    {
      key: 'subDomMinor',
      title: mode === 'minor' 
        ? 'サブドミナントマイナー (SD.m)' 
        : 'サブドミナントマイナー (借用コード)',
      shortTitle: 'サブドミナントマイナー',
      color: 'indigo',
      description: 'マイナー系のサブドミナント機能'
    },
    {
      key: 'twoFiveOne',
      title: 'II-V-I パッケージ',
      shortTitle: 'II-V-I',
      color: 'green',
      description: 'ジャズの基本進行'
    },
    {
      key: 'tritone',
      title: '裏コード (トライトーン代理)',
      shortTitle: '裏コード',
      color: 'orange',
      description: 'トライトーン代理コード'
    },
    {
      key: 'suspended',
      title: 'サスペンド (Sus4/Sus2)',
      shortTitle: 'サスペンド',
      color: 'teal',
      description: 'サスペンションコード'
    },
  ];
}
