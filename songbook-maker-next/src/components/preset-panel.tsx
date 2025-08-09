'use client';

import { useAppStore } from '@/stores/app-store';
import { getPresetChords, getChordCategories } from '@/lib/presets';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

/**
 * 右パネル: プリセットコード
 */
export function PresetPanel() {
  const { state, setSelectedChord, addChordToHistory } = useAppStore();
  
  const presetChords = getPresetChords(state.key, state.mode, state.presetType);
  const categories = getChordCategories(state.mode);

  const handleChordClick = (chord: string) => {
    setSelectedChord(chord);
    addChordToHistory(chord);
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* 現在選択中のコード */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">選択中のコード</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            {state.selectedChord ? (
              <Badge variant="default" className="text-lg px-4 py-2">
                {state.selectedChord}
              </Badge>
            ) : (
              <span className="text-muted-foreground text-sm">なし</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 履歴 */}
      {state.history.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">履歴</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {state.history.slice(-8).map((chord, index) => (
                <Button
                  key={`${chord}-${index}`}
                  variant="outline"
                  size="sm"
                  onClick={() => handleChordClick(chord)}
                  className="text-xs"
                >
                  {chord}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* プリセットコード */}
      {categories.map((category) => {
        const chords = presetChords[category.key];
        if (!chords || chords.length === 0) return null;

        return (
          <Card key={category.key}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{category.shortTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {chords.map((chord) => (
                  <Button
                    key={chord}
                    variant={state.selectedChord === chord ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleChordClick(chord)}
                    className="text-xs h-8"
                  >
                    {chord}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* キー・モード情報 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">設定</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-1">
            <div>キー: <span className="font-medium">{state.key} {state.mode === 'major' ? 'メジャー' : 'マイナー'}</span></div>
            <div>タイプ: <span className="font-medium">
              {state.presetType === 'triad' ? 'トライアド' : 
               state.presetType === 'seventh' ? 'セブンス' : 'すべて'}
            </span></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
