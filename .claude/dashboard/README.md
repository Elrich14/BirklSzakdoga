# Pipeline dashboard

Live view of which agent is working, where the pipeline is, and when it is
waiting for you.

## Run it

From the project root:

```bash
npm run dashboard
```

That starts the server and opens your browser at <http://localhost:3099>.
Leave it running in its own terminal; stop it with `Ctrl+C`.

It is zero-dependency — Node's `http` and `fs` only — and it never writes
anything. Starting it twice is harmless: the second one notices the first and
exits.

### It starts by itself in VS Code

`.vscode/tasks.json` has a `folderOpen` task, so the dashboard comes up whenever
you open the project. The first time, VS Code asks whether to allow automatic
tasks — say yes, or run `Tasks: Allow Automatic Tasks` from the command palette.

To watch it beside your code: `Ctrl+Shift+P` → `Simple Browser: Show` →
`http://localhost:3099`. It docks as an editor tab.

## See it work right now

```bash
npm run dashboard:demo
```

Demo mode loops a scripted run: every agent takes a turn, both gates fire, the
fix loop increments. Nothing touches the real status file. This is the fastest
way to check the thing works before a real task exists.

Port is `3099`, or set `KERIAN_DASHBOARD_PORT`.

## How it updates

```
orchestrate-feature  →  status.js  →  .claude/state/pipeline-status.json
                                              ↓  polled every 400ms
                                      server.js  →  SSE  →  browser
```

The orchestrator calls `status.js` before dispatching an agent, after it returns,
and on every step change. The server polls the JSON file and pushes changes over
Server-Sent Events, so the page updates without a refresh and reconnects by
itself if you restart the server.

Polling rather than `fs.watch` is deliberate: `fs.watch` is unreliable on Windows
and misses writes from editors that replace a file instead of writing in place.

## Updating status by hand

Useful for debugging the dashboard itself:

```bash
node .claude/dashboard/status.js task=my-task step=2 "backend-engineer=working:adding the route"
node .claude/dashboard/status.js backend-engineer=done step=3 test-engineer=working
node .claude/dashboard/status.js gate=report orchestrator=waiting
node .claude/dashboard/status.js reset
```

Keys: `task`, `step` (0–9), `gate` (`contract` | `report` | `none`), `round`,
or any agent name. Agent values are `idle` | `working` | `done` | `blocked` |
`waiting`, optionally followed by `:a short note`.

## Reading the screen

| Signal | Meaning |
|---|---|
| Robot in colour, screen lit, hands typing | working |
| Robot grey, screen dark | idle |
| Robot in colour, calm, "kész" | finished its turn this run |
| Amber card, "rád vár" | blocked on you |
| Amber corner flag on a pipeline cell | that step is a gate |
| Lit connector line from the orchestrator | that agent is the one currently dispatched |
| Top-right dot green and breathing | the stream is live |
| Red banner | the server is not running |

Each agent keeps its own colour everywhere — card, robot, connector, and the
current pipeline cell — so you can tell who is working at a glance without
reading any text.

The orchestrator sits above the others with a second monitor because it is
working almost the whole time: it dispatches, it verifies, it never hands over
control.

## Resource behaviour

The server does nothing while nobody is watching. The 400ms poll, the demo
timer and the keepalive all return early at zero watchers, so a dashboard you
left running with the tab closed costs an idle Node process and no file reads.

`http://localhost:3099/status` carries a `watchers` field — the number of open
SSE connections. **Check it first when the page looks frozen:** `watchers: 0`
with a tab open means the stream dropped and the page is about to reconnect by
itself (it retries every 2s).

In the browser, only the elapsed counters tick between pushes; the log and the
cards are rebuilt on change, not on a timer, and the tick stops entirely while
the tab is hidden.
