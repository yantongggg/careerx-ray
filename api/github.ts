/* ────────────────────────────────────────────────────────────────
   GitHub signal — the one source that verifies itself.

   Everything else on the evidence timeline is the user's word for it.
   This is not: the repositories, the languages and the commit dates are
   public record, and anyone reading the profile can open the same URL
   and check. That is what makes it Corroborated rather than
   self-declared.

   Public REST API only. No token is required for public data, no user
   authorisation is involved, and nothing is scraped — this is the
   documented interface. GITHUB_TOKEN is read when present purely to
   raise the rate limit from 60 requests an hour to 5,000.

   What this measures is visible public activity. It is not a measure of
   ability, and the UI says so.
   ──────────────────────────────────────────────────────────────── */

const API = "https://api.github.com";

interface RepoSummary {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  /** ISO date of the last push. */
  pushedAt: string;
  url: string;
  fork: boolean;
}

function headers() {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "CareerX-Ray",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

/** Pull a handle out of whatever the user pasted. */
function parseHandle(input: string): string | null {
  const trimmed = input.trim().replace(/\/+$/, "");
  const fromUrl = /github\.com\/([A-Za-z0-9-]+)/i.exec(trimmed);
  const handle = fromUrl ? fromUrl[1] : trimmed.replace(/^@/, "");
  return /^[A-Za-z0-9-]{1,39}$/.test(handle) ? handle : null;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const handle = parseHandle(String(body?.handle ?? ""));
  if (!handle) {
    res.status(400).json({ error: "That does not look like a GitHub username or profile URL." });
    return;
  }

  try {
    const [userRes, repoRes] = await Promise.all([
      fetch(`${API}/users/${handle}`, { headers: headers() }),
      fetch(`${API}/users/${handle}/repos?per_page=100&sort=pushed`, { headers: headers() }),
    ]);

    if (userRes.status === 404) {
      res.status(404).json({ error: `No public GitHub account for "${handle}".` });
      return;
    }
    if (userRes.status === 403) {
      /* Rate limited. Say which limit rather than implying the account
         is the problem. */
      res.status(429).json({ error: "GitHub's rate limit was reached. Try again in a few minutes." });
      return;
    }
    if (!userRes.ok || !repoRes.ok) {
      res.status(502).json({ error: "GitHub did not respond as expected." });
      return;
    }

    const user = await userRes.json();
    const rawRepos = await repoRes.json();

    const repos: RepoSummary[] = (Array.isArray(rawRepos) ? rawRepos : [])
      .map((r: any) => ({
        name: r.name,
        description: r.description ?? null,
        language: r.language ?? null,
        stars: r.stargazers_count ?? 0,
        pushedAt: r.pushed_at,
        url: r.html_url,
        fork: !!r.fork,
      }));

    /* Original work first — a fork someone never pushed to says nothing
       about them, and counting it would inflate the picture. */
    const owned = repos.filter(r => !r.fork);

    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
    const activeRepos = owned.filter(r => new Date(r.pushedAt).getTime() > ninetyDaysAgo);

    const languageCount = new Map<string, number>();
    owned.forEach(r => {
      if (r.language) languageCount.set(r.language, (languageCount.get(r.language) ?? 0) + 1);
    });
    const languages = [...languageCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    res.status(200).json({
      handle: user.login,
      name: user.name ?? null,
      url: user.html_url,
      avatarUrl: user.avatar_url ?? null,
      bio: user.bio ?? null,
      publicRepos: user.public_repos ?? owned.length,
      followers: user.followers ?? 0,
      createdAt: user.created_at,
      languages,
      /* Most recently pushed first, which is what the sort already gave
         us — the ones worth showing an employer. */
      topRepos: owned.slice(0, 6),
      activeCount: activeRepos.length,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(502).json({ error: err?.message ?? "Could not reach GitHub." });
  }
}
