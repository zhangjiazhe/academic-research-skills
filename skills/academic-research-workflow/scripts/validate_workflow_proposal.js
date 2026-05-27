#!/usr/bin/env node
const path = require("path");
const { parseArgs, validateWorkflowProposal } = require("./lib/workflow_runtime");

function main() {
  const args = parseArgs(process.argv.slice(2));
  const file = args._[0] || args.proposal;
  if (!file) throw new Error("usage: validate_workflow_proposal.js <workflow_proposal.yaml>");
  const errors = validateWorkflowProposal(path.resolve(file));
  if (errors.length) {
    console.error(JSON.stringify({ ok: false, errors }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, proposal: path.resolve(file) }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(`validate_workflow_proposal failed: ${error.message}`);
  process.exit(1);
}
