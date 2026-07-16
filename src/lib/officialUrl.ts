// Known aggregator / source hosts. Links on these hosts are NOT the
// official brand site — resolve them to the brand's official site instead.
const AGGREGATOR_HOSTS = new Set<string>([
  "studentoffers.co",
  "www.studentoffers.co",
  "studentbeans.com",
  "www.studentbeans.com",
  "unidays.com",
  "www.myunidays.com",
  "myunidays.com",
]);

function safeHost(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Given a brand and the raw claim URL from our index, return a URL that
 * points to the brand's OFFICIAL site rather than an aggregator/source.
 *
 * - If the claim URL is already on the brand's own site, return it as-is.
 * - If it points to a known aggregator, redirect through DuckDuckGo's
 *   "I'm feeling ducky" bang (`!ducky`), which resolves to the top result
 *   for "<brand> official site" — i.e. the brand's real homepage.
 */
export function officialUrl(brand: string | null | undefined, claimUrl?: string | null): string {
  const host = safeHost(claimUrl);
  const isAggregator = host ? AGGREGATOR_HOSTS.has(host) : true;

  if (!isAggregator && claimUrl) return claimUrl;

  const q = encodeURIComponent(`${(brand ?? "").trim()} official site`);
  return `https://duckduckgo.com/?q=%21ducky+${q}`;
}
