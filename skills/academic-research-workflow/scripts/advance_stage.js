#!/usr/bin/env node
const path = require("path");
const { advanceRun, parseArgs } = require("./lib/workflow_runtime");

function main() {
  const args = parseArgs(process.argv.slice(2));
  const runDir = path.resolve(args._[0] || args["run-dir"] || process.cwd());
  const result = advanceRun({
    runDir,
    status: args.status,
    currentStage: args.stage,
    nextAction: args.next,
    completeTask: args["complete-task"],
    blockGate: args["block-gate"],
  });
  console.log(JSON.stringify({ ok: true, ...result }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(`advance_stage failed: ${error.message}`);
  process.exit(1);
}
