# Ponytail in Co-op Desk

Ponytail is an MIT-licensed instruction package by Dietrich Gebert that guides
coding agents toward smaller, complete changes. Its core is a Markdown prompt,
with adapters that load it into different agents. It does not change the model's
weights or add an application service.

## Installed here

The marked `BEGIN:ponytail` / `END:ponytail` section of the root
[`AGENTS.md`](../AGENTS.md) adapts upstream's compact project rules. It is based on
[upstream AGENTS.md at commit 09c434ab73ca43761c5d8b0c5d341926c2fba710](https://github.com/DietrichGebert/ponytail/blob/09c434ab73ca43761c5d8b0c5d341926c2fba710/AGENTS.md),
reviewed on 2026-10-18. The full upstream MIT notice is retained in
[`THIRD_PARTY_NOTICES.md`](../THIRD_PARTY_NOTICES.md).

This uses the upstream-supported rules-file installation path. The local wording
explicitly protects Co-op Desk's precision, provenance, unknown values, checkpoint
scope and architectural separation. Existing project and generated Next.js
instructions remain in place. No package dependency, executable hook, global
configuration or application source was added.

Start a fresh Codex thread in this repository to load the updated instructions.
Ask it to summarize the Ponytail guidance and the project constraints before a
coding task. Correctly summarizing the rules verifies that they were loaded; it
does not prove future compliance. See the
[official AGENTS.md guide](https://developers.openai.com/codex/guides/agents-md).

This installation has no registered Ponytail commands, persistent mode switches,
automatic repository map, status badge, debt ledger generator or savings tracker.
It provides the core coding policy. You can still request an ordinary diff review
or repository audit in natural language.

## How the policy works

The host reads the root instructions and includes them in the model's context.
The model then uses them while choosing edits and tools. There is no deterministic
optimizer or separate enforcement process that rejects large patches.

The intended decision sequence is:

1. Read the task, affected implementation and callers; establish the full scope.
2. Drop extra features the task does not require.
3. Search for an existing project implementation or pattern and reuse it.
4. Otherwise try standard-library/platform capabilities, then installed packages.
5. Write custom code only where those choices cannot fully satisfy the task.
6. Preserve edge cases and safeguards; update every affected consumer.
7. Check nontrivial behavior, disclose unverified work, and mark known shortcuts
   with a concrete condition for replacing them.

Existing project conventions take priority within that choice: an established
accessible dialog should be reused rather than replaced merely to reduce lines.
The goal is less unnecessary implementation and maintenance, not dense one-liners.

## Full plugin path, if needed later

Upstream also packages six skills: `ponytail`, `ponytail-review`,
`ponytail-audit`, `ponytail-debt`, `ponytail-gain` and `ponytail-help`.
Its [Codex manifest](https://github.com/DietrichGebert/ponytail/blob/main/.codex-plugin/plugin.json)
points at the skills and a shared hook configuration. These were researched but
are not installed by this project change.

The [upstream installation guide](https://github.com/DietrichGebert/ponytail/blob/main/INSTALL.md)
documents:

```sh
codex plugin marketplace add DietrichGebert/ponytail
codex plugin add ponytail@ponytail
```

It then instructs users to review/trust hooks in `/hooks` and start a new thread;
the desktop app may require a restart. Those commands were not executed here.
Before switching to that path, reconcile or remove the local Ponytail block so
static guidance does not duplicate or contradict dynamic modes. Keep the Co-op
Desk and Next.js instructions.

The reviewed [hook manifest](https://github.com/DietrichGebert/ponytail/blob/main/hooks/claude-codex-hooks.json)
lists three events even though the install prose still says “two” hooks:

| Event              | Source behavior                                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SessionStart`     | Loads the configured mode, emits its instructions, and attempts a repository map with a three-second timeout. On compaction it attempts to retain the current mode. |
| `UserPromptSubmit` | Recognizes mode commands, updates runtime state, and emits the changed rules for Codex. It does not inject the entire policy on every ordinary Codex prompt.        |
| `SubagentStart`    | Supplies active instructions to spawned agents, optionally filtered by agent type. Actual delivery depends on the host's support.                                   |

Source: [activation](https://github.com/DietrichGebert/ponytail/blob/main/hooks/ponytail-activate.js),
[mode tracking](https://github.com/DietrichGebert/ponytail/blob/main/hooks/ponytail-mode-tracker.js),
[subagent injection](https://github.com/DietrichGebert/ponytail/blob/main/hooks/ponytail-subagent.js).
Node.js and the expected host events/environment are needed for this executable
path. Hook failures are often suppressed so coding can continue, which also means
missing activation can be easy to overlook.

Upstream defines `lite` as implementing the request while proposing a smaller
alternative, `full` as applying the core policy, and `ultra` as also challenging
unjustified scope. `off` disables plugin activation; it cannot remove instructions
already supplied by this repository's static `AGENTS.md`.

## Useful example here

Suppose a new source supplies a posting's start month and year but no day. A good
Ponytail-guided change first checks the existing canonical precision/evidence
types and ingestion helpers, adds only the necessary adapter mapping, and tests
that the missing day remains unknown. Existing card formatting then displays the
result. It should not add a second date model, a new date library, a provider
framework or an AI normalization step. This is a proposed use case, not a change
to the connector implementation in this task.

## Drawbacks and easily missed limits

- **Guidance can be ignored.** Instructions influence generated choices; they
  cannot prove correctness, prevent hallucinations or replace review and tests.
- **The smallest diff can hide future costs.** Reusing a flawed helper can spread
  its limitations. A legitimate requirement for extensibility, performance or
  operational recovery must be stated and evaluated, not dismissed as extra work.
- **Native capabilities have tradeoffs.** Browser widgets, date parsing and
  platform APIs vary in behavior, precision and accessibility. Fewer lines alone
  are insufficient grounds for choosing them.
- **Prompt interaction matters.** Global and nested instructions, host limits,
  stale sessions and repeated plugin/static rules can weaken or contradict the
  intended policy. A new thread is the cleanest loading check.
- **No automatic debt follow-through here.** A `shortcut:` comment is searchable
  documentation, not a scheduled reminder, assigned issue or tracked obligation.
- **Plugin operation has more moving parts.** Runtime state, Node discovery,
  host compatibility and suppressed hook errors affect activation. Mode commands
  and subagent behavior are not portable guarantees across hosts.
- **Efficiency is task-dependent.** Upstream publishes author-run benchmarks on
  particular models/tasks. Those are not measurements of Codex in this repository.
  Extra reading and checking may increase time on small tasks; instruction tokens
  also have a cost. No local savings or security guarantee has been established.
- **Pinned rules do not update themselves.** This adaptation will not receive
  upstream fixes automatically. Review changes and license terms before updating.

To evaluate it, compare representative tasks using the same model and settings,
with and without the policy, over repeated runs. Assess behavior, review defects,
maintenance clarity, elapsed time and token cost together; changed line count
alone is not a quality measure.

## Updating or removing

Review upstream's compact rules at a specific commit, merge only relevant changes
into the marked block, and update its source link and this document. Keep the
license notice for retained upstream material. To disable this project setup,
remove only the marked Ponytail block and its README reference, then start a new
thread. This setup has no external runtime state to clean up.
