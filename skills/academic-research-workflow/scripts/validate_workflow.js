#!/usr/bin/env node
const path = require("path");
const { parseArgs, validateWorkflow } = require("./lib/workflow_runtime");

function main() {
  const args = parseArgs(process.argv.slice(2));
  const file = args._[0] || args.workflow;
  if (!file) throw new Error("usage: validate_workflow.js <run_dir/workflow.yaml>");
  const errors = validateWorkflow(path.resolve(file));
  if (errors.length) {
    console.error(JSON.stringify({ ok: false, errors }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, workflow: path.resolve(file) }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(`validate_workflow failed: ${error.message}`);
  process.exit(1);
}
