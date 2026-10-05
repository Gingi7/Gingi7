# NEW PROJECT CHECKLIST

Use before meaningful implementation in a new repository.

## Identity
- [ ] README / North Star states what the product is and is not.
- [ ] Canon/source-of-truth hierarchy is explicit.
- [ ] Current phase and one next executable action are recorded.

## Agent continuity
- [ ] AGENTS.md exists.
- [ ] A new agent can resume without previous chat history.
- [ ] State/handoff/log conventions fit the project's risk/complexity.

## Agent safety
- [ ] GINGI Agent Project Standard **v2.0.0+** is declared.
- [ ] Existing safeguard structure/behavior tests pass.
- [ ] CODEOWNERS protects critical agent/safety/workflow files.
- [ ] Safety workflow is green in CI.

## Project Flow
- [ ] `ops/project-flow.project.json` exists and declares only project-specific context/domains.
- [ ] Project Flow reusable workflow is called using an immutable upstream commit SHA.
- [ ] FAST/FIX/STANDARD/DEEP/SYSTEM/RESEARCH semantics are not redefined locally without a documented reason.
- [ ] DEEP/SYSTEM require Outcome Gate.
- [ ] Domain-specific Definition of Done is encoded where needed.
- [ ] Context routing replaces “read every document” startup behavior.
- [ ] No second editable handoff is created merely for machine state.

## Repository governance
- [ ] Branch protection / ruleset blocks direct writes to `main` where supported.
- [ ] Pull request is required before merge.
- [ ] Required checks include agent safety, project flow and project quality gate where applicable.
- [ ] Force pushes and branch deletion are disabled on `main`.
- [ ] Admin/bypass policy is deliberate and documented for recovery.

## Engineering
- [ ] Stack is chosen for product needs, not agent preference.
- [ ] Tests exist for critical invariants.
- [ ] CI runs those tests.
- [ ] Secrets are externalized.
- [ ] Database migrations are generated separately from production execution.
- [ ] External integrations have replaceable adapters where practical.

## Product-specific
- [ ] Real user/acceptance criterion exists.
- [ ] Mock/demo state is separated from production capability.
- [ ] Legal/privacy/security obligations are documented where relevant.
- [ ] Browser critical path is defined before adding browser automation.

## Before calling it ready
- [ ] Working path is demonstrated end-to-end.
- [ ] Failure/rollback path is known.
- [ ] Handoff/current-state reflects reality.
- [ ] Open risks/blockers are explicit.
- [ ] At least one outcome metric exists for material product work.
