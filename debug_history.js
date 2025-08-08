// 履歴のデバッグ用スクリプト
console.log('=== 履歴デバッグ ===');

// 現在の履歴を確認
const history = JSON.parse(localStorage.getItem('sbm:v1') || '{}');
console.log('保存された履歴:', history.history || []);

// 現在のページのコード要素を確認
const chordElements = document.querySelectorAll('.chords-row .chord');
console.log('ページ上のコード要素数:', chordElements.length);

const pageChords = [];
chordElements.forEach((chordEl, index) => {
  const chordName = chordEl.textContent.trim();
  pageChords.push(chordName);
  console.log(`コード${index + 1}: "${chordName}"`);
});

console.log('ページ上の全コード:', pageChords);
