// presets.js: プリセット生成と描画

export function getPresetChords(ctx) {
  const { state } = ctx;
  const SEMITONES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  
  // 異名同音の使い分けテーブル（弾き語りすとLABOのルールに基づく）
  const ENHARMONIC_SCALES = {
    // メジャーキー（頭文字重複回避）
    'C': ['C','D','E','F','G','A','B'],
    'C#': ['C#','D#','E#','F#','G#','A#','B#'],
    'Db': ['Db','Eb','F','Gb','Ab','Bb','C'],
    'D': ['D','E','F#','G','A','B','C#'],
    'D#': ['D#','E#','F##','G#','A#','B#','C##'],
    'Eb': ['Eb','F','G','Ab','Bb','C','D'],
    'E': ['E','F#','G#','A','B','C#','D#'],
    'F': ['F','G','A','Bb','C','D','E'],
    'F#': ['F#','G#','A#','B','C#','D#','E#'],
    'Gb': ['Gb','Ab','Bb','Cb','Db','Eb','F'],
    'G': ['G','A','B','C','D','E','F#'],
    'G#': ['G#','A#','B#','C#','D#','E#','F##'],
    'Ab': ['Ab','Bb','C','Db','Eb','F','G'],
    'A': ['A','B','C#','D','E','F#','G#'],
    'A#': ['A#','B#','C##','D#','E#','F##','G##'],
    'Bb': ['Bb','C','D','Eb','F','G','A'],
    'B': ['B','C#','D#','E','F#','G#','A#']
  };
  
  // マイナーキー用の異名同音テーブル（同主短調から借用コード用）
  const MINOR_ENHARMONIC_SCALES = {
    'C': ['C','D','Eb','F','G','Ab','Bb'],
    'C#': ['C#','D#','E','F#','G#','A','B'],
    'Db': ['Db','Eb','E','Gb','Ab','A','Bb'],
    'D': ['D','E','F','G','A','Bb','C'],
    'D#': ['D#','E#','F#','G#','A#','B','C#'],
    'Eb': ['Eb','F','Gb','Ab','Bb','Cb','Db'],
    'E': ['E','F#','G','A','B','C','D'],
    'F': ['F','G','Ab','Bb','C','Db','Eb'],
    'F#': ['F#','G#','A','B','C#','D','E'],
    'Gb': ['Gb','Ab','A','Cb','Db','D','Eb'],
    'G': ['G','A','Bb','C','D','Eb','F'],
    'G#': ['G#','A#','B','C#','D#','E','F#'],
    'Ab': ['Ab','Bb','Cb','Db','Eb','Fb','Gb'],
    'A': ['A','B','C','D','E','F','G'],
    'A#': ['A#','B#','C#','D#','E#','F#','G#'],
    'Bb': ['Bb','C','Db','Eb','F','Gb','Ab'],
    'B': ['B','C#','D','E','F#','G','A']
  };
  
  // 相対長調キーを取得するヘルパー関数
  function getRelativeMajorKey(minorKey) {
    const minorToMajor = {
      'A': 'C', 'A#': 'C#', 'Bb': 'Db', 'B': 'D',
      'C': 'Eb', 'C#': 'E', 'Db': 'E', 'D': 'F',
      'D#': 'F#', 'Eb': 'Gb', 'E': 'G', 'F': 'Ab',
      'F#': 'A', 'Gb': 'A', 'G': 'Bb', 'G#': 'B'
    };
    return minorToMajor[minorKey] || 'C';
  }
  
  // 同主短調キーを取得するヘルパー関数
  function getParallelMinorKey(majorKey) {
    const majorToMinor = {
      'C': 'C', 'C#': 'C#', 'Db': 'Db', 'D': 'D',
      'D#': 'D#', 'Eb': 'Eb', 'E': 'E', 'F': 'F',
      'F#': 'F#', 'Gb': 'Gb', 'G': 'G', 'G#': 'G#',
      'Ab': 'Ab', 'A': 'A', 'A#': 'A#', 'Bb': 'Bb', 'B': 'B'
    };
    return majorToMinor[majorKey] || 'C';
  }
  
  const keyIdx = SEMITONES.indexOf(state.key);
  if (keyIdx < 0) return {};

  let diatonic, diatonic7;
  
  /**
   * ダイアトニックコード生成ロジック
   * 
   * 【長調（メジャーキー）】
   * - 基準: イオニアンモード（自然長音階）
   * - 構成: I, ii, iii, IV, V, vi, vii°
   * - 例: Cメジャー → C, Dm, Em, F, G, Am, Bdim
   * 
   * 【短調（マイナーキー）】
   * - 基準: エオリアンモード（自然短音階）
   * - 構成: Im, II°, bIII, IVm, Vm, bVI, bVII
   * - 例: Aマイナー → Am, Bdim, C, Dm, Em, F, G
   * - 関係調: Aマイナー ↔ Cメジャー（相対調）
   */
  
  // 正しい異名同音を使用した音階取得
  const scale = ENHARMONIC_SCALES[state.key];
  if (!scale) {
    // フォールバック：従来の半音ステップ方式
    const steps = state.mode === 'minor' ? [0,2,3,5,7,8,10] : [0,2,4,5,7,9,11];
    const qualities = state.mode === 'minor' ? 
      ['m','dim','','m','m','',''] : 
      ['','m','m','','','m','dim'];
    const sevenths = state.mode === 'minor' ? 
      ['m7','m7(b5)','△7','m7','m7','△7','7'] : 
      ['△7','m7','m7','△7','7','m7','m7(b5)'];
    
    diatonic = steps.map((step, i) => {
      const root = SEMITONES[(keyIdx + step) % 12];
      return root + qualities[i];
    });
    
    diatonic7 = steps.map((step, i) => {
      const root = SEMITONES[(keyIdx + step) % 12];
      return root + sevenths[i];
    });
    
  } else {
    // 異名同音テーブルを使用した正しいコード生成
    if (state.mode === 'minor') {
      // マイナーキーのダイアトニックコード（相対長調の6番目から開始）
      const relativeScale = ENHARMONIC_SCALES[getRelativeMajorKey(state.key)];
      if (relativeScale) {
        // 相対長調から6番目を起点とした音階
        const minorScale = [...relativeScale.slice(5), ...relativeScale.slice(0, 5)];
        const triadQualities = ['m','dim','','m','m','',''];
        const seventhQualities = ['m7','m7(b5)','△7','m7','m7','△7','7'];
        
        diatonic = minorScale.map((root, i) => root + triadQualities[i]);
        diatonic7 = minorScale.map((root, i) => root + seventhQualities[i]);
      }
    } else {
      // メジャーキーのダイアトニックコード
      const triadQualities = ['','m','m','','','m','dim'];
      const seventhQualities = ['△7','m7','m7','△7','7','m7','m7(b5)'];
      
      diatonic = scale.map((root, i) => root + triadQualities[i]);
      diatonic7 = scale.map((root, i) => root + seventhQualities[i]);
    }
  }

  // セカンダリードミナント（異名同音対応は後で実装）
  let secondaries = [];
  if (state.mode === 'minor') {
    const minorTargets = [3,5,7,8,10];
    secondaries = minorTargets.map((target) => {
      const root = SEMITONES[(keyIdx + target + 7) % 12];
      return root + '7';
    });
  } else {
    const majorTargets = [2,4,5,7,9];
    secondaries = majorTargets.map((target) => {
      const root = SEMITONES[(keyIdx + target + 7) % 12];
      return root + '7';
    });
  }

  // サブドミナントマイナー（異名同音対応済み）
  let subDomMinor = [];
  if (state.mode === 'minor') {
    if (scale) {
      // 異名同音テーブルを使用した正しいサブドミナントマイナー生成
      const relativeScale = ENHARMONIC_SCALES[getRelativeMajorKey(state.key)];
      if (relativeScale) {
        const minorScale = [...relativeScale.slice(5), ...relativeScale.slice(0, 5)];
        const IVm7 = minorScale[3] + 'm7';     // iv
        const IIm7b5 = minorScale[1] + 'm7(b5)'; // ii°
        const bVImaj7 = minorScale[5] + '△7';  // bVI
        const bVII7 = minorScale[6] + '7';    // bVII
        subDomMinor = [IVm7, IIm7b5, bVImaj7, bVII7];
      }
    } else {
      // フォールバック
      const IVm7 = SEMITONES[(keyIdx + 5) % 12] + 'm7';
      const IIm7b5 = SEMITONES[(keyIdx + 2) % 12] + 'm7(b5)';
      const bVImaj7 = SEMITONES[(keyIdx + 8) % 12] + '△7';
      const bVII7 = SEMITONES[(keyIdx + 10) % 12] + '7';
      subDomMinor = [IVm7, IIm7b5, bVImaj7, bVII7];
    }
  } else {
    // メジャーキーのサブドミナントマイナー（同主短調から借用）
    const parallelMinorScale = MINOR_ENHARMONIC_SCALES[state.key];
    if (parallelMinorScale) {
      const iv = parallelMinorScale[3] + 'm';      // IVm (同主短調のiv)
      const bVII = parallelMinorScale[6];          // bVII (同主短調のbVII)
      const bII = parallelMinorScale[5] + '△7';    // bII△7 → 実際は♭VI△7
      subDomMinor = [iv, bVII, bII];
    } else {
      // フォールバック
      const iv = SEMITONES[(keyIdx + 5) % 12] + 'm';
      const bVII = SEMITONES[(keyIdx + 10) % 12];
      const bII = SEMITONES[(keyIdx + 1) % 12] + '△7';
      subDomMinor = [iv, bVII, bII];
    }
  }

  const base = state.presetType === 'seventh' ? diatonic7 : diatonic;
  
  return {
    diatonic: base,
    secondary: secondaries,
    subDomMinor: subDomMinor
  };
}

export function updatePresetList(ctx) {
  const { el, state } = ctx;
  const chordCategories = getPresetChords(ctx);
  el.presetList.innerHTML = '';
  
  // カテゴリ別にコードを表示（ジャズ理論に基づく）
  const categories = [
    { key: 'diatonic', title: state.mode === 'minor' ? 'ダイアトニック (Aeolian/Natural Minor)' : 'ダイアトニック (Ionian/Major)', color: 'var(--primary)' },
    { key: 'secondary', title: 'セカンダリードミナント (V/x)', color: 'var(--primary-light)' },
    { key: 'subDomMinor', title: state.mode === 'minor' ? 'サブドミナントマイナー (SD.m)' : 'サブドミナントマイナー (借用コード)', color: 'var(--primary-dark)' }
  ];
  
  categories.forEach(category => {
    const chords = chordCategories[category.key];
    if (!chords || chords.length === 0) return;
    
    // カテゴリタイトル
    const titleDiv = document.createElement('div');
    titleDiv.style.cssText = `
      font-size: 11px;
      color: var(--muted);
      margin: 8px 0 4px 0;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    `;
    titleDiv.textContent = category.title;
    el.presetList.appendChild(titleDiv);
    
    // コードチップ（カテゴリごとに横並び、カテゴリ間で改行）
    const chipRow = document.createElement('div');
    chipRow.className = 'chip-row';
    chipRow.style.cssText = 'display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 12px;';
    
    chords.forEach((name) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.textContent = name;
      chip.style.borderColor = category.color;
      chip.title = `${category.title}: ${name}`;
      
      // クリックで単体選択
      chip.addEventListener('click', () => {
        if (ctx.applySelectedChord) ctx.applySelectedChord(name);
      });
      chipRow.appendChild(chip);
    });
    
    el.presetList.appendChild(chipRow);
  });
  
  if (ctx.highlightSelectedChip) ctx.highlightSelectedChip();
}


