// placement.js: 歌詞レンダリングとコード配置/ドラッグ

export function renderPage(ctx) {
  const { state, el } = ctx;
  const lines = state.lyrics.split(/\r?\n/);
  el.pageContent.innerHTML = '';

  // タイトル
  const titleWrap = document.createElement('div');
  titleWrap.className = 'page-title ' + getFontClass(state.lyricsFontFamily);
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
    // コード縦位置オフセット
    chordsRow.style.transform = `translateY(${state.chordOffsetPx ?? -18}px)`;

    const lyricsEl = document.createElement('div');
    lyricsEl.className = 'lyrics-text';
    lyricsEl.style.fontSize = `${state.fontSizeLyrics}px`;
    lyricsEl.style.marginBottom = `${state.lineGap}px`;
    lyricsEl.classList.add(getFontClass(state.lyricsFontFamily));
    lyricsEl.textContent = line || '\u00A0';

    lineWrap.appendChild(chordsRow);
    lineWrap.appendChild(lyricsEl);
    el.pageContent.appendChild(lineWrap);
  });
  applyChordStyles(ctx);
}

export function applyChordStyles(ctx) {
  const { state } = ctx;
  const chordEls = document.querySelectorAll('.chord');
  chordEls.forEach((c) => {
    c.style.color = state.chordColor;
    c.style.fontSize = `${state.fontSizeChord}px`;
    
    // 既存のフォントクラスを削除
    c.classList.remove('ff-mono', 'ff-sans', 'ff-serif', 'ff-rounded', 'ff-bold');
    
    // 新しいフォントクラスを追加
    c.classList.add(getFontClass(state.chordFontFamily));
  });
}

function addToHistory(ctx, chord) {
  const { state } = ctx;
  
  // 既存の履歴から同じコードを削除して先頭に追加
  state.history = [chord].concat(state.history.filter((c) => c !== chord)).slice(0, 16);
  
  // 履歴表示を更新
  if (ctx.renderHistory) {
    ctx.renderHistory();
  }
  // 状態を保存
  if (ctx.persist) {
    ctx.persist();
  }
}

// ページ（A4 portrait）に配置されたコード名を取得して履歴に記録する関数
function addChordsToHistory(ctx) {
  const { state } = ctx;
  
  // ページ全体のコードを取得
  const chordElements = document.querySelectorAll('.page-content .chords-row .chord');
  const pageChords = [];
  
  chordElements.forEach((chordEl) => {
    const chordName = chordEl.textContent.trim();
    if (chordName && chordName !== '｜' && chordName !== '×') {
      pageChords.push(chordName);
    }
  });
  
  // 重複を除去して履歴を更新
  const uniqueChords = [...new Set(pageChords)];
  state.history = uniqueChords.slice(-16); // 最大16個まで保持
  
  // 履歴表示を更新
  if (ctx.renderHistory) {
    ctx.renderHistory();
  }
  // 状態を保存
  if (ctx.persist) {
    ctx.persist();
  }
}

export function enableChordPlacement(ctx) {
  const { state, el } = ctx;
  let hoverEl = null;

  // リアルタイムプレビュー（ホバー）
  const rightContent = document.querySelector('.right-content');
  let currentLineWrap = null;
  
  rightContent.addEventListener('mousemove', (ev) => {
    const lineWrap = ev.target.closest('.song-line');
    const chordsRow = lineWrap?.querySelector('.chords-row');
    
    // 行が変わった場合の処理
    if (lineWrap !== currentLineWrap) {
      if (hoverEl) {
        hoverEl.remove();
        hoverEl = null;
      }
      currentLineWrap = lineWrap;
    }
    
    if (!chordsRow) { 
      if (hoverEl) { 
        hoverEl.remove(); 
        hoverEl = null; 
      } 
      return; 
    }
    
    const hasSingle = !!state.selectedChord && state.selectedChord !== '__ERASE__';
    const isErase = state.selectedChord === '__ERASE__';
    if (!hasSingle && !isErase) { 
      if (hoverEl) { 
        hoverEl.remove(); 
        hoverEl = null; 
      } 
      return; 
    }

    // より高速な位置計算
    const rect = chordsRow.getBoundingClientRect();
    const offsetX = Math.max(0, ev.clientX - rect.left);
    
    if (!hoverEl) { 
      hoverEl = document.createElement('span'); 
      hoverEl.className='chord ghost-preview'; 
      hoverEl.style.opacity = '0.6';
      hoverEl.style.color = state.chordColor;
      hoverEl.style.fontSize = `${state.fontSizeChord}px`;
      hoverEl.classList.toggle('ff-mono', state.chordFontFamily === 'mono');
      hoverEl.classList.toggle('ff-sans', state.chordFontFamily === 'sans');
      hoverEl.style.position = 'absolute';
      hoverEl.style.pointerEvents = 'none';
      hoverEl.style.zIndex = '1000';
      chordsRow.appendChild(hoverEl); 
    }
    
    const chord = isErase ? '×' : (state.selectedChord || '');
    hoverEl.textContent = chord || '';
    hoverEl.style.left = `${offsetX}px`;
  });
  
  rightContent.addEventListener('mouseleave', ()=>{ 
    if (hoverEl) { 
      hoverEl.remove(); 
      hoverEl = null; 
    }
    currentLineWrap = null;
  });
  
  // コード編集機能（ダブルクリック）
  el.pageContent.addEventListener('dblclick', (ev) => {
    const chordEl = ev.target.closest('.chord');
    if (!chordEl || chordEl.classList.contains('sep')) return;
    
    ev.preventDefault();
    ev.stopPropagation();
    
    const originalText = chordEl.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = originalText;
    input.style.cssText = `
      position: absolute;
      left: ${chordEl.style.left};
      top: ${chordEl.style.top || '0'};
      width: ${Math.max(60, originalText.length * 12)}px;
      height: 20px;
      border: 2px solid #3b82f6;
      border-radius: 4px;
      padding: 2px 4px;
      font-size: ${state.fontSizeChord}px;
      font-weight: 700;
      color: ${state.chordColor};
      background: white;
      z-index: 1001;
    `;
    
    chordEl.style.visibility = 'hidden';
    chordEl.parentNode.appendChild(input);
    input.focus();
    input.select();
    
    const finishEdit = () => {
      const newText = input.value.trim();
      if (newText && newText !== originalText) {
        chordEl.textContent = newText;
        chordEl.dataset.raw = newText;
        applyChordStyles(ctx);
        // 編集したコードも履歴に追加
        addChordsToHistory(ctx);
      }
      chordEl.style.visibility = '';
      input.remove();
    };
    
    input.addEventListener('blur', finishEdit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        finishEdit();
      } else if (e.key === 'Escape') {
        chordEl.style.visibility = '';
        input.remove();
      }
    });
  });
  
  el.pageContent.addEventListener('click', (ev) => {
    const lineWrap = ev.target.closest('.song-line');
    if (!lineWrap) return;
    const chordsRow = lineWrap.querySelector('.chords-row');
    if (!chordsRow) return;

    if (state.selectedChord === '__ERASE__') {
      const chordEl = ev.target.closest('.chord');
      if (chordEl && chordsRow.contains(chordEl)) chordEl.remove();
      return;
    }
    
    if (!state.selectedChord) return;

    const rect = chordsRow.getBoundingClientRect();
    const offsetX = Math.max(0, ev.clientX - rect.left);
    const chord = state.selectedChord;
    
    let chordAdded = false;
    
    if (chord === '|') {
      const sep = document.createElement('span');
      sep.className = 'chord sep';
      sep.dataset.raw = '|';
      sep.textContent = '｜';
      sep.style.left = `${offsetX}px`;
      chordsRow.appendChild(sep);
      applyChordStyles(ctx);
      chordAdded = true;
    } else {
      const span = document.createElement('span');
      span.className = 'chord';
      span.dataset.raw = chord;
      span.textContent = chord;
      span.style.left = `${offsetX}px`;
      chordsRow.appendChild(span);
      applyChordStyles(ctx);
      chordAdded = true;
    }
    
    // コードが実際に配置された場合のみ履歴に追加
    if (chordAdded) {
      // 配置されたコードを履歴に追加
      addChordsToHistory(ctx);
    }
    
    if (hoverEl) { hoverEl.remove(); hoverEl=null; }
  });

  // Pointer Events drag
  let dragEl = null; let startX = 0; let startLeft = 0; let pid = null;
  el.pageContent.addEventListener('pointerdown', (e) => {
    const target = e.target.closest('.chord');
    if (!target) return;
    dragEl = target; pid = e.pointerId; startX = e.clientX; startLeft = parseFloat(dragEl.style.left||'0');
    dragEl.setPointerCapture?.(pid); e.preventDefault();
  });
  window.addEventListener('pointermove', (e) => {
    if (!dragEl || pid !== e.pointerId) return;
    const dx = e.clientX - startX; const next = Math.max(0, startLeft + dx);
    dragEl.style.left = `${next}px`;
  });
  window.addEventListener('pointerup', (e) => {
    if (pid !== e.pointerId) return;
    dragEl = null; pid = null;
  });
}

function getFontClass(fontFamily) {
  switch (fontFamily) {
    case 'serif': return 'ff-serif';
    case 'sans': return 'ff-sans';
    case 'mono': return 'ff-mono';
    case 'rounded': return 'ff-rounded';
    case 'mincho': return 'ff-mincho';
    case 'bold': return 'ff-bold';
    default: return 'ff-sans';
  }
}


