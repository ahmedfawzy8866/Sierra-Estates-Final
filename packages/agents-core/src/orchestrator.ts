import { AgentRegistry, AgentDefinition } from './registry';

export class AgentOrchestrator {
  private registry: AgentRegistry;

  constructor(registry: AgentRegistry) {
    this.registry = registry;
  }

  selectAgent(task: string): AgentDefinition | undefined {
    const agents = this.registry.list();
    const lower  = task.toLowerCase();

    // Simple keyword-based routing
    for (const agent of agents) {
      const desc = agent.description.toLowerCase();
      if (desc.split(' ').some(word => lower.includes(word))) {
        return agent;
      }
    }

    return agents[0]; // fallback to first agent
  }

  async dispatch(task: string, context?: Record<string, unknown>): Promise<string> {
    const agent = this.selectAgent(task);
    if (!agent) return 'No suitable agent found';

    // Return the agent's system prompt / instructions
    return `Agent: ${agent.name}\n\nTask: ${task}\n\nContext: ${JSON.stringify(context || {})}\n\n${agent.content}`;
  }
}
