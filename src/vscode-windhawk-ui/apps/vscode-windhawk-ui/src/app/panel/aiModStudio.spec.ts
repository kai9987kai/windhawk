import { aiPromptPacks, modStudioStarters } from './aiModStudio';

describe('aiModStudio', () => {
  it('includes an AI-ready starter option', () => {
    expect(modStudioStarters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'ai-ready',
        }),
      ])
    );
  });

  it('ships prompt packs for ideation, scaffolding, review, and docs', () => {
    expect(aiPromptPacks.map((promptPack) => promptPack.key)).toEqual(
      expect.arrayContaining(['ideate', 'scaffold', 'review', 'docs'])
    );
  });
});
