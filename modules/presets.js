// presets.js: プリセット生成と描画

export function getPresetChords(ctx) {
  const { state } = ctx;
  const SEMITONES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  
  // マイナースケールの正しいダイアトニックコード
  const scaleSteps = state.mode === 'minor' ? [0,2,3,5,7,8,10] : [0,2,4,5,7,9,11];
  const qualities = state.mode === 'minor' ? ['m','dim','M','m','m','M','M'] : ['M','m','m','M','M','m','dim'];
  
  const keyIdx = SEMITONES.indexOf(state.key);
  if (keyIdx < 0) return {};

  // ダイアトニックコード
  const diatonic = scaleSteps.map((st, i) => {
    const root = SEMITONES[(keyIdx + st) % 12];
    const q = qualities[i];
    const triad = q === 'M' ? '' : q === 'm' ? 'm' : 'dim';
    return root + triad;
  });
  
  const diatonic7 = diatonic.map((name, i) => {
    if (name.endsWith('dim')) return name.replace('dim', 'm7(b5)');
    if (name.endsWith('m')) return name + '7';
    if (state.mode === 'minor' && i === 6) {
      return name.replace('M', 'm') + '7';
    }
    return name + '△7';
  });

  // セカンダリードミナント (V/ii, V/iii, V/IV, V/V, V/vi)
  const targets = [1,2,3,4,5];
  const secondaries = targets.map((t) => {
    const target = scaleSteps[t] || 0;
    const root = SEMITONES[(keyIdx + target + 7) % 12];
    return root + '7';
  });

  // サブドミナントマイナー (iv, bVII, bIIImaj7)
  const iv = SEMITONES[(keyIdx + 5) % 12] + 'm';
  const bVII = SEMITONES[(keyIdx + 10) % 12];
  const bIIImaj7 = SEMITONES[(keyIdx + 3) % 12] + '△7';
  const subDomMinor = [iv, bVII, bIIImaj7];

  const base = state.presetType === 'seventh' ? diatonic7 : diatonic;
  
  return {
    diatonic: base,
    secondary: secondaries,
    subDomMinor: subDomMinor
  };
}

export function updatePresetList(ctx) {
  const { el } = ctx;
  const chordCategories = getPresetChords(ctx);
  el.presetList.innerHTML = '';
  
  // カテゴリ別にコードを表示
  const categories = [
    { key: 'diatonic', title: 'ダイアトニック', color: 'var(--primary)' },
    { key: 'secondary', title: 'セカンダリードミナント', color: 'var(--primary-light)' },
    { key: 'subDomMinor', title: 'サブドミナントマイナー', color: 'var(--primary-dark)' }
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


