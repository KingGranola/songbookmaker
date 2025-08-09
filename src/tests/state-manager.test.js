import { StateManager, EventBus } from '../modules/state-manager.js';

const createMockState = () => ({
  key: 'C',
  mode: 'major',
  transposeAll: true,
  lyrics: '',
  fontSizeLyrics: 16,
  fontSizeChord: 14,
  chordColor: '#b00020',
  marginMm: 15,
  lineGap: 8,
  selectedChord: null,
  history: [],
  lyricsHistory: [],
  lyricsFontFamily: 'sans',
  chordFontFamily: 'sans',
  title: '',
  artist: '',
  composer: '',
  presetType: 'triad',
  chordOffsetPx: -18,
  letterSpacing: 0,
  lineOffsetPx: 0,
  batchQueue: [],
});

describe('StateManager', () => {
  let stateManager;
  let mockState;

  beforeEach(() => {
    mockState = createMockState();
    stateManager = new StateManager(mockState);
  });

  test('should initialize with provided state', () => {
    const state = stateManager.getState();
    expect(state.key).toBe('C');
    expect(state.mode).toBe('major');
  });

  test('should notify listeners on state change', () => {
    const listener = jest.fn();
    stateManager.subscribe(listener);

    const state = stateManager.getState();
    state.key = 'D';

    expect(listener).toHaveBeenCalled();
  });

  test('should support unsubscribing', () => {
    const listener = jest.fn();
    const unsubscribe = stateManager.subscribe(listener);

    unsubscribe();

    const state = stateManager.getState();
    state.key = 'F';

    expect(listener).not.toHaveBeenCalled();
  });
});

describe('EventBus', () => {
  let eventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  test('should emit and handle events', () => {
    const listener = jest.fn();
    eventBus.on('test-event', listener);

    eventBus.emit('test-event', 'arg1', 'arg2');

    expect(listener).toHaveBeenCalledWith('arg1', 'arg2');
  });

  test('should support multiple listeners for same event', () => {
    const listener1 = jest.fn();
    const listener2 = jest.fn();

    eventBus.on('test-event', listener1);
    eventBus.on('test-event', listener2);

    eventBus.emit('test-event', 'data');

    expect(listener1).toHaveBeenCalledWith('data');
    expect(listener2).toHaveBeenCalledWith('data');
  });

  test('should support unsubscribing', () => {
    const listener = jest.fn();
    const unsubscribe = eventBus.on('test-event', listener);

    unsubscribe();
    eventBus.emit('test-event', 'data');

    expect(listener).not.toHaveBeenCalled();
  });
});
