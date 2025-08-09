// ui.js: イベントバインド、ボタン/入力のハンドリング、ハイライトなど
import { renderPage, applyChordStyles } from './placement.js';
import { updatePresetList } from './presets.js';

export function setupUI(ctx) {
  const { state, el, persist, computeInterval, transposeChord, normalizeChordName } = ctx;

  function highlightSelectedChip() {
    const presetChips = el.presetList?.querySelectorAll('.chip:not(.section-chip)') || [];
    const historyChips = el.historyList?.querySelectorAll('.chip') || [];
    const sepBtn = el.btnSep;
    const isSepSelected = state.selectedChord === '|' || state.selectedChord === '｜';
    
    // プリセットチップのハイライト
    presetChips.forEach((chip) => {
      if (chip.textContent === state.selectedChord) {
        chip.style.outline = '2px solid rgba(59, 130, 246, 0.9)';
        chip.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2) inset';
      } else {
        chip.style.outline = '';
        chip.style.boxShadow = '';
      }
    });
    
    // 履歴チップのハイライト
    historyChips.forEach((chip) => {
      if (chip.textContent === state.selectedChord) {
        chip.style.outline = '2px solid rgba(59, 130, 246, 0.9)';
        chip.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2) inset';
      } else {
        chip.style.outline = '';
        chip.style.boxShadow = '';
      }
    });
    
    // 区切り線ボタンのハイライト
    if (sepBtn) {
      if (isSepSelected) {
        sepBtn.style.outline = '2px solid rgba(59, 130, 246, 0.9)';
        sepBtn.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2) inset';
      } else {
        sepBtn.style.outline = '';
        sepBtn.style.boxShadow = '';
      }
    }
  }

  function setCurrentChord(chordOrNull) {
    state.selectedChord = chordOrNull;
    if (el.currentChord) {
      if (chordOrNull === '__ERASE__') {
        el.currentChord.textContent = '消しゴムモード';
      } else if (window.isEditModeActive) {
        el.currentChord.textContent = '編集モード';
      } else {
        el.currentChord.textContent = chordOrNull || 'なし';
      }
    }
    
    highlightSelectedChip();
    updateCursor();
  }

  function applySelectedChord(chord) {
    const norm = normalizeChordName(chord);
    setCurrentChord(norm);
    // 履歴追加は削除 - 実際に配置した時のみ履歴に追加
  }



  function renderHistory() {
    if (!el.historyList) return;
    el.historyList.innerHTML = '';
    el.historyList.className = 'chip-row';
    // 左→右で表示。state.historyの末尾が最新（右端）
    state.history.forEach((c)=>{
      const chip = document.createElement('button');
      chip.type = 'button'; chip.className='chip'; chip.textContent=c;
      chip.addEventListener('click', ()=> setCurrentChord(c));
      el.historyList.appendChild(chip);
    });
    highlightSelectedChip();
  }

  function refreshChordTexts() {
    const chordEls = el.pageContent.querySelectorAll('.chord');
    chordEls.forEach((n)=>{
      const raw = n.dataset.raw || n.textContent;
      n.dataset.raw = raw;
      if (raw === '|') n.textContent = '｜';
      else n.textContent = raw;
    });
    applyChordStyles(ctx);
  }

  function transposeAllExistingChords(fromKey, toKey) {
    const interval = computeInterval(fromKey, toKey);
    if (!interval) return;
    const chordEls = el.pageContent.querySelectorAll('.chord');
    chordEls.forEach((n)=>{
      const raw = n.dataset.raw || n.textContent;
      if (raw === '|' || raw === '｜') return;
      const next = transposeChord(raw, interval);
      n.dataset.raw = next; n.textContent = next;
    });
    applyChordStyles(ctx);
  }

  function reduceLines(lyrics) {
    const lines = lyrics.split('\n');
    const result = [];
    let currentLine = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // 空行の場合は新しい行を開始
      if (!line) {
        if (currentLine) {
          result.push(currentLine);
          currentLine = '';
        }
        continue;
      }
      
      // セクション記号（[Intro]など）の場合は新しい行を開始
      if (line.startsWith('[') && line.endsWith(']')) {
        if (currentLine) {
          result.push(currentLine);
          currentLine = '';
        }
        result.push(line);
        continue;
      }
      
      // 通常の歌詞行の場合
      if (currentLine) {
        // 既存の行がある場合、結合後の文字数をチェック
        const combinedLine = currentLine + ' ' + line;
        if (combinedLine.length <= 25) {
          // 25文字以下なら結合
          currentLine = combinedLine;
        } else {
          // 25文字を超える場合は改行しない
          result.push(currentLine);
          currentLine = line;
        }
      } else {
        // 新しい行を開始
        currentLine = line;
      }
    }
    
    // 最後の行を追加
    if (currentLine) {
      result.push(currentLine);
    }
    
    return result.join('\n');
  }

  function updateCursor() {
    const isErase = state.selectedChord === '__ERASE__';
    el.pageContent.classList.toggle('cursor-eraser', isErase);
    el.pageContent.classList.toggle('cursor-pencil', !isErase && !!state.selectedChord);
  }

  // バインド
  el.keySelect?.addEventListener('change', ()=>{
    const prevKey = state.key; state.key = el.keySelect.value;
    updatePresetList(ctx);
    if (state.transposeAll) transposeAllExistingChords(prevKey, state.key);
    else refreshChordTexts();
    persist();
  });
  el.modeSelect?.addEventListener('change', ()=>{ state.mode = el.modeSelect.value; updatePresetList(ctx); persist(); });
  el.presetType?.addEventListener('change', ()=>{ state.presetType = el.presetType.value; updatePresetList(ctx); persist(); });
  // 全コード移調は廃止

  el.lyricsInput?.addEventListener('input', ()=>{ state.lyrics = el.lyricsInput.value; renderPage(ctx); persist(); });
  el.titleInput?.addEventListener('input', ()=>{ state.title = el.titleInput.value; renderPage(ctx); persist(); });
  el.artistInput?.addEventListener('input', ()=>{ state.artist = el.artistInput.value; renderPage(ctx); persist(); });
  el.composerInput?.addEventListener('input', ()=>{ state.composer = el.composerInput.value; renderPage(ctx); persist(); });

  el.lyricsFont?.addEventListener('input', ()=>{
    state.fontSizeLyrics = Number(el.lyricsFont.value);
    el.pageContent.querySelectorAll('.lyrics-text').forEach((n)=> {
      n.style.fontSize = `${state.fontSizeLyrics}px`;
      // フォントファミリーも再適用
      n.classList.remove('ff-serif', 'ff-sans', 'ff-rounded', 'ff-mincho');
      n.classList.add(getFontClass(state.lyricsFontFamily));
    });
  });
  el.lyricsLeading?.addEventListener('input', ()=>{
    state.lineGap = Number(el.lyricsLeading.value);
    el.pageContent.querySelectorAll('.lyrics-text').forEach((n)=> n.style.marginBottom = `${state.lineGap}px`);
    persist();
  });
  el.letterSpacing?.addEventListener('input', ()=>{
    state.letterSpacing = Number(el.letterSpacing.value);
    el.pageContent.querySelectorAll('.lyrics-text').forEach((n)=> n.style.letterSpacing = `${state.letterSpacing}px`);
    persist();
  });
  // フォントクラス取得関数
  function getFontClass(fontFamily) {
    switch (fontFamily) {
      case 'serif': return 'ff-serif';
      case 'rounded': return 'ff-rounded';
      default: return 'ff-sans';
    }
  }

  el.lyricsFF?.addEventListener('change', ()=>{
    state.lyricsFontFamily = el.lyricsFF.value;
    el.pageContent.querySelectorAll('.lyrics-text').forEach((n)=>{
      // 既存のフォントクラスを削除
      n.classList.remove('ff-serif', 'ff-sans', 'ff-rounded');
      // 新しいフォントクラスを追加
      n.classList.add(getFontClass(state.lyricsFontFamily));
    });
    persist();
  });
  el.chordFF?.addEventListener('change', ()=>{ 
    state.chordFontFamily = el.chordFF.value; 
    applyChordStyles(ctx); 
    persist(); 
  });
  el.chordFont?.addEventListener('input', ()=>{ state.fontSizeChord = Number(el.chordFont.value); applyChordStyles(ctx); persist(); });
  el.chordColor?.addEventListener('input', ()=>{ state.chordColor = el.chordColor.value; applyChordStyles(ctx); persist(); });
  // コード縦位置
  const chordOffset = document.getElementById('chord-offset');
  chordOffset?.addEventListener('input', ()=>{
    state.chordOffsetPx = Number(chordOffset.value);
    el.pageContent.querySelectorAll('.chords-row').forEach((row)=>{
      row.style.transform = `translateY(${state.chordOffsetPx}px)`;
    });
    persist();
  });

  // 行全体右位置
  const lineOffset = document.getElementById('line-offset');
  lineOffset?.addEventListener('input', ()=>{
    state.lineOffsetPx = Number(lineOffset.value);
    el.pageContent.querySelectorAll('.lyrics-text').forEach((text)=>{
      text.style.marginLeft = `${state.lineOffsetPx}px`;
    });
    persist();
  });

  // バリデーション関数
  function validateRequiredFields() {
    const title = state.title?.trim() || '';
    const artist = state.artist?.trim() || '';
    
    if (!title || !artist) {
      const missingFields = [];
      if (!title) missingFields.push('曲タイトル');
      if (!artist) missingFields.push('アーティスト名');
      
      alert(`以下の項目を入力してください：\n${missingFields.join('\n')}`);
      return false;
    }
    return true;
  }

  el.btnPrint?.addEventListener('click', ()=> {
    if (validateRequiredFields()) {
      window.print();
    }
  });
  el.btnSave?.addEventListener('click', ()=> {
    if (validateRequiredFields()) {
      exportProject(ctx);
    }
  });
  el.btnLoad?.addEventListener('click', ()=> el.fileInput.click());
  el.fileInput?.addEventListener('change', (e)=> onImportFile(ctx, e));
  el.btnClear?.addEventListener('click', ()=>{ if (!el.lyricsInput) return; el.lyricsInput.value=''; state.lyrics=''; renderPage(ctx); persist(); });

  el.btnReduceLines?.addEventListener('click', () => {
    if (!el.lyricsInput) return;
    const lyrics = el.lyricsInput.value;
    if (!lyrics.trim()) return;
    
    // 現在の歌詞をundo履歴に保存
    if (!state.lyricsHistory) state.lyricsHistory = [];
    state.lyricsHistory.push(lyrics);
    if (state.lyricsHistory.length > 10) state.lyricsHistory.shift(); // 最大10個まで
    
    // 行を減らす処理
    const reducedLyrics = reduceLines(lyrics);
    el.lyricsInput.value = reducedLyrics;
    state.lyrics = reducedLyrics;
    renderPage(ctx);
    persist();
  });

  // Undoボタンのイベントハンドラー
  el.btnUndo?.addEventListener('click', () => {
    if (!el.lyricsInput || !state.lyricsHistory || state.lyricsHistory.length === 0) return;
    
    const previousLyrics = state.lyricsHistory.pop();
    el.lyricsInput.value = previousLyrics;
    state.lyrics = previousLyrics;
    renderPage(ctx);
    persist();
  });

  el.btnSetCustom?.addEventListener('click', ()=>{ 
    const v=(el.customChord.value||'').trim(); 
    if(!v) return; 
    applySelectedChord(v); 
    el.customChord.value=''; 
    // 履歴追加は削除 - 実際に配置した時のみ履歴に追加
  });
  el.btnSep?.addEventListener('click', ()=>{ 
    setCurrentChord('|'); 
    // 履歴追加は削除 - 実際に配置した時のみ履歴に追加
  });
  // 手動移調ボタン（入力済みのみ）
  const btnManualTranspose = document.getElementById('btn-manual-transpose');
  btnManualTranspose?.addEventListener('click', ()=>{
    const from = prompt('現在のキーを入力 (例: C) ', state.key) || state.key;
    const to = prompt('移調先キーを入力 (例: D) ', state.key) || state.key;
    const interval = computeInterval(from, to);
    const chordEls = el.pageContent.querySelectorAll('.chord');
    chordEls.forEach((n)=>{
      const raw = n.dataset.raw || n.textContent; if (raw==='|'||raw==='｜') return;
      const next = transposeChord(raw, interval); n.dataset.raw = next; n.textContent = next;
    });
    applyChordStyles(ctx);
  });
  el.btnEraser?.addEventListener('click', ()=> {
    setCurrentChord('__ERASE__');
    // ページツールボタンの状態も同期
    if (btnEraserPage) btnEraserPage.classList.add('active');
    if (btnEditModePage) btnEditModePage.classList.remove('active');
    if (btnEraserControls) btnEraserControls.classList.add('active');
    if (btnEditModeControls) btnEditModeControls.classList.remove('active');
    
    // プレビューエリアのクラスを切り替え
    const pageContent = document.getElementById('page-content');
    if (pageContent) {
      pageContent.classList.remove('edit-mode');
      pageContent.classList.add('eraser-mode');
    }
  });

  // セクションチップのイベントハンドラー
  document.addEventListener('click', (ev) => {
    const sectionChip = ev.target.closest('.section-chip');
    if (!sectionChip) return;
    
    const sectionName = sectionChip.dataset.section;
    if (!sectionName) return;
    
    // セクションを選択状態にする（配置用）
    setCurrentChord(`SECTION:${sectionName}`);
    
    // セクションチップのハイライト
    document.querySelectorAll('.section-chip').forEach(chip => {
      chip.classList.remove('active');
    });
    sectionChip.classList.add('active');
  });


  // 編集モード切り替えボタン
  const btnEditMode = document.getElementById('btn-edit-mode');
  let isEditModeActive = false;
  
  // ページツールボタン
  // ページツールボタンの要素を取得（削除済み）
  const btnEraserPage = null;
  const btnEditModePage = null;
  
  btnEditMode?.addEventListener('click', () => {
    isEditModeActive = !isEditModeActive;
    btnEditMode.textContent = isEditModeActive ? '配置モード' : '編集モード';
    btnEditMode.classList.toggle('primary', isEditModeActive);
    btnEditMode.classList.toggle('ghost', !isEditModeActive);
    
    // 編集モードの状態をグローバルに公開
    window.isEditModeActive = isEditModeActive;
    
    // プレビューエリアのクラスを切り替え
    const pageContent = document.getElementById('page-content');
    if (pageContent) {
      pageContent.classList.toggle('edit-mode', isEditModeActive);
      pageContent.classList.remove('eraser-mode');
    }
    
    // ページツールボタンの状態を同期
    if (btnEditModePage) {
      btnEditModePage.classList.toggle('active', isEditModeActive);
    }
    if (btnEditModeControls) {
      btnEditModeControls.classList.toggle('active', isEditModeActive);
    }
    
    // 表示を更新
    setCurrentChord(state.selectedChord);
  });

  // ページ消しゴムボタン
  btnEraserPage?.addEventListener('click', () => {
    setCurrentChord('__ERASE__');
    
    // 他のツールボタンのアクティブ状態をリセット
    if (btnEditModePage) btnEditModePage.classList.remove('active');
    if (btnEraserPage) btnEraserPage.classList.add('active');
    if (btnEraserControls) btnEraserControls.classList.add('active');
    if (btnEditModeControls) btnEditModeControls.classList.remove('active');
    
    // 編集モードを無効化
    isEditModeActive = false;
    window.isEditModeActive = false;
    const pageContent = document.getElementById('page-content');
    if (pageContent) {
      pageContent.classList.remove('edit-mode');
      pageContent.classList.add('eraser-mode');
    }
  });

  // ページ編集モードボタン
  btnEditModePage?.addEventListener('click', () => {
    isEditModeActive = !isEditModeActive;
    window.isEditModeActive = isEditModeActive;
    
    // ボタンの状態を切り替え
    btnEditModePage.classList.toggle('active', isEditModeActive);
    if (btnEraserPage) btnEraserPage.classList.remove('active');
    if (btnEraserControls) btnEraserControls.classList.remove('active');
    if (btnEditModeControls) btnEditModeControls.classList.toggle('active', isEditModeActive);
    
    // プレビューエリアのクラスを切り替え
    const pageContent = document.getElementById('page-content');
    if (pageContent) {
      pageContent.classList.toggle('edit-mode', isEditModeActive);
      pageContent.classList.remove('eraser-mode');
    }
    
    // 消しゴムモードを解除
    if (state.selectedChord === '__ERASE__') {
      setCurrentChord(null);
    }
    
    // 表示を更新
    setCurrentChord(state.selectedChord);
  });

  // 表示設定内の消しゴムモードボタン
  const btnEraserControls = document.getElementById('btn-eraser-controls');
  btnEraserControls?.addEventListener('click', () => {
    setCurrentChord('__ERASE__');
    
    // 他のツールボタンのアクティブ状態をリセット
    if (btnEditModePage) btnEditModePage.classList.remove('active');
    if (btnEraserPage) btnEraserPage.classList.add('active');
    if (btnEditModeControls) btnEditModeControls.classList.remove('active');
    btnEraserControls.classList.add('active');
    
    // 編集モードを無効化
    isEditModeActive = false;
    window.isEditModeActive = false;
    const pageContent = document.getElementById('page-content');
    if (pageContent) {
      pageContent.classList.remove('edit-mode');
      pageContent.classList.add('eraser-mode');
    }
  });

  // 表示設定内の編集モードボタン
  const btnEditModeControls = document.getElementById('btn-edit-mode-controls');
  btnEditModeControls?.addEventListener('click', () => {
    isEditModeActive = !isEditModeActive;
    window.isEditModeActive = isEditModeActive;
    
    // ボタンの状態を切り替え
    btnEditModeControls.classList.toggle('active', isEditModeActive);
    if (btnEraserControls) btnEraserControls.classList.remove('active');
    if (btnEraserPage) btnEraserPage.classList.remove('active');
    if (btnEditModePage) btnEditModePage.classList.toggle('active', isEditModeActive);
    
    // プレビューエリアのクラスを切り替え
    const pageContent = document.getElementById('page-content');
    if (pageContent) {
      pageContent.classList.toggle('edit-mode', isEditModeActive);
      pageContent.classList.remove('eraser-mode');
    }
    
    // 消しゴムモードを解除
    if (state.selectedChord === '__ERASE__') {
      setCurrentChord(null);
    }
    
    // 表示を更新
    setCurrentChord(state.selectedChord);
  });

  // export/import helpers（app.jsから移植）
  function exportProject(ctx) {
    const { state, el } = ctx;
    const blob = new Blob([ JSON.stringify({ version:1, project: {
      key: state.key, mode: state.mode, presetType: state.presetType,
      lyrics: state.lyrics, lineGap: state.lineGap, letterSpacing: state.letterSpacing,
      fontSizeLyrics: state.fontSizeLyrics, fontSizeChord: state.fontSizeChord,
      chordColor: state.chordColor, lyricsFontFamily: state.lyricsFontFamily, chordFontFamily: state.chordFontFamily,
      marginMm: state.marginMm, history: state.history,
      title: state.title, artist: state.artist, composer: state.composer,
      chords: Array.from(el.pageContent.querySelectorAll('.song-line')).map((line)=>
        Array.from(line.querySelectorAll('.chords-row .chord')).map((n)=>({ raw: n.dataset.raw || n.textContent, x: parseFloat(n.style.left||'0') }))
      ),
    }}, null, 2) ], { type:'application/json' });
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='songbook.json'; document.body.appendChild(a); a.click(); a.remove();
  }
  async function onImportFile(ctx, e){
    const file = e.target.files && e.target.files[0]; if(!file) return; const text = await file.text();
    try{
      const data = JSON.parse(text); const p = data.project||data; Object.assign(state, {
        key:p.key||state.key, mode:p.mode||state.mode, presetType:p.presetType||state.presetType,
        lyrics:p.lyrics||'', lineGap:p.lineGap??state.lineGap, letterSpacing:p.letterSpacing??state.letterSpacing,
        fontSizeLyrics:p.fontSizeLyrics??state.fontSizeLyrics, fontSizeChord:p.fontSizeChord??state.fontSizeChord,
        chordColor:p.chordColor||state.chordColor, lyricsFontFamily:p.lyricsFontFamily||state.lyricsFontFamily,
        chordFontFamily:p.chordFontFamily||state.chordFontFamily, marginMm:p.marginMm??state.marginMm,
        history:Array.isArray(p.history)?p.history:[], title:p.title||'', artist:p.artist||'', composer:p.composer||'',
      });
      // UI反映
      el.keySelect.value=state.key; el.modeSelect.value=state.mode; el.presetType.value=state.presetType;
      el.lyricsInput.value=state.lyrics; el.lyricsFont.value=String(state.fontSizeLyrics); el.chordFont.value=String(state.fontSizeChord);
      el.chordColor.value=state.chordColor; el.lyricsFF.value=state.lyricsFontFamily; el.chordFF.value=state.chordFontFamily;
      el.lyricsLeading.value=String(state.lineGap); if(el.letterSpacing) el.letterSpacing.value=String(state.letterSpacing); if(el.titleInput) el.titleInput.value=state.title; if(el.artistInput) el.artistInput.value=state.artist; if(el.composerInput) el.composerInput.value=state.composer;
      // 再描画
      renderPage(ctx);
      if(Array.isArray(p.chords)){
        const lines = el.pageContent.querySelectorAll('.song-line');
        p.chords.forEach((arr,i)=>{
          const line = lines[i]; if(!line) return; const row=line.querySelector('.chords-row'); if(!row) return; row.innerHTML='';
          arr.forEach((item)=>{
            const raw = typeof item==='string'? item: item.raw; const x = typeof item==='object'? Number(item.x||0):0;
            if(raw==='|'||raw==='｜'){ const sep=document.createElement('span'); sep.className='chord sep'; sep.dataset.raw='|'; sep.textContent='｜'; sep.style.left=`${x}px`; row.appendChild(sep); }
            else { const span=document.createElement('span'); span.className='chord'; span.dataset.raw=raw; span.textContent=raw; span.style.left=`${x}px`; row.appendChild(span); }
          });
        });
        applyChordStyles(ctx);
      }
      renderHistory(); updatePresetList(ctx); persist();
    }catch{ alert('読み込みに失敗しました。ファイル形式をご確認ください。'); }
    finally{ e.target.value=''; }
  }



  // 公開
  ctx.highlightSelectedChip = highlightSelectedChip;
  ctx.setCurrentChord = setCurrentChord;
  ctx.applySelectedChord = applySelectedChord;
  ctx.renderPage = renderPage;
  ctx.persist = persist;
  ctx.renderHistory = renderHistory;

  // ヘルプ機能の設定
  setupHelpModal(ctx);
}

/**
 * ヘルプモーダルの設定
 */
function setupHelpModal(_ctx) {
  const btnHelp = document.getElementById('btn-help');
  const helpModal = document.getElementById('help-modal');
  const helpClose = document.getElementById('help-close');
  const helpTabs = document.querySelectorAll('.help-tab');
  const helpPanels = document.querySelectorAll('.help-panel');

  if (!btnHelp || !helpModal) return;

  // ヘルプを開く
  function openHelp() {
    helpModal.style.display = 'flex';
    helpModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // フォーカス管理
    const firstTab = helpModal.querySelector('.help-tab');
    if (firstTab) {
      firstTab.focus();
    }
  }

  // ヘルプを閉じる
  function closeHelp() {
    helpModal.style.display = 'none';
    helpModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    // フォーカスを戻す
    btnHelp.focus();
  }

  // タブ切り替え
  function switchTab(targetTab) {
    // すべてのタブとパネルの状態をリセット
    helpTabs.forEach(tab => {
      tab.classList.remove('active');
      tab.setAttribute('aria-selected', 'false');
    });
    
    helpPanels.forEach(panel => {
      panel.style.display = 'none';
    });

    // 選択されたタブとパネルをアクティブに
    targetTab.classList.add('active');
    targetTab.setAttribute('aria-selected', 'true');
    
    const targetPanelId = 'help-' + targetTab.dataset.tab;
    const targetPanel = document.getElementById(targetPanelId);
    if (targetPanel) {
      targetPanel.style.display = 'block';
    }
  }

  // イベントリスナーの設定
  btnHelp.addEventListener('click', openHelp);
  
  if (helpClose) {
    helpClose.addEventListener('click', closeHelp);
  }

  // オーバーレイクリックで閉じる
  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) {
      closeHelp();
    }
  });

  // タブクリック
  helpTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      switchTab(tab);
    });
  });

  // キーボード操作
  document.addEventListener('keydown', (e) => {
    // F1キーでヘルプを開く
    if (e.key === 'F1') {
      e.preventDefault();
      if (helpModal.style.display === 'none' || !helpModal.style.display) {
        openHelp();
      } else {
        closeHelp();
      }
    }
    
    // Escキーでヘルプを閉じる
    if (e.key === 'Escape' && helpModal.style.display === 'flex') {
      e.preventDefault();
      closeHelp();
    }
  });

  // タブ内でのキーボードナビゲーション
  helpModal.addEventListener('keydown', (e) => {
    if (e.target.classList.contains('help-tab')) {
      const currentIndex = Array.from(helpTabs).indexOf(e.target);
      
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % helpTabs.length;
        helpTabs[nextIndex].focus();
        switchTab(helpTabs[nextIndex]);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + helpTabs.length) % helpTabs.length;
        helpTabs[prevIndex].focus();
        switchTab(helpTabs[prevIndex]);
      } else if (e.key === 'Home') {
        e.preventDefault();
        helpTabs[0].focus();
        switchTab(helpTabs[0]);
      } else if (e.key === 'End') {
        e.preventDefault();
        const lastTab = helpTabs[helpTabs.length - 1];
        lastTab.focus();
        switchTab(lastTab);
      }
    }
  });

  // 初期化：最初のタブをアクティブに
  if (helpTabs.length > 0) {
    switchTab(helpTabs[0]);
  }
}



