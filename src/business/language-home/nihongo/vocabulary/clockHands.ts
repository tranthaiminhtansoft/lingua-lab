export function minuteWrapHourDelta(currentMinute: number, nextMinute: number, angleDelta: number) {
  if (currentMinute - nextMinute > 30 && angleDelta > 0) return 1;
  if (nextMinute - currentMinute > 30 && angleDelta < 0) return -1;
  return 0;
}
