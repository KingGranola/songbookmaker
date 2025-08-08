// コード変換のテスト
const CHORD_CONFIG = {
  normalizeRules: [
    // ハーフディミニッシュ：C-7-5, C-7b5, Cmin7b5, Cm7b5, Ch7 → Cm7(b5)
    { pattern: /^([A-G][#b]?)(?:-7-5|-7b5|min7b5|m7b5|h7)$/i, replace: (m, r) => r.toUpperCase() + 'm7(b5)' },
    // マイナー：C-7, Cmin7 → Cm7
    { pattern: /^([A-G][#b]?)(?:-7|min7)$/i, replace: (m, r) => r.toUpperCase() + 'm7' },
    // オーギュメント：C+, C#5 → Caug
    { pattern: /^([A-G][#b]?)(?:\+|#5)$/i, replace: (m, r) => r.toUpperCase() + 'aug' },
    // メジャー：CM7, C^7, Cmaj7 → C△7
    { pattern: /^([A-G][#b]?)(?:M7|maj7|\^7)$/i, replace: (m, r) => r.toUpperCase() + '△7' },
  ],
};

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

// テスト
const testChords = ['Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bm7b5'];
console.log('テスト結果:');
testChords.forEach(chord => {
  const result = normalizeChordName(chord);
  console.log(`${chord} → ${result}`);
});

// 各ルールのテスト
console.log('\n各ルールの詳細テスト:');
testChords.forEach(chord => {
  console.log(`\n${chord}:`);
  CHORD_CONFIG.normalizeRules.forEach((rule, index) => {
    const match = chord.match(rule.pattern);
    if (match) {
      console.log(`  ルール${index + 1}にマッチ: ${match[0]}`);
    }
  });
});
