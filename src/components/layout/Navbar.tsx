import React, { useState } from 'react';
import {
  Search,
  Bell,
  Calendar,
  Sparkles,
  Download,
  RotateCcw,
  Check,
  ChevronDown,
  Menu,
  Sun,
  Moon,
  LogIn,
  LogOut,
  UserPlus,
  Crown,
  Shield,
  ShieldCheck,
  GraduationCap,
  Building,
  KeyRound,
  RefreshCw,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { UserRole } from '../../types';
import { AuthModal } from '../auth/AuthModal';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenActivity: () => void;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenActivity,
  onToggleSidebar,
}) => {
  const {
    academicYears,
    activeAcademicYear,
    setActiveAcademicYear,
    activityLogs,
    resetToDemoData,
    exportDatabaseJSON,
    theme,
    toggleTheme,
    currentUser,
    users,
    logout,
    switchUserRole,
  } = useAcademic();

  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const getRoleConfig = (role?: UserRole) => {
    switch (role) {
      case 'Admin':
        return {
          icon: <ShieldCheck className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />,
          avatarBg: 'from-rose-600 via-red-600 to-pink-700',
          badgeBg: 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-500/30',
          shortLabel: 'Super Admin',
        };
      case 'Principal/Director':
        return {
          icon: <Crown className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />,
          avatarBg: 'from-purple-600 to-indigo-700',
          badgeBg: 'bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-500/30',
          shortLabel: 'Principal',
        };
      case 'HOD':
        return {
          icon: <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
          avatarBg: 'from-emerald-600 to-teal-700',
          badgeBg: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
          shortLabel: 'HOD',
        };
      case 'Faculty':
      default:
        return {
          icon: <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
          avatarBg: 'from-blue-600 to-cyan-700',
          badgeBg: 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
          shortLabel: 'Faculty',
        };
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.)\s*/i, '').trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const currentRoleConfig = getRoleConfig(currentUser?.role);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 flex items-center justify-between gap-4 transition-colors duration-200 shadow-xs dark:shadow-none">
      {/* Left side: Mobile menu toggle + Academic session switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Academic Year Switcher Badge & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-200 transition-all hover:border-indigo-500/40 shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">Session:</span>
            <span className="font-bold text-slate-900 dark:text-white truncate max-w-[140px] sm:max-w-[200px]">
              {activeAcademicYear?.name || 'No Active AY'}
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
              ACTIVE
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          </button>

          {/* Dropdown Menu */}
          {isYearDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsYearDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl z-50 p-2 space-y-1">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">Switch Academic Session</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">All data context will synchronize</p>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1 py-1">
                  {academicYears.map((year) => (
                    <button
                      key={year.id}
                      onClick={() => {
                        setActiveAcademicYear(year.id);
                        setIsYearDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors ${
                        year.isActive
                          ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-500/30 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">{year.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          {year.code} • {year.term}
                        </div>
                      </div>
                      {year.isActive && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Middle: Global Search bar trigger */}
      <div className="flex-1 max-w-md hidden md:block">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/70 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/70 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-xs transition-all shadow-inner group"
        >
          <span className="flex items-center gap-2">
            <Search className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
            <span className="truncate">Search student, faculty, class, roll number...</span>
          </span>
          <kbd className="px-2 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 rounded-md shadow-xs">
            ⌘K / Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to High-Contrast Light Mode' : 'Switch to Dark Mode'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all hover:scale-105 active:scale-95 shadow-xs"
          aria-label="Toggle theme mode"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="hidden sm:inline">Dark Mode</span>
            </>
          )}
        </button>

        {/* Mobile Search trigger */}
        <button
          onClick={onOpenSearch}
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Quick JSON Export */}
        <button
          onClick={exportDatabaseJSON}
          title="Export Academic Data Backup (JSON)"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span>Export</span>
        </button>

        {/* Reset Demo Data */}
        <button
          onClick={resetToDemoData}
          title="Reset to Initial Academic Demo Dataset"
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Reset</span>
        </button>

        {/* Activity Logs Notification Bell */}
        <button
          onClick={onOpenActivity}
          className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Audit Log & Notifications"
          aria-label="View activity logs"
        >
          <Bell className="w-5 h-5" />
          {activityLogs.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          )}
        </button>

        {/* User Profile / Session Popover */}
        <div className="relative pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800">
          {currentUser ? (
            <button
              id="user-profile-btn"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60"
            >
              <div
                className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${currentRoleConfig.avatarBg} text-white flex items-center justify-center font-extrabold text-xs shadow-md shadow-indigo-500/20`}
              >
                {getInitials(currentUser.name)}
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[140px]">
                  {currentUser.name}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                    {currentUser.role}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>
          ) : (
            <button
              id="signin-prompt-btn"
              onClick={() => {
                setAuthModalMode('login');
                setIsAuthModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* User Profile Dropdown Menu */}
          {isProfileOpen && currentUser && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileOpen(false)}
              />
              <div
                id="user-profile-popover"
                className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl z-50 p-3 space-y-3 animate-in fade-in zoom-in-95 duration-150"
              >
                {/* Profile Card Header */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${currentRoleConfig.avatarBg} text-white flex items-center justify-center font-black text-sm shadow-md`}
                  >
                    {getInitials(currentUser.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                        {currentUser.name}
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {currentUser.email}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentRoleConfig.badgeBg} flex items-center gap-1`}
                      >
                        {currentRoleConfig.icon}
                        {currentUser.role}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">
                        {currentUser.employeeCode}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Account Details */}
                <div className="px-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5" /> Department:
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[160px] text-right">
                      {currentUser.department}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Designation:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[160px] text-right">
                      {currentUser.designation}
                    </span>
                  </div>
                </div>

                {/* Quick Role Switcher */}
                <div className="pt-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-2">
                    Switch Active Session Role
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['Admin', 'Principal/Director', 'HOD', 'Faculty'] as UserRole[]).map((r) => {
                      const isCurrent = currentUser.role === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => {
                            switchUserRole(r);
                            setIsProfileOpen(false);
                          }}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border text-center transition-all ${
                            isCurrent
                              ? r === 'Admin'
                                ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-600'
                                : r === 'Principal/Director'
                                ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-600'
                                : r === 'HOD'
                                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-600'
                                : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600'
                              : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                        >
                          {r === 'Principal/Director' ? 'Principal' : r}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions: Register / Sign In / Sign Out */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      setAuthModalMode('register');
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <UserPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Register New Academic Account</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      setAuthModalMode('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <LogIn className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span>Switch / Login Another User</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Authentication Modal (Login & Registration) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </header>
  );
};

