import { google } from 'googleapis';
export class GoogleCalendarScheduler {
    constructor() {
        Object.defineProperty(this, "calendar", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        try {
            const auth = new google.auth.GoogleAuth({
                credentials: {
                    client_email: process.env.GOOGLE_CLIENT_EMAIL,
                    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
                },
                scopes: ['https://www.googleapis.com/auth/calendar']
            });
            this.calendar = google.calendar({ version: 'v3', auth });
        }
        catch (e) {
            console.warn('Google Calendar credentials not set. Falling back to mock calendar scheduling.');
        }
    }
    async scheduleViewing(clientEmail, agentEmail, propertyTitles, startTime) {
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration
        const event = {
            summary: `Property Viewing: ${propertyTitles.join(', ')}`,
            description: `Scheduled viewing for the client. Handled by Sierra Engine Brain.`,
            start: {
                dateTime: startTime.toISOString(),
                timeZone: 'Asia/Dubai', // Default timezone, can be parameterized
            },
            end: {
                dateTime: endTime.toISOString(),
                timeZone: 'Asia/Dubai',
            },
            attendees: [
                { email: clientEmail },
                { email: agentEmail }
            ],
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 },
                    { method: 'popup', minutes: 60 },
                ],
            },
        };
        if (this.calendar) {
            try {
                const res = await this.calendar.events.insert({
                    calendarId: 'primary',
                    requestBody: event,
                    sendUpdates: 'all'
                });
                return res.data.htmlLink;
            }
            catch (e) {
                console.error('Failed to create Google Calendar event:', e);
                return null;
            }
        }
        else {
            console.log('--- MOCK GOOGLE CALENDAR EVENT ---');
            console.log(`Event created for ${clientEmail} and ${agentEmail} at ${startTime.toISOString()}`);
            console.log('----------------------------------');
            return 'https://calendar.google.com/mock-event-link';
        }
    }
}
//# sourceMappingURL=calendar.js.map