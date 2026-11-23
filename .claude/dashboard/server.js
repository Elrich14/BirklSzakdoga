#!/usr/bin/env node
/**
 * Kerian pipeline dashboard server.
 *
 *   node .claude/dashboard/server.js           # live — reads .claude/state/pipeline-status.json
 *   node .claude/dashboard/server.js --demo    # scripted run, so you can see it work with no task
 *
 * Then open http://localhost:3099
 * In VS Code: Ctrl+Shift+P → "Simple Browser: Show" → that URL.
 *
 * Zero dependencies — Node's http and fs only.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const PORT = Number(process.env.KERIAN_DASHBOARD_PORT) || 3099;
const STATUS_FILE = path.join(__dirname, "..", "state", "pipeline-status.json");
const INDEX_FILE = path.join(__dirname, "index.html");
const POLL_INTERVAL_MS = 400;

const isDemoMode = process.argv.includes("--demo");
const shouldOpenBrowser = process.argv.includes("--open");

const DASHBOARD_URL = `http://localhost:${PORT}`;

function openInBrowser() {
  const command =
    process.platform === "win32"
      ? `start "" "${DASHBOARD_URL}"`
      : process.platform === "darwin"
        ? `open "${DASHBOARD_URL}"`
        : `xdg-open "${DASHBOARD_URL}"`;

  exec(command, (error) => {
    if (error) {
      console.log(`Could not open a browser automatically — go to ${DASHBOARD_URL}`);
    }
  });
}

const connectedClients = new Set();
let lastSerialisedStatus = null;

// ==================== STATUS SOURCE ====================

function readStatusFromDisk() {
  try {
    return JSON.parse(fs.readFileSync(STATUS_FILE, "utf8"));
  } catch {
    // No task has run yet — the dashboard renders an empty office.
    return null;
  }
}

// ==================== DEMO SCRIPT ====================

const DEMO_STEPS = [
  { step: 0, working: ["orchestrator"], note: "reading the request" },
  { step: 1, working: ["orchestrator", "backend-engineer"], note: "designing the contract" },
  { step: 1, working: [], gate: "contract", note: "waiting for your approval" },
  { step: 2, working: ["orchestrator", "backend-engineer"], note: "implementing" },
  { step: 3, working: ["orchestrator", "test-engineer"], note: "writing attack tests" },
  { step: 4, working: ["orchestrator"], note: "re-running the tests myself" },
  { step: 4, working: ["orchestrator"], note: "mutation spot check", round: 1 },
  { step: 5, working: ["orchestrator", "frontend-engineer"], note: "building the UI" },
  { step: 6, working: ["orchestrator", "ui-reviewer"], note: "both themes, both widths" },
  { step: 7, working: ["orchestrator", "security-auditor"], note: "reviewing the diff" },
  { step: 8, working: ["orchestrator"], note: "finalize-change" },
  { step: 9, working: [], gate: "report", note: "done — your turn" },
];

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

const AGENT_NAMES = [
  "orchestrator",
  "backend-engineer",
  "frontend-engineer",
  "test-engineer",
  "security-auditor",
  "ui-reviewer",
];

let demoIndex = 0;
let demoLog = [];
// Stamped when the frame changes, not when it is read: a timestamp that moves on
// every call would make each poll look like a change and defeat the dedupe.
let demoFrameStampedAt = new Date().toISOString();
let demoStartedAt = new Date().toISOString();

function buildDemoStatus() {
  const frame = DEMO_STEPS[demoIndex];
  const agents = {};

  for (const agentName of AGENT_NAMES) {
    const isWorking = frame.working.includes(agentName);
    let state = "idle";

    if (isWorking) {
      state = "working";
    } else if (frame.gate && agentName === "orchestrator") {
      state = "waiting";
    } else {
      // Anything that already had its turn in this demo run reads as done.
      const firstFrameForAgent = DEMO_STEPS.findIndex((candidate) =>
        candidate.working.includes(agentName)
      );
      if (firstFrameForAgent !== -1 && firstFrameForAgent < demoIndex) {
        state = "done";
      }
    }

    agents[agentName] = {
      state,
      note: isWorking ? frame.note : "",
      since: demoFrameStampedAt,
    };
  }

  return {
    task: "demo — order cancellation",
    step: frame.step,
    stepName: STEP_NAMES[frame.step],
    gate: frame.gate || null,
    fixLoopRound: frame.round || 0,
    startedAt: demoStartedAt,
    updatedAt: demoFrameStampedAt,
    agents,
    log: demoLog,
    demo: true,
  };
}

function advanceDemo() {
  const frame = DEMO_STEPS[demoIndex];
  demoLog.unshift({
    at: new Date().toISOString(),
    message: `step ${frame.step} — ${STEP_NAMES[frame.step]}: ${frame.note}`,
  });
  demoLog = demoLog.slice(0, 12);

  demoIndex += 1;
  if (demoIndex >= DEMO_STEPS.length) {
    demoIndex = 0;
    demoLog = [];
    demoStartedAt = new Date().toISOString();
  }
  demoFrameStampedAt = new Date().toISOString();
}

// ==================== BROADCAST ====================

function currentStatus() {
  return isDemoMode ? buildDemoStatus() : readStatusFromDisk();
}

function broadcast(force) {
  const status = currentStatus();
  const serialised = JSON.stringify(status);

  if (!force && serialised === lastSerialisedStatus) {
    return;
  }
  lastSerialisedStatus = serialised;

  for (const client of connectedClients) {
    client.write(`data: ${serialised}\n\n`);
  }
}

// ==================== SERVER ====================

const server = http.createServer((req, res) => {
  if (req.url === "/" || req.url === "/index.html") {
    fs.readFile(INDEX_FILE, (error, content) => {
      if (error) {
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Could not read index.html");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(content);
    });
    return;
  }

  if (req.url === "/status") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    // `watchers` is diagnostic: the server idles entirely at zero, so this is
    // the first thing to check when the page looks frozen.
    res.end(
      JSON.stringify({ ...currentStatus(), watchers: connectedClients.size })
    );
    return;
  }

  if (req.url === "/events") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.write(`data: ${JSON.stringify(currentStatus())}\n\n`);
    connectedClients.add(res);
    req.on("close", () => connectedClients.delete(res));
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Not found");
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.log(`The dashboard is already running → ${DASHBOARD_URL}`);
    if (shouldOpenBrowser) openInBrowser();
    process.exit(0);
  }
  throw error;
});

server.listen(PORT, () => {
  console.log(`Kerian pipeline dashboard → ${DASHBOARD_URL}`);
  console.log(
    isDemoMode
      ? "Mode: DEMO — scripted run on a loop, no real task needed."
      : `Mode: LIVE — watching ${path.relative(process.cwd(), STATUS_FILE)}`
  );
  console.log("VS Code: Ctrl+Shift+P → Simple Browser: Show → that URL");
  console.log("Stop with Ctrl+C.");
  if (shouldOpenBrowser) openInBrowser();
});

// Polling beats fs.watch here: it is reliable on Windows, survives editors that
// replace the file rather than writing in place, and 400ms is plenty live.
//
// With nobody watching there is nothing to push, so the read is skipped entirely
// and the process costs nothing while the dashboard tab is closed.
setInterval(() => {
  if (connectedClients.size === 0) return;
  broadcast(false);
}, POLL_INTERVAL_MS);

if (isDemoMode) {
  setInterval(() => {
    if (connectedClients.size === 0) return;
    advanceDemo();
    broadcast(true);
  }, 2600);
}

// Keep SSE connections alive through proxies and idle timeouts.
setInterval(() => {
  if (connectedClients.size === 0) return;
  for (const client of connectedClients) {
    client.write(": keepalive\n\n");
  }
}, 25000);
