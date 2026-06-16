import type { BaseAgent } from './base-agent';
export declare class Orchestrator {
    private activeLocks;
    private unsubscribeFn?;
    private registeredAgents;
    constructor(agents: BaseAgent[]);
    start(): void;
    stop(): void;
    private processRecord;
}
//# sourceMappingURL=orchestrator.d.ts.map