import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Calendar,
  School,
  UserCheck,
  Settings,
  BookOpen,
  Database,
  FileSpreadsheet,
  ChevronRight,
  Sparkles,
  X,
  AlertCircle,
  Sun,
  Moon,
  Crown,
  Shield,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { ActiveTab, UserRole } from '../../types';
import { getRoleConfig, getAllowedTabsForRole } from '../../utils/rolePermissions';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    activeTab,
    setActiveTab,
    students,
    faculties,
    subjects,
    classes,
    academicYears,
    courseTrackers,
    stats,
    theme,
    toggleTheme,
    currentUser,
  } = useAcademic();

  const roleConfig = getRoleConfig(currentUser?.role);
  const allowedTabs = getAllowedTabsForRole(currentUser?.role);

  // Department and Faculty specific counts for scoped badges
  const userDept = currentUser?.department || 'Computer Science & Engineering';
  const facultyId = currentUser?.employeeCode;

  // Filtered counts based on role
  const roleStudentsCount =
    currentUser?.role === 'HOD'
      ? students.filter((s) => s.department === userDept).length
      : students.length;

  const roleFacultiesCount =
    currentUser?.role === 'HOD'
      ? faculties.filter((f) => f.department === userDept).length
      : faculties.length;

  const roleSubjectsCount =
    currentUser?.role === 'HOD'
      ? subjects.filter((s) => s.department === userDept).length
      : currentUser?.role === 'Faculty'
      ? subjects.filter((s) => s.assignedFacultyIds.includes(currentUser.id) || s.department === userDept).length
      : subjects.length;

  const roleClassesCount =
    currentUser?.role === 'HOD'
      ? classes.filter((c) => c.department === userDept).length
      : classes.length;

  const roleCourseTrackersCount =
    currentUser?.role === 'HOD'
      ? courseTrackers.filter((t) => t.department === userDept).length
      : currentUser?.role === 'Faculty'
      ? courseTrackers.filter((t) => t.courseOwner.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[1] || '') || t.department === userDept).length
      : courseTrackers.length;

  const allNavItems: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
    badgeColor?: string;
    description: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      description:
        currentUser?.role === 'Admin'
          ? 'System-wide analytics'
          : currentUser?.role === 'Principal/Director'
          ? 'All departments stats'
          : currentUser?.role === 'HOD'
          ? `${userDept.split(' ')[0]} dept overview`
          : 'My teaching workstation',
    },
    {
      id: 'course-tracker',
      label: 'Course Tracker',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      badge: `${roleCourseTrackersCount} Courses`,
      badgeColor: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30 font-semibold',
      description:
        currentUser?.role === 'Faculty'
          ? 'My syllabus, attendance & tests'
          : currentUser?.role === 'HOD'
          ? 'Dept theory & lab delivery'
          : 'Campus theory & lab courses',
    },
    {
      id: 'subjects',
      label: currentUser?.role === 'Faculty' ? 'My Subjects' : 'Subjects & Courses',
      icon: <BookOpen className="w-5 h-5" />,
      badge: roleSubjectsCount,
      badgeColor: 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
      description:
        currentUser?.role === 'Faculty'
          ? 'Curriculum & teaching topics'
          : currentUser?.role === 'HOD'
          ? 'Manage department subjects'
          : 'Institutional curriculum catalog',
    },
    {
      id: 'classes',
      label: 'Classes & Sections',
      icon: <School className="w-5 h-5" />,
      badge: roleClassesCount,
      badgeColor: 'bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-500/30',
      description:
        currentUser?.role === 'HOD'
          ? 'Department sections & rooms'
          : 'Classrooms & section capacity',
    },
    {
      id: 'students',
      label: 'Students Roster',
      icon: <GraduationCap className="w-5 h-5" />,
      badge: roleStudentsCount,
      badgeColor: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30',
      description:
        currentUser?.role === 'HOD'
          ? 'Enrolled in department'
          : currentUser?.role === 'Faculty'
          ? 'Enrolled student roster'
          : 'Campus-wide student directory',
    },
    {
      id: 'faculties',
      label: 'Faculty Staff',
      icon: <Users className="w-5 h-5" />,
      badge: roleFacultiesCount,
      badgeColor: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
      description:
        currentUser?.role === 'HOD'
          ? 'Manage dept teaching staff'
          : 'All faculty roster & workload',
    },
    {
      id: 'coordinators',
      label: 'Class Coordinators',
      icon: <UserCheck className="w-5 h-5" />,
      badge: stats.unassignedClassesCount > 0 ? `${stats.unassignedClassesCount} Unassigned` : '100% Set',
      badgeColor:
        stats.unassignedClassesCount > 0
          ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-500/30 font-bold animate-pulse'
          : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
      description:
        currentUser?.role === 'HOD'
          ? 'Assign dept coordinators'
          : 'Campus coordinator allocation',
    },
    {
      id: 'academic-years',
      label: 'Academic Years',
      icon: <Calendar className="w-5 h-5" />,
      badge: academicYears.length,
      badgeColor: 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
      description: 'Sessions, terms & calendar',
    },
    {
      id: 'database',
      label: 'MySQL Database',
      icon: <Database className="w-5 h-5" />,
      badge: 'Admin Only',
      badgeColor: 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-500/30 font-bold',
      description: 'SQL queries & table engine',
    },
    {
      id: 'settings',
      label: 'System & Reports',
      icon: <Settings className="w-5 h-5" />,
      description: 'Audit, reports & backup',
    },
  ];

  // Filter nav items based on currentUser role privileges
  const navItems = allNavItems.filter((item) => allowedTabs.includes(item.id));

  const handleItemClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-white dark:bg-slate-900/95 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 shadow-lg lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/25 border border-indigo-400/30 text-white font-black text-xl tracking-wider">
              M
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                  MYCAGS
                </span>
                <span
                  className={`text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded border ${
                    currentUser?.role === 'Admin'
                      ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-500/30'
                      : currentUser?.role === 'Principal/Director'
                      ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-500/30'
                      : currentUser?.role === 'HOD'
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30'
                      : 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-500/30'
                  }`}
                >
                  {currentUser ? (currentUser.role === 'Principal/Director' ? 'Director' : currentUser.role) : 'Portal'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-tight">
                College Academics Portal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Authenticated Role Persona Card */}
        {currentUser && (
          <div className="mx-3 mt-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-2.5 shadow-xs">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm ${
                currentUser.role === 'Admin'
                  ? 'bg-gradient-to-tr from-rose-600 via-red-600 to-pink-700'
                  : currentUser.role === 'Principal/Director'
                  ? 'bg-gradient-to-tr from-purple-600 to-indigo-700'
                  : currentUser.role === 'HOD'
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-700'
                  : 'bg-gradient-to-tr from-blue-600 to-cyan-700'
              }`}
            >
              {currentUser.role === 'Admin' ? (
                <ShieldCheck className="w-4 h-4" />
              ) : currentUser.role === 'Principal/Director' ? (
                <Crown className="w-4 h-4" />
              ) : currentUser.role === 'HOD' ? (
                <Shield className="w-4 h-4" />
              ) : (
                <GraduationCap className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {currentUser.name}
                </p>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {currentUser.role} • {currentUser.employeeCode}
              </p>
            </div>
          </div>
        )}

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>
              {currentUser?.role === 'Admin'
                ? 'All Admin Privileges'
                : currentUser?.role === 'Principal/Director'
                ? 'Campus-Wide Stats & Audits'
                : currentUser?.role === 'HOD'
                ? `${userDept.split(' ')[0]} Dept Management`
                : 'Teaching Workstation'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono font-normal">
              {navItems.length} options
            </span>
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-indigo-700 text-white shadow-md shadow-indigo-600/25 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                    }`}
                  >
                    {item.icon}
                  </div>
                  <div className="truncate">
                    <div className="text-sm font-bold tracking-tight leading-tight">
                      {item.label}
                    </div>
                    <div
                      className={`text-[11px] truncate ${
                        isActive ? 'text-indigo-100 dark:text-indigo-200' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`ml-2 px-2 py-0.5 text-[11px] font-bold rounded-full border shrink-0 ${
                      isActive ? 'bg-white/20 text-white border-white/30' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick System Health Box */}
        <div className="p-4 m-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Coordinator Status
            </span>
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
              {stats.coordinatorAssignedPercentage}%
            </span>
          </div>

          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${stats.coordinatorAssignedPercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>{stats.assignedClassesCount} of {stats.totalClasses} Classes Assigned</span>
          </div>
        </div>

        {/* User Footer with Theme Toggle */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">System Online • v2.4</span>
          </div>

          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to High-Contrast Light Mode' : 'Switch to Dark Mode'}
            className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            aria-label="Toggle theme mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

