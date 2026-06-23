/**
 * Sierra Estates — Admin role-based access control
 *
 * Defines which staff roles can see each section of the unified admin dashboard.
 * Roles come from Firestore `users/{uid}.role` (see lib/AuthContext.tsx).
 *
 *   admin   → full control: agents, terminal, system config, everything
 *   manager → operations + analytics + automation monitoring (no system config)
 *   agent   → day-to-day operations only (leads, units, deals, media)
 */

export type Role = 'admin' | 'manager' | 'agent';

export type NavSection = 'Main' | 'Operations' | 'Analytics' | 'System';

export interface AdminNavItem {
  /** Route under /admin */
  href: string;
  /** Sidebar label */
  label: string;
  /** lucide-react icon name (resolved in the layout) */
  icon: string;
  /** Grouping in the sidebar */
  section: NavSection;
  /** Roles allowed to see + open this item */
  roles: Role[];
  /** Optional badge text shown on the right of the nav item */
  badge?: string;
  /** Badge color variant */
  badgeColor?: 'red' | 'green' | 'blue';
}

/**
 * Single source of truth for the admin navigation.
 * Ordered by section; the layout renders them grouped.
 */
export const ADMIN_NAV: AdminNavItem[] = [
  // ── MAIN ───────────────────────────────────────────────────────────
  { href: '/admin/dashboard',      label: 'Intelligence OS',  icon: 'LayoutDashboard', section: 'Main',       roles: ['admin', 'manager', 'agent'] },
  { href: '/admin/intelligence-os', label: 'Cognitive Console', icon: 'BrainCircuit',  section: 'Main',       roles: ['admin', 'manager'], badge: 'LIVE', badgeColor: 'green' },
  { href: '/admin/agents',         label: 'Agents & Bots',    icon: 'Bot',             section: 'Main',       roles: ['admin', 'manager'], badge: 'AI', badgeColor: 'green' },
  { href: '/admin/sync',           label: 'Workflows & Sync', icon: 'Zap',             section: 'Main',       roles: ['admin', 'manager'] },
  { href: '/admin/knowledge-base', label: 'Knowledge Base',   icon: 'BookOpen',        section: 'Main',       roles: ['admin', 'manager'] },

  // ── OPERATIONS ─────────────────────────────────────────────────────
  { href: '/admin/crm',            label: 'CRM Board',        icon: 'Briefcase',       section: 'Operations', roles: ['admin', 'manager', 'agent'] },
  { href: '/admin/leads',          label: 'Leads Queue',      icon: 'ClipboardList',   section: 'Operations', roles: ['admin', 'manager', 'agent'] },
  { href: '/admin/easylisting',    label: 'EasyListing',      icon: 'Wand2',           section: 'Operations', roles: ['admin', 'manager', 'agent'] },
  { href: '/admin/whatsapp-sender', label: 'WhatsApp Sender', icon: 'MessageSquare',  section: 'Operations', roles: ['admin', 'manager'] },
  { href: '/admin/owner-negotiations', label: 'Owner Negotiations', icon: 'Users', section: 'Operations', roles: ['admin', 'manager'] },
  { href: '/admin/units',          label: 'Listings Hub',     icon: 'Building2',       section: 'Operations', roles: ['admin', 'manager', 'agent'] },
  { href: '/admin/deals',          label: 'Deals · Closer',   icon: 'Handshake',       section: 'Operations', roles: ['admin', 'manager', 'agent'] },
  { href: '/admin/media',          label: 'Media Hub',        icon: 'ImageIcon',       section: 'Operations', roles: ['admin', 'manager', 'agent'] },

  // ── ANALYTICS ──────────────────────────────────────────────────────
  { href: '/admin/reports',        label: 'Reports',          icon: 'BarChart3',       section: 'Analytics',  roles: ['admin', 'manager'] },

  // ── SYSTEM ─────────────────────────────────────────────────────────
  { href: '/admin/database',       label: 'Database',         icon: 'Database',        section: 'System',     roles: ['admin'] },
  { href: '/admin/settings',       label: 'System Config',    icon: 'Settings',        section: 'System',     roles: ['admin'] },
];

export const NAV_SECTION_ORDER: NavSection[] = ['Main', 'Operations', 'Analytics', 'System'];

/** Returns the nav items a given role is allowed to see. */
export function navForRole(role: Role | null): AdminNavItem[] {
  if (!role) return [];
  return ADMIN_NAV.filter((item) => item.roles.includes(role));
}

/** Whether a role may access a specific /admin path. */
export function canAccessPath(role: Role | null, pathname: string): boolean {
  if (!role) return false;
  const item = ADMIN_NAV.find((n) => pathname.startsWith(n.href));
  // Unlisted paths (e.g. nested detail routes) inherit access from their prefix;
  // if no match is found, default to allowing signed-in staff.
  if (!item) return true;
  return item.roles.includes(role);
}
