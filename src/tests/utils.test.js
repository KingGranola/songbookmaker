import {
  getFontClass,
  CSSClassManager,
  MusicUtils,
  DOMUtils,
  PerformanceUtils,
} from '../modules/utils.js';

describe('Utils Module', () => {
  describe('getFontClass', () => {
    test('should return correct font classes', () => {
      expect(getFontClass('serif')).toBe('ff-serif');
      expect(getFontClass('sans')).toBe('ff-sans');
      expect(getFontClass('rounded')).toBe('ff-rounded');
      expect(getFontClass('mono')).toBe('ff-mono');
      expect(getFontClass('mincho')).toBe('ff-mincho');
      expect(getFontClass('unknown')).toBe('ff-sans'); // default
    });
  });

  describe('CSSClassManager', () => {
    let mockElement;

    beforeEach(() => {
      mockElement = {
        classList: {
          remove: jest.fn(),
          add: jest.fn(),
          toggle: jest.fn(),
        },
      };
    });

    test('should replace classes correctly', () => {
      CSSClassManager.replaceClasses(
        mockElement,
        ['old-class1', 'old-class2'],
        'new-class'
      );

      expect(mockElement.classList.remove).toHaveBeenCalledWith('old-class1');
      expect(mockElement.classList.remove).toHaveBeenCalledWith('old-class2');
      expect(mockElement.classList.add).toHaveBeenCalledWith('new-class');
    });

    test('should apply font class correctly', () => {
      CSSClassManager.applyFontClass(mockElement, 'serif');

      expect(mockElement.classList.remove).toHaveBeenCalledTimes(5); // 5 font classes
      expect(mockElement.classList.add).toHaveBeenCalledWith('ff-serif');
    });

    test('should handle null element gracefully', () => {
      expect(() => {
        CSSClassManager.replaceClasses(null, ['class'], 'new-class');
      }).not.toThrow();
    });
  });

  describe('MusicUtils', () => {
    test('should provide correct semitones', () => {
      const semitones = MusicUtils.SEMITONES;
      expect(semitones).toHaveLength(12);
      expect(semitones[0]).toBe('C');
      expect(semitones[11]).toBe('B');
    });

    test('should normalize root notes correctly', () => {
      expect(MusicUtils.normalizeRoot('c')).toBe('C');
      expect(MusicUtils.normalizeRoot('C#')).toBe('C#');
      expect(MusicUtils.normalizeRoot('db')).toBe('DB'); // flat equivalent (uppercase)
    });

    test('should transpose root notes correctly', () => {
      expect(MusicUtils.transposeRoot('C', 0)).toBe('C');
      expect(MusicUtils.transposeRoot('C', 2)).toBe('D');
      expect(MusicUtils.transposeRoot('C', 7)).toBe('G');
      expect(MusicUtils.transposeRoot('C', 12)).toBe('C'); // octave
    });

    test('should compute intervals correctly', () => {
      expect(MusicUtils.computeInterval('C', 'C')).toBe(0);
      expect(MusicUtils.computeInterval('C', 'D')).toBe(2);
      expect(MusicUtils.computeInterval('C', 'G')).toBe(7);
      expect(MusicUtils.computeInterval('G', 'C')).toBe(5); // descending
    });

    test('should handle invalid keys gracefully', () => {
      expect(MusicUtils.computeInterval('X', 'C')).toBe(0);
      expect(MusicUtils.transposeRoot('X', 5)).toBe('X');
    });
  });

  describe('DOMUtils', () => {
    test('should create element with class and text', () => {
      const element = DOMUtils.createElement('div', 'test-class', 'Test Text');
      
      expect(element.tagName).toBe('DIV');
      expect(element.className).toBe('test-class');
      expect(element.textContent).toBe('Test Text');
    });

    test('should create element with attributes', () => {
      const element = DOMUtils.createElementWithAttributes('input', {
        type: 'text',
        id: 'test-input',
        value: 'test-value',
      });

      expect(element.tagName).toBe('INPUT');
      expect(element.getAttribute('type')).toBe('text');
      expect(element.getAttribute('id')).toBe('test-input');
      expect(element.getAttribute('value')).toBe('test-value');
    });
  });

  describe('PerformanceUtils', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    test('should debounce function calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = PerformanceUtils.debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(mockFn).not.toHaveBeenCalled();

      jest.runAllTimers();
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('should throttle function calls', () => {
      const mockFn = jest.fn();
      const throttledFn = PerformanceUtils.throttle(mockFn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(mockFn).toHaveBeenCalledTimes(1);

      jest.runAllTimers();
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });
});
