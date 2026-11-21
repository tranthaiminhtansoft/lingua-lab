import {
  createEmptyProgress,
  getTopicProgress,
  resetTopicProgress,
  updateVocabularyScore,
  VOCAB_THRESHOLD,
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

test('pronunciation passes only when the score is above 85 percent', () => {
  let state = createEmptyProgress();
  state = updateVocabularyScore(state, 'greetings', 'Good morning', 85, ['Good morning']);
  expect(state.topics.greetings.vocabulary['Good morning'].completed).toBe(false);

  state = updateVocabularyScore(state, 'greetings', 'Good morning', 86, ['Good morning']);
  expect(state.topics.greetings.vocabulary['Good morning'].completed).toBe(true);
  expect(VOCAB_THRESHOLD).toBe(85);
});
