# Issue tracker: GitHub

Issues and specs live in https://github.com/vladimirgorshunov/v15v/issues.
Use the `gh` CLI from this repository.

## Conventions

- Before creating issues, verify the target with `gh repo view --json nameWithOwner`.
  It must be `vladimirgorshunov/v15v`; never file into the skills source repository.
- Create: `gh issue create --title "..." --body "..."`.
  Use `--body-file <path>` for multiline bodies.
- Read: `gh issue view <number> --json number,title,body,labels,comments`.
- List: `gh issue list --state open --json number,title,body,labels`.
  Apply `--label` and `--state` filters as needed.
- Comment: `gh issue comment <number> --body "..."`.
- Labels: `gh issue edit <number> --add-label "..." --remove-label "..."`.
- Close: comment with the explanation first, then `gh issue close <number>`.
  Comment separately even when the issue is already closed.

## Parent issues and blockers

Use GitHub native sub-issues and issue dependencies when available.
On gh 2.94+, use `gh issue edit <parent> --add-sub-issue <child>`
and `gh issue edit <child> --add-blocked-by <blocker>`.

On older clients, use the GitHub API:
- Sub-issue: POST `repos/vladimirgorshunov/v15v/issues/<parent>/sub_issues`
  with `sub_issue_id=<child database id>`.
- Dependency: POST `repos/vladimirgorshunov/v15v/issues/<child>/dependencies/blocked_by`
  with `issue_id=<blocker database id>`.

Get database IDs with
`gh api repos/vladimirgorshunov/v15v/issues/<number> --jq .id`.
These are not issue numbers or node IDs.

If native relationships are unavailable, put `Part of #<parent>` and
`Blocked by: #<number>, #<number>` at the top of the child body.
A ticket is startable only when every blocker is closed.

## Pull requests as a triage surface

**PRs as a request surface: no.**

## Skill operations

- "Publish to the issue tracker": create a GitHub issue.
- "Fetch the relevant ticket": read the GitHub issue.

## Wayfinding operations

- Map: one issue labeled `wayfinder:map`, containing Notes, Decisions-so-far,
  and Fog.
- Children: link tickets as sub-issues; otherwise use a task list in the map
  and `Part of #<map>` in each child.
- Types: `wayfinder:research`, `wayfinder:prototype`, `wayfinder:grilling`,
  or `wayfinder:task`.
- Frontier: open children in map order, excluding assigned or blocked tickets.
- Claim: `gh issue edit <number> --add-assignee @me`.
- Resolve: comment with the answer, close the ticket, and append a gist and
  link to the map's Decisions-so-far.
