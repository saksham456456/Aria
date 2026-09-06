# BRIEFING — 2026-09-06T05:08:00Z

## Mission
Diagnose and fix all regressions in meeting room, POV logic, ARIA audio routing and response rules, ensuring build passes cleanly and Agora SDK functions flawlessly.

## 🔒 My Identity
- Archetype: teamwork_project_orchestrator
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: C:\Users\xyzai\Desktop\Aria-CoTeacher\.agents\project_orchestrator
- Original parent: parent
- Original parent conversation ID: 2b1da26d-2e11-4732-b189-c781fec7de5e

## 🔒 My Workflow
- **Pattern**: Project Pattern (Survey -> Decompose & Interface -> Iteration Loop: Explorer -> Worker -> Reviewer -> Challenger -> Auditor -> Gate)
- **Scope document**: C:\Users\xyzai\Desktop\Aria-CoTeacher\.agents\project_orchestrator\PROJECT.md
1. **Decompose**: Survey codebase via 3 Explorers (git diffs, Agora integration, ARIA agent prompt & backend, meeting room POV logic), establish milestones and interface contracts.
2. **Dispatch & Execute**:
   - **Direct (iteration loop)**: For each milestone: Explorer (strategy) -> Worker (implement & test) -> Reviewer (2x) -> Challenger (2x) -> Auditor (1x) -> Gate.
3. **On failure** (in this order):
   - Retry: nudge stuck agent or re-send task
   - Replace: spawn fresh agent with partial progress
   - Skip: proceed without (only if non-critical, never auditor)
   - Redistribute: split stuck agent's remaining work
   - Redesign: re-partition decomposition
   - Escalate: report to parent (sub-orchestrators only, last resort)
4. **Succession**: At 16 spawns, write handoff.md, spawn successor
- **Work items**:
  1. Survey & Regression Mapping [done]
  2. Milestone 1: Fix Meeting Room & Distinct Teacher/Student POV Logic [done]
  3. Milestone 2: Fix ARIA Listening & Audio Routing [done]
  4. Milestone 3: Set Working Classroom Rules & Prompt Enforcement for ARIA [done]
  5. Milestone 4: End-to-End Validation & Build Stability [done]
- **Current phase**: Complete
- **Current focus**: Handoff and Reporting

## 🔒 Key Constraints
- NEVER write, modify, or create source code files directly.
- NEVER run build/test commands yourself — require workers to do so.
- NEVER investigate or explore the problem at the code level — dispatch Explorers for technical investigation.
- You MAY use file-editing tools ONLY for metadata/state files (.md) in your .agents/ folder.
- DO NOT CHEAT warning must be included in Worker dispatches.
- Hard audit veto on integrity violations.
- User rule: Serverless WebSockets - NEVER attempt to broadcast to Supabase WebSockets from inside Next.js serverless route/edge function. Return payload in API response for browser broadcast.
- User rule: Zod Coercion - use z.coerce.number(). Zod Defaults - add .default([]) and .default('').
- Never reuse a subagent after it has delivered its handoff — always spawn fresh.

## Current Parent
- Conversation ID: 2b1da26d-2e11-4732-b189-c781fec7de5e
- Updated: 2026-09-06T06:10:00Z

## Key Decisions Made
- Dispatched initial survey with 3 parallel explorers to investigate git history, Agora room/POV logic, ARIA agent audio subscription, and prompt/backend rules.
- Consolidated R1, R2, and R3 into a single unified implementation milestone executed by worker_m1.
- Executed 5-agent independent verification (2 Reviewers, 2 Challengers, 1 Forensic Auditor).
- Resolved test harness parameter type narrowness via worker_m1_testfix and verified unanimous APPROVE via Reviewer 2 Gen 3.

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|
| explorer_survey_git | teamwork_preview_explorer | Survey git log & regressions | completed | b48a2773-14aa-4735-a6ad-f3f253930db5 |
| explorer_survey_room | teamwork_preview_explorer | Survey meeting room & POV logic | completed | b43eee9c-78cd-414c-b3fe-cf27d0f81776 |
| explorer_survey_aria | teamwork_preview_spec_miner | Survey ARIA audio & rules | completed | 9bbb793d-8cb1-491f-a729-ceb02feedf95 |
| worker_m1 | teamwork_preview_worker | Complete Multi-Agent Regression Fixes | completed | 16bc8c56-556b-40b3-936f-3edda818d948 |
| reviewer_1 | teamwork_preview_reviewer | Primary Code Review | completed | 2dfac4a4-b881-41e1-9894-9ef91cb10c30 |
| reviewer_2 | teamwork_preview_reviewer | Secondary Code Review | completed | b91b5376-5250-4dba-bd02-2cda28d37f37 |
| challenger_1 | teamwork_preview_challenger | Meeting Room Adversarial Verification | completed | a62e9a15-575b-4151-9877-c3bc9d9df73c |
| challenger_2 | teamwork_preview_challenger | ARIA Behavior Adversarial Verification | completed | f25498fc-e0c5-4e47-ae44-f1df00387760 |
| auditor_1 | teamwork_preview_auditor | Forensic Integrity Audit | completed | 1a87f856-d7c2-47ed-bf7c-cd6b1df7a223 |
| reviewer_2_gen2 | teamwork_preview_reviewer | Secondary Code Review (Gen 2) | completed | 4ecdf625-0437-468c-b4db-660a66b3c8c7 |
| worker_m1_testfix | teamwork_preview_worker | Test TypeScript Type Fix | completed | 5d63f6d1-e30b-46d6-b10d-ee7f163e488e |
| reviewer_2_gen3 | teamwork_preview_reviewer | Secondary Code Review (Gen 3) | completed | ed721b3f-1833-4c22-99f4-ed2f11d4f301 |

## Succession Status
- Succession required: no
- Spawn count: 12 / 16
- Pending subagents: none
- Predecessor: none
- Successor: not required (mission complete)

## Active Timers
- Heartbeat cron: cd53af4b-cf74-4b7b-8411-f9c5669ec74b/task-14 (*/10 * * * *)
- Safety timer: covered by heartbeat cron
- On succession: kill all timers before spawning successor
- On context truncation: run `manage_task(Action="list")` — re-create if missing

## Artifact Index
- C:\Users\xyzai\Desktop\Aria-CoTeacher\.agents\project_orchestrator\PROJECT.md — Global architecture, milestones, interface contracts
- C:\Users\xyzai\Desktop\Aria-CoTeacher\.agents\project_orchestrator\progress.md — Liveness heartbeat and milestone tracking
- C:\Users\xyzai\Desktop\Aria-CoTeacher\.agents\ORIGINAL_REQUEST.md — Authoritative user request
