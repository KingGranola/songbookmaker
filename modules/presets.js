// presets.js: プリセット生成と描画

export function getPresetChords(ctx) {
  const { state } = ctx;
  const SEMITONES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  
  // マイナースケールの正しいダイアトニックコード
  const scaleSteps = state.mode === 'minor' ? [0,2,3,5,7,8,10] : [0,2,4,5,7,9,11];
  const qualities = state.mode === 'minor' ? ['m','dim','M','m','m','M','M'] : ['M','m','m','M','M','m','dim'];
  
  const keyIdx = SEMITONES.indexOf(state.key);
  if (keyIdx < 0) return [];

  // triad
  const diatonic = scaleSteps.map((st, i) => {
    const root = SEMITONES[(keyIdx + st) % 12];
    const q = qualities[i];
    const triad = q === 'M' ? '' : q === 'm' ? 'm' : 'dim';
    return root + triad;
  });
  
  // seventh - マイナースケールの7番目はm7（Bm7）になるように修正
  const diatonic7 = diatonic.map((name, i) => {
    if (name.endsWith('dim')) return name.replace('dim', 'm7(b5)');
    if (name.endsWith('m')) return name + '7';
    // マイナースケールの7番目（B）はm7にする
    if (state.mode === 'minor' && i === 6) {
      return name.replace('M', 'm') + '7';
    }
    return name + '△7';
  });

  // Secondary dominants (V/ii, V/iii, V/IV, V/V, V/vi)
  const targets = [1,2,3,4,5];
  const secondaries = targets.map((t) => {
    const target = scaleSteps[t] || 0;
    const root = SEMITONES[(keyIdx + target + 7) % 12];
    return root + '7';
  });

  // Subdominant minor (simple set)
  const iv = SEMITONES[(keyIdx + 5) % 12] + 'm';
  const bVII = SEMITONES[(keyIdx + 10) % 12];
  const bIIImaj7 = SEMITONES[(keyIdx + 3) % 12] + '△7';
  const subDomMinor = [iv, bVII, bIIImaj7];

  const base = state.presetType === 'seventh' ? diatonic7 : diatonic;
  const presets = [...base, ...secondaries, ...subDomMinor];
  return Array.from(new Set(presets));
}

export function updatePresetList(ctx) {
  const { el } = ctx;
  const chords = getPresetChords(ctx);
  el.presetList.innerHTML = '';
  
  // セクション追加ボタン
  const sectionButtons = [
    { text: 'イントロ', placeholder: '[Intro]' },
    { text: '間奏', placeholder: '[Interlude]' },
    { text: 'アウトロ', placeholder: '[Outro]' },
    { text: 'ブリッジ', placeholder: '[Bridge]' }
  ];
  
  sectionButtons.forEach(section => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip section-chip';
    chip.textContent = section.text;
    chip.title = `${section.text}セクションを歌詞に追加`;
    chip.addEventListener('click', () => {
      addSectionToLyrics(ctx, section.placeholder);
    });
    el.presetList.appendChild(chip);
  });
  
  // 区切り線
  const separator = document.createElement('div');
  separator.style.cssText = 'width: 100%; height: 1px; background: var(--border); margin: 8px 0;';
  el.presetList.appendChild(separator);
  
  // コードプリセット
  chords.forEach((name) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = name;
    // クリックで単体選択
    chip.addEventListener('click', () => {
      if (ctx.applySelectedChord) ctx.applySelectedChord(name);
    });
    el.presetList.appendChild(chip);
  });
  if (ctx.highlightSelectedChip) ctx.highlightSelectedChip();
}

function addSectionToLyrics(ctx, sectionText) {
  const { state, el } = ctx;
  const textarea = el.lyricsInput;
  if (!textarea) return;
  
  const currentLyrics = textarea.value;
  const cursorPos = textarea.selectionStart;
  const lines = currentLyrics.split('\n');
  
  // カーソル位置の行を特定
  let currentLineIndex = 0;
  let charCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    charCount += lines[i].length + 1; // +1 for newline
    if (charCount > cursorPos) {
      currentLineIndex = i;
      break;
    }
  }
  
  // セクションを挿入
  lines.splice(currentLineIndex, 0, sectionText, '');
  
  const newLyrics = lines.join('\n');
  textarea.value = newLyrics;
  state.lyrics = newLyrics;
  
  // プレビューを更新
  if (ctx.renderPage) ctx.renderPage(ctx);
  if (ctx.persist) ctx.persist();
  
  // カーソル位置を調整
  const newCursorPos = cursorPos + sectionText.length + 1; // +1 for newline
  textarea.setSelectionRange(newCursorPos, newCursorPos);
  textarea.focus();
}


