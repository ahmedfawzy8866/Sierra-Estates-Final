import { NextResponse } from 'next/server';
import { ObsidianVaultSync } from '@obedian/index';

export async function GET() {
  try {
    const sync = new ObsidianVaultSync();
    const notes = await sync.scanVault();
    
    // For admin UI, we don't want to send the entire content of every note over the wire,
    // just the metadata.
    const metadataList = notes.map((n: any) => ({
      id: n.id,
      title: n.title,
      tags: n.tags,
      lastModified: n.lastModified,
      metadata: n.metadata
    }));
    
    return NextResponse.json({ notes: metadataList });
  } catch (error: any) {
    console.error('Error fetching knowledge base:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
