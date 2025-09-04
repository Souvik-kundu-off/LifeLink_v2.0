import { User } from '../types';

// Demo accounts that work without backend connectivity
export const DEMO_ACCOUNTS = {
  admin: {
    email: 'admin@lifelink.com',
    password: 'admin123',
    user: {
      id: 'demo_admin',
      email: 'admin@lifelink.com',
      name: 'System Administrator',
      role: 'admin' as const,
      createdAt: new Date().toISOString()
    }
  },
  hospital: {
    email: 'staff@citygeneral.com',
    password: 'demo123',
    user: {
      id: 'demo_hospital',
      email: 'staff@citygeneral.com',
      name: 'Dr. Jane Cooper',
      role: 'hospital_staff' as const,
      hospitalId: 'h1',
      createdAt: new Date().toISOString()
    }
  },
  donor: {
    email: 'john.smith@email.com',
    password: 'demo123',
    user: {
      id: 'demo_donor',
      email: 'john.smith@email.com',
      name: 'John Smith',
      role: 'individual' as const,
      createdAt: new Date().toISOString()
    }
  },
  recipient: {
    email: 'emily.davis@email.com',
    password: 'demo123',
    user: {
      id: 'demo_recipient',
      email: 'emily.davis@email.com',
      name: 'Emily Davis',
      role: 'individual' as const,
      createdAt: new Date().toISOString()
    }
  }
};

export function getDemoUser(email: string, password: string): User | null {
  const account = Object.values(DEMO_ACCOUNTS).find(
    acc => acc.email === email && acc.password === password
  );
  
  return account?.user || null;
}

export function isDemoCredentials(email: string, password: string): boolean {
  return Object.values(DEMO_ACCOUNTS).some(
    acc => acc.email === email && acc.password === password
  );
}