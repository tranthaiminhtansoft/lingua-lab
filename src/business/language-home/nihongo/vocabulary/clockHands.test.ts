import { expect, test } from 'vitest';
import { minuteWrapHourDelta } from './clockHands';

test('minute hand increments the hour when rotating clockwise across twelve', () => {
  expect(minuteWrapHourDelta(59, 0, 6)).toBe(1);
  expect(minuteWrapHourDelta(58, 2, 24)).toBe(1);
});

test('minute hand decrements the hour when rotating counterclockwise across twelve', () => {
  expect(minuteWrapHourDelta(0, 59, -6)).toBe(-1);
  expect(minuteWrapHourDelta(2, 58, -24)).toBe(-1);
});

test('ordinary minute changes do not move the hour, regardless of distance', () => {
  expect(minuteWrapHourDelta(15, 50, 210)).toBe(0);
  expect(minuteWrapHourDelta(45, 10, -210)).toBe(0);
});
