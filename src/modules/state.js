// state.js: アプリ全体の状態、定数、保存/復元、共通ユーティリティ
import { MusicUtils } from './utils.js';
// import { StateManager } from './state-manager.js'; // 将来の使用のため

export function setupState() {
  const state = {
    key: 'C',
    mode: 'major',
    transposeAll: true,
    lyrics: '',
    fontSizeLyrics: 16,
    fontSizeChord: 14,
    chordColor: '#b00020',
    marginMm: 15,
    lineGap: 8,
    selectedChord: null,
    history: [],
    lyricsHistory: [], // 歌詞のundo履歴
    lyricsFontFamily: 'sans', // デフォルトをゴシックに変更
    chordFontFamily: 'sans', // デフォルトをゴシックに変更
    title: '',
    artist: '',
    presetType: 'triad',
    chordOffsetPx: -18,
    letterSpacing: 0,
    lineOffsetPx: 0, // 行全体の右オフセット
    batchQueue: [],
  };

  const el = {
    keySelect: document.getElementById('key-select'),
    modeSelect: document.getElementById('mode-select'),
    transposeToggle: document.getElementById('transpose-toggle'),
    lyricsInput: document.getElementById('lyrics-input'),
    pageContent: document.getElementById('page-content'),
    lyricsFont: document.getElementById('lyrics-font'),
    chordFont: document.getElementById('chord-font'),
    chordColor: document.getElementById('chord-color'),
    lyricsFF: document.getElementById('lyrics-ff'),
    chordFF: document.getElementById('chord-ff'),
    lyricsLeading: document.getElementById('lyrics-leading'),
    titleInput: document.getElementById('title-input'),
    artistInput: document.getElementById('artist-input'),

    chordOffset: document.getElementById('chord-offset'),
    lineOffset: document.getElementById('line-offset'),
    letterSpacing: document.getElementById('letter-spacing'),
    btnPrint: document.getElementById('btn-print'),
    btnSave: document.getElementById('btn-save'),
    btnLoad: document.getElementById('btn-load'),
    fileInput: document.getElementById('file-input'),
    btnClear: document.getElementById('btn-clear'),
    btnReduceLines: document.getElementById('btn-reduce-lines'),
    btnUndo: document.getElementById('btn-undo'),
    historyList: document.getElementById('history-list'),
    presetList: document.getElementById('preset-list'),
    customChord: document.getElementById('custom-chord'),
    btnSetCustom: document.getElementById('btn-set-custom'),
    btnSep: document.getElementById('btn-sep'),
    btnEraser: document.getElementById('btn-eraser'),
    btnSectionEraser: document.getElementById('btn-section-eraser'),
    currentChord: document.getElementById('current-chord'),
    presetType: document.getElementById('preset-type'),
  };




  const CHORD_CONFIG = {
    // ルールの書き方: コメントは README/SPEC にも記載
    normalizeRules: [
      // ハーフディミニッシュ：C-7-5, C-7b5, Cmin7b5, Cm7b5, Ch7 → Cm7(b5)
      {
        pattern: /^([A-G][#b]?)(?:-7-5|-7b5|min7b5|m7b5|h7)$/i,
        replace: (m, r) => r.toUpperCase() + 'm7(b5)',
      },
      // マイナー：C-7, Cmin7 → Cm7
      {
        pattern: /^([A-G][#b]?)(?:-7|min7)$/i,
        replace: (m, r) => r.toUpperCase() + 'm7',
      },
      // オーギュメント：C+, C#5 → Caug
      {
        pattern: /^([A-G][#b]?)(?:\+|#5)$/i,
        replace: (m, r) => r.toUpperCase() + 'aug',
      },
      // メジャー：CM7, C^7, Cmaj7 → C△7 (大文字小文字を区別！)
      {
        pattern: /^([A-G][#b]?)(?:M7|maj7|\^7)$/,
        replace: (m, r) => r.toUpperCase() + '△7',
      },
    ],
  };

  const STORAGE_KEY = 'sbm:v1';
  function persist() {
    try {
      const data = {
        key: state.key,
        mode: state.mode,
        transposeAll: state.transposeAll,
        lyrics: state.lyrics,
        fontSizeLyrics: state.fontSizeLyrics,
        fontSizeChord: state.fontSizeChord,
        chordColor: state.chordColor,
        marginMm: state.marginMm,
        lineGap: state.lineGap,
        history: state.history,
        lyricsFontFamily: state.lyricsFontFamily,
        chordFontFamily: state.chordFontFamily,
        title: state.title,
        artist: state.artist,
        presetType: state.presetType,
        chordOffsetPx: state.chordOffsetPx,
        lineOffsetPx: state.lineOffsetPx,
        letterSpacing: state.letterSpacing,
        batchQueue: state.batchQueue,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // エラーを無視
    }
  }

  function restore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      Object.assign(state, {
        ...data,
        lineOffsetPx: data.lineOffsetPx ?? 0,
      });

      // UI反映
      if (el.keySelect) el.keySelect.value = state.key;
      if (el.modeSelect) el.modeSelect.value = state.mode;
      if (el.transposeToggle) el.transposeToggle.checked = state.transposeAll;
      if (el.lyricsInput) el.lyricsInput.value = state.lyrics;
      if (el.lyricsFont) el.lyricsFont.value = String(state.fontSizeLyrics);
      if (el.chordFont) el.chordFont.value = String(state.fontSizeChord);
      if (el.chordColor) el.chordColor.value = state.chordColor;
      if (el.lyricsFF) el.lyricsFF.value = state.lyricsFontFamily;
      if (el.chordFF) el.chordFF.value = state.chordFontFamily;
      if (el.titleInput) el.titleInput.value = state.title;
      if (el.artistInput) el.artistInput.value = state.artist;
      if (el.presetType) el.presetType.value = state.presetType;
      if (el.lyricsLeading) el.lyricsLeading.value = String(state.lineGap);
      if (el.letterSpacing)
        el.letterSpacing.value = String(state.letterSpacing);
      if (el.chordOffset) el.chordOffset.value = String(state.chordOffsetPx);
      if (el.lineOffset) el.lineOffset.value = String(state.lineOffsetPx);
    } catch {
      // エラーを無視
    }
  }

  function normalizeRoot(root) {
    return MusicUtils.normalizeRoot(root);
  }
  function parseChordSymbol(symbol) {
    const [base, bass] = symbol.split('/');
    const m = base.match(/^([A-Ga-g][#b]?)(.*)$/);
    if (!m) return { root: symbol, quality: '', bass: bass || null };
    const root = normalizeRoot(m[1]);
    const quality = (m[2] || '').trim();
    return { root, quality, bass: bass ? normalizeRoot(bass) : null };
  }
  function transposeRoot(root, interval) {
    return MusicUtils.transposeRoot(root, interval);
  }
  function transposeChord(symbol, interval) {
    if (!interval) return symbol;
    const { root, quality, bass } = parseChordSymbol(symbol);
    const tr = transposeRoot(root, interval);
    const tb = bass ? transposeRoot(bass, interval) : null;
    return tr + quality + (tb ? '/' + tb : '');
  }
  function computeInterval(fromKey, toKey) {
    return MusicUtils.computeInterval(fromKey, toKey);
  }

  function normalizeChordName(inputSymbol) {
    let symbol = inputSymbol.trim();

    for (const rule of CHORD_CONFIG.normalizeRules) {
      const m = symbol.match(rule.pattern);
      if (m) {
        const root = m[1];
        symbol =
          typeof rule.replace === 'function'
            ? rule.replace(m[0], root)
            : symbol.replace(rule.pattern, rule.replace);
        break;
      }
    }

    return symbol;
  }

  restore();
  return {
    state,
    el,
    persist,
    restore,
    computeInterval,
    transposeChord,
    normalizeChordName,
  };
}
