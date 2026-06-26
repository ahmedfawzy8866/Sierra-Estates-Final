import { OpenClawClient } from "openclaw";

// Initialize OpenClaw client (mock/placeholder credentials for the demo)
let aiClient: any = null;

export const initializeAIGateway = () => {
  try {
    aiClient = new OpenClawClient({
      apiKey: process.env.EXPO_PUBLIC_OPENCLAW_KEY || "test-key",
      projectId: "sierra-estates-ai"
    });
    console.log("OpenClaw AI Gateway initialized");
  } catch (e) {
    console.warn("OpenClaw init failed:", e);
  }
};

export const indexPropertiesForAI = async (properties: any[]) => {
  if (!aiClient) return;
  try {
    // Vectorize properties based on description, title, features
    const documents = properties.map(p => ({
      id: p.id,
      text: `${p.title}. ${p.description}. Features: ${p.features.join(", ")}. Price: ${p.priceLabel}. Location: ${p.location}`,
      metadata: {
        price: p.price,
        type: p.type,
        beds: p.beds
      }
    }));
    await aiClient.indexDocuments("properties", documents);
    console.log("Properties indexed in OpenClaw for AI Search");
  } catch (e) {
    console.warn("Failed to index properties:", e);
  }
};

export const searchPropertiesWithAI = async (query: string, allProperties: any[]) => {
  if (!query.trim()) return allProperties;
  
  if (aiClient) {
    try {
      const results = await aiClient.search("properties", query, { topK: 10 });
      // Map results back to original properties
      const matchedIds = results.map((r: any) => r.id);
      return allProperties.filter(p => matchedIds.includes(p.id));
    } catch (e) {
      console.warn("AI search failed, falling back to simple search:", e);
    }
  }
  
  // Fallback to simple text matching
  const lowerQuery = query.toLowerCase();
  return allProperties.filter(p => 
    p.title.toLowerCase().includes(lowerQuery) || 
    p.description.toLowerCase().includes(lowerQuery) ||
    p.tags.some((t: string) => t.toLowerCase().includes(lowerQuery)) ||
    p.features.some((f: string) => f.toLowerCase().includes(lowerQuery))
  );
};
