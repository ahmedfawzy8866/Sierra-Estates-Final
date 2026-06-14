import { AgentOrchestrator } from './orchestrator';

export class AgentWorkflows {
  constructor(private orchestrator: AgentOrchestrator) {}

  async runApiWorkflow(task: string):      Promise<string> { return this.orchestrator.dispatch(task, { mode: 'api' }); }
  async runDebugWorkflow(task: string):    Promise<string> { return this.orchestrator.dispatch(task, { mode: 'debug' }); }
  async runPlanWorkflow(task: string):     Promise<string> { return this.orchestrator.dispatch(task, { mode: 'plan' }); }
  async runSecurityWorkflow(task: string): Promise<string> { return this.orchestrator.dispatch(task, { mode: 'security' }); }
  async runAuditWorkflow(task: string):    Promise<string> { return this.orchestrator.dispatch(task, { mode: 'audit' }); }
  async runUiUxWorkflow(task: string):     Promise<string> { return this.orchestrator.dispatch(task, { mode: 'ui-ux' }); }
}
