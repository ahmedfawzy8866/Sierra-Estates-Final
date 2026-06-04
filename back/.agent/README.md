# `.agent/` — Autonomous Execution State

Runtime-managed directory. **Do not commit generated contents.**

| File | Written by | Purpose |
|------|-----------|---------|
| `uptime.flag` | `engine_core.py` | JSON `{state, ts}` — `online` / `active` / `degraded` / `stopped`. The orchestration layer reads this for liveness. |
| `*.log` | daemon | Rotating execution logs (also streamed to journald via systemd). |

The directory is tracked (so the path exists on clone); its generated files are
git-ignored (see `.gitignore`).
