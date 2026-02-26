/**
 * SSRF protection — validates URLs before server-side fetch.
 * Blocks private IP ranges, localhost, and non-allowlisted domains.
 */

const PRIVATE_IP_RANGES = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^0\./,
  /^169\.254\./,           // link-local
  /^::1$/,                 // IPv6 loopback
  /^fc00:/i,               // IPv6 ULA
  /^fe80:/i,               // IPv6 link-local
];

const DOMAIN_ALLOWLIST = new Set([
  'api.coingecko.com',
  'pro-api.coingecko.com',
  'api.opensea.io',
  'openrouter.ai',
  'oauth2.googleapis.com',
  'accounts.google.com',
  'www.googleapis.com',
  'i.seadn.io',
  'openseauserdata.com',
  'coin-images.coingecko.com',
  'assets.coingecko.com',
]);

/**
 * Returns true if the URL is safe to fetch from server-side.
 * Blocks private IPs and non-allowlisted domains.
 */
export function isSafeURL(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);

    // Only allow http(s)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;

    // Block localhost variants
    const hostname = url.hostname.toLowerCase();
    if (hostname === 'localhost' || hostname === '[::1]') return false;

    // Block private IPs
    if (PRIVATE_IP_RANGES.some((re) => re.test(hostname))) return false;

    // Domain allowlist
    if (!DOMAIN_ALLOWLIST.has(hostname)) return false;

    return true;
  } catch {
    return false;
  }
}

/**
 * Wraps fetch with SSRF protection + timeout.
 * Throws if URL is unsafe or request exceeds timeout.
 */
export async function safeFetchExternal(
  url: string,
  init?: RequestInit,
  timeoutMs = 5000,
): Promise<Response> {
  if (!isSafeURL(url)) {
    throw new Error(`SSRF blocked: ${url} is not in the domain allowlist`);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
