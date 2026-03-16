import {
  defaultLocalUISettings,
  mergeLocalUISettings,
  readLocalUISettings,
  writeLocalUISettings,
} from './appUISettings';

describe('appUISettings local preferences', () => {
  it('merges valid updates without dropping existing values', () => {
    expect(
      mergeLocalUISettings(defaultLocalUISettings, {
        interfaceDensity: 'compact',
        useWideLayout: true,
      })
    ).toEqual({
      interfaceDensity: 'compact',
      reduceMotion: false,
      useWideLayout: true,
    });
  });

  it('falls back to defaults when persisted data is malformed', () => {
    const storage = {
      getItem: jest.fn(() => '{'),
      setItem: jest.fn(),
    } as unknown as Storage;

    expect(readLocalUISettings(storage)).toEqual(defaultLocalUISettings);
  });

  it('round-trips valid settings through storage', () => {
    let storedValue: string | null = null;
    const storage = {
      getItem: jest.fn(() => storedValue),
      setItem: jest.fn((key: string, value: string) => {
        storedValue = value;
      }),
    } as unknown as Storage;

    writeLocalUISettings(
      {
        interfaceDensity: 'compact',
        reduceMotion: true,
        useWideLayout: true,
      },
      storage
    );

    expect(readLocalUISettings(storage)).toEqual({
      interfaceDensity: 'compact',
      reduceMotion: true,
      useWideLayout: true,
    });
  });
});
