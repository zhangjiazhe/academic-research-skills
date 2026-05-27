#!/usr/bin/env node
const { asArray, createRun, parseArgs } = require("./lib/workflow_runtime");

function main() {
  const args = parseArgs(process.argv.slice(2));
  const hasData =
    args["has-data"] === undefined ? null : ["yes", "true", "1"].includes(String(args["has-data"]).toLowerCase());
  const result = createRun({
    workspace: args.workspace || process.cwd(),
    topic: args.topic || args.slug || "academic-workflow",
    route: args.route || null,
    executionMode: args.mode || "planning",
    hasData,
    data: asArray(args.data),
    code: asArray(args.code),
    experiments: asArray(args.experiment || args.experiments),
  });
  console.log(JSON.stringify(result, null, 2));
}

try {
  main();
} catch (error) {
  console.error(`init_run failed: ${error.message}`);
  process.exit(1);
}
