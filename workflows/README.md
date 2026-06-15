# Sierra Estates — n8n Workflow Automation

This directory contains all automated workflows for the Sierra Estates intelligence pipeline.

## Workflows

| # | Workflow | Purpose |
|---|----------|---------|
| 01 | WhatsApp Scraper | Ingest property data from WhatsApp groups |
| 02 | Owner Search | Search for property owner contact info |
| 03 | Owner Contact | Automated outreach to property owners |
| 04 | Email Sender | Email campaign management |
| 05 | Unit Adder | Auto-add verified units to the database |

## n8n Templates

- `daily_market_report.json` — Daily automated market summary
- `leila_lead_scoring.json` — AI-powered lead scoring and routing
- `new_listing_notification.json` — Alert team when new listings are added
- `viewing_booking_sms.json` — SMS confirmation for viewing appointments

## Setup

1. Start n8n: `docker-compose -f ../docker-compose.n8n.yml up -d`
2. Open http://localhost:5678
3. Import JSON templates from this directory
4. Configure credentials in n8n Settings

Required credentials:
- Firebase (service account JSON)
- Google Sheets
- Telegram Bot
- SMTP (email sender)
- Twilio (SMS)
