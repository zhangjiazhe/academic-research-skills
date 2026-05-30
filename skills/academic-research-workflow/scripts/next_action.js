#!/usr/bin/env node
const path = require("path");
const { parseArgs, resolveNextAction } = require("./lib/workflow_runtime");

function main() {
  const args = parseArgs(process.argv.slice(2));
  const runDir = path.resolve(args._[0] || args["run-dir"] || process.cwd());
  const result = resolveNextAction({ runDir });
  console.log(JSON.stringify(result, null, 2));
}

try {
  main();
} catch (error) {
  console.error(`next_action failed: ${error.message}`);
  process.exit(1);
}
