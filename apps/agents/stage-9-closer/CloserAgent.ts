import { adminDb } from '../../web/src/lib/server/firebase-admin';
import { getTemplate } from './messaging/templates';
import * as admin from 'firebase-admin';

/**
 * Sierra Estates — THE CLOSER (AGENT 04)
 * Manages Stage 9 & 10 of the Intelligence Pipeline.
 * Responsible for Deal Orchestration, E-Signatures, and Closing.
 */
export class CloserAgent {
  private static instance: CloserAgent;
  private constructor() {}

  public static getInstance(): CloserAgent {
    if (!CloserAgent.instance) CloserAgent.instance = new CloserAgent();
    return CloserAgent.instance;
  }

  async handleViewingRequest(leadId: string, propertyCode: string) {
    try {
      const leadSnap     = await adminDb.collection('stakeholders').doc(leadId).get();
      const leadName     = leadSnap.data()?.name || 'Valued Investor';
      const propertySnap = await adminDb.collection('units').doc(propertyCode).get();
      const propertyTitle = propertySnap.exists ? (propertySnap.data()?.title || propertyCode) : propertyCode;

      const dealData = {
        leadId, propertyCode, clientName: leadName, propertyTitle,
        status: 'draft',
        orchestration: { currentStage: 9.0, nextAction: 'generate_proposal', leilaPersonaInformed: true },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const dealRef = await adminDb.collection('deals').add(dealData);
      const introMessage = getTemplate('viewingFollowUp', 'en')
        .replace('{propertyName}', propertyTitle)
        .replace('{leadName}', leadName);

      return { success: true, dealId: dealRef.id, introMessage, meta: { leadName, propertyTitle } };
    } catch (error) {
      console.error('[CloserAgent] S9 Initiation Failed:', error);
      throw error;
    }
  }

  async finalizeProposal(dealId: string, terms: Record<string, unknown>) {
    await adminDb.collection('deals').doc(dealId).update({
      status: 'offered', terms,
      'orchestration.currentStage': 9.1,
      'orchestration.nextAction': 'initiate_signing',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { success: true };
  }

  async initiateSigning(dealId: string, _leadEmail: string) {
    const signingUrl = `https://sign.sierraestates.ae?deal=${dealId}`;
    await adminDb.collection('deals').doc(dealId).update({
      status: 'signing', 'signing.status': 'sent',
      'orchestration.currentStage': 9.2,
      'orchestration.nextAction': 'wait_for_signature',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { success: true, signingUrl };
  }

  async completeClosing(dealId: string) {
    await adminDb.collection('deals').doc(dealId).update({
      status: 'closed',
      'orchestration.currentStage': 9.3,
      'orchestration.nextAction': 'trigger_s10_feedback',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { success: true, message: getTemplate('signingComplete', 'en') };
  }
}
