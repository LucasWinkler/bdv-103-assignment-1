import { describe, expect, it } from 'vitest';

function add(...numbers: number[]): number {
  return numbers.reduce((sum, num) => sum + num, 0);
}

describe('temp tests', () => {
  it('should add numbers correctly', () => {
    expect(add()).toBe(0);
    expect(add(1)).toBe(1);
    expect(add(1, 2, 3)).toBe(6);
  });
});
