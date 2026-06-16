"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Orchestrator = void 0;
const exchange_client_1 = require("@sierra-estates/exchange/exchange-client");
class Orchestrator {
    constructor(agents) {
        this.activeLocks = new Set();
        this.registeredAgents = new Map();
        for (const agent of agents) {
            this.registeredAgents.set(agent.name, agent);
        }
    }
    start() {
        console.log(`[Orchestrator] Starting listener for agent tasks...`);
        console.log(`[Orchestrator] Registered agents: ${Array.from(this.registeredAgents.keys()).join(', ')}`);
        // Listen to Firebase Exchange collection for tasks assigned to any agent
        this.unsubscribeFn = (0, exchange_client_1.subscribeAgentTasks)((records) => {
            for (const record of records) {
                this.processRecord(record);
            }
        });
    }
    stop() {
        if (this.unsubscribeFn) {
            this.unsubscribeFn();
            this.unsubscribeFn = undefined;
            console.log(`[Orchestrator] Stopped listener.`);
        }
    }
    async processRecord(record) {
        // Only process pending records
        if (record.status !== 'pending')
            return;
        // Prevent double processing in the current Node instance
        if (this.activeLocks.has(record.id))
            return;
        this.activeLocks.add(record.id);
        try {
            // Look up the targeted agent
            const targetAgentId = record.agentId;
            if (!targetAgentId) {
                throw new Error('No agentId specified in task');
            }
            const agent = this.registeredAgents.get(targetAgentId);
            if (!agent) {
                throw new Error(`Agent ${targetAgentId} not found or not registered.`);
            }
            // Mark the task as running
            console.log(`[Orchestrator] Picking up task ${record.id} for agent ${targetAgentId}`);
            await (0, exchange_client_1.updateExchange)(record.id, {
                status: 'running',
            });
            // Execute the agent
            const result = await agent.execute(record);
            // Mark the task as done or error based on result
            if (result.success) {
                await (0, exchange_client_1.updateExchange)(record.id, {
                    status: 'done',
                    result: result.data,
                    progress: 100,
                });
            }
            else {
                await (0, exchange_client_1.updateExchange)(record.id, {
                    status: 'error',
                    error: result.error,
                });
            }
        }
        catch (error) {
            console.error(`[Orchestrator] Error processing task ${record.id}:`, error);
            // Try to mark as error in Firestore
            await (0, exchange_client_1.updateExchange)(record.id, {
                status: 'error',
                error: error.message || 'Unknown error occurred in orchestrator.',
            }).catch(err => console.error(`Failed to update status to error for ${record.id}`, err));
        }
        finally {
            // Release local lock
            this.activeLocks.delete(record.id);
        }
    }
}
exports.Orchestrator = Orchestrator;
//# sourceMappingURL=orchestrator.js.map