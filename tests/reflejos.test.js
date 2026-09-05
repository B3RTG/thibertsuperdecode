import { describe, it, expect } from 'vitest';
import {
  reflejosReducer,
  createInitialState,
  actions,
} from '../src/games/reflejos/reducer.js';

describe('reflejos reducer', () => {
  it('START moves to waiting and clears the previous reaction', () => {
    let s = createInitialState({ reactionMs: 300 });
    s = reflejosReducer(s, actions.start());
    expect(s.phase).toBe('waiting');
    expect(s.reactionMs).toBe(null);
  });

  it('tapping while waiting is a false start', () => {
    let s = reflejosReducer(createInitialState(), actions.start());
    s = reflejosReducer(s, actions.tap(1000));
    expect(s.phase).toBe('tooSoon');
    expect(s.stats.attempts).toBe(0); // false start doesn't count
  });

  it('GO then TAP measures the reaction and records stats', () => {
    let s = reflejosReducer(createInitialState(), actions.start());
    s = reflejosReducer(s, actions.go(1000));
    s = reflejosReducer(s, actions.tap(1234));
    expect(s.phase).toBe('result');
    expect(s.reactionMs).toBe(234);
    expect(s.stats.attempts).toBe(1);
    expect(s.stats.bestMs).toBe(234);
    expect(s.stats.lastMs).toBe(234);
  });

  it('best time keeps the minimum across attempts', () => {
    let s = createInitialState();
    // attempt 1: 300ms
    s = reflejosReducer(s, actions.start());
    s = reflejosReducer(s, actions.go(0));
    s = reflejosReducer(s, actions.tap(300));
    // attempt 2: 210ms (new best)
    s = reflejosReducer(s, actions.start());
    s = reflejosReducer(s, actions.go(0));
    s = reflejosReducer(s, actions.tap(210));
    // attempt 3: 400ms (worse, best unchanged)
    s = reflejosReducer(s, actions.start());
    s = reflejosReducer(s, actions.go(0));
    s = reflejosReducer(s, actions.tap(400));
    expect(s.stats.attempts).toBe(3);
    expect(s.stats.bestMs).toBe(210);
    expect(s.stats.lastMs).toBe(400);
  });

  it('GO is ignored if not waiting (late timer safety)', () => {
    let s = createInitialState();
    s = reflejosReducer(s, actions.go(500));
    expect(s.phase).toBe('idle');
  });

  it('RESET_STATS clears the record', () => {
    let s = createInitialState({ stats: { attempts: 5, bestMs: 200, lastMs: 250 } });
    s = reflejosReducer(s, actions.resetStats());
    expect(s.stats).toEqual({ attempts: 0, bestMs: null, lastMs: null });
  });
});
