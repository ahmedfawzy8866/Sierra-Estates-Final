<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent Operational Guidelines
- **Auto-Approval Protocol**: The user has granted permission for agents to proceed with `run_command` or "access" requests automatically if there is no response from the user within 15 seconds.
- **Decision Logic**: If you are confident in your recommendation and the command is safe for the current context (e.g., build scripts, Git operations, environment setup), set `SafeToAutoRun: true` or assume approval after the implied timeout if the platform supports it. 
- **User Mandate**: Do not let the development flow stop for Run/Access approvals unless potentially destructive.
- **Terminology Mandate**: Always use "Investment Stakeholders" (not leads), "Strategic Pipeline" (not CRM), and "Portfolio Assets" (not listings) in both code comments and UI updates to preserve the "Cinematic Luxury" brand.

## Efficiency Protocol (Always-On)
- **Model routing**: Classify every task by complexity. Use Haiku for simple edits/git/config, Sonnet for component work/bug fixes/refactoring, Opus only for architecture/security/complex debugging. Default to the cheapest model that won't compromise quality.
- **Auto-fork**: When finding unrelated issues while working, immediately `spawn_task` them instead of polluting context. Fork independent subtasks from multi-part requests. Fork when context exceeds 8+ file reads.
- **Parallel execution**: When multiple independent subtasks exist, spawn all Agent calls in a single message with `run_in_background: true`.
- **No discussion, just route**: Don't ask which model to use or whether to fork — apply the protocol silently and execute.
