const { execSync } = require("child_process");
const esbuild = require("esbuild");

// Chạy `tsc` để sinh file .d.ts
execSync("tsc --project tsconfig.json", { stdio: "inherit" });

// Build JS với esbuild
esbuild.build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    outfile: "dist/index.js",
    platform: "node",
    format: "cjs",
    minify: true
}).catch(() => process.exit(1));
