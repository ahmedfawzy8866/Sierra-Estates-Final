"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Orchestrator = exports.AgentOrchestrator = void 0;
const exchange_client_1 = require("@sierra-estates/exchange/exchange-client");
const registry_1 = require("./registry");
const obedian_1 = require("@sierra-estates/obedian");
const generative_ai_1 = require("@google/generative-ai");
class AgentOrchestrator {
    constructor(config = {}) {
        this.genAI = null;
        const apiKey = config.apiKey || process.env.GOOGLE_AI_API_KEY;
        if (apiKey) {
            this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        }
        this.defaultModel = config.defaultModel || 'gemini-flash-latest';
        this.runCompletionCustom = config.runCompletion;
    }
    /**
     * Helper to execute completions, using custom callback or direct SDK
     */
    async executeCompletion(agentName, stage, systemPrompt, userPrompt) {
        if (this.runCompletionCustom) {
            return this.runCompletionCustom(agentName, stage, systemPrompt, userPrompt);
        }
        if (!this.genAI) {
            throw new Error(`[AgentOrchestrator] Direct execution failed: GOOGLE_AI_API_KEY is not configured.`);
        }
        const model = this.genAI.getGenerativeModel({
            model: this.defaultModel,
            generationConfig: { temperature: 0.2 },
            systemInstruction: systemPrompt,
        });
        const result = await model.generateContent(userPrompt);
        return result.response.text();
    }
    /**
     * Query all shared knowledge stored in Obedian Memory
     */
    async getSharedKnowledge() {
        const memories = await obedian_1.obedian.search('', ['shared-knowledge']);
        if (memories.length === 0) {
            return 'No prior shared knowledge found.';
        }
        return memories
            .map((m) => `[Source: ${m.id} | Date: ${m.updatedAt}]\nTags: ${m.tags.join(', ')}\nContent: ${typeof m.value === 'string' ? m.value : JSON.stringify(m.value, null, 2)}`)
            .join('\n\n---\n\n');
    }
    /**
     * Add new knowledge to the shared memory pool
     */
    async addSharedKnowledge(id, value, tags = []) {
        const allTags = ['shared-knowledge', ...tags];
        await obedian_1.obedian.set(id, value, allTags);
    }
    /**
     * Executes a single agent task. The system prompt is automatically enriched
     * with the shared knowledge of all other agents from Obedian memory.
     */
    async runAgentTask(agentName, taskDescription, additionalContext) {
        console.log(`[Orchestrator] Starting task for agent: ${agentName}`);
        const agent = registry_1.registry.getAgent(agentName);
        if (!agent) {
            return {
                agentName,
                status: 'failed',
                output: '',
                error: `Agent "${agentName}" not found in registry.`,
            };
        }
        try {
            // 1. Fetch Shared Knowledge from Obedian Memory
            const sharedIntel = await this.getSharedKnowledge();
            // 2. Synthesize System Prompt containing the Agent's profile + Shared Knowledge
            const enrichedSystemPrompt = `
${agent.systemPrompt}

=========================================
🧠 SHARED COGNITIVE MEMORY (OBEDIAN STORE)
=========================================
All agents share the knowledge below. You must use this context to inform your decision-making and ensure alignment with other specialists' progress and findings:

${sharedIntel}
=========================================
`;
            // 3. Synthesize User Prompt
            const userPrompt = `
TASK DESCRIPTION:
${taskDescription}

${additionalContext ? `ADDITIONAL CONTEXT:\n${additionalContext}` : ''}

Please execute this task and return your final response/results. Ensure your response is detailed, professional, and directly addresses the goal.
`;
            // 4. Execute Completion
            const output = await this.executeCompletion(agent.name, 'execute-task', enrichedSystemPrompt.trim(), userPrompt.trim());
            // 5. Save the output to Shared Memory so other agents learn from this execution
            await this.addSharedKnowledge(`agent-task-${agentName}-${Date.now()}`, {
                taskDescription,
                output,
            }, [agentName, 'task-execution']);
            return {
                agentName,
                status: 'success',
                output,
            };
        }
        catch (err) {
            console.error(`[Orchestrator] Failed task execution for ${agentName}:`, err);
            return {
                agentName,
                status: 'failed',
                output: '',
                error: err.message || String(err),
            };
        }
    }
    /**
     * Coordinated pipeline execution. Orchestrates multiple agents in sequence.
     */
    async orchestratePipeline(pipelineName, steps, initialContext) {
        console.log(`🚀 [Orchestrator] Running coordinated pipeline: ${pipelineName}`);
        // Save initial context to shared memory
        if (initialContext) {
            await this.addSharedKnowledge(`${pipelineName}-initial-context`, initialContext, ['pipeline-context']);
        }
        const results = [];
        for (const step of steps) {
            const result = await this.runAgentTask(step.agentName, step.taskDescription, `Pipeline Step Context: Running pipeline "${pipelineName}"`);
            results.push(result);
            if (result.status === 'failed') {
                console.warn(`⚠️ [Orchestrator] Step failed for ${step.agentName}. Continuing pipeline...`);
            }
        }
        return results;
    }
}
exports.AgentOrchestrator = AgentOrchestrator;
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