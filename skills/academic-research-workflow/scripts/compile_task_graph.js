#!/usr/bin/env node
const path = require("path");
const { compileTaskGraph, parseArgs } = require("./lib/workflow_runtime");

function main() {
  const args = parseArgs(process.argv.slice(2));
  const proposalPath = path.resolve(args._[0] || args.proposal || "workflow_proposal.yaml");
  const runDir = path.resolve(args["run-dir"] || path.dirname(proposalPath));
  const result = compileTaskGraph({ proposalPath, runDir });
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify(result, null, 2));
}

try {
  main();
} catch (error) {
  console.error(`compile_task_graph failed: ${error.message}`);
  process.exit(1);
}
