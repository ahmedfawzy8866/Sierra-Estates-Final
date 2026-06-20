import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest, AuthResult } from '@/lib/server/auth-guard';
import { adminDb } from '@/lib/server/firebase-admin';
import { logger } from '@/lib/logger';

/** Only superadmins (or trusted service/cron callers) may grant the superadmin role to someone else. */
async function callerCanGrantSuperadmin(authResult: AuthResult): Promise<boolean> {
  if (authResult.method === 'secret-key' || authResult.method === 'cron-secret') return true;
  if (!authResult.uid) return false;
  const callerDoc = await adminDb.collection('users').doc(authResult.uid).get();
  return callerDoc.data()?.role === 'superadmin';
}

export async function GET(req: NextRequest) {
  // Verify admin authentication
  const authResult = await verifyAdminRequest(req);
  if (!authResult.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const usersSnap = await adminDb.collection('users').where('role', 'in', ['admin', 'agent', 'broker']).get();
    const team = usersSnap.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ success: true, team });
  } catch (err) {
    logger.error('Error fetching team:', err);
    return NextResponse.json(
      { error: 'Failed to fetch team', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // Verify admin authentication
  const authResult = await verifyAdminRequest(req);
  if (!authResult.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, name, email, phone, role } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (role === 'superadmin' && !(await callerCanGrantSuperadmin(authResult))) {
      return NextResponse.json({ error: 'Only a superadmin can grant the superadmin role' }, { status: 403 });
    }

    const data = {
      name,
      email,
      phone: phone || '',
      role: role || 'agent',
      status: 'active',
      createdAt: new Date(),
    };

    // When `id` (a Firebase Auth UID) is given, write to users/{uid} directly —
    // verifyAdminRequest looks up the caller's role by their UID, so granting
    // admin access to a specific signed-in user requires a doc at that exact path.
    const userId = id ? id : (await adminDb.collection('users').add(data)).id;
    if (id) {
      await adminDb.collection('users').doc(id).set(data, { merge: true });
    }

    return NextResponse.json({
      success: true,
      userId,
    });
  } catch (err) {
    logger.error('Error creating team member:', err);
    return NextResponse.json(
      { error: 'Failed to create team member', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  // Verify admin authentication
  const authResult = await verifyAdminRequest(req);
  if (!authResult.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, ...updateData } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    if (updateData.role === 'superadmin' && !(await callerCanGrantSuperadmin(authResult))) {
      return NextResponse.json({ error: 'Only a superadmin can grant the superadmin role' }, { status: 403 });
    }

    await adminDb.collection('users').doc(id).update({
      ...updateData,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error('Error updating team member:', err);
    return NextResponse.json(
      { error: 'Failed to update team member', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  // Verify admin authentication
  const authResult = await verifyAdminRequest(req);
  if (!authResult.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    await adminDb.collection('users').doc(userId).delete();

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error('Error deleting team member:', err);
    return NextResponse.json(
      { error: 'Failed to delete team member', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
