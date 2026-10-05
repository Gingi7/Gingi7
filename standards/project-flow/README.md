# GINGI Project Flow v2

This directory is the executable cross-project workflow layer for **GINGI Agent Project Standard v2.0.0**.

## Architecture

The standard is split deliberately:

- **central upstream** — this repository owns the engine, base modes, contract semantics, metrics and reusable CI;
- **project adapter** — each product repository owns only `ops/project-flow.project.json`, its domain routing and stricter Definition of Done;
- **project canon** — product-specific AGENTS, safeguards, ADRs, evidence, contracts and handoff remain authoritative.

Projects must not copy and independently edit the engine. They should call the reusable workflow by an **immutable commit SHA**.

## Modes

`FAST / FIX / STANDARD / DEEP / SYSTEM / RESEARCH`

Heavy process is risk-based, not automatic. FAST stays fast. FIX requires reproduction/root cause/regression coverage. DEEP and SYSTEM require Outcome Gate plus critic/convergence.

## Project config

Copy the *shape*, not the engine, from `project-config.example.json` into:

`ops/project-flow.project.json`

The project config declares:
- additional core context,
- domain paths/keywords,
- domain-specific canonical documents,
- stricter domain Definition of Done,
- optional classifier thresholds/signals.

## Reusable workflow

Consumer repositories use:

```yaml
jobs:
  project-flow:
    uses: Gingi7/Gingi7/.github/workflows/project-flow-reusable.yml@<IMMUTABLE_COMMIT_SHA>
    with:
      config_path: ops/project-flow.project.json
```

The reusable workflow checks out the **same upstream commit that contains the workflow** using `github.workflow_sha`, then runs the engine against the caller repository.

## Outcome Gate

DEEP/SYSTEM contracts must define:

`problem → outcome → metric → cheapest_valid_change`

The gate exists to stop agents from rebuilding systems when a smaller verified change can achieve the outcome.

## Metrics

The engine emits the immediately measurable layer: mode, domains, changed-file count and CONTEXT_LOAD. TTF, TTP, acceptance, rework, interventions, spec drift and business impact require lifecycle events and must not be fabricated from one CI run.
