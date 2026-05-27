#!/usr/bin/env node
const path = require("path");
const { parseArgs, validateManifest } = require("./lib/workflow_runtime");

function main() {
  const args = parseArgs(process.argv.slice(2));
  const file = args._[0] || args.manifest;
  if (!file) throw new Error("usage: validate_manifest.js <run_dir/manifest.yaml>");
  const errors = validateManifest(path.resolve(file));
  if (errors.length) {
    console.error(JSON.stringify({ ok: false, errors }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, manifest: path.resolve(file) }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(`validate_manifest failed: ${error.message}`);
  process.exit(1);
}
