/* Load a TypeScript module in plain node.
   The project has no test runner, and the corpus is the piece most worth
   testing — it decides what six pages show. esbuild ships with vite, so
   bundling to a temp .mjs costs nothing and needs no new dependency. */

import { build } from "esbuild";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export async function loadTs(entry) {
  /* Inside node_modules so node resolves react from the project when it
     loads the bundle — a temp dir outside the tree cannot. */
  const dir = await mkdtemp(join("node_modules", ".cxr-test-"));
  const out = join(dir, "bundle.mjs");
  await build({
    entryPoints: [entry],
    bundle: true,
    format: "esm",
    platform: "neutral",
    outfile: out,
    logLevel: "silent",
    // React is never evaluated by the modules under test, but the import
    // graph reaches it; marking it external keeps the bundle small.
    external: ["react", "react-dom", "lucide-react"],
  });
  const mod = await import(pathToFileURL(out).href);
  await rm(dir, { recursive: true, force: true });
  return mod;
}

export async function readSource(path) {
  return readFile(path, "utf8");
}
