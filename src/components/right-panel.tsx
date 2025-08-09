'use client';

// import { motion } from 'framer-motion'; // 将来のアニメーション用
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import type { Key, Mode, PresetType, FontFamily } from '@/types';

/**
 * 右カラム: モード表示 + 設定
 */
export function RightPanel() {
  const { 
    state, 
    setTitle, 
    setArtist, 
    setComposer,
    setKey, 
    setMode, 
    setPresetType, 
    updateState 
  } = useAppStore();

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* 現在の状態表示 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">現在の状態</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {state.selectedChord && (
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">選択中のコード</div>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {state.selectedChord}
              </Badge>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <div>配置済み: {state.chordPlacements.length}個</div>
            <div>履歴: {state.history.length}個</div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* 楽曲情報 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">楽曲情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="title" className="text-xs">タイトル</Label>
            <Input
              id="title"
              value={state.title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="曲名を入力"
              className="mt-1 text-sm"
            />
          </div>
          <div>
            <Label htmlFor="artist" className="text-xs">アーティスト</Label>
            <Input
              id="artist"
              value={state.artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="アーティスト名"
              className="mt-1 text-sm"
            />
          </div>
          <div>
            <Label htmlFor="composer" className="text-xs">作曲者</Label>
            <Input
              id="composer"
              value={state.composer}
              onChange={(e) => setComposer(e.target.value)}
              placeholder="作曲者名"
              className="mt-1 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* 音楽設定 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">音楽設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">キー</Label>
              <Select value={state.key} onValueChange={(value) => setKey(value as Key)}>
                <SelectTrigger className="mt-1 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'].map((key) => (
                    <SelectItem key={key} value={key}>{key}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">モード</Label>
              <Select value={state.mode} onValueChange={(value) => setMode(value as Mode)}>
                <SelectTrigger className="mt-1 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="major">メジャー</SelectItem>
                  <SelectItem value="minor">マイナー</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label className="text-xs">プリセットタイプ</Label>
            <Select value={state.presetType} onValueChange={(value) => setPresetType(value as PresetType)}>
              <SelectTrigger className="mt-1 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="triad">トライアド</SelectItem>
                <SelectItem value="seventh">セブンス</SelectItem>
                <SelectItem value="all">すべて</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 表示設定 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">表示設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">歌詞サイズ</Label>
              <Input
                type="number"
                min="10"
                max="24"
                value={state.fontSizeLyrics}
                onChange={(e) => updateState({ fontSizeLyrics: Number(e.target.value) })}
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">コードサイズ</Label>
              <Input
                type="number"
                min="8"
                max="20"
                value={state.fontSizeChord}
                onChange={(e) => updateState({ fontSizeChord: Number(e.target.value) })}
                className="mt-1 text-sm"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">行間</Label>
              <Input
                type="number"
                min="0"
                max="20"
                value={state.lineGap}
                onChange={(e) => updateState({ lineGap: Number(e.target.value) })}
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">字間</Label>
              <Input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={state.letterSpacing}
                onChange={(e) => updateState({ letterSpacing: Number(e.target.value) })}
                className="mt-1 text-sm"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">コード色</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="color"
                value={state.chordColor}
                onChange={(e) => updateState({ chordColor: e.target.value })}
                className="w-12 h-8 p-0 border rounded"
              />
              <Input
                type="text"
                value={state.chordColor}
                onChange={(e) => updateState({ chordColor: e.target.value })}
                className="flex-1 text-sm"
                placeholder="#b00020"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">歌詞フォント</Label>
              <Select 
                value={state.lyricsFontFamily} 
                onValueChange={(value) => updateState({ lyricsFontFamily: value as FontFamily })}
              >
                <SelectTrigger className="mt-1 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sans">ゴシック</SelectItem>
                  <SelectItem value="serif">明朝</SelectItem>
                  <SelectItem value="rounded">丸ゴシック</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">コードフォント</Label>
              <Select 
                value={state.chordFontFamily} 
                onValueChange={(value) => updateState({ chordFontFamily: value as FontFamily })}
              >
                <SelectTrigger className="mt-1 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sans">ゴシック</SelectItem>
                  <SelectItem value="serif">明朝</SelectItem>
                  <SelectItem value="mono">等幅</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* レイアウト設定 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">レイアウト</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">余白(mm)</Label>
              <Input
                type="number"
                min="5"
                max="30"
                value={state.marginMm}
                onChange={(e) => updateState({ marginMm: Number(e.target.value) })}
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">行オフセット</Label>
              <Input
                type="number"
                min="-10"
                max="10"
                value={state.lineOffsetPx}
                onChange={(e) => updateState({ lineOffsetPx: Number(e.target.value) })}
                className="mt-1 text-sm"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-xs">コードオフセット</Label>
            <Input
              type="number"
              min="-30"
              max="10"
              value={state.chordOffsetPx}
              onChange={(e) => updateState({ chordOffsetPx: Number(e.target.value) })}
              className="mt-1 text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
