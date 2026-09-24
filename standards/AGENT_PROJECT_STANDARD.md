# GINGI AGENT PROJECT STANDARD

Current minimum: **v1.1.0**.

This is the cross-project bootstrap standard for repositories that humans and AI coding agents work on.

## Required in every active agent-worked repository

1. `AGENTS.md` — project-specific authority, read order, scope and handoff rules.
2. `SAFEGUARDS.md` — cross-agent safety policy with version marker.
3. `CLAUDE.md` — Claude Code entry point importing AGENTS + SAFEGUARDS.
4. `.claude/settings.json` — conservative allow-list + PreToolUse enforcement.
5. `.claude/hooks/guard.sh` — tested guard against common irreversible mistakes.
6. `.claude/hooks/guard-test.sh` — behavioral regression suite.
7. `.claude/check_agent_safety.py` — standard-integrity checker.
8. `.github/CODEOWNERS` — owner visibility for critical process files.
9. `.github/workflows/agent-safety.yml` — CI gate using immutable Action SHAs.
10. project continuity/state files appropriate to the product.
11. project-specific tests/quality gates.

## Core principles

- **Canon before chat memory.**
- **One source of truth per concern.**
- **Inspect → plan → implement → verify → record → handoff.**
- **Agents propose/execute only within explicit authority.**
- **Secrets and irreversible operations are human-controlled.**
- **No direct/force push to protected branches.**
- **No silent database migration execution.**
- **No floating `@latest` tooling in canonical agent configuration.**
- **Unknown remote scripts are downloaded and reviewed before execution.**
- **Browser verification is opt-in only when a real frontend critical path exists.**
- **Project-specific policy may be stricter than the minimum standard.**

## Safety v1.1.0 additions

Compared with v1.0, v1.1 additionally blocks:
- any `rm` target outside the repository, even without `-rf`;
- direct remote-script execution such as `curl ... | bash`;
- remote/local branch deletion by agents;
- mass discard via `git restore .` / `git checkout -- .`;
- degradation of the standard itself through a CI integrity checker.

It also requires CODEOWNERS and pins the safety workflow's third-party Action to an immutable commit SHA.

## New repository rule

Do not start substantial implementation until the repository has:
- a North Star / README;
- AGENTS + SAFEGUARDS;
- continuity/current-state + next-action representation;
- tests/quality gate appropriate to the stack;
- secret handling + `.env.example` where applicable;
- branch/PR strategy;
- explicit source-of-truth boundaries.

## Browser/UI add-on

For browser products define a 3–5 step critical path first. Then add a **pinned** Playwright/MCP/browser tool and require PASS/FAIL evidence after material UI changes. Do not install browser automation globally where no browser surface exists.

## Project-specific extensions

Runtime policy engines (for example JARVIS), privacy/safety constitutions (AETHER/ARES), economic invariants (COST2BITE) and production gates (7PRO) remain authoritative and may add stricter controls.
