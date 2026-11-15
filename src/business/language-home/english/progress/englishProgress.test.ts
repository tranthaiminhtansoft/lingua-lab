import {
  createEmptyProgress,
  getTopicProgress,
  resetTopicProgress,
  updateVocabularyScore,
} from './englishProgress';

test('resetTopicProgress clears only the requested topic', () => {
  let state = createEmptyProgress();
  state = updateVocabularyScore(state, 'autumn', 'energy level', 95, ['energy level'], []);
  state = updateVocabularyScore(state, 'work', 'on track', 95, ['on track'], []);

  const reset = resetTopicProgress(state, 'autumn');

  expect(reset.topics.autumn).toBeUndefined();
  expect(reset.topics.work.vocabulary['on track'].score).toBe(95);
  expect(getTopicProgress(reset, 'autumn', ['energy level'], []).progress).toBe(0);
});
