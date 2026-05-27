#!/usr/bin/env node
const path = require("path");
const { parseArgs, validateTaskCard } = require("./lib/workflow_runtime");

function main() {
  const args = parseArgs(process.argv.slice(2));
  const file = args._[0] || args.card;
  if (!file) throw new Error("usage: validate_task_card.js <agent_tasks/task.yaml>");
  const errors = validateTaskCard(path.resolve(file));
  if (errors.length) {
    console.error(JSON.stringify({ ok: false, errors }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, task_card: path.resolve(file) }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(`validate_task_card failed: ${error.message}`);
  process.exit(1);
}
