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
    lyricsEl.style.letterSpacing = `${state.letterSpacing}px`;
    lyricsEl.style.marginLeft = `${state.lineOffsetPx}px`; // 行全体の右オフセット
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
    c.classList.remove('ff-sans', 'ff-serif', 'ff-rounded');
    
    // 新しいフォントクラスを追加
    c.classList.add(getFontClass(state.chordFontFamily));
  });
}

// eslint-disable-next-line no-unused-vars
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

// コード編集機能を強化
function editChord(chordEl, ctx) {
  const { state } = ctx;
  const originalText = chordEl.textContent;
  
  // 編集用の入力フィールドを作成
  const input = document.createElement('input');
  input.type = 'text';
  input.value = originalText;
  input.className = 'chord-edit-input';
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
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  `;
  
  // 元のコードを一時的に非表示
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
      
      // 編集完了の視覚的フィードバック
      chordEl.style.animation = 'chord-edit-complete 0.3s ease';
      setTimeout(() => {
        chordEl.style.animation = '';
      }, 300);
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
}

// コード配置後の即座編集機能
function placeChordAndEdit(chordsRow, offsetX, chord, ctx) {
  const { state } = ctx; // eslint-disable-line no-unused-vars
  
  let chordAdded = false;
  let chordEl = null;
  
  if (chord === '|') {
    const sep = document.createElement('span');
    sep.className = 'chord sep';
    sep.dataset.raw = '|';
    sep.textContent = '｜';
    sep.style.left = `${offsetX}px`;
    chordsRow.appendChild(sep);
    chordEl = sep;
    chordAdded = true;
  } else {
    const span = document.createElement('span');
    span.className = 'chord';
    span.dataset.raw = chord;
    span.textContent = chord;
    span.style.left = `${offsetX}px`;
    chordsRow.appendChild(span);
    chordEl = span;
    chordAdded = true;
  }
  
  if (chordAdded && chordEl) {
    applyChordStyles(ctx);
    
    // 配置完了の視覚的フィードバック
    chordEl.style.animation = 'chord-placed 0.3s ease';
    setTimeout(() => {
      chordEl.style.animation = '';
    }, 300);
    
    // 自動編集モードは無効化
    // setTimeout(() => {
    //   editChord(chordEl, ctx);
    // }, 100);
    
    // 配置されたコードを履歴に追加
    addChordsToHistory(ctx);
  }
  
  return chordEl;
}

// セクション配置機能
// eslint-disable-next-line no-unused-vars
function placeSection(chordsRow, offsetX, sectionName, ctx) {
  const { state } = ctx; // eslint-disable-line no-unused-vars
  
  const sectionEl = document.createElement('span');
  sectionEl.className = 'section-inline';
  sectionEl.textContent = sectionName;
  sectionEl.style.left = `${offsetX}px`;
  sectionEl.style.position = 'absolute';
  sectionEl.style.top = '0';
  sectionEl.style.fontSize = '12px';
  sectionEl.style.fontWeight = '700';
  sectionEl.style.color = '#6b7280';
  sectionEl.style.textTransform = 'uppercase';
  sectionEl.style.letterSpacing = '1px';
  sectionEl.style.padding = '2px 6px';
  sectionEl.style.background = 'rgba(107, 114, 128, 0.1)';
  sectionEl.style.borderRadius = '3px';
  sectionEl.style.borderLeft = '2px solid #6b7280';
  sectionEl.style.cursor = 'grab';
  sectionEl.style.userSelect = 'none';
  
  chordsRow.appendChild(sectionEl);
  
  // 配置完了の視覚的フィードバック
  sectionEl.style.animation = 'chord-placed 0.3s ease';
  setTimeout(() => {
    sectionEl.style.animation = '';
  }, 300);
  
  // ドラッグ機能を追加
  let isDragging = false;
  let startX = 0;
  let startLeft = 0;
  
  sectionEl.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startLeft = parseFloat(sectionEl.style.left || '0');
    sectionEl.style.cursor = 'grabbing';
    e.preventDefault();
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const newLeft = Math.max(0, startLeft + dx);
    sectionEl.style.left = `${newLeft}px`;
  });
  
  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      sectionEl.style.cursor = 'grab';
    }
  });
  
  return sectionEl;
}

// ページ全体にセクション配置機能
function placeSectionOnPage(pageContent, offsetX, offsetY, sectionName, ctx) {
  const { state } = ctx; // eslint-disable-line no-unused-vars
  
  const sectionEl = document.createElement('span');
  sectionEl.className = 'section-inline';
  sectionEl.textContent = sectionName;
  sectionEl.style.left = `${offsetX}px`;
  sectionEl.style.top = `${offsetY}px`;
  sectionEl.style.position = 'absolute';
  sectionEl.style.fontSize = '12px';
  sectionEl.style.fontWeight = '700';
  sectionEl.style.color = '#6b7280';
  sectionEl.style.textTransform = 'uppercase';
  sectionEl.style.letterSpacing = '1px';
  sectionEl.style.padding = '2px 6px';
  sectionEl.style.background = 'rgba(107, 114, 128, 0.1)';
  sectionEl.style.borderRadius = '3px';
  sectionEl.style.borderLeft = '2px solid #6b7280';
  sectionEl.style.cursor = 'grab';
  sectionEl.style.userSelect = 'none';
  sectionEl.style.zIndex = '100';
  
  pageContent.appendChild(sectionEl);
  
  // 配置完了の視覚的フィードバック
  sectionEl.style.animation = 'chord-placed 0.3s ease';
  setTimeout(() => {
    sectionEl.style.animation = '';
  }, 300);
  
  // ドラッグ機能を追加
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;
  
  sectionEl.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startLeft = parseFloat(sectionEl.style.left || '0');
    startTop = parseFloat(sectionEl.style.top || '0');
    sectionEl.style.cursor = 'grabbing';
    e.preventDefault();
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const newLeft = Math.max(0, startLeft + dx);
    const newTop = Math.max(0, startTop + dy);
    sectionEl.style.left = `${newLeft}px`;
    sectionEl.style.top = `${newTop}px`;
  });
  
  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      sectionEl.style.cursor = 'grab';
    }
  });
  
  return sectionEl;
}

export function enableChordPlacement(ctx) {
  const { state, el } = ctx;
  let hoverEl = null;
  let isEditMode = false; // 編集モードの状態

  // リアルタイムプレビュー（ホバー）
  const rightContent = document.querySelector('.right-content');
  let currentLineWrap = null;
  
  rightContent.addEventListener('mousemove', (ev) => {
    if (isEditMode || window.isEditModeActive) return; // 編集モード中はプレビューを無効化
    
    const isSection = state.selectedChord && state.selectedChord.startsWith('SECTION:');
    
    // セクションの場合はページ全体にプレビュー表示
    if (isSection) {
      const rect = el.pageContent.getBoundingClientRect();
      const offsetX = Math.max(0, ev.clientX - rect.left);
      const offsetY = Math.max(0, ev.clientY - rect.top);
      
      if (!hoverEl) {
        hoverEl = document.createElement('span');
        hoverEl.className = 'section-inline ghost-preview';
        hoverEl.style.opacity = '0.6';
        hoverEl.style.position = 'absolute';
        hoverEl.style.pointerEvents = 'none';
        hoverEl.style.zIndex = '1000';
        hoverEl.style.fontSize = '12px';
        hoverEl.style.fontWeight = '700';
        hoverEl.style.color = '#6b7280';
        hoverEl.style.textTransform = 'uppercase';
        hoverEl.style.letterSpacing = '1px';
        hoverEl.style.padding = '2px 6px';
        hoverEl.style.background = 'rgba(107, 114, 128, 0.1)';
        hoverEl.style.borderRadius = '3px';
        hoverEl.style.borderLeft = '2px solid #6b7280';
        el.pageContent.appendChild(hoverEl);
      }
      
      hoverEl.textContent = state.selectedChord.replace('SECTION:', '');
      hoverEl.style.left = `${offsetX}px`;
      hoverEl.style.top = `${offsetY}px`;
      return;
    }
    
    // コードの場合は歌詞行にのみプレビュー表示
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
      hoverEl.className = 'chord ghost-preview'; 
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
    
    isEditMode = true;
    editChord(chordEl, ctx);
    
    // 編集完了後に編集モードを解除
    setTimeout(() => {
      isEditMode = false;
    }, 100);
  });

  // 編集モード時のシングルクリック編集
  el.pageContent.addEventListener('click', (ev) => {
    if (!window.isEditModeActive) return; // 編集モードが有効でない場合は無視
    
    const chordEl = ev.target.closest('.chord');
    if (!chordEl || chordEl.classList.contains('sep')) return;
    
    ev.preventDefault();
    ev.stopPropagation();
    
    editChord(chordEl, ctx);
  });
  
  el.pageContent.addEventListener('click', (ev) => {
    if (isEditMode || window.isEditModeActive) return; // 編集モード中は配置を無効化
    
    // セクションの場合はページ全体に配置可能
    if (state.selectedChord && state.selectedChord.startsWith('SECTION:')) {
      const sectionName = state.selectedChord.replace('SECTION:', '');
      const rect = el.pageContent.getBoundingClientRect();
      const offsetX = Math.max(0, ev.clientX - rect.left);
      const offsetY = Math.max(0, ev.clientY - rect.top);
      placeSectionOnPage(el.pageContent, offsetX, offsetY, sectionName, ctx);
      if (hoverEl) { hoverEl.remove(); hoverEl=null; }
      return;
    }
    
    // コードの場合は歌詞行にのみ配置
    const lineWrap = ev.target.closest('.song-line');
    if (!lineWrap) return;
    const chordsRow = lineWrap.querySelector('.chords-row');
    if (!chordsRow) return;

    if (state.selectedChord === '__ERASE__') {
      const chordEl = ev.target.closest('.chord, .section-inline');
      if (chordEl && (chordsRow.contains(chordEl) || el.pageContent.contains(chordEl))) {
        // 削除の視覚的フィードバック
        chordEl.style.animation = 'chord-deleted 0.3s ease';
        setTimeout(() => {
          chordEl.remove();
        }, 300);
      }
      return;
    }
    
    if (!state.selectedChord) return;

    const rect = chordsRow.getBoundingClientRect();
    const offsetX = Math.max(0, ev.clientX - rect.left);
    const chord = state.selectedChord;
    
    // コードを配置して即座に編集モードに入る
    placeChordAndEdit(chordsRow, offsetX, chord, ctx);
    
    if (hoverEl) { hoverEl.remove(); hoverEl=null; }
  });

  // Pointer Events drag
  let dragEl = null; let startX = 0; let startLeft = 0; let pid = null;
  el.pageContent.addEventListener('pointerdown', (e) => {
    if (isEditMode || window.isEditModeActive) return; // 編集モード中はドラッグを無効化
    
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
    case 'rounded': return 'ff-rounded';
    default: return 'ff-sans';
  }
}


