import { AppUser } from '../types';

export interface UserCredential {
  user: AppUser;
  password: string;
}

export const INITIAL_USER_CREDENTIALS: UserCredential[] = [
  {
    user: {
      id: 'usr-adm-001',
      employeeCode: 'ADM-001',
      name: 'Er. Rajesh Deshmukh',
      email: 'admin@cags.edu',
      role: 'Admin',
      department: 'Central Administration & IT',
      designation: 'Chief System Administrator',
      phone: '+91 98000 00001',
      status: 'Active',
      lastLoginAt: '2026-09-03T07:45:00.000Z',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      createdAt: '2023-01-01T00:00:00.000Z',
    },
    password: 'admin123',
  },
  {
    user: {
      id: 'usr-dir-101',
      employeeCode: 'DIR-101',
      name: 'Dr. Suresh K. Sharma',
      email: 'director@cags.edu',
      role: 'Principal/Director',
      department: 'Institutional Leadership',
      designation: 'Principal & Campus Director',
      phone: '+91 98200 11001',
      status: 'Active',
      lastLoginAt: '2026-09-03T08:15:00.000Z',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: '2023-06-01T00:00:00.000Z',
    },
    password: 'director123',
  },
  {
    user: {
      id: 'usr-hod-201',
      employeeCode: 'HOD-CSE-01',
      name: 'Dr. Arvind Deshmukh',
      email: 'hod.cse@cags.edu',
      role: 'HOD',
      department: 'Computer Science & Engineering',
      designation: 'Head of Department (HOD) & Professor',
      phone: '+91 98231 44521',
      status: 'Active',
      lastLoginAt: '2026-09-03T09:30:00.000Z',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      createdAt: '2023-07-15T00:00:00.000Z',
    },
    password: 'hod123',
  },
  {
    user: {
      id: 'usr-fac-109',
      employeeCode: 'FAC-109',
      name: 'Prof. Mukhtar Ansari',
      email: 'mukhtar.ansari@cags.edu',
      role: 'Faculty',
      department: 'Computer Science & Engineering',
      designation: 'Assistant Professor & Class Coordinator',
      phone: '+91 98220 54321',
      status: 'Active',
      lastLoginAt: '2026-09-03T10:05:00.000Z',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      createdAt: '2024-01-10T00:00:00.000Z',
    },
    password: 'faculty123',
  },
  {
    user: {
      id: 'usr-hod-202',
      employeeCode: 'HOD-AIDS-01',
      name: 'Dr. Vikram Malhotra',
      email: 'hod.aids@cags.edu',
      role: 'HOD',
      department: 'Artificial Intelligence & Data Science',
      designation: 'Head of Department (HOD) & Associate Professor',
      phone: '+91 98450 11223',
      status: 'Active',
      lastLoginAt: '2026-09-02T16:20:00.000Z',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      createdAt: '2023-08-01T00:00:00.000Z',
    },
    password: 'hod123',
  },
  {
    user: {
      id: 'usr-fac-101',
      employeeCode: 'FAC-101',
      name: 'Dr. Sunita Kulkarni',
      email: 'sunita.kulkarni@cags.edu',
      role: 'Faculty',
      department: 'Computer Science & Engineering',
      designation: 'Professor',
      phone: '+91 98234 56789',
      status: 'Active',
      lastLoginAt: '2026-09-01T11:45:00.000Z',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      createdAt: '2023-06-15T00:00:00.000Z',
    },
    password: 'faculty123',
  },
];

export const INITIAL_USERS: AppUser[] = INITIAL_USER_CREDENTIALS.map((c) => c.user);
