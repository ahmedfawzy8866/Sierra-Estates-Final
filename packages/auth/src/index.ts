/**
 * SIERRA ESTATES — SHARED AUTH LAYER
 *
 * ONE Firebase Auth for BOTH apps. Never create a second auth system.
 *
 * Roles via custom claims: admin | agent | employee
 * - admin:    Full access to all resources + user management + bot control
 * - agent:    CRM leads + listings management
 * - employee: Read access + lead management
 */

import type { UserRole } from '@sierra-estates/db';

// ─── Custom Claims Structure ────────────────────────────────────────

export interface SierraCustomClaims {
  role: UserRole;
  permissions: string[];
  department?: string;
}

// ─── Role Hierarchy ─────────────────────────────────────────────────

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 3,
  agent: 2,
  employee: 1,
} as const;

// ─── Permission Checks ──────────────────────────────────────────────

export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions: Record<UserRole, string[]> = {
    admin: ['read', 'write', 'delete', 'manage_users', 'deploy', 'manage_bots'],
    agent: ['read', 'write', 'manage_leads', 'manage_listings'],
    employee: ['read', 'manage_leads'],
  };
  return permissions[role]?.includes(permission) ?? false;
}

export function hasMinimumRole(role: UserRole, minimum: UserRole): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minimum];
}

export function isAdmin(role: UserRole): boolean {
  return role === 'admin';
}

export function canWrite(role: UserRole): boolean {
  return hasPermission(role, 'write');
}

export function canManageBots(role: UserRole): boolean {
  return hasPermission(role, 'manage_bots');
}

// ─── Vercel App — Client-side Auth Guard ────────────────────────────

/**
 * Use in Vercel middleware to gate dashboard routes.
 * Checks custom claims from the ID token.
 */
export function requireRole(claims: SierraCustomClaims | null, minimumRole: UserRole): boolean {
  if (!claims?.role) return false;
  return hasMinimumRole(claims.role, minimumRole);
}

// ─── Firebase Admin App — Server-side Auth Guard ────────────────────

/**
 * Use in Firebase Cloud Functions to verify requests.
 * Checks the Authorization header against Firebase Auth.
 */
export async function verifyRequestAuth(
  adminAuth: import('firebase-admin').auth.Auth,
  authorizationHeader: string | null
): Promise<{ uid: string; claims: SierraCustomClaims } | null> {
  if (!authorizationHeader?.startsWith('Bearer ')) return null;

  const token = authorizationHeader.slice(7);
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const role = (decoded.role as UserRole) || 'employee';
    return {
      uid: decoded.uid,
      claims: {
        role,
        permissions: [],
        department: decoded.department as string | undefined,
      },
    };
  } catch {
    return null;
  }
}
