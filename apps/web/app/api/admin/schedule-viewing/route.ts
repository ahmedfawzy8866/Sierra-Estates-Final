import { NextResponse } from 'next/server';
import { TelegramNotifier, GoogleCalendarScheduler } from '@agents-core/index';

export async function POST(req: Request) {
  try {
    const { leadId, units } = await req.json();

    const notifier = new TelegramNotifier();
    const scheduler = new GoogleCalendarScheduler();

    // Mocking DB lookup
    const clientEmail = `client_${leadId}@example.com`;
    const clientName = `Client ${leadId}`;
    const agentEmail = `agent@sierrablu.com`;
    const agentName = `Sierra Agent`;
    
    // We schedule it for tomorrow at 10 AM by default
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const propertyTitles = units.map((u: any) => u.title);

    // Trigger Google Calendar
    const calendarLink = await scheduler.scheduleViewing(clientEmail, agentEmail, propertyTitles, tomorrow);

    // Trigger Telegram Notification to Team
    await notifier.sendViewingScheduledAlert(agentName, clientName, propertyTitles, tomorrow.toLocaleString());

    return NextResponse.json({ 
      success: true, 
      calendarLink,
      message: 'Viewing scheduled and team notified successfully.'
    });
  } catch (error: any) {
    console.error('Error scheduling viewing:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
