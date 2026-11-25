import { UserRole, ActiveTab, DepartmentType } from '../types';

export interface RoleConfig {
  role: UserRole;
  title: string;
  badgeLabel: string;
  badgeClass: string;
  badgeBgLight: string;
  avatarGradient: string;
  description: string;
  allowedTabs: ActiveTab[];
  canAccessDatabase: boolean;
  canManageAcademicYears: boolean;
  canManageAllDepartments: boolean;
  canViewAllDepartmentStats: boolean;
  isDepartmentScoped: boolean;
  isSubjectScoped: boolean;
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  Admin: {
    role: 'Admin',
    title: 'System Administrator',
    badgeLabel: 'Super Admin',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40 ring-1 ring-rose-500/30',
    badgeBgLight: 'bg-rose-100 text-rose-800 border-rose-300',
    avatarGradient: 'from-rose-600 via-red-600 to-pink-700',
    description: 'All Privileges • Institutional Governance, Database, Academic Years & All Departments',
    allowedTabs: [
      'dashboard',
      'course-tracker',
      'students',
      'faculties',
      'subjects',
      'academic-years',
      'classes',
      'coordinators',
      'database',
      'settings',
    ],
    canAccessDatabase: true,
    canManageAcademicYears: true,
    canManageAllDepartments: true,
    canViewAllDepartmentStats: true,
    isDepartmentScoped: false,
    isSubjectScoped: false,
  },
  'Principal/Director': {
    role: 'Principal/Director',
    title: 'Principal / Campus Director',
    badgeLabel: 'Principal',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40 ring-1 ring-purple-500/30',
    badgeBgLight: 'bg-purple-100 text-purple-800 border-purple-300',
    avatarGradient: 'from-purple-600 via-indigo-600 to-violet-700',
    description: 'Executive Oversight • Inspect Stats of All Departments, Curricula & Accreditation',
    allowedTabs: [
      'dashboard',
      'course-tracker',
      'students',
      'faculties',
      'subjects',
      'academic-years',
      'classes',
      'coordinators',
      'settings',
    ],
    canAccessDatabase: false,
    canManageAcademicYears: true,
    canManageAllDepartments: false,
    canViewAllDepartmentStats: true,
    isDepartmentScoped: false,
    isSubjectScoped: false,
  },
  HOD: {
    role: 'HOD',
    title: 'Head of Department (HOD)',
    badgeLabel: 'HOD',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-500/30',
    badgeBgLight: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    avatarGradient: 'from-emerald-600 via-teal-600 to-cyan-700',
    description: 'Department Authority • Manage Department Subjects, Faculties, Classes & Students',
    allowedTabs: [
      'dashboard',
      'course-tracker',
      'subjects',
      'classes',
      'coordinators',
      'faculties',
      'students',
    ],
    canAccessDatabase: false,
    canManageAcademicYears: false,
    canManageAllDepartments: false,
    canViewAllDepartmentStats: false,
    isDepartmentScoped: true,
    isSubjectScoped: false,
  },
  Faculty: {
    role: 'Faculty',
    title: 'Faculty / Course In-Charge',
    badgeLabel: 'Faculty',
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40 ring-1 ring-blue-500/30',
    badgeBgLight: 'bg-blue-100 text-blue-800 border-blue-300',
    avatarGradient: 'from-blue-600 via-cyan-600 to-indigo-700',
    description: 'Teaching Workstation • Manage Assigned Subject Syllabi, Attendance & CIA Assessments',
    allowedTabs: [
      'course-tracker',
      'dashboard',
      'subjects',
      'classes',
      'students',
    ],
    canAccessDatabase: false,
    canManageAcademicYears: false,
    canManageAllDepartments: false,
    canViewAllDepartmentStats: false,
    isDepartmentScoped: false,
    isSubjectScoped: true,
  },
};

export const getRoleConfig = (role?: UserRole): RoleConfig => {
  if (!role || !ROLE_CONFIGS[role]) {
    return ROLE_CONFIGS.Faculty;
  }
  return ROLE_CONFIGS[role];
};

export const getAllowedTabsForRole = (role?: UserRole): ActiveTab[] => {
  return getRoleConfig(role).allowedTabs;
};

export const isTabAllowedForRole = (tab: ActiveTab, role?: UserRole): boolean => {
  return getAllowedTabsForRole(role).includes(tab);
};

export const canUserManageDepartment = (
  userRole?: UserRole,
  userDept?: string,
  targetDept?: string
): boolean => {
  if (userRole === 'Admin') return true;
  if (userRole === 'HOD') {
    if (!userDept || !targetDept) return true;
    return userDept.toLowerCase().trim() === targetDept.toLowerCase().trim();
  }
  return false;
};

export const canUserDeleteCourse = (
  userRole?: UserRole,
  userDept?: string,
  courseDept?: string
): boolean => {
  if (userRole === 'Admin') return true;
  if (userRole === 'HOD') {
    if (!userDept || !courseDept) return true;
    return userDept.toLowerCase().trim() === courseDept.toLowerCase().trim();
  }
  return false;
};

export const canUserAddCourse = (userRole?: UserRole): boolean => {
  // Admin and HOD can add courses. Faculty can also add course assigned to their subject
  return userRole === 'Admin' || userRole === 'HOD' || userRole === 'Faculty';
};

export const canUserEditCourse = (
  userRole?: UserRole,
  userDept?: string,
  courseDept?: string,
  userId?: string,
  courseOwnerFacultyId?: string
): boolean => {
  if (userRole === 'Admin') return true;
  if (userRole === 'HOD') {
    if (!userDept || !courseDept) return true;
    return userDept.toLowerCase().trim() === courseDept.toLowerCase().trim();
  }
  if (userRole === 'Faculty') {
    if (userId && courseOwnerFacultyId) {
      return userId === courseOwnerFacultyId;
    }
    return true;
  }
  return false;
};
