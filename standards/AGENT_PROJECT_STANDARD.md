# GINGI AGENT PROJECT STANDARD

Current minimum: **v2.0.0**.

This is the cross-project operating standard for repositories developed by humans and AI coding agents. Version 2 keeps the v1.1 safety layer and adds **risk-sized execution, context routing, task contracts, convergence and flow telemetry**.

## Required in every active agent-worked repository

1. `AGENTS.md` — project-specific authority, canon, scope and handoff rules.
2. `SAFEGUARDS.md` — cross-agent safety policy with standard version marker.
3. `CLAUDE.md` — Claude Code entry point importing AGENTS + SAFEGUARDS.
4. tested agent-safety hooks/configuration appropriate to the repository.
5. CODEOWNERS / ownership visibility for critical process files.
6. project-specific tests and CI quality gates.
7. project continuity/state representation appropriate to the product.
8. `ops/project-flow.project.json` — **thin project adapter** for GINGI Project Flow.
9. a Project Flow workflow calling the central reusable workflow by immutable SHA.

## Core principles

- **Canon before chat memory.**
- **One source of truth per concern.**
- **Owner controls the goal; the orchestrator controls procedure.**
- **Use the smallest valid change that can achieve the outcome.**
- **Reuse before rebuilding.**
- **Evidence over assumption.**
- **Process weight follows risk, not habit.**
- **Agents act only within explicit authority.**
- **Secrets and irreversible operations remain human-controlled.**
- **No direct/force push to protected branches.**
- **No silent production database migration execution.**
- **No floating `@latest` tooling in canonical agent configuration.**
- **Project-specific policy may always be stricter than the shared minimum.**

## Project Flow v2

Every task is classified into one operating mode:

- **FAST** — small low-risk change; targeted verification only.
- **FIX** — defect/regression; reproduce → root cause → regression test.
- **STANDARD** — bounded normal feature; short task contract + acceptance.
- **DEEP** — cross-domain/high-uncertainty work; Outcome Gate, small batches, critic and convergence.
- **SYSTEM** — architecture/security/schema/platform/migration; DEEP controls plus impact and rollback analysis.
- **RESEARCH** — source-backed research with provenance and freshness.

The shared engine and semantics live under [project-flow](project-flow/). Product repositories do **not** fork the engine. They declare only their own context and stricter DoD in `ops/project-flow.project.json`.

## Context routing

Do not read every project document at the start of every task.

Load:
1. shared safety/project instructions,
2. current project handoff/state,
3. only domain documents routed by the task and affected files.

The purpose is to reduce context load and startup time without removing domain authority.

## Outcome Gate

DEEP and SYSTEM work must state:

`problem → outcome → metric → cheapest_valid_change`

This prevents an agent from solving a narrow user problem with an unnecessary rewrite.

## Convergence

DEEP/SYSTEM use:

`implement → critic → compare with acceptance → correct → verify`

“Code written” is not equivalent to “done”. The loop ends only when acceptance passes or a concrete blocker is evidenced.

## Flow telemetry

Repositories should measure at least:
- CONTEXT_LOAD,
- Time To First Green (TTF),
- Time To Production (TTP) when deployment is in scope,
- First Pass Acceptance,
- Rework Ratio,
- Human Interventions,
- Spec Drift,
- a task-specific Business Impact metric.

Do not invent lifecycle metrics from a single CI run.

## Safety layer retained from v1.1

Version 2 does not weaken v1.1. Projects continue to block or require human approval for secrets, unsafe deletion, force/direct protected-branch pushes, destructive Git resets/cleans, unapproved migration execution, remote-script piping and untrusted dependency mutation.

## New repository rule

Do not start substantial implementation until the repository has:
- North Star / README,
- AGENTS + SAFEGUARDS,
- current-state / next-action representation,
- project-flow adapter,
- tests/quality gate appropriate to the stack,
- secret handling,
- branch/PR strategy,
- explicit source-of-truth boundaries.

## Project-specific extensions

Runtime policy engines (JARVIS), privacy/safety constitutions (ARES/AETHER), economic invariants (COST2BITE), production gates (7PRO) and future project constitutions remain authoritative and may add stricter controls.
