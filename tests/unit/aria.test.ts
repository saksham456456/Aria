import { AriaResponseSchema } from '../../src/types/aria';

describe('ARIA validation', () => {
  it('validates a correct ARIA response', () => {
    const raw = {
      shouldSpeak: true,
      urgency: 5,
      target: 'class',
      language: 'en',
      responseType: 'explanation',
      response: 'This is an explanation.',
      reason: 'Because they asked.',
    };

    expect(() => AriaResponseSchema.parse(raw)).not.toThrow();
  });
});
