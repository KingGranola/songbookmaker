// ui.js: イベントバインド、ボタン/入力のハンドリング、ハイライトなど
import { renderPage, applyChordStyles } from './placement.js';
import { updatePresetList } from './presets.js';

export function setupUI(ctx) {
  const { state, el, persist, computeInterval, transposeChord, normalizeChordName } = ctx;

  function highlightSelectedChip() {
    const presetChips = el.presetList?.querySelectorAll('.chip') || [];
    const historyChips = el.historyList?.querySelectorAll('.chip') || [];
    const sepBtn = el.btnSep;
    const isSepSelected = state.selectedChord === '|' || state.selectedChord === '｜';
    
    [...presetChips, ...historyChips].forEach((chip) => {
      chip.classList.toggle('active', chip.textContent === state.selectedChord);
    });
    if (sepBtn) sepBtn.classList.toggle('active', isSepSelected);
  }

  function setCurrentChord(chordOrNull) {
    state.selectedChord = chordOrNull;
    if (el.currentChord) el.currentChord.textContent = chordOrNull || 'なし';
    highlightSelectedChip();
    updateCursor();
  }

  function applySelectedChord(chord) {
    const norm = normalizeChordName(chord);
    setCurrentChord(norm);
    // history更新
    state.history = [norm].concat(state.history.filter((c)=>c!==norm)).slice(0,16);
    renderHistory();
  }



  function renderHistory() {
    if (!el.historyList) return;
    el.historyList.innerHTML = '';
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
    el.pageContent.querySelectorAll('.lyrics-text').forEach((n)=> n.style.fontSize = `${state.fontSizeLyrics}px`);
  });
  el.lyricsLeading?.addEventListener('input', ()=>{
    state.lineGap = Number(el.lyricsLeading.value);
    el.pageContent.querySelectorAll('.lyrics-text').forEach((n)=> n.style.marginBottom = `${state.lineGap}px`);
    persist();
  });
  el.lyricsFF?.addEventListener('change', ()=>{
    state.lyricsFontFamily = el.lyricsFF.value;
    el.pageContent.querySelectorAll('.lyrics-text').forEach((n)=>{
      n.classList.toggle('ff-serif', state.lyricsFontFamily==='serif');
      n.classList.toggle('ff-sans', state.lyricsFontFamily==='sans');
    });
    persist();
  });
  el.chordFF?.addEventListener('change', ()=>{ state.chordFontFamily = el.chordFF.value; applyChordStyles(ctx); persist(); });
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

  el.btnPrint?.addEventListener('click', ()=> window.print());
  el.btnSave?.addEventListener('click', ()=> exportProject(ctx));
  el.btnLoad?.addEventListener('click', ()=> el.fileInput.click());
  el.fileInput?.addEventListener('change', (e)=> onImportFile(ctx, e));
  el.btnClear?.addEventListener('click', ()=>{ if (!el.lyricsInput) return; el.lyricsInput.value=''; state.lyrics=''; renderPage(ctx); persist(); });

  el.btnSetCustom?.addEventListener('click', ()=>{ const v=(el.customChord.value||'').trim(); if(!v) return; applySelectedChord(v); el.customChord.value=''; });
  el.btnSep?.addEventListener('click', ()=>{ setCurrentChord('|'); state.history=[ '|', ...state.history.filter(c=>c!=='|')].slice(0,16); renderHistory();});
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
  el.btnEraser?.addEventListener('click', ()=> setCurrentChord('__ERASE__'));

  // export/import helpers（app.jsから移植）
  function exportProject(ctx) {
    const { state, el } = ctx;
    const blob = new Blob([ JSON.stringify({ version:1, project: {
      key: state.key, mode: state.mode, presetType: state.presetType,
      lyrics: state.lyrics, lineGap: state.lineGap,
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
        lyrics:p.lyrics||'', lineGap:p.lineGap??state.lineGap, fontSizeLyrics:p.fontSizeLyrics??state.fontSizeLyrics,
        fontSizeChord:p.fontSizeChord??state.fontSizeChord, chordColor:p.chordColor||state.chordColor,
        lyricsFontFamily:p.lyricsFontFamily||state.lyricsFontFamily, chordFontFamily:p.chordFontFamily||state.chordFontFamily,
        marginMm:p.marginMm??state.marginMm, history:Array.isArray(p.history)?p.history:[],
        title:p.title||'', artist:p.artist||'', composer:p.composer||'',
      });
      // UI反映
      el.keySelect.value=state.key; el.modeSelect.value=state.mode; el.presetType.value=state.presetType;
      el.lyricsInput.value=state.lyrics; el.lyricsFont.value=String(state.fontSizeLyrics); el.chordFont.value=String(state.fontSizeChord);
      el.chordColor.value=state.chordColor; el.lyricsFF.value=state.lyricsFontFamily; el.chordFF.value=state.chordFontFamily;
      el.lyricsLeading.value=String(state.lineGap); if(el.titleInput) el.titleInput.value=state.title; if(el.artistInput) el.artistInput.value=state.artist; if(el.composerInput) el.composerInput.value=state.composer;
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
}


