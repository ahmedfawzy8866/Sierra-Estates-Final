import TelegramBot from 'node-telegram-bot-api';

export class TelegramNotifier {
  private bot: TelegramBot | null = null;
  private chatId: string;

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    this.chatId = process.env.TELEGRAM_GROUP_CHAT_ID || '';
    
    if (token && this.chatId) {
      this.bot = new TelegramBot(token, { polling: false });
    } else {
      console.warn('Telegram Bot Token or Chat ID not found. Notifications will be logged to console instead.');
    }
  }

  async sendViewingScheduledAlert(agentName: string, clientName: string, propertyTitles: string[], date: string) {
    const message = `
🏢 *New Viewing Scheduled!*
*Agent:* ${agentName}
*Client:* ${clientName}
*Date:* ${date}
*Properties:*
${propertyTitles.map(t => `- ${t}`).join('\n')}

_Powered by Sierra Engine Brain_
`;

    if (this.bot) {
      try {
        await this.bot.sendMessage(this.chatId, message, { parse_mode: 'Markdown' });
      } catch (e) {
        console.error('Failed to send Telegram message:', e);
      }
    } else {
      console.log('--- MOCK TELEGRAM MESSAGE ---');
      console.log(message);
      console.log('-----------------------------');
    }
  }
}
