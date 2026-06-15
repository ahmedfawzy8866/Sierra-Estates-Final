import { subscribeAgentTasks, updateExchange, type ExchangeRecord } from '@sierra-estates/exchange/exchange-client';
import type { Unsubscribe } from 'firebase/firestore';
import type { BaseAgent } from './base-agent';

export class Orchestrator {
  private activeLocks = new Set<string>();
  private unsubscribeFn?: Unsubscribe;
  private registeredAgents = new Map<string, BaseAgent>();

  constructor(agents: BaseAgent[]) {
    for (const agent of agents) {
      this.registeredAgents.set(agent.name, agent);
    }
  }

  public start() {
    console.log(`[Orchestrator] Starting listener for agent tasks...`);
    console.log(`[Orchestrator] Registered agents: ${Array.from(this.registeredAgents.keys()).join(', ')}`);

    // Listen to Firebase Exchange collection for tasks assigned to any agent
    this.unsubscribeFn = subscribeAgentTasks((records) => {
      for (const record of records) {
        this.processRecord(record);
      }
    });
  }

  public stop() {
    if (this.unsubscribeFn) {
      this.unsubscribeFn();
      this.unsubscribeFn = undefined;
      console.log(`[Orchestrator] Stopped listener.`);
    }
  }

  private async processRecord(record: ExchangeRecord) {
    // Only process pending records
    if (record.status !== 'pending') return;
    
    // Prevent double processing in the current Node instance
    if (this.activeLocks.has(record.id)) return;
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
      await updateExchange(record.id, {
        status: 'running',
      });

      // Execute the agent
      const result = await agent.execute(record);

      // Mark the task as done or error based on result
      if (result.success) {
        await updateExchange(record.id, {
          status: 'done',
          result: result.data,
          progress: 100,
        });
      } else {
        await updateExchange(record.id, {
          status: 'error',
          error: result.error,
        });
      }

    } catch (error: any) {
      console.error(`[Orchestrator] Error processing task ${record.id}:`, error);
      // Try to mark as error in Firestore
      await updateExchange(record.id, {
        status: 'error',
        error: error.message || 'Unknown error occurred in orchestrator.',
      }).catch(err => console.error(`Failed to update status to error for ${record.id}`, err));
    } finally {
      // Release local lock
      this.activeLocks.delete(record.id);
    }
  }
}
