import { cookies } from 'next/headers';
import { UserRoleSession } from './types';

export const DEMO_USERS: Record<UserRoleSession['role'], UserRoleSession> = {
  BUYER: {
    role: 'BUYER',
    name: 'Morgan Blake',
    title: 'Hardware Buyer / Consumer',
  },
  TECHNICIAN: {
    role: 'TECHNICIAN',
    name: 'Alex Chen',
    title: 'Senior Hardware Bench Technician',
  },
  REVIEWER: {
    role: 'REVIEWER',
    name: 'Jordan Vance',
    title: 'Hardware Specification Lead Reviewer',
  },
};

export const ROLE_COOKIE_NAME = 'fitproof_demo_role';

/**
 * Returns the active user role session.
 * In this prototype demonstration, role is toggled via an explicit UI switcher stored in a secure cookie.
 * IMPORTANT: This is a prototype-only demonstration mechanism and must NOT be used for production auth.
 */
export async function getCurrentUser(): Promise<UserRoleSession> {
  const cookieStore = cookies();
  const roleCookie = cookieStore.get(ROLE_COOKIE_NAME)?.value as UserRoleSession['role'] | undefined;

  if (roleCookie && DEMO_USERS[roleCookie]) {
    return DEMO_USERS[roleCookie];
  }
  return DEMO_USERS.BUYER;
}

/**
 * Server-side role assertion for API mutations.
 */
export async function assertRole(allowed: UserRoleSession['role'][]): Promise<UserRoleSession> {
  const user = await getCurrentUser();
  if (!allowed.includes(user.role)) {
    throw new Error(
      `Unauthorized: Action requires role [${allowed.join(', ')}], but current active role is [${user.role}]. Switch role in top bar.`
    );
  }
  return user;
}

