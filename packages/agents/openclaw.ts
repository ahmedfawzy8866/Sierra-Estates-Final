import { z } from 'zod';
import pino from 'pino';

const logger = pino({ name: 'openclaw-agent' });

// Define the schema for a real estate unit to be extracted from WhatsApp messages
export const UnitExtractionSchema = z.object({
  type: z.string().describe('The type of property, e.g., Apartment, Villa, Office, etc.'),
  location: z.string().describe('The location or address of the property'),
  price: z.number().optional().describe('The price or budget mentioned (as a number)'),
  currency: z.string().optional().describe('The currency mentioned, e.g., USD, EGP'),
  area_sqm: z.number().optional().describe('The area in square meters'),
  bedrooms: z.number().optional().describe('Number of bedrooms'),
  bathrooms: z.number().optional().describe('Number of bathrooms'),
  contact_info: z.string().optional().describe('Phone number or name of the owner'),
  notes: z.string().optional().describe('Any other relevant notes or details'),
});

export type ExtractedUnit = z.infer<typeof UnitExtractionSchema>;

/**
 * OpenClaw Agent Class
 * Responsible for handling incoming WhatsApp messages, extracting unit data using AI,
 * and pushing it to Airtable or an Excel sheet.
 */
export class OpenClawAgent {
  private airtableApiKey: string;
  private airtableBaseId: string;
  private airtableTableName: string;
  private aiApiKey: string; // e.g., OpenAI API Key

  constructor(config: { airtableApiKey: string; airtableBaseId: string; airtableTableName: string; aiApiKey: string }) {
    this.airtableApiKey = config.airtableApiKey;
    this.airtableBaseId = config.airtableBaseId;
    this.airtableTableName = config.airtableTableName;
    this.aiApiKey = config.aiApiKey;
  }

  /**
   * Parses the text using an AI API (e.g., OpenAI or Gemini) to extract structured unit data
   */
  async extractUnitData(text: string): Promise<ExtractedUnit | null> {
    logger.info({ msg: 'Extracting unit data from text', textLength: text.length });
    
    // In a real implementation, you would call OpenAI here with the UnitExtractionSchema
    // Example:
    // const response = await openai.chat.completions.create({
    //   model: 'gpt-4o',
    //   messages: [
    //     { role: 'system', content: 'Extract real estate unit details into JSON.' },
    //     { role: 'user', content: text }
    //   ],
    //   functions: [{ name: 'extract_unit', parameters: zodToJsonSchema(UnitExtractionSchema) }]
    // });
    
    // For now, we mock the extraction process for demonstration
    // The actual integration will be plugged into the user's preferred LLM
    try {
      const mockResult: ExtractedUnit = {
        type: 'Apartment',
        location: 'Unknown',
      };
      
      return mockResult;
    } catch (error) {
      logger.error({ err: error, msg: 'Failed to extract unit data' });
      return null;
    }
  }

  /**
   * Pushes the extracted unit data to Airtable
   */
  async pushToAirtable(unit: ExtractedUnit): Promise<boolean> {
    logger.info({ msg: 'Pushing unit data to Airtable', unitType: unit.type, location: unit.location });
    
    try {
      const encodedTableName = encodeURIComponent(this.airtableTableName);
      const response = await fetch(`https://api.airtable.com/v0/${this.airtableBaseId}/${encodedTableName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.airtableApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          records: [
            {
              fields: {
                "Property Type": unit.type,
                "Location": unit.location,
                "Price": unit.price,
                "Currency": unit.currency,
                "Area (sqm)": unit.area_sqm,
                "Bedrooms": unit.bedrooms,
                "Bathrooms": unit.bathrooms,
                "Contact": unit.contact_info,
                "Notes": unit.notes
              }
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error({ msg: 'Airtable API error', error: errorText });
        return false;
      }

      logger.info({ msg: 'Successfully pushed to Airtable' });
      return true;
    } catch (error) {
      logger.error({ err: error, msg: 'Failed to connect to Airtable' });
      return false;
    }
  }

  /**
   * Main entry point for a WhatsApp webhook
   */
  async handleWhatsAppMessage(messageText: string, sender: string): Promise<string> {
    logger.info({ msg: 'Received WhatsApp message', hasSender: sender.length > 0, messageLength: messageText.length });
    
    const unitData = await this.extractUnitData(messageText);
    
    if (!unitData || !unitData.location) {
      logger.info({ msg: 'Could not extract unit from message, ignoring.' });
      return 'Sorry, I couldn\'t extract a real estate unit from this message.';
    }
    
    if (!unitData.contact_info) {
      unitData.contact_info = sender;
    }

    const success = await this.pushToAirtable(unitData);
    
    if (success) {
      return `✅ Unit successfully added to the database!\n\nType: ${unitData.type}\nLocation: ${unitData.location}`;
    } else {
      return '❌ Failed to save the unit to the database. Please try again later.';
    }
  }
}
