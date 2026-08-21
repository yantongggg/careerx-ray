/* ────────────────────────────────────────────────────────────────
   GitHub signal — the client half.

   This is the only evidence in the product that verifies itself. A
   certificate on a résumé is a claim; a repository with commits in it
   is a public record anyone can open. That is the difference between
   Self-declared and Corroborated, and it is why this connector exists.

   What it measures is visible public activity. Not ability. Someone
   with private repositories at work looks quiet here and is not, and
   the UI has to say so rather than let a low count read as a verdict.
   ──────────────────────────────────────────────────────────────── */

import type { EvidenceItem } from "./profileTypes";

export interface GithubRepo {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  pushedAt: string;
  url: string;
}

export interface GithubSignal {
  handle: string;
  name: string | null;
  url: string;
  bio: string | null;
  publicRepos: number;
  followers: number;
  createdAt: string;
  languages: { name: string; count: number }[];
  topRepos: GithubRepo[];
  /** Repositories pushed to in the last 90 days. */
  activeCount: number;
  fetchedAt: string;
}

export type GithubResult =
  | { status: "ok"; signal: GithubSignal }
  | { status: "error"; reason: string };

/** Pull a handle out of a pasted URL or a bare username. */
export function parseGithubHandle(input: string): string | null {
  const trimmed = input.trim().replace(/\/+$/, "");
  const fromUrl = /github\.com\/([A-Za-z0-9-]+)/i.exec(trimmed);
  const handle = fromUrl ? fromUrl[1] : trimmed.replace(/^@/, "");
  return /^[A-Za-z0-9-]{1,39}$/.test(handle) ? handle : null;
}

export async function fetchGithubSignal(input: string): Promise<GithubResult> {
  const handle = parseGithubHandle(input);
  if (!handle) return { status: "error", reason: "That does not look like a GitHub username or profile URL." };

  try {
    const res = await fetch("/api/github", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return {
        status: "error",
        /* The function already writes a reason a person can act on, so
           pass it through rather than replacing it with a status code. */
        reason: data?.error ?? "GitHub could not be reached from here.",
      };
    }
    return { status: "ok", signal: (await res.json()) as GithubSignal };
  } catch {
    return { status: "error", reason: "GitHub could not be reached from here." };
  }
}

/** How long they have been publishing, in whole years. */
export function yearsActive(signal: GithubSignal): number {
  const ms = Date.now() - new Date(signal.createdAt).getTime();
  return Math.max(0, Math.floor(ms / (365.25 * 24 * 60 * 60 * 1000)));
}

/**
 * Turn the repositories into evidence.
 *
 * Corroborated, not Verified: the repository is public and anyone can
 * open it, but nobody has confirmed that the person listing it wrote
 * the code. Verified would need the account linked through OAuth.
 */
export function repoEvidence(signal: GithubSignal): Omit<EvidenceItem, "id" | "addedAt">[] {
  return signal.topRepos.map(repo => ({
    kind: "project" as const,
    label: repo.description ? `${repo.name} — ${repo.description}` : repo.name,
    source: repo.url,
    trust: "corroborated" as const,
    skills: repo.language ? [repo.language] : [],
  }));
}

/**
 * What this does and does not show, in the product's own words.
 *
 * Written here rather than in the page so the caveat travels with the
 * data — a repository count separated from what it means is exactly how
 * a signal turns into a score nobody can defend.
 */
export function signalCaveat(signal: GithubSignal): string {
  return signal.activeCount === 0
    ? "Nothing pushed publicly in the last 90 days. That is not a verdict — work done in private repositories does not appear here at all."
    : `${signal.activeCount} ${signal.activeCount === 1 ? "repository" : "repositories"} pushed to in the last 90 days. This measures visible public activity, not ability — private work does not appear.`;
}
