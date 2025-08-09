'use client';

import { useAppStore } from '@/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import type { Key, Mode, PresetType, FontFamily } from '@/types';

/**
 * 左パネル: 歌詞エディターと設定
 */
export function EditorPanel() {
  const { state, setTitle, setArtist, setComposer, setLyrics, setKey, setMode, setPresetType, updateState } = useAppStore();

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* 楽曲情報 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">楽曲情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="title" className="text-xs">タイトル</Label>
            <Input
              id="title"
              value={state.title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="曲名を入力"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="artist" className="text-xs">アーティスト</Label>
            <Input
              id="artist"
              value={state.artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="アーティスト名を入力"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="composer" className="text-xs">作曲者</Label>
            <Input
              id="composer"
              value={state.composer}
              onChange={(e) => setComposer(e.target.value)}
              placeholder="作曲者名を入力"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* 音楽設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">音楽設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">キー</Label>
              <Select value={state.key} onValueChange={(value) => setKey(value as Key)}>
                <SelectTrigger className="mt-1">
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
                <SelectTrigger className="mt-1">
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
              <SelectTrigger className="mt-1">
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

      {/* 歌詞エディター */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="text-sm">歌詞</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={state.lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            placeholder="歌詞を入力してください..."
            className="min-h-[300px] resize-none font-jp"
            style={{
              fontSize: `${state.fontSizeLyrics}px`,
              lineHeight: `${state.lineGap * 0.1 + 1.2}`,
              letterSpacing: `${state.letterSpacing}px`,
            }}
          />
        </CardContent>
      </Card>

      {/* 表示設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">表示設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">歌詞サイズ</Label>
              <Input
                type="number"
                min="10"
                max="24"
                value={state.fontSizeLyrics}
                onChange={(e) => updateState({ fontSizeLyrics: Number(e.target.value) })}
                className="mt-1"
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
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">行間</Label>
              <Input
                type="number"
                min="0"
                max="20"
                value={state.lineGap}
                onChange={(e) => updateState({ lineGap: Number(e.target.value) })}
                className="mt-1"
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
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">コード色</Label>
            <Input
              type="color"
              value={state.chordColor}
              onChange={(e) => updateState({ chordColor: e.target.value })}
              className="mt-1 h-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">歌詞フォント</Label>
              <Select 
                value={state.lyricsFontFamily} 
                onValueChange={(value) => updateState({ lyricsFontFamily: value as FontFamily })}
              >
                <SelectTrigger className="mt-1">
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
                <SelectTrigger className="mt-1">
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
    </div>
  );
}
