const fs = require("fs");
const path = require("path");

const WORKFLOW_NAME = "academic-research-workflow";
const WORKFLOW_VERSION = "3.6.5";

const VALID_ROUTES = new Set(["毕业论文", "工科学术论文", "计算机会议论文"]);
const VALID_PIPELINE_STATUSES = new Set([
  "initializing",
  "planning",
  "running",
  "awaiting_gate_resolution",
  "paused",
  "completed",
  "aborted",
]);
const VALID_TASK_STATUSES = new Set(["pending", "running", "completed", "blocked", "failed"]);
const VALID_EXECUTION_MODES = new Set(["planning", "strict_multi_agent", "sequential_fallback"]);
const VALID_GATES = new Set([
  "ROUTE_GATE",
  "TOPIC_CLAIM_GATE",
  "FRAMEWORK_GATE",
  "START_WRITING_GATE",
  "INTEGRITY_GATE",
  "REVIEWER_FEASIBILITY_GATE",
]);

function nowIso() {
  return new Date().toISOString();
}

function datePart() {
  return new Date().toISOString().slice(0, 10);
}

function slugify(input) {
  const raw = String(input || "academic-workflow").trim().toLowerCase();
  const ascii = raw
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return ascii || "academic-workflow";
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFileIfAbsent(file, content) {
  if (fs.existsSync(file)) {
    throw new Error(`Refusing to overwrite existing file: ${file}`);
  }
  fs.writeFileSync(file, content, "utf8");
}

function yamlScalar(value) {
  if (value === null) return "null";
  if (value === undefined) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  const s = String(value);
  if (s === "" || /[:#\n\r\t]|^\s|\s$|^-|^\[|^\{|^null$|^true$|^false$/i.test(s)) {
    return JSON.stringify(s);
  }
  return s;
}

function toYaml(value, indent = 0) {
  const pad = " ".repeat(indent);
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return value
      .map((item) => {
        if (item && typeof item === "object") {
          return `${pad}- ${toYaml(item, indent + 2).trimStart()}`;
        }
        return `${pad}- ${yamlScalar(item)}`;
      })
      .join("\n");
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length === 0) return "{}";
    return entries
      .map(([key, val]) => {
        if (Array.isArray(val)) {
          if (val.length === 0) return `${pad}${key}: []`;
          return `${pad}${key}:\n${toYaml(val, indent + 2)}`;
        }
        if (val && typeof val === "object") {
          return `${pad}${key}:\n${toYaml(val, indent + 2)}`;
        }
        return `${pad}${key}: ${yamlScalar(val)}`;
      })
      .join("\n");
  }
  return `${pad}${yamlScalar(value)}`;
}

function readText(file) {
  return fs.readFileSync(file, "utf8");
}

function parseYaml(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  let index = 0;

  function current() {
    return lines[index];
  }

  function indentOf(line) {
    const match = line.match(/^ */);
    return match ? match[0].length : 0;
  }

  function skipBlank() {
    while (index < lines.length && /^\s*(#.*)?$/.test(lines[index])) index += 1;
  }

  function parseNode(indent) {
    skipBlank();
    if (index >= lines.length || indentOf(current()) < indent) return null;
    const trimmed = current().slice(indent);
    if (trimmed.startsWith("- ")) return parseArray(indent);
    return parseObject(indent);
  }

  function parseArray(indent) {
    const arr = [];
    while (index < lines.length) {
      skipBlank();
      if (index >= lines.length || indentOf(current()) !== indent) break;
      const line = current().slice(indent);
      if (!line.startsWith("- ")) break;
      const rest = line.slice(2).trimEnd();
      index += 1;
      if (rest === "") {
        arr.push(parseNode(indent + 2));
      } else if (/^[A-Za-z0-9_'".-]+\s*:/.test(rest)) {
        const obj = {};
        parseKeyValueInto(obj, rest, indent + 2);
        const child = parseObject(indent + 2, true);
        arr.push(Object.assign(obj, child));
      } else {
        arr.push(parseScalar(rest));
      }
    }
    return arr;
  }

  function parseObject(indent, allowEmpty = false) {
    const obj = {};
    let saw = false;
    while (index < lines.length) {
      skipBlank();
      if (index >= lines.length) break;
      const lineIndent = indentOf(current());
      if (lineIndent < indent) break;
      if (lineIndent > indent) break;
      const line = current().slice(indent);
      if (line.startsWith("- ")) break;
      index += 1;
      parseKeyValueInto(obj, line.trimEnd(), indent + 2);
      saw = true;
    }
    if (!saw && !allowEmpty) return {};
    return obj;
  }

  function parseKeyValueInto(obj, line, childIndent) {
    const colon = line.indexOf(":");
    if (colon === -1) throw new Error(`Invalid YAML line: ${line}`);
    const key = unquote(line.slice(0, colon).trim());
    const rest = line.slice(colon + 1).trim();
    if (rest === "") {
      obj[key] = parseNode(childIndent);
    } else if (rest === "|") {
      obj[key] = parseLiteral(childIndent);
    } else {
      obj[key] = parseScalar(rest);
    }
  }

  function parseLiteral(indent) {
    const parts = [];
    while (index < lines.length) {
      const line = current();
      if (/^\s*$/.test(line)) {
        parts.push("");
        index += 1;
        continue;
      }
      if (indentOf(line) < indent) break;
      parts.push(line.slice(indent));
      index += 1;
    }
    return parts.join("\n");
  }

  skipBlank();
  return parseNode(indentOf(current() || ""));
}

function parseScalar(raw) {
  const value = stripComment(raw.trim());
  if (value === "null" || value === "~") return null;
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "[]") return [];
  if (value === "{}") return {};
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return unquote(value);
  }
  return value;
}

function stripComment(value) {
  let quote = null;
  for (let i = 0; i < value.length; i += 1) {
    const ch = value[i];
    if ((ch === '"' || ch === "'") && value[i - 1] !== "\\") {
      quote = quote === ch ? null : quote || ch;
    }
    if (ch === "#" && !quote && /\s/.test(value[i - 1] || "")) return value.slice(0, i).trimEnd();
  }
  return value;
}

function unquote(value) {
  if (value.startsWith('"') && value.endsWith('"')) return JSON.parse(value);
  if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1).replace(/''/g, "'");
  return value;
}

function readYamlOrJson(file) {
  const text = readText(file);
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return JSON.parse(trimmed);
  return parseYaml(text);
}

function hasKey(text, key) {
  return new RegExp(`(^|\\n)\\s*${escapeRegExp(key)}\\s*:`, "m").test(text);
}

function getScalar(text, key) {
  const re = new RegExp(`(^|\\n)\\s*${escapeRegExp(key)}\\s*:\\s*([^\\n#]+)`, "m");
  const match = text.match(re);
  if (!match) return null;
  return match[2].trim().replace(/^["']|["']$/g, "");
}

function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const cur = argv[i];
    if (!cur.startsWith("--")) {
      args._.push(cur);
      continue;
    }
    const eq = cur.indexOf("=");
    if (eq !== -1) {
      const key = cur.slice(2, eq);
      const value = cur.slice(eq + 1);
      pushArg(args, key, value);
      continue;
    }
    const key = cur.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      pushArg(args, key, true);
    } else {
      pushArg(args, key, next);
      i += 1;
    }
  }
  return args;
}

function pushArg(args, key, value) {
  if (Object.prototype.hasOwnProperty.call(args, key)) {
    if (!Array.isArray(args[key])) args[key] = [args[key]];
    args[key].push(value);
  } else {
    args[key] = value;
  }
}

function asArray(value) {
  if (value === undefined || value === null || value === false) return [];
  return Array.isArray(value) ? value : [value];
}

function relativeToRun(runDir, target) {
  return path.relative(runDir, target).replace(/\\/g, "/") || ".";
}

function buildManifest({
  runId,
  route = null,
  executionMode = "planning",
  hasData = null,
  data = [],
  code = [],
  experiments = [],
}) {
  const ts = nowIso();
  const routeValue = route && VALID_ROUTES.has(route) ? route : null;
  const mode = VALID_EXECUTION_MODES.has(executionMode) ? executionMode : "planning";
  const activeGates = routeValue
    ? []
    : [
        {
          gate_id: "gate_route_001",
          gate_type: "ROUTE_GATE",
          status: "awaiting_user",
          reason: "Paper route must be one of 毕业论文, 工科学术论文, or 计算机会议论文.",
          required_user_action: "Choose one paper route.",
          evidence: [],
          created_at: ts,
        },
      ];
  return {
    pipeline_run_id: runId,
    workflow_name: WORKFLOW_NAME,
    workflow_version: WORKFLOW_VERSION,
    status: routeValue ? "planning" : "awaiting_gate_resolution",
    current_stage: "stage_0_intake",
    created_at: ts,
    updated_at: ts,
    execution_control: {
      execution_mode: mode,
      auto_continue: mode === "strict_multi_agent",
      canonical_state_file: "manifest.yaml",
      resume_policy: "manifest_first",
      stop_conditions: ["active_gate", "blocking_issue", "paused_completed_or_aborted"],
      user_design_gates_waived: [],
    },
    paper_profile: {
      route: routeValue,
      target_standard: "highest_feasible",
      target_language: "中文",
      output_format: "tex_pdf",
      has_data_or_experiments: hasData,
      data_locations: data,
      code_locations: code,
      experiment_locations: experiments,
      topic: null,
      core_claim: null,
      contribution_type: null,
    },
    workflow_files: {
      run_dir: ".",
      manifest: "manifest.yaml",
      workflow_definition: "workflow.yaml",
      agent_tasks_dir: "agent_tasks/",
      artifacts_dir: "artifacts/",
      logs_dir: "logs/",
    },
    stage_status: {
      stage_0_intake: "pending",
      stage_1_material_inspection: "pending",
      stage_2_topic_and_claim_dialogue: "pending",
      stage_3_workflow_definition: "pending",
      stage_4_research: "pending",
      stage_5_framework: "pending",
      stage_6_writing: "pending",
      stage_7_integrity: "pending",
      stage_8_review: "pending",
      stage_9_revision: "pending",
      stage_10_final_integrity: "pending",
      stage_11_finalize: "pending",
      stage_12_process_summary: "pending",
    },
    active_gates: activeGates,
    completed_tasks: [],
    running_tasks: [],
    blocked_tasks: [],
    artifacts: {
      material_inventory: null,
      topic_claim_brief: null,
      workflow_proposal: null,
      workflow_definition: "workflow.yaml",
      verified_source_corpus: null,
      candidate_sources_unverified: null,
      paper_framework: null,
      draft_tex: null,
      draft_pdf: null,
      integrity_report: null,
      review_report: null,
      revision_report: null,
      final_integrity_report: null,
      final_tex: null,
      final_pdf: null,
      process_record_pdf: null,
    },
    blocking_issues: [],
    next_action: routeValue ? "inspect materials and derive topic/core claim" : "resolve ROUTE_GATE",
  };
}

function defaultStages() {
  return [
    ["stage_0_intake", "Intake", null, []],
    ["stage_1_material_inspection", "Material Inspection", null, ["stage_0_intake"]],
    ["stage_2_topic_and_claim_dialogue", "Topic And Claim Dialogue", null, ["stage_1_material_inspection"]],
    ["stage_3_workflow_definition", "Workflow Definition", null, ["stage_2_topic_and_claim_dialogue"]],
    ["stage_4_research", "Research", "deep-research", ["stage_3_workflow_definition"]],
    ["stage_5_framework", "Writing Framework", "my-academic-paper", ["stage_4_research"]],
    ["stage_6_writing", "Writing", "my-academic-paper", ["stage_5_framework"]],
    ["stage_7_integrity", "Pre-Review Integrity", "integrity_verification_agent", ["stage_6_writing"]],
    ["stage_8_review", "Review", "academic-paper-reviewer", ["stage_7_integrity"]],
    ["stage_9_revision", "Revision", "my-academic-paper", ["stage_8_review"]],
    ["stage_10_final_integrity", "Final Integrity", "integrity_verification_agent", ["stage_9_revision"]],
    ["stage_11_finalize", "Finalize TeX/PDF", "my-academic-paper", ["stage_10_final_integrity"]],
    ["stage_12_process_summary", "Process Summary", null, ["stage_11_finalize"]],
  ].map(([stage_id, name, called_skill, depends_on]) => ({
    stage_id,
    name,
    called_skill,
    status: "pending",
    depends_on,
    required_inputs: [],
    expected_outputs: [],
    hard_gates: [],
    tasks: [],
  }));
}

function buildWorkflow({ runId, executionMode }) {
  const stages = defaultStages();
  for (const task of seedTaskCards()) {
    const stage = stages.find((item) => item.stage_id === task.stage_id);
    if (stage) stage.tasks.push(`agent_tasks/${task.task_id}.yaml`);
  }
  return {
    workflow_id: runId,
    workflow_name: WORKFLOW_NAME,
    run_dir: ".",
    execution_mode: executionMode,
    defaults: {
      target_standard: "highest_feasible",
      target_language: "中文",
      output_format: "tex_pdf",
    },
    stages,
  };
}

function seedTaskCards() {
  return [
    {
      task_id: "stage_0_intake",
      stage_id: "stage_0_intake",
      agent_name: "pipeline_orchestrator_agent",
      called_skill: "academic-research-workflow",
      status: "pending",
      can_run_parallel: false,
      depends_on: [],
      input_artifacts: [],
      output_artifacts: ["artifacts/intake_summary.yaml"],
      log_file: "logs/stage_0_intake.log",
      prompt:
        "Collect only the required intake: paper route and whether data/experiments/code/materials exist. Do not ask for final topic or core claim.",
      completion_criteria: [
        "paper route is recorded or ROUTE_GATE is active",
        "material locations are recorded if provided",
        "manifest.yaml is updated",
      ],
      handoff: { produced_for: ["stage_1_material_inspection"], summary_required: true },
    },
    {
      task_id: "stage_1_material_inspection",
      stage_id: "stage_1_material_inspection",
      agent_name: "material_inspection_agent",
      called_skill: "academic-research-workflow",
      status: "pending",
      can_run_parallel: false,
      depends_on: ["stage_0_intake"],
      input_artifacts: ["manifest.yaml"],
      output_artifacts: ["artifacts/material_inventory.yaml"],
      log_file: "logs/stage_1_material_inspection.log",
      prompt:
        "Inspect declared project materials and current paper directory. Produce an inventory; do not draft the paper.",
      completion_criteria: [
        "material inventory exists",
        "code/data/experiment/document paths are categorized",
        "missing critical materials are listed",
      ],
      handoff: { produced_for: ["stage_2_topic_and_claim_dialogue"], summary_required: true },
    },
  ];
}

function createRun({ workspace, topic, route, executionMode, hasData, data, code, experiments }) {
  const base = path.resolve(workspace || process.cwd());
  const runId = `${datePart()}_${slugify(topic || "academic-workflow")}`;
  const runDir = path.join(base, "runs", runId);
  ensureDir(runDir);
  ensureDir(path.join(runDir, "agent_tasks"));
  ensureDir(path.join(runDir, "artifacts"));
  ensureDir(path.join(runDir, "logs"));

  const manifest = buildManifest({ runId, route, executionMode, hasData, data, code, experiments });
  const workflow = buildWorkflow({ runId, executionMode });
  const tasks = seedTaskCards();

  writeFileIfAbsent(path.join(runDir, "manifest.yaml"), `${toYaml(manifest)}\n`);
  writeFileIfAbsent(path.join(runDir, "workflow.yaml"), `${toYaml(workflow)}\n`);
  for (const task of tasks) {
    writeFileIfAbsent(path.join(runDir, "agent_tasks", `${task.task_id}.yaml`), `${toYaml(task)}\n`);
  }
  fs.writeFileSync(
    path.join(runDir, "logs", "runtime_init.log"),
    `[${nowIso()}] Created ${WORKFLOW_NAME} run ${runId}\n`,
    "utf8",
  );
  return { runId, runDir, manifestPath: path.join(runDir, "manifest.yaml") };
}

function validateManifest(file) {
  const text = readText(file);
  const errors = [];
  for (const key of [
    "pipeline_run_id",
    "workflow_name",
    "workflow_version",
    "status",
    "current_stage",
    "paper_profile",
    "workflow_files",
    "stage_status",
    "active_gates",
    "artifacts",
    "next_action",
  ]) {
    if (!hasKey(text, key)) errors.push(`missing key: ${key}`);
  }
  const workflowName = getScalar(text, "workflow_name");
  if (workflowName && workflowName !== WORKFLOW_NAME) errors.push(`workflow_name must be ${WORKFLOW_NAME}`);
  const status = getScalar(text, "status");
  if (status && !VALID_PIPELINE_STATUSES.has(status)) errors.push(`invalid status: ${status}`);
  const dir = path.dirname(path.resolve(file));
  for (const required of ["workflow.yaml", "agent_tasks", "artifacts", "logs"]) {
    if (!fs.existsSync(path.join(dir, required))) errors.push(`missing run path: ${required}`);
  }
  return errors;
}

function validateTaskCard(file) {
  const text = readText(file);
  const errors = [];
  for (const key of [
    "task_id",
    "stage_id",
    "agent_name",
    "called_skill",
    "status",
    "can_run_parallel",
    "depends_on",
    "input_artifacts",
    "output_artifacts",
    "log_file",
    "prompt",
    "completion_criteria",
  ]) {
    if (!hasKey(text, key)) errors.push(`missing key: ${key}`);
  }
  const status = getScalar(text, "status");
  if (status && !VALID_TASK_STATUSES.has(status)) errors.push(`invalid status: ${status}`);
  return errors;
}

function validateWorkflow(file) {
  const text = readText(file);
  const errors = [];
  for (const key of ["workflow_id", "workflow_name", "run_dir", "execution_mode", "defaults", "stages"]) {
    if (!hasKey(text, key)) errors.push(`missing key: ${key}`);
  }
  const workflowName = getScalar(text, "workflow_name");
  if (workflowName && workflowName !== WORKFLOW_NAME) errors.push(`workflow_name must be ${WORKFLOW_NAME}`);
  const mode = getScalar(text, "execution_mode");
  if (mode && !VALID_EXECUTION_MODES.has(mode)) {
    errors.push(`invalid execution_mode: ${mode}`);
  }
  if (!/stage_id\s*:/.test(text)) errors.push("workflow must contain at least one stage_id");
  return errors;
}

function validateWorkflowProposalObject(proposal) {
  const errors = [];
  if (!proposal || typeof proposal !== "object") return ["proposal must be an object"];
  if (proposal.workflow_name !== WORKFLOW_NAME) errors.push(`workflow_name must be ${WORKFLOW_NAME}`);
  if (!proposal.proposal_id) errors.push("missing proposal_id");
  if (!VALID_EXECUTION_MODES.has(proposal.execution_mode)) {
    errors.push("execution_mode must be planning, strict_multi_agent, or sequential_fallback");
  }
  if (!Array.isArray(proposal.stages) || proposal.stages.length === 0) {
    errors.push("stages must be a non-empty array");
    return errors;
  }

  const stageIds = new Set();
  const taskIds = new Set();
  for (const stage of proposal.stages) {
    if (!stage.stage_id) errors.push("stage missing stage_id");
    if (stage.stage_id && stageIds.has(stage.stage_id)) errors.push(`duplicate stage_id: ${stage.stage_id}`);
    if (stage.stage_id) stageIds.add(stage.stage_id);
    if (!stage.name) errors.push(`stage ${stage.stage_id || "<unknown>"} missing name`);
    for (const gate of asArray(stage.hard_gates)) {
      if (!VALID_GATES.has(gate)) errors.push(`invalid gate ${gate} in stage ${stage.stage_id}`);
    }
    const tasks = asArray(stage.tasks);
    for (const task of tasks) {
      if (!task || typeof task !== "object") {
        errors.push(`stage ${stage.stage_id} has non-object task`);
        continue;
      }
      for (const key of [
        "task_id",
        "agent_name",
        "called_skill",
        "can_run_parallel",
        "depends_on",
        "input_artifacts",
        "output_artifacts",
        "prompt",
        "completion_criteria",
      ]) {
        if (!Object.prototype.hasOwnProperty.call(task, key)) {
          errors.push(`task ${task.task_id || "<unknown>"} missing ${key}`);
        }
      }
      if (task.task_id && taskIds.has(task.task_id)) errors.push(`duplicate task_id: ${task.task_id}`);
      if (task.task_id) taskIds.add(task.task_id);
      for (const gate of asArray(task.hard_gates)) {
        if (!VALID_GATES.has(gate)) errors.push(`invalid gate ${gate} in task ${task.task_id}`);
      }
      if (!Array.isArray(task.completion_criteria) || task.completion_criteria.length === 0) {
        errors.push(`task ${task.task_id || "<unknown>"} must have completion_criteria`);
      }
    }
  }

  for (const stage of proposal.stages) {
    for (const dep of asArray(stage.depends_on)) {
      if (!stageIds.has(dep)) errors.push(`stage ${stage.stage_id} depends on unknown stage ${dep}`);
    }
    for (const task of asArray(stage.tasks)) {
      for (const dep of asArray(task.depends_on)) {
        if (!taskIds.has(dep) && !stageIds.has(dep)) {
          errors.push(`task ${task.task_id} depends on unknown task/stage ${dep}`);
        }
      }
    }
  }

  const hasVerifiedCorpus = JSON.stringify(proposal).includes("verified_source_corpus");
  const hasWriting = proposal.stages.some((stage) =>
    asArray(stage.tasks).some((task) => /write|draft|writing|正文|写作/i.test(task.task_id || "")),
  );
  if (hasWriting && !hasVerifiedCorpus) {
    errors.push("writing tasks require a Verified Source Corpus artifact/dependency reference");
  }
  return errors;
}

function validateWorkflowProposal(file) {
  return validateWorkflowProposalObject(readYamlOrJson(file));
}

function compileTaskGraph({ proposalPath, runDir }) {
  const proposal = readYamlOrJson(proposalPath);
  const errors = validateWorkflowProposalObject(proposal);
  if (errors.length) return { ok: false, errors };

  const targetRunDir = path.resolve(runDir || path.dirname(proposalPath));
  ensureDir(targetRunDir);
  ensureDir(path.join(targetRunDir, "agent_tasks"));
  ensureDir(path.join(targetRunDir, "logs"));
  ensureDir(path.join(targetRunDir, "artifacts"));

  const workflow = {
    workflow_id: proposal.workflow_id || proposal.proposal_id,
    workflow_name: WORKFLOW_NAME,
    run_dir: ".",
    execution_mode: proposal.execution_mode,
    defaults: proposal.defaults || {
      target_standard: "highest_feasible",
      target_language: "中文",
      output_format: "tex_pdf",
    },
    stages: proposal.stages.map((stage) => {
      const tasks = asArray(stage.tasks);
      return {
        stage_id: stage.stage_id,
        name: stage.name,
        called_skill: stage.called_skill || null,
        status: stage.status || "pending",
        depends_on: asArray(stage.depends_on),
        required_inputs: asArray(stage.required_inputs),
        expected_outputs: asArray(stage.expected_outputs),
        hard_gates: asArray(stage.hard_gates),
        tasks: tasks.map((task) => `agent_tasks/${task.task_id}.yaml`),
      };
    }),
  };

  const taskCards = [];
  for (const stage of proposal.stages) {
    for (const task of asArray(stage.tasks)) {
      taskCards.push({
        task_id: task.task_id,
        stage_id: task.stage_id || stage.stage_id,
        agent_name: task.agent_name,
        called_skill: task.called_skill,
        status: task.status || "pending",
        can_run_parallel: Boolean(task.can_run_parallel),
        depends_on: asArray(task.depends_on),
        input_artifacts: asArray(task.input_artifacts),
        output_artifacts: asArray(task.output_artifacts),
        log_file: task.log_file || `logs/${task.task_id}.log`,
        prompt: task.prompt,
        completion_criteria: asArray(task.completion_criteria),
        hard_gates: asArray(task.hard_gates),
        handoff: task.handoff || { produced_for: [], summary_required: true },
      });
    }
  }

  const workflowPath = path.join(targetRunDir, "workflow.yaml");
  fs.writeFileSync(workflowPath, `${toYaml(workflow)}\n`, "utf8");
  for (const task of taskCards) {
    fs.writeFileSync(path.join(targetRunDir, "agent_tasks", `${task.task_id}.yaml`), `${toYaml(task)}\n`, "utf8");
  }
  const manifestPath = path.join(targetRunDir, "manifest.yaml");
  if (fs.existsSync(manifestPath)) {
    const manifestText = readText(manifestPath);
    fs.writeFileSync(manifestPath, upsertExecutionControl(manifestText, proposal.execution_mode), "utf8");
  }
  appendLog(targetRunDir, `compiled task graph from ${proposalPath}`);
  return { ok: true, workflowPath, taskCount: taskCards.length };
}

function appendLog(runDir, message) {
  const log = path.join(runDir, "logs", "runtime_actions.log");
  fs.appendFileSync(log, `[${nowIso()}] ${message}\n`, "utf8");
}

function updateManifestText(text, updates) {
  let out = text;
  if (updates.status) out = replaceScalar(out, "status", updates.status);
  if (updates.currentStage) out = replaceScalar(out, "current_stage", updates.currentStage);
  if (updates.nextAction) out = replaceScalar(out, "next_action", updates.nextAction);
  if (updates.runTask) out = addTopLevelListItem(out, "running_tasks", updates.runTask);
  if (updates.completeTask) out = addTopLevelListItem(out, "completed_tasks", updates.completeTask);
  if (updates.completeTask) out = removeTopLevelListItem(out, "running_tasks", updates.completeTask);
  if (updates.completeStage) out = setStageStatus(out, updates.completeStage, "completed");
  if (updates.blockTask) out = addTopLevelListItem(out, "blocked_tasks", updates.blockTask);
  if (updates.blockTask) out = removeTopLevelListItem(out, "running_tasks", updates.blockTask);
  if (updates.blockGate) out = addGate(out, updates.blockGate);
  out = replaceScalar(out, "updated_at", nowIso());
  return out;
}

function upsertExecutionControl(text, executionMode) {
  const mode = VALID_EXECUTION_MODES.has(executionMode) ? executionMode : "planning";
  const autoContinue = mode === "strict_multi_agent";
  if (!hasKey(text, "execution_control")) {
    const block = `execution_control:\n  execution_mode: ${yamlScalar(mode)}\n  auto_continue: ${yamlScalar(autoContinue)}\n  canonical_state_file: manifest.yaml\n  resume_policy: manifest_first\n  stop_conditions:\n    - active_gate\n    - blocking_issue\n    - paused_completed_or_aborted\n  user_design_gates_waived: []\n`;
    return text.replace(/(^updated_at\s*:[^\n]*\n)/m, `$1${block}`);
  }
  let out = replaceNestedScalar(text, "execution_control", "execution_mode", mode);
  out = replaceNestedScalar(out, "execution_control", "auto_continue", autoContinue);
  return out;
}

function replaceScalar(text, key, value) {
  const re = new RegExp(`(^|\\n)(\\s*${escapeRegExp(key)}\\s*:\\s*)([^\\n]*)`, "m");
  const replacement = `$1$2${yamlScalar(value)}`;
  if (re.test(text)) return text.replace(re, replacement);
  return `${text.replace(/\s*$/, "")}\n${key}: ${yamlScalar(value)}\n`;
}

function addTopLevelListItem(text, key, value) {
  if (!value) return text;
  const emptyRe = new RegExp(`(^|\\n)(${escapeRegExp(key)}\\s*:\\s*)\\[\\]`, "m");
  if (emptyRe.test(text)) return text.replace(emptyRe, `$1${key}:\n  - ${yamlScalar(value)}`);
  const blockRe = new RegExp(`(^|\\n)${escapeRegExp(key)}\\s*:\\n((?:  - [^\\n]*\\n?)*)`, "m");
  const match = text.match(blockRe);
  if (!match) return `${text.replace(/\s*$/, "")}\n${key}:\n  - ${yamlScalar(value)}\n`;
  if (match[2].includes(`- ${value}`)) return text;
  const insertAt = match.index + match[0].length;
  return `${text.slice(0, insertAt).replace(/\n?$/, "\n")}  - ${yamlScalar(value)}\n${text.slice(insertAt)}`;
}

function removeTopLevelListItem(text, key, value) {
  if (!value) return text;
  const blockRe = new RegExp(`(^|\\n)${escapeRegExp(key)}\\s*:\\n((?:  - [^\\n]*\\n?)*)`, "m");
  const match = text.match(blockRe);
  if (!match) return text;
  const lines = match[2]
    .split("\n")
    .filter((line) => line.trim() && line.trim() !== `- ${value}` && line.trim() !== `- ${yamlScalar(value)}`);
  const replacement = lines.length ? `${key}:\n${lines.join("\n")}\n` : `${key}: []\n`;
  return `${text.slice(0, match.index + (match[1] ? 1 : 0))}${replacement}${text.slice(match.index + match[0].length)}`;
}

function setStageStatus(text, stageId, status) {
  if (!stageId) return text;
  const re = new RegExp(`(^\\s{2}${escapeRegExp(stageId)}\\s*:\\s*)([^\\n]*)`, "m");
  if (re.test(text)) return text.replace(re, `$1${yamlScalar(status)}`);
  return text;
}

function replaceNestedScalar(text, parentKey, childKey, value) {
  const parentRe = new RegExp(`(^|\\n)${escapeRegExp(parentKey)}\\s*:\\n`, "m");
  const parentMatch = text.match(parentRe);
  if (!parentMatch) return text;
  const start = parentMatch.index + parentMatch[0].length;
  const nextTop = text.slice(start).search(/\n\S/);
  const end = nextTop === -1 ? text.length : start + nextTop + 1;
  const block = text.slice(start, end);
  const childRe = new RegExp(`(^\\s{2}${escapeRegExp(childKey)}\\s*:\\s*)([^\\n]*)`, "m");
  if (childRe.test(block)) {
    return `${text.slice(0, start)}${block.replace(childRe, `$1${yamlScalar(value)}`)}${text.slice(end)}`;
  }
  return `${text.slice(0, end).replace(/\n?$/, "\n")}  ${childKey}: ${yamlScalar(value)}\n${text.slice(end)}`;
}

function addGate(text, gateType) {
  if (!gateType) return text;
  const gate = {
    gate_id: `gate_${String(gateType).toLowerCase()}_${Date.now()}`,
    gate_type: gateType,
    status: "awaiting_user",
    reason: `Workflow blocked by ${gateType}.`,
    required_user_action: `Resolve ${gateType}.`,
    evidence: [],
    created_at: nowIso(),
  };
  const gateYaml = toYaml([gate], 2).replace(/^  /gm, "  ");
  const emptyRe = /(^|\n)(active_gates\s*:\s*)\[\]/m;
  if (emptyRe.test(text)) return text.replace(emptyRe, `$1active_gates:\n${gateYaml}`);
  return text;
}

function advanceRun({ runDir, status, currentStage, nextAction, completeTask, completeStage, runTask, blockGate }) {
  const manifestPath = path.join(runDir, "manifest.yaml");
  if (!fs.existsSync(manifestPath)) throw new Error(`manifest.yaml not found in ${runDir}`);
  let text = readText(manifestPath);
  if (blockGate && !VALID_GATES.has(blockGate)) throw new Error(`invalid gate: ${blockGate}`);
  text = updateManifestText(text, {
    status: blockGate ? "awaiting_gate_resolution" : status,
    currentStage,
    nextAction: blockGate ? `resolve ${blockGate}` : nextAction,
    completeTask,
    completeStage,
    runTask,
    blockTask: blockGate ? completeTask : null,
    blockGate,
  });
  fs.writeFileSync(manifestPath, text, "utf8");
  if (runTask) appendLog(runDir, `running task: ${runTask}`);
  if (completeTask) appendLog(runDir, `completed task: ${completeTask}`);
  if (completeStage) appendLog(runDir, `completed stage: ${completeStage}`);
  if (blockGate) appendLog(runDir, `blocked by gate: ${blockGate}`);
  return { manifestPath };
}

function idsFromList(value) {
  return new Set(asArray(value).filter(Boolean).map(String));
}

function isActiveGateList(value) {
  return asArray(value).some((gate) => {
    if (!gate) return false;
    if (typeof gate === "string") return gate.length > 0;
    return gate.status !== "resolved" && gate.status !== "waived";
  });
}

function readTaskCard(runDir, taskPath) {
  const file = path.join(runDir, taskPath);
  const task = readYamlOrJson(file);
  task.task_card = taskPath;
  return task;
}

function resolveNextAction({ runDir }) {
  const manifestPath = path.join(runDir, "manifest.yaml");
  const workflowPath = path.join(runDir, "workflow.yaml");
  if (!fs.existsSync(manifestPath)) throw new Error(`manifest.yaml not found in ${runDir}`);
  if (!fs.existsSync(workflowPath)) throw new Error(`workflow.yaml not found in ${runDir}`);
  const manifest = readYamlOrJson(manifestPath);
  const workflow = readYamlOrJson(workflowPath);
  const executionMode =
    manifest.execution_control?.execution_mode || workflow.execution_mode || "planning";
  const autoContinue =
    manifest.execution_control?.auto_continue !== undefined
      ? Boolean(manifest.execution_control.auto_continue)
      : executionMode === "strict_multi_agent";
  const completed = idsFromList(manifest.completed_tasks);
  const blockedTasks = idsFromList(manifest.blocked_tasks);
  const stageStatus = manifest.stage_status || {};
  const isComplete = (id) => completed.has(id) || stageStatus[id] === "completed";
  const activeGates = asArray(manifest.active_gates);
  const blockingIssues = asArray(manifest.blocking_issues);
  const terminalStatuses = new Set(["paused", "completed", "aborted"]);

  if (terminalStatuses.has(manifest.status)) {
    return {
      ok: true,
      blocked: true,
      reason: `pipeline status is ${manifest.status}`,
      canonical_state: "manifest.yaml",
      execution_mode: executionMode,
      auto_continue: autoContinue,
      current_stage: manifest.current_stage,
      next_action: manifest.next_action,
      runnable_tasks: [],
    };
  }
  if (isActiveGateList(activeGates)) {
    return {
      ok: true,
      blocked: true,
      reason: "active_gate",
      active_gates: activeGates,
      canonical_state: "manifest.yaml",
      execution_mode: executionMode,
      auto_continue: autoContinue,
      current_stage: manifest.current_stage,
      next_action: manifest.next_action,
      runnable_tasks: [],
    };
  }
  if (blockingIssues.length > 0) {
    return {
      ok: true,
      blocked: true,
      reason: "blocking_issue",
      blocking_issues: blockingIssues,
      canonical_state: "manifest.yaml",
      execution_mode: executionMode,
      auto_continue: autoContinue,
      current_stage: manifest.current_stage,
      next_action: manifest.next_action,
      runnable_tasks: [],
    };
  }

  const stages = asArray(workflow.stages);
  let stage = stages.find((item) => item.stage_id === manifest.current_stage);
  if (!stage || isComplete(stage.stage_id)) {
    stage = stages.find(
      (item) => !isComplete(item.stage_id) && asArray(item.depends_on).every((dep) => isComplete(dep)),
    );
  }
  if (!stage) {
    return {
      ok: true,
      blocked: false,
      reason: null,
      canonical_state: "manifest.yaml",
      execution_mode: executionMode,
      auto_continue: autoContinue,
      current_stage: manifest.current_stage,
      next_action: "no runnable stage found",
      runnable_tasks: [],
    };
  }

  const tasks = asArray(stage.tasks).map((taskPath) => readTaskCard(runDir, taskPath));
  const runnable = tasks.filter((task) => {
    if (completed.has(task.task_id) || blockedTasks.has(task.task_id)) return false;
    return asArray(task.depends_on).every((dep) => isComplete(dep));
  });
  const parallelRunnable = runnable.filter((task) => task.can_run_parallel);
  const selected =
    executionMode === "strict_multi_agent" && parallelRunnable.length > 1 ? parallelRunnable : runnable.slice(0, 1);

  return {
    ok: true,
    blocked: false,
    reason: null,
    canonical_state: "manifest.yaml",
    execution_mode: executionMode,
    auto_continue: autoContinue,
    current_stage: stage.stage_id,
    next_action: selected.length
      ? `dispatch ${selected.map((task) => task.task_id).join(", ")}`
      : `complete or inspect ${stage.stage_id}`,
    dispatch_mode:
      executionMode === "strict_multi_agent" && selected.length > 1 ? "parallel_subagents" : "single_or_sequential",
    runnable_tasks: selected.map((task) => ({
      task_id: task.task_id,
      stage_id: task.stage_id,
      task_card: task.task_card,
      agent_name: task.agent_name,
      called_skill: task.called_skill,
      can_run_parallel: Boolean(task.can_run_parallel),
      input_artifacts: asArray(task.input_artifacts),
      output_artifacts: asArray(task.output_artifacts),
      log_file: task.log_file,
    })),
  };
}

module.exports = {
  WORKFLOW_NAME,
  VALID_ROUTES,
  VALID_EXECUTION_MODES,
  asArray,
  createRun,
  parseArgs,
  readYamlOrJson,
  resolveNextAction,
  validateManifest,
  validateTaskCard,
  validateWorkflow,
  validateWorkflowProposal,
  compileTaskGraph,
  advanceRun,
  buildWorkflow,
  seedTaskCards,
  toYaml,
  relativeToRun,
};
