import { describe, it, expect } from 'vitest';
import {
  lucesReducer,
  createInitialState,
  actions,
  applyToggle,
  isAllOff,
  scramble,
  scrambleCount,
} from '../src/games/luces/reducer.js';

describe('luces helpers', () => {
  it('applyToggle flips the cell and its orthogonal neighbors', () => {
    const size = 3;
    const grid = new Array(9).fill(false);
    // toggle center (idx 4) → flips 4,1,7,3,5
    const g = applyToggle(grid, 4, size);
    const on = g.map((v, i) => (v ? i : null)).filter((v) => v != null);
    expect(on.sort((a, b) => a - b)).toEqual([1, 3, 4, 5, 7]);
  });

  it('corner toggle only flips in-bounds neighbors', () => {
    const size = 3;
    const g = applyToggle(new Array(9).fill(false), 0, size); // top-left
    const on = g.map((v, i) => (v ? i : null)).filter((v) => v != null);
    expect(on.sort((a, b) => a - b)).toEqual([0, 1, 3]);
  });

  it('scramble is solvable-shaped: correct size and not all-off', () => {
    const g = scramble(5, scrambleCount(1));
    expect(g).toHaveLength(25);
    expect(isAllOff(g)).toBe(false);
  });
});

describe('luces reducer', () => {
  it('winning: turning off the last lights → won, stats updated', () => {
    // 3x3 with only the center cross lit; toggling center clears it.
    const size = 3;
    let grid = new Array(9).fill(false);
    grid = applyToggle(grid, 4, size); // light the cross
    let s = createInitialState({ size, grid, level: 2, stats: { maxLevel: 1, solved: 0 } });
    s = lucesReducer(s, actions.toggle(4)); // clears the cross
    expect(isAllOff(s.grid)).toBe(true);
    expect(s.phase).toBe('won');
    expect(s.moves).toBe(1);
    expect(s.stats.solved).toBe(1);
    expect(s.stats.maxLevel).toBe(2);
  });

  it('a non-winning toggle increments moves and stays playing', () => {
    const size = 3;
    let grid = new Array(9).fill(false);
    grid[0] = true; // a lone light; toggling elsewhere won't clear it
    let s = createInitialState({ size, grid });
    s = lucesReducer(s, actions.toggle(8));
    expect(s.phase).toBe('playing');
    expect(s.moves).toBe(1);
  });

  it('NEXT_LEVEL advances the level and resets moves', () => {
    let s = createInitialState({ level: 1 });
    s = lucesReducer(s, { type: 'NEXT_LEVEL' });
    expect(s.level).toBe(2);
    expect(s.moves).toBe(0);
    expect(s.phase).toBe('playing');
  });

  it('toggles are ignored once won', () => {
    const size = 3;
    let grid = applyToggle(new Array(9).fill(false), 4, size);
    let s = createInitialState({ size, grid });
    s = lucesReducer(s, actions.toggle(4)); // win
    const before = s;
    s = lucesReducer(s, actions.toggle(0));
    expect(s).toBe(before);
  });
});
