import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const ENGINE_DIR = path.dirname(fileURLToPath(import.meta.url));
const BASE_PATH = path.join(ENGINE_DIR, "base.v2.json");

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalize(value) {
  return String(value || "").toLowerCase();
}

function parseFiles(value = "") {
  return String(value)
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function arg(name, fallback = "") {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] ?? fallback : fallback;
}

function rootFromArgs() {
  return path.resolve(arg("--root", process.cwd()));
}

export function loadBase() {
  return JSON.parse(fs.readFileSync(BASE_PATH, "utf8"));
}

export function loadProjectConfig(root, configPath = "ops/project-flow.project.json") {
  const resolved = path.resolve(root, configPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Missing project config: ${path.relative(root, resolved)}`);
  }
  return JSON.parse(fs.readFileSync(resolved, "utf8"));
}

export function mergeConfig(base, project) {
  const baseClassification = base.classification || {};
  const projectClassification = project.classification || {};
  const signals = {};
  for (const mode of Object.keys(base.modes)) {
    signals[mode] = unique([
      ...(baseClassification.signals?.[mode] || []),
      ...(projectClassification.signals?.[mode] || [])
    ]);
  }

  return {
    ...base,
    project: project.project,
    standard_version: project.standard_version,
    core_context: unique([...(base.core_context || []), ...(project.core_context || [])]),
    domains: project.domains || {},
    classification: {
      ...baseClassification,
      ...projectClassification,
      signals
    },
    definition_of_done: {
      ...base.definition_of_done,
      global: unique([
        ...(base.definition_of_done?.global || []),
        ...(project.definition_of_done || [])
      ])
    }
  };
}

function pathMatches(file, pattern) {
  if (!pattern) return false;
  return file === pattern || file.startsWith(pattern);
}

export function detectDomains(task = "", files = [], config) {
  const haystack = normalize(task);
  const domains = [];
  for (const [name, domain] of Object.entries(config.domains || {})) {
    const keywordHit = (domain.keywords || []).some((keyword) => haystack.includes(normalize(keyword)));
    const pathHit = files.some((file) => (domain.paths || []).some((pattern) => pathMatches(file, pattern)));
    if (keywordHit || pathHit) domains.push(name);
  }
  return domains;
}

export function routeContext(task = "", files = [], config) {
  const domains = detectDomains(task, files, config);
  const domainContext = domains.flatMap((name) => config.domains[name].context || []);
  return unique([...(config.core_context || []), ...domainContext]);
}

function hasSignal(task, signals = []) {
  const haystack = normalize(task);
  return signals.some((signal) => haystack.includes(normalize(signal)));
}

export function classifyTask(task = "", files = [], config) {
  const explicit = normalize(task).match(/\b(fast|fix|standard|deep|system|research)\b/);
  const domains = detectDomains(task, files, config);
  let mode;

  if (explicit) {
    mode = explicit[1].toUpperCase();
  } else {
    for (const candidate of config.classification.priority || []) {
      if (hasSignal(task, config.classification.signals?.[candidate])) {
        mode = candidate;
        break;
      }
    }
  }

  if (!mode && (
    domains.length >= (config.classification.deep_if_domains_at_least ?? 3) ||
    files.length >= (config.classification.deep_if_changed_files_at_least ?? 12)
  )) {
    mode = "DEEP";
  }

  if (!mode && files.length > 0 && files.length <= 3) {
    const extensions = config.classification.fast_extensions || [];
    const fastPaths = files.every((file) => extensions.includes(path.extname(file)));
    if (fastPaths) mode = "FAST";
  }

  if (!mode) mode = "STANDARD";

  const context = routeContext(task, files, config);
  const modeConfig = config.modes[mode];
  return {
    mode,
    domains,
    context,
    context_load: context.length,
    required_steps: modeConfig.required_steps,
    contract_required: modeConfig.contract_required,
    outcome_gate_required: modeConfig.outcome_gate_required,
    independent_review: modeConfig.independent_review
  };
}

export function validateConfig(root, config) {
  const errors = [];
  if (!config.project) errors.push("Missing project name.");
  if (config.standard_version !== config.version) {
    errors.push(`Project standard_version ${config.standard_version || "missing"} does not match engine ${config.version}.`);
  }

  for (const mode of ["FAST", "FIX", "STANDARD", "DEEP", "SYSTEM", "RESEARCH"]) {
    if (!config.modes[mode]) errors.push(`Missing mode: ${mode}`);
  }

  const refs = unique([
    ...(config.core_context || []),
    ...Object.values(config.domains || {}).flatMap((domain) => domain.context || [])
  ]);

  for (const ref of refs) {
    if (!fs.existsSync(path.join(root, ref))) {
      errors.push(`Missing context reference: ${ref}`);
    }
  }

  return errors;
}

export function validateContract(contract, config) {
  const errors = [];
  for (const field of config.task_contract.base_required_fields) {
    if (contract[field] == null || contract[field] === "" || (Array.isArray(contract[field]) && contract[field].length === 0)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (contract.mode && !config.modes[contract.mode]) {
    errors.push(`Unknown mode: ${contract.mode}`);
  }

  if (contract.mode && config.modes[contract.mode]?.outcome_gate_required) {
    for (const field of config.outcome_gate.required_fields) {
      if (contract[field] == null || contract[field] === "") {
        errors.push(`Outcome Gate missing: ${field}`);
      }
    }
  }

  if (contract.mode === "RESEARCH") {
    for (const field of config.task_contract.research_required_fields) {
      if (contract[field] == null || contract[field] === "" || (Array.isArray(contract[field]) && contract[field].length === 0)) {
        errors.push(`Research contract missing: ${field}`);
      }
    }
  }

  if (contract.mode === "SYSTEM") {
    for (const field of config.task_contract.system_required_fields) {
      if (contract[field] == null || contract[field] === "") {
        errors.push(`System contract missing: ${field}`);
      }
    }
  }
  return errors;
}

function git(root, args, fallback = null) {
  try {
    return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
  } catch {
    return fallback;
  }
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function projectDoD(result, config) {
  return unique([
    ...(config.definition_of_done?.global || []),
    ...result.domains.flatMap((name) => config.domains[name].definition_of_done || [])
  ]);
}

function reportMarkdown(report) {
  const domains = report.domains.length ? report.domains.join(", ") : "none";
  return `# GINGI Project Flow report

- **Project:** ${report.project}
- **Standard:** ${report.standard_version}
- **Mode:** ${report.mode}
- **Domains:** ${domains}
- **Changed files:** ${report.changed_files.length}
- **CONTEXT_LOAD:** ${report.context_load}
- **Contract required:** ${report.contract_required ? "yes" : "no"}
- **Outcome Gate:** ${report.outcome_gate_required ? "required" : "not required"}
- **Independent review:** ${report.independent_review ? "required" : "not required"}

## Routed context
${report.context.map((item) => `- \`${item}\``).join("\n")}

## Required flow
${report.required_steps.map((item) => `- ${item}`).join("\n")}

## Definition of Done
${report.definition_of_done.map((item) => `- ${item}`).join("\n")}
`;
}

function buildRuntime(root, configPath) {
  const base = loadBase();
  const project = loadProjectConfig(root, configPath);
  return mergeConfig(base, project);
}

function readFilesArg(root) {
  const filesFile = arg("--files-file");
  if (filesFile) return parseFiles(fs.readFileSync(path.resolve(root, filesFile), "utf8"));
  return parseFiles(arg("--files"));
}

function writeReport(root, configPath, task, files, outDir) {
  const config = buildRuntime(root, configPath);
  const result = classifyTask(task, files, config);
  const report = {
    generated_at: new Date().toISOString(),
    project: config.project,
    standard_version: config.version,
    task_hint: task || null,
    changed_files: files,
    ...result,
    definition_of_done: projectDoD(result, config)
  };
  ensureDir(outDir);
  fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2) + "\n");
  fs.writeFileSync(path.join(outDir, "report.md"), reportMarkdown(report));
  return report;
}

function writeState(root, outDir) {
  ensureDir(outDir);
  const state = {
    generated_at: new Date().toISOString(),
    sha: git(root, ["rev-parse", "HEAD"]),
    branch: git(root, ["rev-parse", "--abbrev-ref", "HEAD"]),
    last_commit: git(root, ["log", "-1", "--pretty=format:%H|%cI|%s"]),
    dirty_count: parseFiles(git(root, ["status", "--porcelain"], "") || "").length
  };
  fs.writeFileSync(path.join(outDir, "project-state.json"), JSON.stringify(state, null, 2) + "\n");
  fs.writeFileSync(path.join(outDir, "project-state.md"), `# Machine project state

- **SHA:** ${state.sha || "unavailable"}
- **Branch:** ${state.branch || "unavailable"}
- **Generated:** ${state.generated_at}
- **Last commit:** ${state.last_commit || "unavailable"}
- **Dirty entries:** ${state.dirty_count}
`);
  return state;
}

async function main() {
  const command = process.argv[2] || "help";
  const root = rootFromArgs();
  const configPath = arg("--config", "ops/project-flow.project.json");
  const config = buildRuntime(root, configPath);

  if (command === "check") {
    const errors = validateConfig(root, config);
    if (errors.length) {
      console.error(errors.join("\n"));
      process.exit(1);
    }
    console.log(`GINGI Project Flow ${config.version}: PASS (${config.project})`);
    return;
  }

  const task = arg("--task", process.env.TASK_HINT || "");
  const files = readFilesArg(root);

  if (command === "classify") {
    console.log(JSON.stringify(classifyTask(task, files, config), null, 2));
    return;
  }

  if (command === "context") {
    console.log(routeContext(task, files, config).join("\n"));
    return;
  }

  if (command === "report") {
    const outDir = path.resolve(root, arg("--out", "artifacts/project-flow"));
    console.log(JSON.stringify(writeReport(root, configPath, task, files, outDir), null, 2));
    return;
  }

  if (command === "state") {
    const outDir = path.resolve(root, arg("--out", "artifacts/project-flow"));
    console.log(JSON.stringify(writeState(root, outDir), null, 2));
    return;
  }

  if (command === "validate-contract") {
    const contractPath = process.argv[3];
    if (!contractPath) throw new Error("Usage: validate-contract <path>");
    const contract = JSON.parse(fs.readFileSync(path.resolve(root, contractPath), "utf8"));
    const errors = validateContract(contract, config);
    if (errors.length) {
      console.error(errors.join("\n"));
      process.exit(1);
    }
    console.log("Task contract: PASS");
    return;
  }

  console.log(`Usage:
  node project-flow.mjs check --root <repo>
  node project-flow.mjs classify --root <repo> --task "..." [--files a,b]
  node project-flow.mjs context --root <repo> --task "..." [--files a,b]
  node project-flow.mjs report --root <repo> [--files-file path] [--out dir]
  node project-flow.mjs state --root <repo> [--out dir]
  node project-flow.mjs validate-contract path/to/task.json --root <repo>`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error?.stack || String(error));
    process.exit(1);
  });
}
