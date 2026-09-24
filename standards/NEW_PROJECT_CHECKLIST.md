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
- [ ] GINGI_AGENT_PROJECT_STANDARD current version installed.
- [ ] `python .claude/check_agent_safety.py` passes.
- [ ] `bash .claude/hooks/guard-test.sh` passes.
- [ ] CODEOWNERS protects agent/safety/workflow files.
- [ ] Safety workflow is green in CI.

## Repository governance
- [ ] Branch protection / ruleset blocks direct writes to `main` where GitHub plan/features allow it.
- [ ] Pull request is required before merge.
- [ ] Required status checks include `agent-safety` plus the project quality gate.
- [ ] Force pushes and branch deletion are disabled on `main`.
- [ ] Admin/bypass policy is deliberate and documented for recovery.

## Engineering
- [ ] Stack is chosen for product needs, not agent preference.
- [ ] Tests exist for critical invariants.
- [ ] CI runs those tests.
- [ ] Secrets are externalized; examples/templates contain no real credentials.
- [ ] Database migrations are generated separately from production execution.
- [ ] External integrations have replaceable adapters where practical.

## Product-specific
- [ ] Real user/acceptance criterion exists.
- [ ] Mock/demo state is clearly separated from production capability.
- [ ] Legal/privacy/security obligations are documented where relevant.
- [ ] Browser critical path is defined before adding Playwright/browser automation.

## Before calling it "ready"
- [ ] Working path is demonstrated end-to-end.
- [ ] Failure/rollback path is known.
- [ ] Handoff/current-state reflects reality.
- [ ] Open risks/blockers are explicit.
