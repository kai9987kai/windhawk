/**
 * Sanitizes a URL to only allow http:// or https:// protocols.
 * Returns undefined if the URL is invalid or uses a disallowed protocol.
 *
 * @param url - The URL to sanitize
 * @returns The sanitized URL or undefined if invalid
 */
export function sanitizeUrl(url: string | undefined): string | undefined {
  if (!url || typeof url !== 'string') {
    return undefined;
  }

  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    return undefined;
  }

  try {
    const parsed = new URL(trimmedUrl);

    // Only allow http and https protocols
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return trimmedUrl;
    }

    return undefined;
  } catch (e) {
    console.warn(`Invalid URL format (${url}):`, e);
    return undefined;
  }
}

export async function copyTextToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (e) {
      console.warn('Clipboard API write failed, using fallback copy', e);
    }
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.opacity = '0';
  textArea.setAttribute('readonly', '');
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const copySucceeded = document.execCommand('copy');
    if (!copySucceeded) {
      throw new Error('Fallback copy command failed');
    }
  } finally {
    document.body.removeChild(textArea);
  }
}
