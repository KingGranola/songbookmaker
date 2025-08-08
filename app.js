// シンプルな歌本メーカーMVP
(() => {
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
    lyricsFontFamily: 'serif', // 'serif' | 'sans'
    chordFontFamily: 'mono',   // 'mono' | 'sans'
    title: '',
    artist: '',
    composer: '',
    presetType: 'triad', // 'triad' | 'seventh'
  };

  const el = {
    keySelect: document.getElementById('key-select'),
    modeSelect: document.getElementById('mode-select'),
    transposeToggle: document.getElementById('transpose-toggle'),
    lyricsInput: document.getElementById('lyrics-input'),
    page: document.getElementById('page'),
    pageContent: document.getElementById('page-content'),
    lyricsFont: document.getElementById('lyrics-font'),
    chordFont: document.getElementById('chord-font'),
    chordColor: document.getElementById('chord-color'),
    presetType: document.getElementById('preset-type'),
    lyricsFF: document.getElementById('lyrics-ff'),
    chordFF: document.getElementById('chord-ff'),
    lyricsLeading: document.getElementById('lyrics-leading'),
    titleInput: document.getElementById('title-input'),
    artistInput: document.getElementById('artist-input'),
    composerInput: document.getElementById('composer-input'),
    btnPrint: document.getElementById('btn-print'),
    btnSave: document.getElementById('btn-save'),
    btnLoad: document.getElementById('btn-load'),
    fileInput: document.getElementById('file-input'),
    btnSettings: document.getElementById('btn-settings'),
    btnClear: document.getElementById('btn-clear'),
    historyList: document.getElementById('history-list'),
    presetList: document.getElementById('preset-list'),
    customChord: document.getElementById('custom-chord'),
    btnSetCustom: document.getElementById('btn-set-custom'),
    btnSep: document.getElementById('btn-sep'),
    btnEraser: document.getElementById('btn-eraser'),
    currentChord: document.getElementById('current-chord'),
    settingsDialog: document.getElementById('settings-dialog'),
    btnApplySettings: document.getElementById('btn-apply-settings'),
    marginMm: document.getElementById('margin-mm'),
    lineGap: document.getElementById('line-gap'),
  };

  // 音名と半音値
  const SEMITONES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const FLAT_EQ = { 'Db':'C#','Eb':'D#','Gb':'F#','Ab':'G#','Bb':'A#','Cb':'B','Fb':'E','E#':'F','B#':'C' };

  function normalizeRoot(root, preferFlats = false) {
    const up = root.toUpperCase();
    if (SEMITONES.includes(up)) return up;
    if (FLAT_EQ[up]) return FLAT_EQ[up];
    // パターン: [A-G][#b]? 以外はそのまま
    return up;
  }

  function parseChordSymbol(symbol) {
    // 例: C#m7b5/G# → {root:'C#', quality:'m7b5', bass:'G#'}
    const [base, bass] = symbol.split('/');
    const m = base.match(/^([A-Ga-g][#b]?)(.*)$/);
    if (!m) return { root: symbol, quality: '', bass: bass || null };
    const root = normalizeRoot(m[1]);
    const quality = (m[2] || '').trim();
    return { root, quality, bass: bass ? normalizeRoot(bass) : null };
  }

  function transposeRoot(root, interval) {
    const n = normalizeRoot(root);
    const idx = SEMITONES.indexOf(n);
    if (idx < 0) return root;
    const next = (idx + interval + 120) % 12;
    return SEMITONES[next];
  }

  function transposeChord(symbol, interval) {
    if (!interval) return symbol;
    const { root, quality, bass } = parseChordSymbol(symbol);
    const tr = transposeRoot(root, interval);
    const tb = bass ? transposeRoot(bass, interval) : null;
    return tr + quality + (tb ? '/' + tb : '');
  }

  function computeInterval(fromKey, toKey) {
    const a = SEMITONES.indexOf(normalizeRoot(fromKey));
    const b = SEMITONES.indexOf(normalizeRoot(toKey));
    if (a < 0 || b < 0) return 0;
    return (b - a + 120) % 12;
  }

  // プリセットコード: ダイアトニック + セカンダリードミナント + サブドミナントマイナー
  // 参考: ダイアトニックコード【キーごと一覧】 https://watanabejunya.com/diatonic-code/
  function getDiatonicChords(key, mode) {
    const scaleSteps = mode === 'minor' ? [0,2,3,5,7,8,10] : [0,2,4,5,7,9,11];
    const qualities = mode === 'minor' ? ['m','dim','M','m','m','M','M'] : ['M','m','m','M','M','m','dim'];
    const keyIdx = SEMITONES.indexOf(normalizeRoot(key));
    if (keyIdx < 0) return [];

    // ダイアトニック triad
    const diatonic = scaleSteps.map((st, i) => {
      const root = SEMITONES[(keyIdx + st) % 12];
      const q = qualities[i];
      const triad = q === 'M' ? '' : q === 'm' ? 'm' : 'dim';
      return root + triad;
    });

    // ダイアトニック7th
    const diatonic7 = diatonic.map((name, i) => {
      if (name.endsWith('dim')) return name.replace('dim', 'm7b5');
      if (name.endsWith('m')) return name + '7';
      return name + 'maj7';
    });

    // セカンダリードミナント（V/ii, V/iii, V/IV, V/V, V/vi）
    const targets = [1,2,3,4,5];
    const secondaries = targets.map((t) => {
      const target = scaleSteps[t] || 0; // 目的コード根音
      const domRoot = SEMITONES[(keyIdx + target + 7) % 12]; // 5度上
      return domRoot + '7';
    });

    // サブドミナントマイナー（簡易）: iv, bVII, bIII(maj7)
    const iv = SEMITONES[(keyIdx + 5) % 12] + 'm';
    const bVII = SEMITONES[(keyIdx + 10) % 12];
    const bIIImaj7 = SEMITONES[(keyIdx + 3) % 12] + 'maj7';
    const subDomMinor = [iv, bVII, bIIImaj7];

    const base = state.presetType === 'seventh' ? diatonic7 : diatonic;
    const presets = [...base, ...secondaries, ...subDomMinor];
    const unique = Array.from(new Set(presets));
    return unique.map((n) => ({ name: n, degree: 'preset' }));
  }

  // ========= コードネーム自動変換（編集可能） =========
  // CHORD_CONFIG を編集することで、アプリ内のコード表記や置換ロジック、
  // プリセットの構成（ダイアトニック/セブンス記号）などを柔軟に変更できます。
  const CHORD_CONFIG = {
    // 表記ルール: 入力→正規化表記
    // ルールの書き方:
    // - pattern: 正規表現（先頭^〜末尾$で全体を対象）。グループ1は必ずルート（[A-G][#b]?）
    // - replace: 文字列 もしくは (match, root) => string の関数。
    //   root にはキャプチャしたルート（大文字小文字問わず）が入ります。
    // 例:
    //   { pattern: /^([A-G][#b]?)sus4$/i, replace: (m, r) => r.toUpperCase()+"sus4" }
    //   { pattern: /^([A-G][#b]?)M9$/i,    replace: (m, r) => r.toUpperCase()+"maj9" }
    normalizeRules: [
      // 例: C-7, Cmin7 → Cm7
      { pattern: /^([A-G][#b]?)(?:-7|min7)$/i, replace: (m, r) => r.toUpperCase() + 'm7' },
      // C-7b5, Cmin7b5, Ch7 → Cm7(b5)
      { pattern: /^([A-G][#b]?)(?:-7b5|min7b5|h7)$/i, replace: (m, r) => r.toUpperCase() + 'm7(b5)' },
      // CM7, Cmaj7, C^7 → C△7
      { pattern: /^([A-G][#b]?)(?:M7|maj7|\^7)$/i, replace: (m, r) => r.toUpperCase() + '△7' },
    ],
  };

  // 正規化関数（ユーザーが編集可能な箇所）
  function normalizeChordName(inputSymbol) {
    let symbol = inputSymbol.trim();
    for (const rule of CHORD_CONFIG.normalizeRules) {
      const m = symbol.match(rule.pattern);
      if (m) {
        const root = m[1];
        symbol = typeof rule.replace === 'function' ? rule.replace(m[0], root) : symbol.replace(rule.pattern, rule.replace);
        break;
      }
    }
    return symbol;
  }

  function updatePresetList() {
    const chords = getDiatonicChords(state.key, state.mode);
    el.presetList.innerHTML = '';
    chords.forEach(({ name }) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.textContent = name;
      chip.addEventListener('click', () => applySelectedChord(name));
      el.presetList.appendChild(chip);
    });
    highlightSelectedChip();
  }

  function pushHistory(chord) {
    const exists = state.history.find((c) => c === chord);
    state.history = [chord].concat(state.history.filter((c) => c !== chord)).slice(0, 16);
    if (!exists) renderHistory(); else renderHistory();
  }

  function renderHistory() {
    el.historyList.innerHTML = '';
    state.history.forEach((c) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.textContent = c;
      chip.addEventListener('click', () => setCurrentChord(c));
      el.historyList.appendChild(chip);
    });
    highlightSelectedChip();
  }

  function setCurrentChord(chordOrNull) {
    state.selectedChord = chordOrNull;
    el.currentChord.textContent = chordOrNull || 'なし';
    highlightSelectedChip();
    updateCursor();
  }

  function applySelectedChord(chord) {
    const norm = normalizeChordName(chord);
    setCurrentChord(norm);
    pushHistory(norm);
  }

  // 歌詞→表示構築
  function renderPage() {
    const lines = state.lyrics.split(/\r?\n/);
    el.pageContent.style.padding = `${state.marginMm}mm`;
    el.pageContent.innerHTML = '';

    // タイトル
    const titleWrap = document.createElement('div');
    titleWrap.className = 'page-title ' + (state.lyricsFontFamily === 'serif' ? 'ff-serif' : 'ff-sans');
    const titleEl = document.createElement('div');
    titleEl.className = 'title';
    titleEl.textContent = state.title || '';
    const metaEl = document.createElement('div');
    metaEl.className = 'meta';
    metaEl.textContent = [state.artist, state.composer && `作曲:${state.composer}`].filter(Boolean).join(' / ');
    titleWrap.appendChild(titleEl);
    titleWrap.appendChild(metaEl);
    el.pageContent.appendChild(titleWrap);

    lines.forEach((line, lineIndex) => {
      const lineWrap = document.createElement('div');
      lineWrap.className = 'song-line';

      const chordsRow = document.createElement('div');
      chordsRow.className = 'chords-row';
      chordsRow.dataset.lineIndex = String(lineIndex);

      const lyricsEl = document.createElement('div');
      lyricsEl.className = 'lyrics-text';
      lyricsEl.style.fontSize = `${state.fontSizeLyrics}px`;
      lyricsEl.style.marginBottom = `${state.lineGap}px`;
      lyricsEl.classList.add(state.lyricsFontFamily === 'serif' ? 'ff-serif' : 'ff-sans');
      lyricsEl.textContent = line || '\u00A0';

      lineWrap.appendChild(chordsRow);
      lineWrap.appendChild(lyricsEl);
      el.pageContent.appendChild(lineWrap);
    });

    applyChordStyles();
  }

  function applyChordStyles() {
    const chordEls = el.pageContent.querySelectorAll('.chord');
    chordEls.forEach((c) => {
      c.style.color = state.chordColor;
      c.style.fontSize = `${state.fontSizeChord}px`;
      c.classList.toggle('ff-mono', state.chordFontFamily === 'mono');
      c.classList.toggle('ff-sans', state.chordFontFamily === 'sans');
    });
  }

  // クリックでコード設置
  function enableChordPlacement() {
    el.pageContent.addEventListener('click', (ev) => {
      const lineWrap = ev.target.closest('.song-line');
      if (!lineWrap) return;
      const chordsRow = lineWrap.querySelector('.chords-row');
      if (!chordsRow) return;

      // 消しゴム
      if (state.selectedChord === '__ERASE__') {
        const chordEl = ev.target.closest('.chord');
        if (chordEl && chordsRow.contains(chordEl)) {
          chordEl.remove();
        }
        return;
      }

      if (!state.selectedChord) return;

      const rect = chordsRow.getBoundingClientRect();
      const offsetX = (ev.clientX - rect.left) + lineWrap.scrollLeft;
      const chord = state.selectedChord;
      // 区切り
      if (chord === '|') {
        const sep = document.createElement('span');
        sep.className = 'chord sep';
        sep.dataset.raw = '|';
        sep.textContent = '｜';
        sep.style.left = `${Math.max(0, offsetX)}px`;
        chordsRow.appendChild(sep);
        applyChordStyles();
        return;
      }

      const span = document.createElement('span');
      span.className = 'chord';
      span.dataset.raw = chord;
      span.textContent = displayChordForKey(chord);
      span.style.left = `${Math.max(0, offsetX)}px`;
      chordsRow.appendChild(span);
      applyChordStyles();
    });

    // ドラッグで移動（Pointer Events 対応）
    let dragEl = null;
    let startX = 0;
    let startLeft = 0;
    let activePointerId = null;
    el.pageContent.addEventListener('pointerdown', (e) => {
      const target = e.target.closest('.chord');
      if (!target) return;
      dragEl = target;
      activePointerId = e.pointerId;
      startX = e.clientX;
      startLeft = parseFloat(dragEl.style.left || '0');
      dragEl.setPointerCapture?.(activePointerId);
      e.preventDefault();
    });
    window.addEventListener('pointermove', (e) => {
      if (!dragEl || activePointerId !== e.pointerId) return;
      const dx = e.clientX - startX;
      const next = Math.max(0, startLeft + dx);
      dragEl.style.left = `${next}px`;
    });
    window.addEventListener('pointerup', (e) => {
      if (activePointerId !== e.pointerId) return;
      dragEl = null;
      activePointerId = null;
    });
  }

  // カーソル切替
  function updateCursor() {
    const isErase = state.selectedChord === '__ERASE__';
    el.pageContent.classList.toggle('cursor-eraser', isErase);
    el.pageContent.classList.toggle('cursor-pencil', !isErase && !!state.selectedChord);
  }

  function displayChordForKey(symbol) {
    // 表示時の自動移調は行わない。キー変更時に既存コードを一括移調する方針。
    return symbol;
  }

  function transposeAllExistingChords(fromKey, toKey) {
    const interval = computeInterval(fromKey, toKey);
    if (!interval) return;
    const chordEls = el.pageContent.querySelectorAll('.chord');
    chordEls.forEach((n) => {
      const raw = n.dataset.raw || n.textContent;
      if (raw === '|' || raw === '｜') return;
      const next = transposeChord(raw, interval);
      n.dataset.raw = next;
      n.textContent = displayChordForKey(next);
    });
    applyChordStyles();
  }

  // イベント
  function bindEvents() {
    el.keySelect.addEventListener('change', () => {
      const prevKey = state.key;
      state.key = el.keySelect.value;
      updatePresetList();
      if (state.transposeAll) {
        transposeAllExistingChords(prevKey, state.key);
      } else {
        refreshChordTexts();
      }
      persist();
    });
    el.modeSelect.addEventListener('change', () => {
      state.mode = el.modeSelect.value;
      updatePresetList();
      persist();
    });
    el.presetType.addEventListener('change', () => {
      state.presetType = el.presetType.value;
      updatePresetList();
      persist();
    });
    el.transposeToggle.addEventListener('change', () => {
      state.transposeAll = el.transposeToggle.checked;
      // トグル時は何もしない（キー変更時に一括移調）
      persist();
    });

    el.lyricsInput.addEventListener('input', () => {
      state.lyrics = el.lyricsInput.value;
      renderPage();
      persist();
    });

    el.lyricsFont.addEventListener('input', () => {
      state.fontSizeLyrics = Number(el.lyricsFont.value);
      const all = el.pageContent.querySelectorAll('.lyrics-text');
      all.forEach((n) => (n.style.fontSize = `${state.fontSizeLyrics}px`));
    });
    el.lyricsLeading.addEventListener('input', () => {
      state.lineGap = Number(el.lyricsLeading.value);
      const all = el.pageContent.querySelectorAll('.lyrics-text');
      all.forEach((n) => (n.style.marginBottom = `${state.lineGap}px`));
      persist();
    });
    el.lyricsFF.addEventListener('change', () => {
      state.lyricsFontFamily = el.lyricsFF.value;
      const all = el.pageContent.querySelectorAll('.lyrics-text');
      all.forEach((n) => {
        n.classList.toggle('ff-serif', state.lyricsFontFamily === 'serif');
        n.classList.toggle('ff-sans', state.lyricsFontFamily === 'sans');
      });
      persist();
    });
    el.chordFF.addEventListener('change', () => {
      state.chordFontFamily = el.chordFF.value;
      applyChordStyles();
      persist();
    });
    el.chordFont.addEventListener('input', () => {
      state.fontSizeChord = Number(el.chordFont.value);
      applyChordStyles();
      persist();
    });
    el.chordColor.addEventListener('input', () => {
      state.chordColor = el.chordColor.value;
      applyChordStyles();
      persist();
    });

    // タイトル等
    el.titleInput.addEventListener('input', () => { state.title = el.titleInput.value; renderPage(); persist(); });
    el.artistInput.addEventListener('input', () => { state.artist = el.artistInput.value; renderPage(); persist(); });
    el.composerInput.addEventListener('input', () => { state.composer = el.composerInput.value; renderPage(); persist(); });

    el.btnPrint.addEventListener('click', () => window.print());
    el.btnSave.addEventListener('click', () => exportProject());
    el.btnLoad.addEventListener('click', () => el.fileInput.click());
    el.fileInput.addEventListener('change', onImportFile);
    el.btnSettings.addEventListener('click', () => el.settingsDialog.showModal());
    el.btnApplySettings.addEventListener('click', (e) => {
      e.preventDefault();
      state.marginMm = Number(el.marginMm.value);
      state.lineGap = Number(el.lineGap.value);
      renderPage();
      el.settingsDialog.close();
      persist();
    });

    el.btnClear.addEventListener('click', () => {
      el.lyricsInput.value = '';
      state.lyrics = '';
      renderPage();
      persist();
    });
    // サンプル機能は削除

    el.btnSetCustom.addEventListener('click', () => {
      const v = (el.customChord.value || '').trim();
      if (!v) return;
      applySelectedChord(v);
      el.customChord.value = '';
    });
    el.btnSep.addEventListener('click', () => {
      setCurrentChord('|');
      pushHistory('|');
    });
    el.btnEraser.addEventListener('click', () => setCurrentChord('__ERASE__'));
  }

  function refreshChordTexts() {
    const chordEls = el.pageContent.querySelectorAll('.chord');
    chordEls.forEach((n) => {
      const raw = n.dataset.raw || n.textContent;
      n.dataset.raw = raw;
      if (raw === '|') {
        n.textContent = '｜';
      } else {
        n.textContent = displayChordForKey(raw);
      }
    });
    applyChordStyles();
  }

  // ハイライト
  function highlightSelectedChip() {
    const presetChips = el.presetList.querySelectorAll('.chip');
    const historyChips = el.historyList.querySelectorAll('.chip');
    const sepBtn = el.btnSep;
    const isSepSelected = state.selectedChord === '|' || state.selectedChord === '｜';

    function mark(nodes) {
      nodes.forEach((chip) => {
        chip.classList.toggle('active', chip.textContent === state.selectedChord);
      });
    }

    mark(presetChips);
    mark(historyChips);
    if (sepBtn) sepBtn.classList.toggle('active', isSepSelected);
  }

  // ローカル保存
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
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (_) {}
  }

  function restore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      Object.assign(state, data);

      // UI反映
      el.keySelect.value = state.key;
      el.modeSelect.value = state.mode;
      el.transposeToggle.checked = state.transposeAll;
      el.lyricsInput.value = state.lyrics;
      el.lyricsFont.value = String(state.fontSizeLyrics);
      el.chordFont.value = String(state.fontSizeChord);
      el.chordColor.value = state.chordColor;
      el.lyricsFF.value = state.lyricsFontFamily;
      el.chordFF.value = state.chordFontFamily;
      el.presetType.value = state.presetType || 'triad';
      el.lyricsLeading.value = String(state.lineGap);
      el.marginMm.value = String(state.marginMm);
      el.lineGap.value = String(state.lineGap);
    } catch (_) {}
  }

  // 保存/読み込み
  function exportProject() {
    const blob = new Blob([
      JSON.stringify({
        version: 1,
        project: {
          key: state.key,
          mode: state.mode,
          presetType: state.presetType,
          lyrics: state.lyrics,
          lineGap: state.lineGap,
          fontSizeLyrics: state.fontSizeLyrics,
          fontSizeChord: state.fontSizeChord,
          chordColor: state.chordColor,
          lyricsFontFamily: state.lyricsFontFamily,
          chordFontFamily: state.chordFontFamily,
          marginMm: state.marginMm,
          history: state.history,
          title: state.title,
          artist: state.artist,
          composer: state.composer,
          // コード配置（各行のコード列）
          chords: Array.from(el.pageContent.querySelectorAll('.song-line')).map((line) =>
            Array.from(line.querySelectorAll('.chords-row .chord')).map((n) => ({
              raw: n.dataset.raw || n.textContent,
              x: parseFloat(n.style.left || '0'),
            }))
          ),
        },
      }, null, 2),
    ], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'songbook.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function onImportFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const text = await file.text();
    try {
      const data = JSON.parse(text);
      const p = data.project || data;
      state.key = p.key || state.key;
      state.mode = p.mode || state.mode;
      state.lyrics = p.lyrics || '';
      state.lineGap = p.lineGap ?? state.lineGap;
      state.fontSizeLyrics = p.fontSizeLyrics ?? state.fontSizeLyrics;
      state.fontSizeChord = p.fontSizeChord ?? state.fontSizeChord;
      state.chordColor = p.chordColor || state.chordColor;
      state.lyricsFontFamily = p.lyricsFontFamily || state.lyricsFontFamily;
      state.chordFontFamily = p.chordFontFamily || state.chordFontFamily;
      state.marginMm = p.marginMm ?? state.marginMm;
      state.history = Array.isArray(p.history) ? p.history : [];

      // UI反映
      el.keySelect.value = state.key;
      el.modeSelect.value = state.mode;
      el.transposeToggle.checked = state.transposeAll;
      el.lyricsInput.value = state.lyrics;
      el.lyricsFont.value = String(state.fontSizeLyrics);
      el.chordFont.value = String(state.fontSizeChord);
      el.chordColor.value = state.chordColor;
      el.lyricsFF.value = state.lyricsFontFamily;
      el.chordFF.value = state.chordFontFamily;
      el.lyricsLeading.value = String(state.lineGap);
      el.marginMm.value = String(state.marginMm);
      el.lineGap.value = String(state.lineGap);

      // 歌詞再描画
      renderPage();

      // コード復元
      if (Array.isArray(p.chords)) {
        const lines = el.pageContent.querySelectorAll('.song-line');
        p.chords.forEach((arr, i) => {
          const line = lines[i];
          if (!line) return;
          const row = line.querySelector('.chords-row');
          if (!row) return;
          row.innerHTML = '';
          arr.forEach((item) => {
            const raw = typeof item === 'string' ? item : item.raw;
            const x = typeof item === 'object' ? Number(item.x || 0) : 0;
            if (raw === '|' || raw === '｜') {
              const sep = document.createElement('span');
              sep.className = 'chord sep';
              sep.dataset.raw = '|';
              sep.textContent = '｜';
              sep.style.left = `${x}px`;
              row.appendChild(sep);
            } else {
              const span = document.createElement('span');
              span.className = 'chord';
              span.dataset.raw = raw;
              span.textContent = displayChordForKey(raw);
              span.style.left = `${x}px`;
              row.appendChild(span);
            }
          });
        });
        applyChordStyles();
      }
      renderHistory();
      updatePresetList();
      persist();
    } catch (err) {
      alert('読み込みに失敗しました。ファイル形式をご確認ください。');
    } finally {
      e.target.value = '';
    }
  }

  // 初期化
  function init() {
    // 設定初期値
    restore();

    bindEvents();
    enableChordPlacement();
    updatePresetList();
    renderPage();
    renderHistory();
  }

  init();
})();


