# GITHUB MAIN-BRANCH PROTECTION STANDARD

The local agent guard is not sufficient on its own. Active repositories should also protect the canonical branch at GitHub level.

## Recommended minimum

For `main` / canonical production branch, where the repository plan and GitHub features support it:

1. require changes through a pull request;
2. require `agent-safety` to pass;
3. require the project's normal quality/CI gate to pass;
4. block force pushes;
5. block branch deletion;
6. keep bypass/admin behavior explicit and limited to recovery;
7. use CODEOWNERS for `AGENTS.md`, `SAFEGUARDS.md`, `CLAUDE.md`, `.claude/**` and workflow files.

## Solo-owner note

A single-owner repository does not necessarily need a mandatory human approval count. The key protection is to prevent accidental direct writes and force a reviewable PR + automated checks. If a second trusted reviewer exists, required approvals can be raised later.

## Recovery

Do not make the repository impossible to recover. Document who can bypass rules in an emergency and require a follow-up PR/incident note after any bypass.

## Verification

This must be verified by a GitHub administrator. The connected ChatGPT GitHub integration does not have branch-protection administration permission and may receive HTTP 403 when reading or changing these settings.
