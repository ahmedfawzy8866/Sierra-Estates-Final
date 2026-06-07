export interface ObsidianNote {
    id: string;
    title: string;
    content: string;
    tags: string[];
    metadata: Record<string, any>;
    lastModified: Date;
}
export declare class ObsidianVaultSync {
    private vaultPath;
    constructor(vaultPath?: string);
    scanVault(): Promise<ObsidianNote[]>;
    private readDirectoryRecursively;
}
//# sourceMappingURL=obsidian-sync.d.ts.map