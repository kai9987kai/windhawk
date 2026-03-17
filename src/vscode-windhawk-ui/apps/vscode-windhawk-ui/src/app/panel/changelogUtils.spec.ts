import {
  filterChangelogSections,
  parseChangelogSections,
  selectChangelogSections,
} from './changelogUtils';

describe('changelogUtils', () => {
  it('splits markdown changelogs into heading-based sections', () => {
    const sections = parseChangelogSections(`
# 1.7.3

- Added a better install flow

## UI

- Refreshed the changelog modal

# 1.7.2

- Fixed a crash
`);

    expect(sections).toHaveLength(3);
    expect(sections[0]).toMatchObject({
      heading: '1.7.3',
      bulletCount: 1,
    });
    expect(sections[1].heading).toBe('UI');
    expect(sections[2].heading).toBe('1.7.2');
  });

  it('returns a single section when the changelog has no headings', () => {
    const sections = parseChangelogSections(`
- Added better summaries
- Improved install review links
`);

    expect(sections).toEqual([
      expect.objectContaining({
        heading: '',
        bulletCount: 2,
      }),
    ]);
  });

  it('filters sections by heading or body content', () => {
    const sections = parseChangelogSections(`
# 1.7.3

- Added a search box

# 1.7.2

- Fixed a crash in the compiler
`);

    expect(filterChangelogSections(sections, 'search')).toHaveLength(1);
    expect(filterChangelogSections(sections, '1.7.2')[0].heading).toBe('1.7.2');
  });

  it('can scope the changelog to the latest release or a selected section', () => {
    const sections = parseChangelogSections(`
# 1.7.3

- Added a search box

# 1.7.2

- Fixed a crash in the compiler
`);

    expect(selectChangelogSections(sections, { latestOnly: true })).toEqual([
      expect.objectContaining({ heading: '1.7.3' }),
    ]);
    expect(selectChangelogSections(sections, { sectionIndex: 1 })).toEqual([
      expect.objectContaining({ heading: '1.7.2' }),
    ]);
  });
});
