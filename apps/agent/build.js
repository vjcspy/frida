const esbuild = require("esbuild");

esbuild.build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    outfile: "dist/_agent.js",
    platform: "node",
    format: "cjs",
    minify: true
}).catch(() => process.exit(1));
