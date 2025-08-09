import { setupState } from '../modules/state.js';

describe('Chord Processing', () => {
  let ctx;

  beforeEach(() => {
    ctx = setupState();
  });

  describe('normalizeChordName', () => {
    test('should normalize half-diminished chords', () => {
      expect(ctx.normalizeChordName('Cm7b5')).toBe('Cm7(b5)');
      expect(ctx.normalizeChordName('C-7-5')).toBe('Cm7(b5)');
    });

    test('should normalize minor seventh chords', () => {
      expect(ctx.normalizeChordName('Cmin7')).toBe('Cm7');
      expect(ctx.normalizeChordName('C-7')).toBe('Cm7');
    });

    test('should normalize major seventh chords', () => {
      expect(ctx.normalizeChordName('CM7')).toBe('C△7');
      expect(ctx.normalizeChordName('Cmaj7')).toBe('C△7');
    });
  });

  describe('transposeChord', () => {
    test('should transpose simple chords correctly', () => {
      expect(ctx.transposeChord('C', 2)).toBe('D');
      expect(ctx.transposeChord('C', 7)).toBe('G');
      expect(ctx.transposeChord('C', 12)).toBe('C');
    });

    test('should handle edge cases', () => {
      expect(ctx.transposeChord('', 5)).toBe('');
      expect(ctx.transposeChord('C', 0)).toBe('C');
    });
  });

  describe('computeInterval', () => {
    test('should compute correct intervals', () => {
      expect(ctx.computeInterval('C', 'D')).toBe(2);
      expect(ctx.computeInterval('C', 'G')).toBe(7);
      expect(ctx.computeInterval('C', 'C')).toBe(0);
    });
  });
});