import { buildInstallDecisionChecklist, getInstallDecisionRecommendations } from './installDecisionUtils';

describe('installDecisionUtils', () => {
  it('recommends disabled-first installs for broad or low-review mods', () => {
    const recommendations = getInstallDecisionRecommendations(
      {
        include: ['*'],
      },
      {
        users: 120,
        rating: 6,
        ratingBreakdown: [0, 0, 1, 2, 3],
        defaultSorting: 10,
        published: Date.now(),
        updated: Date.now() - 240 * 24 * 60 * 60 * 1000,
      },
      {
        readme: null,
        source: null,
      }
    );

    expect(
      recommendations.find((item) => item.key === 'install-disabled')?.recommended
    ).toBe(true);
  });

  it('builds an install checklist that reacts to scope and freshness', () => {
    const checklist = buildInstallDecisionChecklist(
      {
        include: ['explorer.exe', 'StartMenuExperienceHost.exe'],
      },
      {
        users: 4000,
        rating: 9,
        ratingBreakdown: [0, 0, 1, 8, 24],
        defaultSorting: 90,
        published: Date.now(),
        updated: Date.now() - 220 * 24 * 60 * 60 * 1000,
      },
      {
        source: 'int main() {}',
      }
    );

    expect(checklist.some((item) => item.includes('targeted process'))).toBe(true);
    expect(checklist.some((item) => item.includes('not been updated recently'))).toBe(true);
  });
});
