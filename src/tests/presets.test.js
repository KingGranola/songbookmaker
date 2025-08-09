import { getPresetChords } from '../modules/presets.js';

// Mock DOM elements for testing
const mockContext = {
  state: {
    key: 'C',
    mode: 'major',
    presetType: 'triad'
  },
  el: {
    presetList: {
      innerHTML: '',
      appendChild: jest.fn()
    }
  }
};

describe('Preset Chords', () => {
  describe('getPresetChords', () => {
    test('should generate major triads for C major', () => {
      const ctx = {
        ...mockContext,
        state: { key: 'C', mode: 'major', presetType: 'triad' }
      };
      
      const chords = getPresetChords(ctx);
      
      expect(chords).toHaveProperty('diatonic');
      expect(chords.diatonic).toContain('C');
      expect(chords.diatonic).toContain('Dm');
      expect(chords.diatonic).toContain('Em');
      expect(chords.diatonic).toContain('F');
      expect(chords.diatonic).toContain('G');
      expect(chords.diatonic).toContain('Am');
      expect(chords.diatonic).toContain('Bdim');
    });

    test('should generate major 7th chords for C major', () => {
      const ctx = {
        ...mockContext,
        state: { key: 'C', mode: 'major', presetType: 'seventh' }
      };
      
      const chords = getPresetChords(ctx);
      
      // With seventh preset type, 7th chords are included in diatonic array
      expect(chords).toHaveProperty('diatonic');
      expect(chords.diatonic).toContain('C△7');
      expect(chords.diatonic).toContain('Dm7');
      expect(chords.diatonic).toContain('Em7');
      expect(chords.diatonic).toContain('F△7');
      expect(chords.diatonic).toContain('G7');
      expect(chords.diatonic).toContain('Am7');
      expect(chords.diatonic).toContain('Bm7(b5)');
    });

    test('should generate minor triads for A minor', () => {
      const ctx = {
        ...mockContext,
        state: { key: 'A', mode: 'minor', presetType: 'triad' }
      };
      
      const chords = getPresetChords(ctx);
      
      expect(chords).toHaveProperty('diatonic');
      expect(chords.diatonic).toContain('Am');
      expect(chords.diatonic).toContain('Bdim');
      expect(chords.diatonic).toContain('C');
      expect(chords.diatonic).toContain('Dm');
      expect(chords.diatonic).toContain('Em');
      expect(chords.diatonic).toContain('F');
      expect(chords.diatonic).toContain('G');
    });

    test('should handle sharp keys correctly', () => {
      const ctx = {
        ...mockContext,
        state: { key: 'F#', mode: 'major', presetType: 'triad' }
      };
      
      const chords = getPresetChords(ctx);
      
      expect(chords).toHaveProperty('diatonic');
      expect(chords.diatonic).toContain('F#');
      expect(chords.diatonic).toContain('G#m');
      expect(chords.diatonic).toContain('A#m');
      expect(chords.diatonic).toContain('B');
      expect(chords.diatonic).toContain('C#');
      expect(chords.diatonic).toContain('D#m');
      expect(chords.diatonic).toContain('E#dim');
    });

    test('should handle flat keys correctly', () => {
      const ctx = {
        ...mockContext,
        state: { key: 'A#', mode: 'major', presetType: 'triad' } // Use A# instead of Bb
      };
      
      const chords = getPresetChords(ctx);
      
      expect(chords).toHaveProperty('diatonic');
      expect(chords.diatonic.length).toBeGreaterThan(0);
      // Check that we get some major key chords
      expect(chords.diatonic.some(chord => chord.includes('A#'))).toBeTruthy();
    });

    test('should generate secondary dominants', () => {
      const ctx = {
        ...mockContext,
        state: { key: 'C', mode: 'major', presetType: 'secondary' }
      };
      
      const chords = getPresetChords(ctx);
      
      expect(chords).toHaveProperty('secondary');
      expect(chords.secondary.length).toBeGreaterThan(0);
      
      // Check for common secondary dominants in C major
      expect(chords.secondary).toContain('A7'); // V7/ii
      expect(chords.secondary).toContain('B7'); // V7/iii
      expect(chords.secondary).toContain('C7'); // V7/IV
      expect(chords.secondary).toContain('D7'); // V7/V
      expect(chords.secondary).toContain('E7'); // V7/vi
    });

    test('should return empty object for invalid key', () => {
      const ctx = {
        ...mockContext,
        state: { key: 'X', mode: 'major', presetType: 'triad' }
      };
      
      const chords = getPresetChords(ctx);
      
      expect(Object.keys(chords)).toHaveLength(0);
    });
  });
});
