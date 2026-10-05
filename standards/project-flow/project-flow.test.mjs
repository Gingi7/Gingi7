import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  classifyTask,
  loadBase,
  mergeConfig,
  routeContext,
  validateContract,
  validateConfig
} from "./project-flow.mjs";

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "gingi-flow-"));
  fs.mkdirSync(path.join(root, "ops"), { recursive: true });
  fs.mkdirSync(path.join(root, "docs"), { recursive: true });
  fs.writeFileSync(path.join(root, "AGENTS.md"), "# agents\n");
  fs.writeFileSync(path.join(root, "SAFEGUARDS.md"), "# safeguards\n");
  fs.writeFileSync(path.join(root, "README.md"), "# project\n");
  fs.writeFileSync(path.join(root, "docs", "frontend.md"), "# frontend\n");
  const project = {
    standard_version: "2.0.0",
    project: "FIXTURE",
    core_context: ["README.md"],
    domains: {
      frontend: {
        paths: ["web/"],
        keywords: ["ui", "frontend"],
        context: ["docs/frontend.md"],
        definition_of_done: ["Browser path is verified."]
      }
    }
  };
  return { root, config: mergeConfig(loadBase(), project) };
}

test("project config validates against existing context", () => {
  const { root, config } = fixture();
  assert.deepEqual(validateConfig(root, config), []);
});

test("frontend path routes only frontend domain context", () => {
  const { config } = fixture();
  const context = routeContext("", ["web/page.js"], config);
  assert.ok(context.includes("AGENTS.md"));
  assert.ok(context.includes("SAFEGUARDS.md"));
  assert.ok(context.includes("README.md"));
  assert.ok(context.includes("docs/frontend.md"));
});

test("bug request becomes FIX", () => {
  const { config } = fixture();
  assert.equal(classifyTask("fix broken login", [], config).mode, "FIX");
});

test("multi-domain threshold can escalate to DEEP", () => {
  const base = loadBase();
  const config = mergeConfig(base, {
    standard_version: "2.0.0",
    project: "X",
    domains: {
      a: { paths: ["a/"], context: [] },
      b: { paths: ["b/"], context: [] },
      c: { paths: ["c/"], context: [] }
    }
  });
  assert.equal(classifyTask("change flow", ["a/x", "b/y", "c/z"], config).mode, "DEEP");
});

test("DEEP contract requires Outcome Gate", () => {
  const { config } = fixture();
  const errors = validateContract({ id: "1", mode: "DEEP", goal: "x", acceptance: ["y"] }, config);
  assert.ok(errors.some((item) => item.includes("Outcome Gate missing")));
});
