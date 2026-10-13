import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ORCHESTRATOR_RULES = `Delegate subtasks to specialized agents using pi-agents tools (agent_spawn, agent_spawn_graph, agent_send, agent_wait).
- Perform the first 2 to 3 targeted searches yourself with read, grep, find, or ls. Delegate only when the scope is broad enough to saturate context, requires parallel execution, or demands an independent second opinion.
- Select delegated roles strictly by deliverable type:
  - explore: Codebase mapping, symbol discovery, and evidence gathering. Never assign file edits or writes to explore.
  - worker: Bounded implementation and file modifications within explicit scope and ownership.
  - verifier: Adversarial code review, audit, and test execution. Never assign file modifications to verifier.
- For multi-step implementation workflows, chain roles via agent_spawn_graph in sequence: explore -> worker -> verifier.
- Prompts for child agents must be fully self-contained with explicit objective, scope, file paths, constraints, and acceptance criteria. Child agents have no access to parent chat history.
- Always review child results and evidence upon completion before delivering the final response.`;

const AGENT_PROFILES = ["explore.md", "worker.md", "verifier.md"];

function getAgentDirs(): string[] {
  const dirs: string[] = [];
  const home = process.env.HOME || os.homedir();

  // Pi agent directory
  const piDir = process.env.PI_CODING_AGENT_DIR || path.join(home, ".pi", "agent");
  dirs.push(path.join(piDir, "agents"));

  // PiG agent directory if ~/.pig exists or env var is set
  const pigBase = process.env.PIG_CODING_AGENT_DIR || path.join(home, ".pig", "agent");
  if (process.env.PIG_CODING_AGENT_DIR || fs.existsSync(path.join(home, ".pig"))) {
    dirs.push(path.join(pigBase, "agents"));
  }

  return dirs;
}

function syncAgentProfiles(force = false): { targetDir: string; synced: string[] }[] {
  const sourceDir = path.resolve(__dirname, "../agents");
  if (!fs.existsSync(sourceDir)) {
    return [];
  }

  const results: { targetDir: string; synced: string[] }[] = [];

  for (const targetDir of getAgentDirs()) {
    const synced: string[] = [];
    try {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      for (const file of AGENT_PROFILES) {
        const srcPath = path.join(sourceDir, file);
        const dstPath = path.join(targetDir, file);

        if (fs.existsSync(srcPath)) {
          if (force || !fs.existsSync(dstPath)) {
            fs.copyFileSync(srcPath, dstPath);
            synced.push(file);
          }
        }
      }
    } catch {
      // Ignore directory access errors gracefully
    }
    results.push({ targetDir, synced });
  }

  return results;
}

export default function (pi: ExtensionAPI) {
  // Sync profiles on startup
  syncAgentProfiles(false);

  // Command to manually re-sync or update agent profiles
  pi.registerCommand("orquestador-sync", {
    description: "Sincroniza los perfiles de explore, worker y verifier en ~/.pi/agent/agents",
    handler: async (_args, ctx) => {
      const outcome = syncAgentProfiles(true);
      const summary = outcome
        .map((o) => `${o.targetDir}: ${o.synced.join(", ") || "al día"}`)
        .join("\n");
      ctx.ui.notify(`Perfiles de agentes actualizados:\n${summary}`, "info");
    },
  });

  // Inject orchestrator guidance before every agent run
  pi.on("before_agent_start", (event) => {
    if (event.systemPromptOptions && event.systemPromptOptions.sections) {
      event.systemPromptOptions.sections.agent_delegation = ORCHESTRATOR_RULES;
    }
  });
}
