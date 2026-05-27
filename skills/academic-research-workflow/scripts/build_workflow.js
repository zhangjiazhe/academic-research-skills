#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { buildWorkflow, parseArgs, seedTaskCards, toYaml } = require("./lib/workflow_runtime");

function main() {
  const args = parseArgs(process.argv.slice(2));
  const runDir = path.resolve(args._[0] || args["run-dir"] || process.cwd());
  const runId = path.basename(runDir);
  const workflowPath = path.join(runDir, "workflow.yaml");
  const taskDir = path.join(runDir, "agent_tasks");
  fs.mkdirSync(taskDir, { recursive: true });
  const workflow = buildWorkflow({ runId, executionMode: args.mode || "planning" });
  fs.writeFileSync(workflowPath, `${toYaml(workflow)}\n`, "utf8");
  for (const task of seedTaskCards()) {
    fs.writeFileSync(path.join(taskDir, `${task.task_id}.yaml`), `${toYaml(task)}\n`, "utf8");
  }
  console.log(JSON.stringify({ ok: true, workflow: workflowPath, task_dir: taskDir }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(`build_workflow failed: ${error.message}`);
  process.exit(1);
}
