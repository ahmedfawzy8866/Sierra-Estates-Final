"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.registry = exports.AgentRegistry = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class AgentRegistry {
    constructor(customSrcDir) {
        this.profiles = {};
        this.srcDir = customSrcDir || __dirname;
        this.loadAllProfiles();
    }
    loadAllProfiles() {
        try {
            const files = fs.readdirSync(this.srcDir);
            for (const file of files) {
                if (file.endsWith('.md')) {
                    const name = path.basename(file, '.md');
                    const filePath = path.join(this.srcDir, file);
                    const content = fs.readFileSync(filePath, 'utf-8');
                    const profile = this.parseMarkdownProfile(name, content);
                    this.profiles[name] = profile;
                }
            }
        }
        catch (err) {
            console.error('[AgentRegistry] Error loading profiles:', err);
        }
    }
    parseMarkdownProfile(name, content) {
        // Basic Frontmatter Parser
        const frontmatterRegex = /^---\r?\n([\s\S]+?)\r?\n---\r?\n([\s\S]*)$/;
        const match = content.match(frontmatterRegex);
        let domain = 'General Development';
        let description = '';
        let ruleRef = '';
        let dnaRef = '';
        let systemPrompt = content;
        if (match) {
            const frontmatter = match[1];
            systemPrompt = match[2];
            const lines = frontmatter.split('\n');
            for (const line of lines) {
                const parts = line.split(':');
                if (parts.length >= 2) {
                    const key = parts[0].trim().toLowerCase();
                    const val = parts.slice(1).join(':').trim();
                    if (key === 'domain')
                        domain = val;
                    else if (key === 'description')
                        description = val;
                    else if (key === 'rule_ref')
                        ruleRef = val;
                    else if (key === 'dna_ref')
                        dnaRef = val;
                }
            }
        }
        return {
            name,
            domain,
            description,
            systemPrompt: systemPrompt.trim(),
            ruleRef,
            dnaRef,
        };
    }
    getAgent(name) {
        return this.profiles[name] || null;
    }
    listAgents() {
        return Object.values(this.profiles);
    }
}
exports.AgentRegistry = AgentRegistry;
exports.registry = new AgentRegistry();
//# sourceMappingURL=registry.js.map