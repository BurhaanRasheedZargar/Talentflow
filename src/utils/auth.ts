/**
 * Authentication and authorization utilities
 */

import type { User, AuthSession } from '../db/types';
import { db } from '../db';

const SESSION_KEY = 'talentflow_session';

export async function login(username: string, password: string): Promise<User | null> {
  // In a real app, this would verify against a server
  // For mock: simple username/password check
  const user = await db.users.where('username').equals(username).first();
  
  if (!user) {
    // Create default users if none exist
    if ((await db.users.count()) === 0) {
      await seedDefaultUsers();
      return login(username, password);
    }
    return null;
  }

  // Mock password check (in real app, use bcrypt/hash)
  if (password !== 'password') return null;

  // Create session
  const session: AuthSession = {
    userId: user.id!,
    username: user.username,
    role: user.role,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return user;
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentSession(): AuthSession | null {
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return null;

  try {
    const session: AuthSession = JSON.parse(stored);
    if (session.expiresAt < Date.now()) {
      logout();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const session = getCurrentSession();
  if (!session) return null;

  const user = await db.users.get(session.userId);
  return user ?? null;
}

export function hasRole(requiredRole: 'admin' | 'recruiter' | 'viewer'): boolean {
  const session = getCurrentSession();
  if (!session) return false;

  const roleHierarchy = { viewer: 0, recruiter: 1, admin: 2 };
  return roleHierarchy[session.role] >= roleHierarchy[requiredRole];
}

export function hasPermission(permission: string): boolean {
  const session = getCurrentSession();
  if (!session) return true; // Allow all for now (optional auth)

  // Define permissions by role
  const permissions: Record<string, string[]> = {
    admin: ['*'], // All permissions
    recruiter: ['jobs.*', 'candidates.*', 'assessments.*', 'notes.*', 'export', 'import'],
    viewer: ['jobs.read', 'candidates.read', 'assessments.read'],
  };

  const userPerms = permissions[session.role] || [];
  return userPerms.includes('*') || userPerms.includes(permission);
}

async function seedDefaultUsers(): Promise<void> {
  await db.users.bulkAdd([
    {
      username: 'admin',
      email: 'admin@talentflow.com',
      name: 'Admin User',
      role: 'admin',
      createdAt: Date.now(),
    },
    {
      username: 'recruiter',
      email: 'recruiter@talentflow.com',
      name: 'Recruiter User',
      role: 'recruiter',
      createdAt: Date.now(),
    },
    {
      username: 'viewer',
      email: 'viewer@talentflow.com',
      name: 'Viewer User',
      role: 'viewer',
      createdAt: Date.now(),
    },
  ]);
}

