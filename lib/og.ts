export const DEFAULT_OG_IMAGE = 'https://purefacts.com/og-homepage.png'

/**
 * Returns the OG image URL for a page.
 * Pass a page-specific URL to override, or call with no arguments
 * to fall back to the default homepage OG image.
 *
 * Usage:
 *   ogImage()                              // → default
 *   ogImage('https://purefacts.com/og-fees.png')  // → page-specific
 */
export function ogImage(override?: string): string {
  return override ?? DEFAULT_OG_IMAGE
}