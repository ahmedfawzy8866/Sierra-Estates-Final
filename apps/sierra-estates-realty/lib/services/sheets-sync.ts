import { google } from 'googleapis';
import { logger } from '@/lib/logger';

/**
 * sierra estates — GOOGLE SHEETS DUAL-INGESTION PROTOCOL
 */
export const GoogleSheetsSync = {
  /**
   * Appends a new lead or property to the master log.
   */
  async appendRow(sheetName: 'Leads' | 'Inventory', data: Record<string, any>) {
    logger.info(`[GoogleSheetsSync] Syncing to ${sheetName}...`);

    try {
      const auth = new google.auth.GoogleAuth({
        keyFile: './config/service_account.json',
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const sheets = google.sheets({ version: 'v4', auth });
      const spreadsheetId = process.env.MASTER_SHEET_ID;

      if (!spreadsheetId) {
        throw new Error('MASTER_SHEET_ID not configured in environment.');
      }

      const values = [Object.values(data)];

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
      });

      return {
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      logger.error(`[GoogleSheetsSync] Error:`, error.message);
      return { success: false, error: error.message };
    }
  }
};
