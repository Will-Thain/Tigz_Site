import { readFileSync } from "node:fs";

let input = {};
try {
  input = JSON.parse(readFileSync(0, "utf8"));
} catch {
  input = {};
}

const type = String(
  input.subagent_type ?? input.subagentType ?? input.agent_type ?? input.type ?? "",
);

if (type === "test-engineer") {
  process.stdout.write("{}\n");
  process.exit(0);
}

const message = [
  "A feature subagent just finished.",
  "Delegate to the test-engineer subagent now.",
  "It should add or update colocated Vitest files for the diff, then run npm test.",
  "Do not launch test-engineer again in this loop.",
].join(" ");

process.stdout.write(
  JSON.stringify({
    followup_message: message,
  }) + "\n",
);
