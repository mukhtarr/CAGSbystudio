import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Shield,
  ShieldCheck,
  Briefcase,
  Building,
  Phone,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Crown,
  KeyRound,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { UserRole, DepartmentType, FacultyDesignation } from '../../types';
import { INITIAL_USER_CREDENTIALS } from '../../data/userData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  initialRole?: UserRole;
}

const DEPARTMENTS: DepartmentType[] = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Artificial Intelligence & Data Science',
  'Management Studies (MBA)',
  'Computer Applications (BCA/MCA)',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  initialRole = 'Faculty',
}) => {
  const { login, register, loginAsDemoUser } = useAcademic();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form State
  const [regRole, setRegRole] = useState<UserRole>(initialRole);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regEmployeeCode, setRegEmployeeCode] = useState('');
  const [regDepartment, setRegDepartment] = useState<string>('Computer Science & Engineering');
  const [regDesignation, setRegDesignation] = useState<string>('Assistant Professor');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  if (!isOpen) return null;

  const handleRoleChange = (role: UserRole) => {
    setRegRole(role);
    setErrorMessage(null);
    if (role === 'Admin') {
      setRegDepartment('Central Administration & IT');
      setRegDesignation('Chief System Administrator');
      if (!regEmployeeCode || !regEmployeeCode.startsWith('ADM-')) {
        setRegEmployeeCode(`ADM-00${Math.floor(Math.random() * 90 + 10)}`);
      }
    } else if (role === 'Principal/Director') {
      setRegDepartment('Institutional Leadership');
      setRegDesignation('Principal / Director');
      if (!regEmployeeCode || regEmployeeCode.startsWith('FAC-') || regEmployeeCode.startsWith('HOD-') || regEmployeeCode.startsWith('ADM-')) {
        setRegEmployeeCode(`DIR-00${Math.floor(Math.random() * 90 + 10)}`);
      }
    } else if (role === 'HOD') {
      if (regDepartment === 'Institutional Leadership' || regDepartment === 'Central Administration & IT') {
        setRegDepartment('Computer Science & Engineering');
      }
      setRegDesignation('Head of Department & Professor');
      if (!regEmployeeCode || regEmployeeCode.startsWith('DIR-') || regEmployeeCode.startsWith('FAC-') || regEmployeeCode.startsWith('ADM-')) {
        setRegEmployeeCode(`HOD-CS-00${Math.floor(Math.random() * 9 + 1)}`);
      }
    } else {
      // Faculty
      if (regDepartment === 'Institutional Leadership' || regDepartment === 'Central Administration & IT') {
        setRegDepartment('Computer Science & Engineering');
      }
      setRegDesignation('Assistant Professor');
      if (!regEmployeeCode || regEmployeeCode.startsWith('DIR-') || regEmployeeCode.startsWith('HOD-') || regEmployeeCode.startsWith('ADM-')) {
        setRegEmployeeCode(`FAC-CS-0${Math.floor(Math.random() * 90 + 10)}`);
      }
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginIdentifier.trim()) {
      setErrorMessage('Please enter your institutional email or employee code.');
      return;
    }
    if (!loginPassword.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    const result = login(loginIdentifier, loginPassword);
    if (!result.success) {
      setErrorMessage(result.error || 'Failed to authenticate');
    } else {
      onClose();
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    if (regPassword.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }

    const result = register({
      name: regName,
      email: regEmail,
      employeeCode: regEmployeeCode,
      role: regRole,
      department: regDepartment,
      designation: regDesignation,
      phone: regPhone,
      password: regPassword,
    });

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to register account');
    } else {
      setSuccessMessage(`Account created successfully! Logged in as ${regName} (${regRole})`);
      setTimeout(() => {
        onClose();
      }, 700);
    }
  };

  const fillDemoLogin = (role: UserRole) => {
    const cred = INITIAL_USER_CREDENTIALS.find((c) => c.user.role === role);
    if (cred) {
      setLoginIdentifier(cred.user.email);
      setLoginPassword(cred.password);
      setErrorMessage(null);
    }
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="auth-modal-container"
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
                {mode === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  <span>{mode === 'login' ? 'Portal Authentication' : 'Create Academic Account'}</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200">
                    MYCAGS
                  </span>
                </h2>
                <p className="text-xs text-indigo-200/80">
                  Role-based access for Faculty, Head of Department & Principal / Director
                </p>
              </div>
            </div>

            <button
              id="close-auth-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="mt-4 flex p-1 bg-black/30 rounded-xl border border-white/10 max-w-xs">
            <button
              id="tab-login-btn"
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" /> Sign In
            </button>
            <button
              id="tab-register-btn"
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" /> Register
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Error / Success Notifications */}
          {errorMessage && (
            <div
              id="auth-error-banner"
              className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-rose-800 dark:text-rose-300 text-xs animate-in slide-in-from-top-1"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div
              id="auth-success-banner"
              className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs animate-in slide-in-from-top-1"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {/* Quick Demo One-Click Logins Banner (Always visible in Login mode) */}
          {mode === 'login' && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Instant One-Click Demo Logins
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  Pre-configured Accounts
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Admin Card */}
                <button
                  type="button"
                  onClick={() => {
                    loginAsDemoUser('Admin');
                    onClose();
                  }}
                  className="p-2.5 rounded-xl text-left bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800/40 hover:border-rose-500 dark:hover:border-rose-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Admin</span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                    Er. Rajesh Deshmukh
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    ADM-001
                  </p>
                </button>

                {/* Principal Card */}
                <button
                  type="button"
                  onClick={() => {
                    loginAsDemoUser('Principal/Director');
                    onClose();
                  }}
                  className="p-2.5 rounded-xl text-left bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800/40 hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300">
                      <Crown className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Principal</span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                    Dr. Suresh Sharma
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    DIR-001
                  </p>
                </button>

                {/* HOD Card */}
                <button
                  type="button"
                  onClick={() => {
                    loginAsDemoUser('HOD');
                    onClose();
                  }}
                  className="p-2.5 rounded-xl text-left bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/40 hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">HOD</span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                    Dr. Arvind Deshmukh
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    HOD-CSE-01
                  </p>
                </button>

                {/* Faculty Card */}
                <button
                  type="button"
                  onClick={() => {
                    loginAsDemoUser('Faculty');
                    onClose();
                  }}
                  className="p-2.5 rounded-xl text-left bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800/40 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">
                      <GraduationCap className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Faculty</span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                    Prof. Anita Rao
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    FAC-CS-002
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* ===================== LOGIN FORM ===================== */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Institutional Email or Employee Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="login-identifier-input"
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. principal@mycags.edu or FAC-CS-002"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400">
                    Default demo password: <code className="font-mono font-bold">admin123</code>
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your security password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="submit-login-btn"
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In to Academic Portal
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Don't have an institutional login account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Register here
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* ===================== REGISTRATION FORM ===================== */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Role Selection Cards */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Select Institutional Role
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* Admin Card */}
                  <button
                    type="button"
                    onClick={() => handleRoleChange('Admin')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      regRole === 'Admin'
                        ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <ShieldCheck className={`w-4 h-4 ${regRole === 'Admin' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`} />
                      {regRole === 'Admin' && <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />}
                    </div>
                    <p className="text-xs font-bold">Admin</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">All Privileges</p>
                  </button>

                  {/* Principal / Director Card */}
                  <button
                    type="button"
                    onClick={() => handleRoleChange('Principal/Director')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      regRole === 'Principal/Director'
                        ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 ring-2 ring-purple-500/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Crown className={`w-4 h-4 ${regRole === 'Principal/Director' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`} />
                      {regRole === 'Principal/Director' && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
                    </div>
                    <p className="text-xs font-bold">Principal</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">All Dept Stats</p>
                  </button>

                  {/* HOD Card */}
                  <button
                    type="button"
                    onClick={() => handleRoleChange('HOD')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      regRole === 'HOD'
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Shield className={`w-4 h-4 ${regRole === 'HOD' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                      {regRole === 'HOD' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                    </div>
                    <p className="text-xs font-bold">HOD</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Dept Data</p>
                  </button>

                  {/* Faculty Card */}
                  <button
                    type="button"
                    onClick={() => handleRoleChange('Faculty')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      regRole === 'Faculty'
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <GraduationCap className={`w-4 h-4 ${regRole === 'Faculty' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                      {regRole === 'Faculty' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                    </div>
                    <p className="text-xs font-bold">Faculty</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Subject Data</p>
                  </button>
                </div>
              </div>

              {/* Name & Employee Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Legal Name & Title
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-name-input"
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Dr. Meenakshi Sundaram"
                      required
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Employee Identification Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-code-input"
                      type="text"
                      value={regEmployeeCode}
                      onChange={(e) => setRegEmployeeCode(e.target.value.toUpperCase())}
                      placeholder={regRole === 'Faculty' ? 'FAC-CS-009' : regRole === 'HOD' ? 'HOD-CS-002' : 'DIR-002'}
                      required
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Institutional Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-email-input"
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="academic.staff@mycags.edu"
                      required
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Contact Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-phone-input"
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+91 98450 12345"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Department & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Department
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Building className="w-4 h-4" />
                    </div>
                    {regRole === 'Principal/Director' ? (
                      <input
                        type="text"
                        disabled
                        value="Institutional Leadership"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs"
                      />
                    ) : (
                      <select
                        id="reg-dept-select"
                        value={regDepartment}
                        onChange={(e) => setRegDepartment(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs"
                      >
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Academic Designation
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-designation-input"
                      type="text"
                      value={regDesignation}
                      onChange={(e) => setRegDesignation(e.target.value)}
                      placeholder={regRole === 'Faculty' ? 'Assistant Professor' : regRole === 'HOD' ? 'Head of Department' : 'Principal'}
                      required
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Security Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min. 4 characters"
                      required
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-confirm-password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Re-type password"
                      required
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Show Password Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  id="reg-toggle-pwd"
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="reg-toggle-pwd" className="text-xs text-slate-600 dark:text-slate-400 select-none cursor-pointer">
                  Show entered password
                </label>
              </div>

              <div className="pt-2">
                <button
                  id="submit-register-btn"
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  Complete Registration & Sign In
                </button>
              </div>

              <div className="text-center pt-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Sign In instead
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
