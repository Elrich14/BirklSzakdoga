#!/usr/bin/env node
/**
 * Writes the pipeline status that the dashboard renders.
 *
 * Usage (every argument is optional, order does not matter):
 *
 *   node .claude/dashboard/status.js task=order-cancellation step=3 \
 *        orchestrator=working "test-engineer=working:writing attack tests" \
 *        backend-engineer=done
 *
 *   node .claude/dashboard/status.js gate=contract
 *   node .claude/dashboard/status.js round=2
 *   node .claude/dashboard/status.js reset
 *
 * Agent states: idle | working | done | blocked | waiting
 * A state may carry a note after a colon.
 */

const fs = require("fs");
const path = require("path");

const STATUS_FILE = path.join(__dirname, "..", "state", "pipeline-status.json");

const AGENT_NAMES = [
  "orchestrator",
  "backend-engineer",
  "frontend-engineer",
  "test-engineer",
  "security-auditor",
  "ui-reviewer",
];

const AGENT_STATES = ["idle", "working", "done", "blocked", "waiting"];

const STEP_NAMES = [
  "Intake",
  "API contract",
  "Backend",
  "Attack",
  "Verification",
  "Frontend",
  "Visual",
  "Security",
  "Finalize",
  "Report",
];

function createEmptyStatus() {
  const agents = {};
  for (const agentName of AGENT_NAMES) {
    agents[agentName] = { state: "idle", note: "", since: null };
  }
  return {
    task: null,
    step: null,
    stepName: null,
    gate: null,
    fixLoopRound: 0,
    startedAt: null,
    updatedAt: new Date().toISOString(),
    agents,
    log: [],
  };
}

function readStatus() {
  try {
    const raw = fs.readFileSync(STATUS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    const base = createEmptyStatus();
    return {
      ...base,
      ...parsed,
      agents: { ...base.agents, ...(parsed.agents || {}) },
      log: Array.isArray(parsed.log) ? parsed.log : [],
    };
  } catch {
    // No status file yet, or it was corrupted — start clean.
    return createEmptyStatus();
  }
}

function appendLogEntry(status, message) {
  status.log.unshift({ at: new Date().toISOString(), message });
  status.log = status.log.slice(0, 12);
}

function applyAgentChange(status, agentName, rawValue) {
  const separatorIndex = rawValue.indexOf(":");
  const state =
    separatorIndex === -1 ? rawValue : rawValue.slice(0, separatorIndex);
  const note = separatorIndex === -1 ? "" : rawValue.slice(separatorIndex + 1);

  if (!AGENT_STATES.includes(state)) {
    throw new Error(
      `Unknown state "${state}" for ${agentName}. Use one of: ${AGENT_STATES.join(", ")}`
    );
  }

  const previous = status.agents[agentName];
  const isNewWorkingSpell = state === "working" && previous.state !== "working";

  status.agents[agentName] = {
    state,
    note: note.trim(),
    since: isNewWorkingSpell ? new Date().toISOString() : previous.since,
  };

  if (previous.state !== state) {
    appendLogEntry(status, `${agentName} → ${state}${note ? ` (${note.trim()})` : ""}`);
  }
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes("reset")) {
    fs.mkdirSync(path.dirname(STATUS_FILE), { recursive: true });
    fs.writeFileSync(
      STATUS_FILE,
      JSON.stringify(createEmptyStatus(), null, 2) + "\n"
    );
    console.log("Pipeline status reset.");
    return;
  }

  const status = readStatus();

  for (const arg of args) {
    const separatorIndex = arg.indexOf("=");
    if (separatorIndex === -1) {
      throw new Error(`Expected key=value, got "${arg}"`);
    }
    const key = arg.slice(0, separatorIndex);
    const value = arg.slice(separatorIndex + 1);

    if (AGENT_NAMES.includes(key)) {
      applyAgentChange(status, key, value);
      continue;
    }

    switch (key) {
      case "task":
        if (status.task !== value) {
          status.startedAt = new Date().toISOString();
          status.log = [];
          appendLogEntry(status, `task started: ${value}`);
        }
        status.task = value;
        break;
      case "step": {
        const stepNumber = Number(value);
        if (!Number.isInteger(stepNumber) || stepNumber < 0 || stepNumber > 9) {
          throw new Error(`step must be 0-9, got "${value}"`);
        }
        if (status.step !== stepNumber) {
          appendLogEntry(status, `step ${stepNumber} — ${STEP_NAMES[stepNumber]}`);
        }
        status.step = stepNumber;
        status.stepName = STEP_NAMES[stepNumber];
        break;
      }
      case "gate":
        status.gate = value === "none" ? null : value;
        if (status.gate) {
          appendLogEntry(status, `gate: waiting for user (${status.gate})`);
        }
        break;
      case "round":
        status.fixLoopRound = Number(value) || 0;
        if (status.fixLoopRound > 0) {
          appendLogEntry(status, `fix loop round ${status.fixLoopRound}/3`);
        }
        break;
      default:
        throw new Error(
          `Unknown key "${key}". Valid: task, step, gate, round, or an agent name.`
        );
    }
  }

  status.updatedAt = new Date().toISOString();

  fs.mkdirSync(path.dirname(STATUS_FILE), { recursive: true });
  fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2) + "\n");

  const working = Object.entries(status.agents)
    .filter(([, agent]) => agent.state === "working")
    .map(([agentName]) => agentName);

  console.log(
    `step ${status.step ?? "-"} (${status.stepName ?? "idle"})` +
      ` · working: ${working.length ? working.join(", ") : "nobody"}` +
      (status.gate ? ` · GATE: ${status.gate}` : "")
  );
}

try {
  main();
} catch (error) {
  console.error(`status.js: ${error.message}`);
  process.exit(1);
}
