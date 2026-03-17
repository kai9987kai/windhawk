import { copyTextToClipboard, sanitizeUrl } from './utils';

describe('sanitizeUrl', () => {
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {
      // Invalid URLs are intentionally exercised in this suite.
    });
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('should allow http URLs', () => {
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
    expect(sanitizeUrl('http://example.com/path')).toBe('http://example.com/path');
  });

  it('should allow https URLs', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    expect(sanitizeUrl('https://example.com/path')).toBe('https://example.com/path');
  });

  it('should reject javascript: URLs', () => {
    // eslint-disable-next-line no-script-url
    expect(sanitizeUrl('javascript:alert(1)')).toBeUndefined();
  });

  it('should reject data: URLs', () => {
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBeUndefined();
  });

  it('should reject file: URLs', () => {
    expect(sanitizeUrl('file:///etc/passwd')).toBeUndefined();
  });

  it('should reject vbscript: URLs', () => {
    expect(sanitizeUrl('vbscript:msgbox(1)')).toBeUndefined();
  });

  it('should handle undefined input', () => {
    expect(sanitizeUrl(undefined)).toBeUndefined();
  });

  it('should handle empty string', () => {
    expect(sanitizeUrl('')).toBeUndefined();
    expect(sanitizeUrl('   ')).toBeUndefined();
  });

  it('should handle invalid URLs', () => {
    expect(sanitizeUrl('not a url')).toBeUndefined();
    expect(sanitizeUrl('htp://example.com')).toBeUndefined();
  });

  it('should preserve query parameters', () => {
    expect(sanitizeUrl('https://example.com?foo=bar')).toBe('https://example.com?foo=bar');
  });

  it('should preserve URL fragments', () => {
    expect(sanitizeUrl('https://example.com#section')).toBe('https://example.com#section');
  });
});

describe('copyTextToClipboard', () => {
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {
      // Clipboard fallback is intentionally exercised in this suite.
    });
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it('uses the Clipboard API when available', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText,
      },
    });

    await copyTextToClipboard('hello');

    expect(writeText).toHaveBeenCalledWith('hello');
  });

  it('falls back to execCommand when the Clipboard API fails', async () => {
    const writeText = jest.fn().mockRejectedValue(new Error('no clipboard'));
    Object.assign(navigator, {
      clipboard: {
        writeText,
      },
    });

    const execCommandSpy = jest.fn().mockReturnValue(true);
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: execCommandSpy,
    });

    await copyTextToClipboard('fallback');

    expect(execCommandSpy).toHaveBeenCalledWith('copy');
  });
});
