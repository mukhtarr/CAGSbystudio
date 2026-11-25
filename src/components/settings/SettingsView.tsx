import React from 'react';
import { motion } from 'motion/react';
import {
  Settings,
  Download,
  RotateCcw,
  Database,
  Shield,
  FileSpreadsheet,
  Terminal,
  Sparkles,
  Layers,
  HelpCircle,
  Sun,
  Moon,
  Check,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';

export const SettingsView: React.FC = () => {
  const {
    exportDatabaseJSON,
    exportStudentsCSV,
    exportStudentsExcel,
    exportFacultiesCSV,
    exportFacultiesExcel,
    resetToDemoData,
    students,
    faculties,
    classes,
    academicYears,
    activityLogs,
    theme,
    setTheme,
  } = useAcademic();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3.5 p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl lg:text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
            System Configuration & Academic Data Backups
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Customize theme appearance, export academic records, manage persistent storage, and view shortcuts
          </p>
        </div>
      </div>

      {/* Theme Customization Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" /> Appearance & Theme Switcher
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Toggle between modern Deep Dark Mode and High-Contrast Light Mode with full Tailwind consistency
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
            Active: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Light Mode Card */}
          <button
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
              theme === 'light'
                ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30 shadow-md'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-600 border border-amber-200 shadow-xs">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">High-Contrast Light Mode</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Crisp white canvas, high legibility</p>
                </div>
              </div>
              {theme === 'light' && (
                <span className="p-1 rounded-full bg-indigo-600 text-white">
                  <Check className="w-3.5 h-3.5" />
                </span>
              )}
            </div>

            {/* Mini visual mockup */}
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-xs">
              <div className="h-2 w-1/3 bg-indigo-600 rounded" />
              <div className="h-1.5 w-full bg-slate-200 rounded" />
              <div className="h-1.5 w-2/3 bg-slate-100 rounded" />
            </div>
          </button>

          {/* Dark Mode Card */}
          <button
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
              theme === 'dark'
                ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30 shadow-md'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-800 text-indigo-400 border border-slate-700 shadow-xs">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Classic Dark Mode</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Deep slate palette, easy on eyes</p>
                </div>
              </div>
              {theme === 'dark' && (
                <span className="p-1 rounded-full bg-indigo-600 text-white">
                  <Check className="w-3.5 h-3.5" />
                </span>
              )}
            </div>

            {/* Mini visual mockup */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 shadow-xs">
              <div className="h-2 w-1/3 bg-indigo-500 rounded" />
              <div className="h-1.5 w-full bg-slate-800 rounded" />
              <div className="h-1.5 w-2/3 bg-slate-850 rounded" />
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Data Persistence & Backups */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Academic Data Management
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            All students, faculty profiles, classes, coordinator assignments, and academic years are safely stored locally in your browser's persistent storage.
          </p>

          <div className="space-y-3 pt-2">
            <button
              onClick={exportDatabaseJSON}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500/40 text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Export Full Database Backup (JSON)</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Includes all {students.length} students, {faculties.length} faculties, {classes.length} classes, and audit logs
                  </p>
                </div>
              </div>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Download</span>
            </button>

            {/* Students Export */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Student Academic Records ({students.length})</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Enriched with coordinators, sections, CGPA, and attendance</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => exportStudentsExcel()}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Export Excel (.xls)
                </button>
                <button
                  onClick={() => exportStudentsCSV()}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Export CSV (.csv)
                </button>
              </div>
            </div>

            {/* Faculty Export */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Faculty Directory Records ({faculties.length})</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Includes designations, subjects, specializations, and duties</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => exportFacultiesExcel()}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Export Excel (.xls)
                </button>
                <button
                  onClick={() => exportFacultiesCSV()}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Export CSV (.csv)
                </button>
              </div>
            </div>

            <button
              onClick={resetToDemoData}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-slate-200 dark:border-slate-700 hover:border-rose-500/40 text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Reset to Initial Demo Dataset</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Restores 12+ students, 8 faculties, 6 classes, and coordinators
                  </p>
                </div>
              </div>
              <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">Reset</span>
            </button>
          </div>
        </div>

        {/* Database Inventory Metrics */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" /> Database Inventory Overview
          </h3>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Total Students</span>
              <div className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white mt-1">
                {students.length}
              </div>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">Enrolled in classes</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Faculty Staff</span>
              <div className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white mt-1">
                {faculties.length}
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Professors & Lecturers</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Class Sections</span>
              <div className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white mt-1">
                {classes.length}
              </div>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Across all programs</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Audit Logs</span>
              <div className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white mt-1">
                {activityLogs.length}
              </div>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">System events tracked</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="text-slate-500 dark:text-slate-400">Application Architecture:</span>
              <span className="font-semibold text-slate-900 dark:text-white">MYCAGS v2.4 (College Academics Portal)</span>
            </div>
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="text-slate-500 dark:text-slate-400">Theme System:</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">Dynamic High-Contrast / Dark Engine</span>
            </div>
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="text-slate-500 dark:text-slate-400">CRUD Engine:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Synchronous Context + LocalStorage</span>
            </div>
          </div>
        </div>

        {/* Global Keyboard Shortcuts */}
        <div className="md:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-teal-600 dark:text-teal-400" /> Keyboard Shortcuts & Quick Navigation
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-300 font-medium">Global Search</span>
              <kbd className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 font-mono border border-slate-300 dark:border-slate-700 font-bold shadow-xs">
                Ctrl + K / ⌘K
              </kbd>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-300 font-medium">Switch Sessions</span>
              <kbd className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-300 font-mono border border-slate-300 dark:border-slate-700 font-bold shadow-xs">
                Navbar Session
              </kbd>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-300 font-medium">Audit Logs</span>
              <kbd className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 font-mono border border-slate-300 dark:border-slate-700 font-bold shadow-xs">
                Bell Icon (Top Right)
              </kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

