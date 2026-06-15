# Sierra Estates External Workflows

External automation scripts that sync data between Google Sheets, WhatsApp, Property Finder, and Firestore.

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your credentials
```

## Workflows

### 01. WhatsApp Scraper
Monitors WhatsApp groups for property listings, writes raw messages to Sheets.

```bash
npm run whatsapp-scraper
```

### 02. Owner Search
Searches Property Finder for direct-owner properties, writes to Sheets.

**Schedule:** Daily at 9am (cron: `0 9 * * *`)

### 03. Owner Contact
Sends WhatsApp messages to property owners, tracks delivery status.

**Schedule:** Daily at 10am (cron: `0 10 * * *`)

### 04. Email Sender
Sends bulk emails to investor stakeholders via SendGrid.

**Schedule:** Daily at 8am (cron: `0 8 * * *`)

### 05. Unit Adder
Reads new properties from Sheets, deduplicates, writes to Firestore.

**Schedule:** Every 30 minutes (cron: `*/30 * * * *`)

## Google Sheets Structure

| Tab | Purpose |
|-----|---------|
| `raw_messages` | WhatsApp scraper output |
| `owner_leads` | Owner search output |
| `email_campaigns` | Email sender input |
| `new_units` | Unit adder input |
