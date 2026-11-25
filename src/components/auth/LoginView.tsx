import React, { useState } from 'react';
import {
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
  BookOpen,
  Calendar,
  School,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { UserRole, DepartmentType } from '../../types';
import { INITIAL_USER_CREDENTIALS } from '../../data/userData';

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

export const LoginView: React.FC = () => {
  const { login, register, loginAsDemoUser } = useAcademic();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Login Form
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form
  const [regRole, setRegRole] = useState<UserRole>('Faculty');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regEmployeeCode, setRegEmployeeCode] = useState('');
  const [regDepartment, setRegDepartment] = useState<string>('Computer Science & Engineering');
  const [regDesignation, setRegDesignation] = useState<string>('Assistant Professor');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

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
      setErrorMessage(result.error || 'Authentication failed');
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
      setErrorMessage(result.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center px-4 py-12 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10">
        {/* Header Branding */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border-b border-slate-800 text-white text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/30 text-white font-black text-2xl tracking-wider">
                M
              </div>
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="font-heading font-extrabold text-2xl tracking-tight text-white">
                    MYCAGS
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-300">
                    Academics
                  </span>
                </div>
                <p className="text-xs text-indigo-200/80 mt-0.5">
                  Institutional Portal • Faculty, HOD & Leadership
                </p>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex p-1 bg-black/40 rounded-xl border border-white/10 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMessage(null);
                }}
                className={`flex-1 sm:flex-none px-5 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'login'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setErrorMessage(null);
                }}
                className={`flex-1 sm:flex-none px-5 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'register'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" /> Register
              </button>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Quick Demo One-Click Access Cards (Visible in login mode) */}
          {activeTab === 'login' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Instant One-Click Role Access
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Select a persona to test
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Super Admin Demo */}
                <button
                  type="button"
                  onClick={() => loginAsDemoUser('Admin')}
                  className="p-3 rounded-2xl text-left bg-slate-800/60 hover:bg-slate-800 border border-rose-500/30 hover:border-rose-400 transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="p-1.5 rounded-xl bg-rose-500/20 text-rose-300">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Admin</span>
                      <span className="text-[10px] text-rose-300/80">All Privileges</span>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-slate-200 mt-1 truncate">Er. Rajesh Deshmukh</p>
                  <p className="text-[10px] text-slate-400 font-mono">ADM-001</p>
                </button>

                {/* Principal Demo */}
                <button
                  type="button"
                  onClick={() => loginAsDemoUser('Principal/Director')}
                  className="p-3 rounded-2xl text-left bg-slate-800/60 hover:bg-slate-800 border border-purple-500/30 hover:border-purple-400 transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="p-1.5 rounded-xl bg-purple-500/20 text-purple-300">
                      <Crown className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Director</span>
                      <span className="text-[10px] text-purple-300/80">All Dept Stats</span>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-slate-200 mt-1 truncate">Dr. Suresh Sharma</p>
                  <p className="text-[10px] text-slate-400 font-mono">DIR-001</p>
                </button>

                {/* HOD Demo */}
                <button
                  type="button"
                  onClick={() => loginAsDemoUser('HOD')}
                  className="p-3 rounded-2xl text-left bg-slate-800/60 hover:bg-slate-800 border border-emerald-500/30 hover:border-emerald-400 transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-300">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">HOD</span>
                      <span className="text-[10px] text-emerald-300/80">Dept Data Only</span>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-slate-200 mt-1 truncate">Dr. Arvind Deshmukh</p>
                  <p className="text-[10px] text-slate-400 font-mono">HOD-CSE-01</p>
                </button>

                {/* Faculty Demo */}
                <button
                  type="button"
                  onClick={() => loginAsDemoUser('Faculty')}
                  className="p-3 rounded-2xl text-left bg-slate-800/60 hover:bg-slate-800 border border-blue-500/30 hover:border-blue-400 transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="p-1.5 rounded-xl bg-blue-500/20 text-blue-300">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Faculty</span>
                      <span className="text-[10px] text-blue-300/80">Subject Data</span>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-slate-200 mt-1 truncate">Prof. Anita Rao</p>
                  <p className="text-[10px] text-slate-400 font-mono">FAC-CS-002</p>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'login' ? (
            /* ================= LOGIN FORM ================= */
            <form onSubmit={handleLoginSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Institutional Email or Employee Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. principal@mycags.edu or FAC-CS-002"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    Password
                  </label>
                  <span className="text-[11px] text-indigo-400">
                    Demo password: <code className="font-mono font-bold">admin123</code>
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your security password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <LogIn className="w-4 h-4" />
                Sign In to Portal
              </button>
            </form>
          ) : (
            /* ================= REGISTRATION FORM ================= */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Select Role to Register
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('Admin')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      regRole === 'Admin'
                        ? 'border-rose-500 bg-rose-950/40 text-rose-200 ring-2 ring-rose-500/30'
                        : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <ShieldCheck className={`w-4 h-4 ${regRole === 'Admin' ? 'text-rose-400' : 'text-slate-500'}`} />
                      {regRole === 'Admin' && <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />}
                    </div>
                    <p className="text-xs font-bold text-white">Admin</p>
                    <p className="text-[10px] text-slate-400">All Privileges</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('Principal/Director')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      regRole === 'Principal/Director'
                        ? 'border-purple-500 bg-purple-950/40 text-purple-200 ring-2 ring-purple-500/30'
                        : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Crown className={`w-4 h-4 ${regRole === 'Principal/Director' ? 'text-purple-400' : 'text-slate-500'}`} />
                      {regRole === 'Principal/Director' && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />}
                    </div>
                    <p className="text-xs font-bold text-white">Director</p>
                    <p className="text-[10px] text-slate-400">All Dept Stats</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('HOD')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      regRole === 'HOD'
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200 ring-2 ring-emerald-500/30'
                        : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Shield className={`w-4 h-4 ${regRole === 'HOD' ? 'text-emerald-400' : 'text-slate-500'}`} />
                      {regRole === 'HOD' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <p className="text-xs font-bold text-white">HOD</p>
                    <p className="text-[10px] text-slate-400">Dept Data</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('Faculty')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      regRole === 'Faculty'
                        ? 'border-blue-500 bg-blue-950/40 text-blue-200 ring-2 ring-blue-500/30'
                        : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <GraduationCap className={`w-4 h-4 ${regRole === 'Faculty' ? 'text-blue-400' : 'text-slate-500'}`} />
                      {regRole === 'Faculty' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                    </div>
                    <p className="text-xs font-bold text-white">Faculty</p>
                    <p className="text-[10px] text-slate-400">Subject Data</p>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Dr. Meenakshi Sundaram"
                      required
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Employee Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={regEmployeeCode}
                      onChange={(e) => setRegEmployeeCode(e.target.value.toUpperCase())}
                      placeholder={regRole === 'Faculty' ? 'FAC-CS-009' : regRole === 'HOD' ? 'HOD-CS-002' : 'DIR-002'}
                      required
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Institutional Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="academic.staff@mycags.edu"
                      required
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+91 98450 12345"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
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
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-400 text-xs"
                      />
                    ) : (
                      <select
                        value={regDepartment}
                        onChange={(e) => setRegDepartment(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
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
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Academic Designation
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={regDesignation}
                      onChange={(e) => setRegDesignation(e.target.value)}
                      placeholder={regRole === 'Faculty' ? 'Assistant Professor' : regRole === 'HOD' ? 'Head of Department' : 'Principal'}
                      required
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min. 4 characters"
                      required
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Re-type password"
                      required
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all mt-2"
              >
                <UserPlus className="w-4 h-4" />
                Complete Registration & Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
