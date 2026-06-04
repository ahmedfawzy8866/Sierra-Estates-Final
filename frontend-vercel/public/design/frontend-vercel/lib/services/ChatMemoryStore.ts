// lib/services/ChatMemoryStore.ts

/**
 * Simple in‑memory chat memory store with optional Firestore persistence.
 *
 * For the web platform we route messages through Claude, but the existing
 * OmnichannelChatService still logs each message via `logChatMessage`. This
 * store provides a unified API that can be used by future services without
 * changing the current behaviour.
 */
export interface ChatMessage {
  sender: 'user' | 'sierra';
  text: string;
  platform: string;
  timestamp: Date;
}

export class ChatMemoryStore {
  // In‑memory cache: stakeholderId => array of messages
  private static cache: Map<string, ChatMessage[]> = new Map();

  /**
   * Add a message to the store and optionally persist to Firestore.
   */
  static async addMessage(
    stakeholderId: string,
    sender: 'user' | 'sierra',
    text: string,
    platform: string,
    persist = true
  ): Promise<void> {
    const entry = { sender, text, platform, timestamp: new Date() };
    const arr = this.cache.get(stakeholderId) ?? [];
    arr.push(entry);
    this.cache.set(stakeholderId, arr);

    if (persist) {
      // Reuse the existing logging implementation from OmnichannelChatService
      // to keep Firestore writes consistent.
      // Dynamic import to avoid circular dependency.
      const { adminDb } = await import('../server/firebase-admin');
      const { COLLECTIONS } = await import('../models/schema');
      const { Timestamp, FieldValue } = await import('firebase-admin/firestore');
      try {
        await adminDb
          .collection(COLLECTIONS.stakeholders)
          .doc(stakeholderId)
          .collection('messages')
          .add({
            sender,
            text,
            platform,
            timestamp: Timestamp.now()
          });
        await adminDb
          .collection(COLLECTIONS.stakeholders)
          .doc(stakeholderId)
          .update({
            lastContactAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            interactionCount: FieldValue.increment(1) as any
          });
      } catch (err) {
        console.error('❌ ChatMemoryStore persistence error:', err);
      }
    }
  }

  static async getHistory(stakeholderId: string): Promise<ChatMessage[]> {
    // Return a shallow copy to prevent external mutation.
    const msgs = this.cache.get(stakeholderId) ?? [];
    return [...msgs];
  }

  /** Clear a stakeholder's memory (both cache and Firestore). */
  static async clearSession(stakeholderId: string, alsoPersist = true): Promise<void> {
    this.cache.delete(stakeholderId);
    if (alsoPersist) {
      const { adminDb } = await import('../server/firebase-admin');
      const { COLLECTIONS } = await import('../models/schema');
      const { Timestamp } = await import('firebase-admin/firestore');
      try {
        // Delete subcollection of messages
        const messagesRef = adminDb.collection(COLLECTIONS.stakeholders).doc(stakeholderId).collection('messages');
        const snapshot = await messagesRef.get();
        const batch = adminDb.batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        // Reset interaction fields
        await adminDb
          .collection(COLLECTIONS.stakeholders)
          .doc(stakeholderId)
          .update({ interactionCount: 0, lastContactAt: null, updatedAt: Timestamp.now() } as any);
      } catch (err) {
        console.error('❌ ChatMemoryStore clear error:', err);
      }
    }
  }
}
