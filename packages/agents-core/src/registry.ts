import * as fs   from 'fs';
import * as path from 'path';

export interface AgentDefinition {
  name:        string;
  description: string;
  domain?:     string;
  filePath:    string;
  content:     string;
}

export class AgentRegistry {
  private agents: Map<string, AgentDefinition> = new Map();

  load(srcDir: string): void {
    const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const filePath = path.join(srcDir, file);
      const content  = fs.readFileSync(filePath, 'utf8');
      const def      = this.parseFrontmatter(content, filePath);
      if (def.name) this.agents.set(def.name, def);
    }
  }

  private parseFrontmatter(content: string, filePath: string): AgentDefinition {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    const meta: Record<string, string> = {};
    if (match) {
      for (const line of match[1].split('\n')) {
        const [key, ...val] = line.split(':');
        if (key && val.length) meta[key.trim()] = val.join(':').trim().replace(/^['"]|['"]$/g, '');
      }
    }
    return {
      name:        meta.name        || path.basename(filePath, '.md'),
      description: meta.description || '',
      domain:      meta.domain,
      filePath,
      content,
    };
  }

  get(name: string): AgentDefinition | undefined { return this.agents.get(name); }
  list(): AgentDefinition[] { return Array.from(this.agents.values()); }
}
