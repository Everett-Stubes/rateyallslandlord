import { describe, it, expect } from 'vitest';
import { toLetterGrade } from '../../utils/grading';

describe('toLetterGrade', () => {
  it('maps whole ratings 1-5 to F, D, C, B, A', () => {
    expect([1, 2, 3, 4, 5].map(toLetterGrade)).toEqual(['F', 'D', 'C', 'B', 'A']);
  });

  it('gives averages in between a plus or minus', () => {
    expect(toLetterGrade(4.5)).toBe('A-');
    expect(toLetterGrade(4.3)).toBe('B+');
    expect(toLetterGrade(3.6)).toBe('B-');
    expect(toLetterGrade(2.5)).toBe('C-');
    expect(toLetterGrade(1.5)).toBe('D-');
    expect(toLetterGrade(1.2)).toBe('F');
  });

  it('never goes above A or below F', () => {
    expect(toLetterGrade(5)).toBe('A');
    expect(toLetterGrade(1)).toBe('F');
  });
});
