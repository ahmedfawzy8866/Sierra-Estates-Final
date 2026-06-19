import { GoogleGenerativeAI } from "@google/generative-ai";
import { adminDb } from "../server/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS, type InboundAssetSignal } from "../models/schema";
import { buildSierraCodeMetadata, type PropertyCodeInput } from "./coding-algorithm";
import { StorageService } from "./StorageService";
import { logger } from '@/lib/logger';
import { triggerN8nWebhook } from '@/lib/server/n8n-client';

/**
 * sierra estates WHATSAPP INTELLIGENCE SERVICE
 * Core orchestrator for Stage 1 & 2 (Acquisition/Parsing).
 */

const API_KEY = process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export class WhatsAppParserService {
  static formatWhatsAppMessage(data: { compound: string; price: number; bedrooms: number; [key: string]: any }): string {
    const brandingTag = process.env.BRANDING_TAG || 'Sierra Estates | Excellence in Living.';
    return [
      '*BEYOND BROKERAGE.*',
      `*${brandingTag}*`,
      '',
      `*${data.compound}*`,
      `Price: ${data.price} EGP`,
      `Bedrooms: ${data.bedrooms}`,
    ].join('\n');
  }

  /**
   * Raw parser that returns extracted JSON without persistence.
   */
  static async parseMessage(content: string, media?: { data: string, mimeType: string }) {
    if (!API_KEY) {
      logger.error("❌ [WhatsAppParserService] No API key found for Gemini. Please set GOOGLE_AI_API_KEY.");
      throw new Error("Gemini API key is missing. Neural parsing disabled.");
    }

    const modelName = media ? "gemini-1.5-pro" : "gemini-1.5-flash";
    const model = genAI.getGenerativeModel({ model: modelName });

    const systemInstruction = `ROLE: You are the Sierra Estates Strategic Intelligence Parser (The Scribe).
    Your mission is to transform raw real estate text (Arabic/English/Fringlish) into cinematic data.

    OPERATIONAL PROTOCOL:
    1. VALIDATE: If the message is NOT a property listing, set "isListing" to false.
    2. FINANCIALS: Extract Price, Downpayment, Number of Installments, and Delivery Year.
    3. VALUATION: Estimate a "valuationScore" (0-100). High score (80+) for distress deals, under-market prices, or "لقطة" (bargain) mentions.
    4. LUXURY ASSETS: Identify "garden", "pool", "roof", "villa", "lake view", "prime", "corner".
    5. CODING: Strictly enforce the SBR Coding System (e.g., Villette, 3BD, Semi, 45k, Garden -> VS-3S-45K+G).

    JSON SCHEMA:
    {
      "isListing": boolean,
      "compound": string,
      "price": number,
      "bedrooms": number,
      "area": number,
      "type": "apartment" | "villa" | "land" | "office" | "townhouse" | "duplex" | "penthouse" | "studio" | "chalet",
      "finishing": "core_and_shell" | "semi_finished" | "fully_finished",
      "paymentPlan": {
        "downpayment": number,
        "installments": number,
        "deliveryDate": string
      },
      "sierraCode": string,
      "needsReview": boolean,
      "urgencyScore": number (0-100),
      "valuationScore": number (0-100),
      "sentiment": "positive" | "neutral" | "aggressive" | "desperate",
      "matchingKeywords": ["garden", "pool", "roof", "villa", "lake", "prime", "corner"],
      "phoneNumber": string
    }

    Respond ONLY with the JSON object.`;

    let result;
    if (media) {
      result = await model.generateContent([
        systemInstruction,
        { inlineData: media },
        content
      ]);
    } else {
      result = await model.generateContent([systemInstruction, content]);
    }

    const response = await result.response;
    const text = response.text();
    const jsonStr = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  }

  /**
   * Processes a raw message (text or image) and persists it.
   */
  static async processIncomingMessage(content: string, sender: string, groupName: string, media?: { data: string, mimeType: string }) {
    logger.info(`📡 Ingesting strategic intel from ${groupName}... (Multimodal: ${!!media})`);
    
    try {
      const extractedData = await this.parseMessage(content, media);

      // --- SIERRA INTELLIGENCE LAYER: CODES & DQE ---
      const { code, technicalId } = this.generateInternalCodes(extractedData, 'whatsapp');
      extractedData.sierraCode = code;
      extractedData.technicalId = technicalId;

      const duplicateId = await this.checkForDuplicates(extractedData);
      
      const signal: Omit<InboundAssetSignal, 'id'> = {
        rawMessage: content,
        status: duplicateId ? 'duplicate' : 'parsed',
        sourceGroup: groupName,
        sourcePlatform: 'whatsapp',
        senderInfo: sender,
        isVerified: false,
        createdAt: Timestamp.now() as any,
        extractedData: extractedData,
        coordinates: this.simulateGeocoding(extractedData.compound),
        duplicateOf: duplicateId || undefined,
        intelligence: {
            urgencyScore: extractedData.urgencyScore || 50,
            valuationScore: extractedData.valuationScore || 50,
            featureCodes: this.extractFeatureCodes(extractedData.matchingKeywords || []) as import('../models/schema').SierraFeatureCode[]
        },
        orchestrationState: {
          stage: 'S3',
          status: 'completed'
        }
      };

      const docRef = await adminDb.collection(COLLECTIONS.brokerListings).add(signal);
      
      // --- MEDIA PERSISTENCE ---
      if (media && docRef.id) {
          logger.info(`📸 Persisting media for signal ${docRef.id}...`);
          try {
              const mediaUrl = await StorageService.uploadPropertyMedia(
                  docRef.id, 
                  media.data, 
                  media.mimeType
              );
              await docRef.update({
                  mediaUrls: [mediaUrl],
                  'intelligence.hasVisualReference': true
              });
              logger.info(`✅ Media linked: ${mediaUrl}`);
          } catch (storageError) {
              logger.error("❌ Storage Persistence Failure:", storageError);
          }
      }

      logger.info(`✅ AI Orchestration Complete: Signal ${docRef.id} persisted. [Code: ${extractedData.sierraCode}]`);
      
      return { id: docRef.id, data: extractedData, isDuplicate: !!duplicateId };
    } catch (error) {
      logger.error("❌ Neural Parsing Engine Failure:", error);
      
      // Fallback: Save as 'raw' for human review
      await adminDb.collection(COLLECTIONS.brokerListings).add({
        rawMessage: content,
        status: 'new',
        sourceGroup: groupName,
        sourcePlatform: 'whatsapp',
        senderInfo: sender,
        isVerified: false,
        createdAt: Timestamp.now(),
        orchestrationState: {
          stage: 'S1_ACQUISITION',
          status: 'failed',
          errors: [String(error)]
        }
      });
      
      throw error;
    }
  }

  /**
   * Simulates geospatial mapping based on compound name for the 'Live Map' feature.
   */
  private static simulateGeocoding(compound: string | null) {
    const coordsMap: Record<string, {lat: number, lng: number}> = {
      'Mivida': { lat: 30.015, lng: 31.490 },
      'Mountain View': { lat: 30.035, lng: 31.470 },
      'Hyde Park': { lat: 30.005, lng: 31.480 },
      'CFC': { lat: 30.010, lng: 31.510 },
      'Palm Hills': { lat: 30.025, lng: 31.460 }
    };
    
    if (compound && coordsMap[compound]) return coordsMap[compound];
    
    // Default New Cairo center with slight jittering for visualization
    return { 
      lat: 30.044 + (Math.random() - 0.5) * 0.1, 
      lng: 31.235 + (Math.random() - 0.5) * 0.1 
    };
  }

  private static generateInternalCodes(data: any, source: string): { code: string, technicalId: string } {
    const input: PropertyCodeInput = {
      locationCode: data.compound || "UNK",
      rooms: data.bedrooms || 0,
      furnishingStatus: this.mapFinishingToStatus(data.finishing),
      price: data.price || 0,
      currency: 'EGP',
      features: data.matchingKeywords?.filter((k: string) => ['garden', 'pool', 'roof', 'villa'].includes(k.toLowerCase()))
    };
    
    const meta = buildSierraCodeMetadata(input, source, 'SB');
    return { code: meta.code, technicalId: meta.technicalId };
  }

  private static mapFinishingToStatus(finishing?: string): 'F' | 'U' | 'K' | 'S' {
    if (!finishing) return 'U';
    const f = finishing.toLowerCase();
    if (f.includes('fully') || f.includes('ultra')) return 'F';
    if (f.includes('semi')) return 'S';
    if (f.includes('core')) return 'U';
    return 'U';
  }

  /**
   * DQE (Data Quality Estimation): Scans for near-duplicates in the inventory.
   */
  private static async checkForDuplicates(data: any): Promise<string | null> {
    if (!data.compound || !data.price) return null;

    const snapshot = await adminDb.collection(COLLECTIONS.brokerListings)
      .where('extractedData.compound', '==', data.compound)
      .where('extractedData.bedrooms', '==', data.bedrooms)
      .get();

    const margin = 0.05; // 5% price margin

    for (const doc of snapshot.docs) {
      const existing = doc.data() as InboundAssetSignal;
      const existingPrice = existing.extractedData.price || 0;
      const priceDiff = Math.abs(existingPrice - data.price) / (existingPrice || 1);

      if (priceDiff <= margin) {
        return doc.id;
      }
    }

    return null;
  }

  /**
   * Maps matching keywords to the strategic feature codes used by ROI analysis.
   */
  private static extractFeatureCodes(keywords: string[]): string[] {
    const map: Record<string, string> = {
        'garden': 'G',
        'pool': 'P',
        'roof': 'R',
        'villa': 'V',
        'lake': 'L',
        'corner': 'C'
    };
    return keywords
        .map(k => map[k.toLowerCase()])
        .filter(Boolean);
  }

  /**
   * BULK OWNER OUTREACH (Staggered Sender)
   * Executes the 3-workflow bulk outreach system using 4 WhatsApp numbers.
   * Batch sends 30 messages per number every 2 hours (12:00 PM to 8:00 PM).
   * Total daily capacity: 480 messages.
   */
  static async dispatchBulkOwnerOutreach(ownerList: any[]) {
    logger.info(`🚀 Initiating Bulk Owner Outreach for ${ownerList.length} owners...`);
    const WABA_NUMBERS = [
      process.env.WABA_NUMBER_1,
      process.env.WABA_NUMBER_2,
      process.env.WABA_NUMBER_3,
      process.env.WABA_NUMBER_4
    ].filter(Boolean);

    if (WABA_NUMBERS.length === 0) {
      logger.warn("⚠️ No WABA numbers configured. Using fallback simulation for bulk sender.");
      WABA_NUMBERS.push("SIMULATOR_1", "SIMULATOR_2", "SIMULATOR_3", "SIMULATOR_4");
    }

    const BATCH_SIZE_PER_NUMBER = 30;
    const MAX_DAILY_LIMIT = 480;
    
    // Restrict processing queue to daily limit
    const queueToProcess = ownerList.slice(0, Math.min(ownerList.length, MAX_DAILY_LIMIT));
    
    let processedCount = 0;
    
    for (const senderPhone of WABA_NUMBERS) {
      if (processedCount >= queueToProcess.length) break;
      
      const chunk = queueToProcess.slice(processedCount, processedCount + BATCH_SIZE_PER_NUMBER);
      processedCount += chunk.length;
      
      logger.info(`📤 Dispatching ${chunk.length} templates via Sender: ${senderPhone}`);

      // Hand off to n8n for staggered, rate-limited sending.
      await triggerN8nWebhook('bulk-owner-outreach', {
        senderPhone,
        owners: chunk,
      });
    }
    
    return {
      status: 'queued',
      dispatchedBatches: Math.ceil(processedCount / BATCH_SIZE_PER_NUMBER),
      totalDispatched: processedCount,
      remainingInQueue: Math.max(0, ownerList.length - processedCount)
    };
  }
}

