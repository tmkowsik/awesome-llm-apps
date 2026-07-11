import {BASE_SCORE, placementScore, winBonus} from '../scoring';

describe('placementScore', () => {
  it('awards base score with no speed chain and no completed units', () => {
    expect(placementScore('easy', null, 0)).toBe(50);
    expect(placementScore('expert', null, 0)).toBe(280);
  });

  it('awards full speed bonus at 0 seconds', () => {
    expect(placementScore('medium', 0, 0)).toBe(200); // base 100 + bonus 100
  });

  it('decays the speed bonus linearly to zero at 10s', () => {
    expect(placementScore('medium', 5, 0)).toBe(150);
    expect(placementScore('medium', 10, 0)).toBe(100);
    expect(placementScore('medium', 60, 0)).toBe(100);
  });

  it('adds half base per completed unit', () => {
    expect(placementScore('hard', null, 1)).toBe(180 + 90);
    expect(placementScore('hard', null, 3)).toBe(180 + 270);
  });
});

describe('winBonus', () => {
  it('pays 10x base for wins under 10 minutes', () => {
    expect(winBonus('easy', 9 * 60 * 1000)).toBe(BASE_SCORE.easy * 10);
  });

  it('pays 5x base for slower wins', () => {
    expect(winBonus('easy', 10 * 60 * 1000)).toBe(BASE_SCORE.easy * 5);
    expect(winBonus('expert', 60 * 60 * 1000)).toBe(BASE_SCORE.expert * 5);
  });
});
