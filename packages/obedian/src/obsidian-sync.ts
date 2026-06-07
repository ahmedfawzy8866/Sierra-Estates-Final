import * as fs from 'fs/promises';
import * as path from 'path';
import matter from 'gray-matter';

export interface ObsidianNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  metadata: Record<string, any>;
  lastModified: Date;
}

export class ObsidianVaultSync {
  private vaultPath: string;

  constructor(vaultPath?: string) {
    // Default to the provided hard drive path if not overridden
    this.vaultPath = vaultPath || 'I:\\Work Sierra Estates\\Sierra Engine Brain\\obsidian-vault';
  }

  async scanVault(): Promise<ObsidianNote[]> {
    const notes: ObsidianNote[] = [];
    
    try {
      // Create path if it doesn't exist for local testing
      try {
        await fs.access(this.vaultPath);
      } catch {
        console.warn(`Vault path ${this.vaultPath} not accessible. Creating mock for development.`);
        await fs.mkdir(this.vaultPath, { recursive: true });
        
        // Add a mock file so we can test the UI
        await fs.writeFile(
          path.join(this.vaultPath, 'Lead_Qualifying_Rules.md'), 
          `---\ntags: [sales, rules]\npriority: high\n---\n# Lead Qualifying\n\nAlways ask for budget first.`
        );
      }

      await this.readDirectoryRecursively(this.vaultPath, notes);
    } catch (error) {
      console.error('Error scanning Obsidian vault:', error);
    }

    return notes;
  }

  private async readDirectoryRecursively(dir: string, notes: ObsidianNote[]) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip obsidian internal folders
        if (entry.name === '.obsidian' || entry.name === '.trash') continue;
        await this.readDirectoryRecursively(fullPath, notes);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const fileContent = await fs.readFile(fullPath, 'utf8');
        const stats = await fs.stat(fullPath);
        
        try {
          const parsed = matter(fileContent);
          
          notes.push({
            id: Buffer.from(fullPath).toString('base64'),
            title: entry.name.replace('.md', ''),
            content: parsed.content,
            tags: parsed.data.tags || [],
            metadata: parsed.data,
            lastModified: stats.mtime
          });
        } catch (e) {
          console.warn(`Could not parse frontmatter for ${fullPath}`);
        }
      }
    }
  }
}
