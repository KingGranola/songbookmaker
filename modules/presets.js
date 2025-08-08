// presets.js: プリセット生成と描画

export function getPresetChords(ctx) {
  const { state } = ctx;
  const SEMITONES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
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
  // seventh
  const diatonic7 = diatonic.map((name) => {
    if (name.endsWith('dim')) return name.replace('dim', 'm7(b5)');
    if (name.endsWith('m')) return name + '7';
    return name + 'maj7';
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
  const bIIImaj7 = SEMITONES[(keyIdx + 3) % 12] + 'maj7';
  const subDomMinor = [iv, bVII, bIIImaj7];

  const base = state.presetType === 'seventh' ? diatonic7 : diatonic;
  const presets = [...base, ...secondaries, ...subDomMinor];
  return Array.from(new Set(presets));
}

export function updatePresetList(ctx) {
  const { el } = ctx;
  const chords = getPresetChords(ctx);
  el.presetList.innerHTML = '';
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


