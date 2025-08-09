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

  // セカンダリードミナント（CHORD_RULES.mdに基づく）
  let secondaries = [];
  if (state.mode === 'minor') {
    // マイナーキーのセカンダリードミナント: V/i, V/iv, V/v, V/♭III, V/♭VI
    const minorTargets = [0,5,7,3,8]; // i, iv, v, ♭III, ♭VI
    secondaries = minorTargets.map((target) => {
      const root = SEMITONES[(keyIdx + target + 7) % 12];
      return root + '7';
    });
  } else {
    // メジャーキーのセカンダリードミナント: V/ii, V/iii, V/IV, V/V, V/vi
    const majorTargets = [2,4,5,7,9]; // ii, iii, IV, V, vi
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
    // CHORD_RULES.mdに基づく4つのコード: IVm7, IIm7(♭5), ♭VImaj7, ♭VII7
    const parallelMinorScale = MINOR_ENHARMONIC_SCALES[state.key];
    if (parallelMinorScale) {
      const IVm7 = parallelMinorScale[3] + 'm7';     // IVm7 (同主短調のiv)
      const IIm7b5 = parallelMinorScale[1] + 'm7(b5)'; // IIm7(♭5) (同主短調のii)
      const bVImaj7 = parallelMinorScale[5] + '△7';   // ♭VImaj7 (同主短調のvi)
      const bVII7 = parallelMinorScale[6] + '7';      // ♭VII7 (同主短調のbVII)
      subDomMinor = [IVm7, IIm7b5, bVImaj7, bVII7];
    } else {
      // フォールバック
      const IVm7 = SEMITONES[(keyIdx + 5) % 12] + 'm7';
      const IIm7b5 = SEMITONES[(keyIdx + 2) % 12] + 'm7(b5)';
      const bVImaj7 = SEMITONES[(keyIdx + 8) % 12] + '△7';
      const bVII7 = SEMITONES[(keyIdx + 10) % 12] + '7';
      subDomMinor = [IVm7, IIm7b5, bVImaj7, bVII7];
    }
  }

  // 裏コード（トライトーン・サブスティテューション）
  const tritoneSubstitutes = generateTritoneSubstitutes(state, keyIdx);
  
  // II-V-I パッケージ
  const twoFiveOne = generateTwoFiveOne(state, keyIdx, scale);
  
  // サスペンドコード（Sus4/Sus2）
  const suspendedChords = generateSuspendedChords(state, keyIdx, scale);

  const base = state.presetType === 'seventh' ? diatonic7 : diatonic;
  
  return {
    diatonic: base,
    secondary: secondaries,
    subDomMinor: subDomMinor,
    tritone: tritoneSubstitutes,
    twoFiveOne: twoFiveOne,
    suspended: suspendedChords
  };
}

export function updatePresetList(ctx) {
  const { el, state } = ctx;
  const chordCategories = getPresetChords(ctx);
  el.presetList.innerHTML = '';
  
  // プリセットエリア全体のスタイル設定（統一デザイン）
  el.presetList.style.cssText = `
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: var(--space-md);
    padding: var(--space-sm);
    align-items: start;
  `;
  
  // カテゴリ別にコードを表示（ジャズ理論に基づく）
  const categories = [
    { key: 'diatonic', title: state.mode === 'minor' ? 'ダイアトニック (Aeolian/Natural Minor)' : 'ダイアトニック (Ionian/Major)', color: 'var(--primary)' },
    { key: 'secondary', title: 'セカンダリードミナント (V/x)', color: 'var(--primary-light)' },
    { key: 'subDomMinor', title: state.mode === 'minor' ? 'サブドミナントマイナー (SD.m)' : 'サブドミナントマイナー (借用コード)', color: 'var(--primary-dark)' },
    { key: 'twoFiveOne', title: 'II-V-I パッケージ', color: 'var(--success)' },
    { key: 'tritone', title: '裏コード (トライトーン代理)', color: 'var(--warning)' },
    { key: 'suspended', title: 'サスペンド (Sus4/Sus2)', color: 'var(--info)' }
  ];
  
  categories.forEach(category => {
    const chords = chordCategories[category.key];
    if (!chords || chords.length === 0) return;
    
    // カテゴリコンテナ（統一デザイン）
    const categoryContainer = document.createElement('div');
    categoryContainer.className = 'category-container';
    categoryContainer.style.cssText = `
      background: var(--surface-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: var(--space-md);
      display: flex;
      flex-direction: column;
      min-height: 80px;
      max-height: 120px;
      box-shadow: var(--shadow);
    `;
    
    // カテゴリタイトル（統一デザイン）
    const titleDiv = document.createElement('div');
    titleDiv.style.cssText = `
      font-size: var(--font-xs);
      color: ${category.color};
      margin: 0 0 var(--space-sm) 0;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      border-bottom: 1px solid ${category.color};
      padding-bottom: var(--space-xs);
      flex-shrink: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `;
    
    // タイトルを短縮
    const shortTitles = {
      'diatonic': 'ダイアトニック',
      'secondary': 'セカンダリードミナント',
      'subDomMinor': 'サブドミナントマイナー',
      'twoFiveOne': 'II-V-I',
      'tritone': '裏コード',
      'suspended': 'サスペンド'
    };
    titleDiv.textContent = shortTitles[category.key] || category.title;
    categoryContainer.appendChild(titleDiv);
    
    // コードチップ（カテゴリに応じたレイアウト）
    const chipRow = document.createElement('div');
    chipRow.className = 'chip-row';
    
    // カテゴリごとにコンパクトなレイアウトを設定
    let gridColumns = 'repeat(3, 1fr)';
    if (category.key === 'twoFiveOne') {
      gridColumns = '1fr'; // II-V-Iは縦並び
    } else if (category.key === 'tritone') {
      gridColumns = '1fr'; // 裏コードは1つなので全幅
    } else if (category.key === 'suspended') {
      gridColumns = 'repeat(2, 1fr)'; // サスペンドは2列
    } else if (chords.length <= 3) {
      gridColumns = 'repeat(3, 1fr)'; // 3個以下は3列
    } else if (chords.length <= 4) {
      gridColumns = 'repeat(2, 1fr)'; // 4個は2列
    } else {
      gridColumns = 'repeat(3, 1fr)'; // 5個以上は3列
    }
    
    chipRow.style.cssText = `
      display: grid;
      grid-template-columns: ${gridColumns};
      gap: var(--space-sm);
      flex: 1;
      align-content: start;
    `;
    
    chords.forEach((name) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.textContent = name;
      chip.style.cssText = `
        border: 1px solid ${category.color};
        border-radius: var(--radius-sm);
        background: var(--surface);
        color: var(--text);
        padding: var(--space-xs) var(--space-sm);
        font-size: var(--font-xs);
        font-weight: 500;
        cursor: pointer;
        transition: var(--transition-fast);
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        min-width: 0;
      `;
      chip.title = name;
      
      // シンプルホバー効果
      chip.addEventListener('mouseenter', () => {
        chip.style.background = category.color;
        chip.style.color = 'white';
      });
      
      chip.addEventListener('mouseleave', () => {
        chip.style.background = 'var(--surface)';
        chip.style.color = 'var(--text)';
      });
      
      // クリックで単体選択
      chip.addEventListener('click', () => {
        if (ctx.applySelectedChord) ctx.applySelectedChord(name);
      });
      chipRow.appendChild(chip);
    });
    
    categoryContainer.appendChild(chipRow);
    el.presetList.appendChild(categoryContainer);
  });
  
  if (ctx.highlightSelectedChip) ctx.highlightSelectedChip();
}

// 裏コード（トライトーン・サブスティテューション）生成
function generateTritoneSubstitutes(state, keyIdx) {
  // 裏コードの異名同音対応（フラット系を優先）
  const TRITONE_ENHARMONIC = {
    'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb'
  };
  const SEMITONES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  
  if (state.mode === 'minor') {
    // マイナーキー: V7の裏コード（V7 = keyIdx + 7, 裏 = keyIdx + 1）
    let tritoneRoot = SEMITONES[(keyIdx + 1) % 12];
    // 異名同音変換（フラット系優先）
    if (TRITONE_ENHARMONIC[tritoneRoot]) {
      tritoneRoot = TRITONE_ENHARMONIC[tritoneRoot];
    }
    return [tritoneRoot + '7']; // 例: Am → E7の裏コード = Bb7
  } else {
    // メジャーキー: V7の裏コード（V7 = keyIdx + 7, 裏 = keyIdx + 1）
    let tritoneRoot = SEMITONES[(keyIdx + 1) % 12];
    // 異名同音変換（フラット系優先）
    if (TRITONE_ENHARMONIC[tritoneRoot]) {
      tritoneRoot = TRITONE_ENHARMONIC[tritoneRoot];
    }
    return [tritoneRoot + '7']; // 例: C → G7の裏コード = Db7
  }
}

// II-V-I パッケージ生成
function generateTwoFiveOne(state, keyIdx, scale) {
  const SEMITONES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  
  if (state.mode === 'minor') {
    // マイナー II-V-I: IIm7(b5) - V7 - Im7
    const ii = SEMITONES[(keyIdx + 2) % 12] + 'm7(b5)';
    const V = SEMITONES[(keyIdx + 7) % 12] + '7';
    const i = SEMITONES[keyIdx] + 'm7';
    return [ii, V, i]; // 例: Am → Bm7(b5) - E7 - Am7
  } else {
    // メジャー II-V-I: IIm7 - V7 - IM7
    const ii = SEMITONES[(keyIdx + 2) % 12] + 'm7';
    const V = SEMITONES[(keyIdx + 7) % 12] + '7';
    const I = SEMITONES[keyIdx] + '△7';
    return [ii, V, I]; // 例: C → Dm7 - G7 - C△7
  }
}

// サスペンドコード生成  
function generateSuspendedChords(state, keyIdx, scale) {
  const SEMITONES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  
  if (scale && scale.length >= 5) {
    // 異名同音テーブルを使用
    return [
      scale[0] + 'sus4',  // I sus4
      scale[0] + 'sus2',  // I sus2  
      scale[4] + 'sus4',  // V sus4
      scale[4] + 'sus2'   // V sus2
    ];
  } else {
    // フォールバック
    return [
      SEMITONES[keyIdx] + 'sus4',
      SEMITONES[keyIdx] + 'sus2', 
      SEMITONES[(keyIdx + 7) % 12] + 'sus4',
      SEMITONES[(keyIdx + 7) % 12] + 'sus2'
    ];
  }
}


