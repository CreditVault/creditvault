import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

type StarsResult = { stars: number; forks: number };

// Module-level cache to avoid hammering the unauthenticated GitHub API
// (limit: 60 req/hr per IP). Serves stale data on rate-limit / errors.
const cache = new Map<string, { value: StarsResult; expiresAt: number }>();
const TTL_MS = 60_000; // 1 minute

export const getRepoStars = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    z.object({ owner: z.string().min(1), repo: z.string().min(1) }).parse(data)
  )
  .handler(async ({ data }): Promise<StarsResult> => {
    const key = `${data.owner}/${data.repo}`;
    const now = Date.now();
    const cached = cache.get(key);
    if (cached && cached.expiresAt > now) {
      return cached.value;
    }

    try {
      const res = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(data.owner)}/${encodeURIComponent(data.repo)}`,
        {
          headers: {
            Accept: "application/vnd.github+json",
            "User-Agent": "CreditVault-App",
          },
        }
      );

      if (!res.ok) {
        // On rate-limit / other errors, serve stale value if we have one,
        // otherwise return zeros so the UI does not crash.
        if (cached) {
          cache.set(key, { value: cached.value, expiresAt: now + TTL_MS });
          return cached.value;
        }
        const fallback: StarsResult = { stars: 0, forks: 0 };
        cache.set(key, { value: fallback, expiresAt: now + TTL_MS });
        return fallback;
      }

      const json = await res.json();
      const value: StarsResult = {
        stars: typeof json.stargazers_count === "number" ? json.stargazers_count : 0,
        forks: typeof json.forks_count === "number" ? json.forks_count : 0,
      };
      cache.set(key, { value, expiresAt: now + TTL_MS });
      return value;
    } catch {
      if (cached) return cached.value;
      return { stars: 0, forks: 0 };
    }
  });
