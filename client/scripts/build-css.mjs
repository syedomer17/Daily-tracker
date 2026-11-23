import fs from "node:fs";
import path from "node:path";
import { compile } from "@tailwindcss/node";
import { Scanner } from "@tailwindcss/oxide";

const projectRoot = process.cwd();
const inputPath = path.join(projectRoot, "app", "input.css");
const outputPath = path.join(projectRoot, "app", "globals.css");

async function buildCss() {
  const start = Date.now();
  const inputCss = fs.readFileSync(inputPath, "utf-8");

  const scanner = new Scanner({
    sources: [
      { base: path.join(projectRoot, "app"), pattern: "**/*.{ts,tsx,js,jsx}", negated: false },
      { base: path.join(projectRoot, "components"), pattern: "**/*.{ts,tsx,js,jsx}", negated: false },
      { base: path.join(projectRoot, "lib"), pattern: "**/*.{ts,tsx,js,jsx}", negated: false },
      { base: path.join(projectRoot, "data"), pattern: "**/*.{ts,tsx,js,jsx}", negated: false },
    ],
  });

  const candidates = scanner.scan();

  const compiler = await compile(inputCss, {
    base: projectRoot,
    from: inputPath,
    onDependency: () => {},
  });

  const outputCss = compiler.build(candidates);
  fs.writeFileSync(outputPath, outputCss, "utf-8");

  const elapsed = Date.now() - start;
  console.log(`[Tailwind CSS] Rebuilt globals.css (${candidates.length} candidates) in ${elapsed}ms`);
}

buildCss().catch((err) => {
  console.error("[Tailwind CSS] Build error:", err);
  process.exit(1);
});

if (process.argv.includes("--watch")) {
  console.log("[Tailwind CSS] Watching for changes in app/ and components/...");
  let timeout;
  const triggerRebuild = (eventType, filename) => {
    if (!filename || filename === "globals.css") return;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      buildCss().catch((err) => console.error("[Tailwind CSS] Watch error:", err));
    }, 100);
  };

  const watchDirs = [
    path.join(projectRoot, "app"),
    path.join(projectRoot, "components"),
  ];

  for (const dir of watchDirs) {
    if (fs.existsSync(dir)) {
      fs.watch(dir, { recursive: true }, triggerRebuild);
    }
  }
}
