import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  FileSpreadsheet,
  Download,
  X,
  CheckCircle2,
  Filter,
  BarChart3,
  Users,
  GraduationCap,
  Scale,
  ShieldCheck,
  Building,
  Sparkles,
  Info,
  Calendar,
} from 'lucide-react';
import { Student, Faculty, ClassEntity, AcademicYear } from '../../types';
import {
  exportDashboardReportPDF,
  exportDashboardReportCSV,
  computeReportAnalytics,
} from '../../utils/reportGenerator';

interface DownloadReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  faculties: Faculty[];
  classes: ClassEntity[];
  academicYears: AcademicYear[];
  activeAcademicYear?: AcademicYear;
}

export const DownloadReportModal: React.FC<DownloadReportModalProps> = ({
  isOpen,
  onClose,
  students,
  faculties,
  classes,
  academicYears,
  activeAcademicYear,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'csv'>('pdf');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [includeCohortTrends, setIncludeCohortTrends] = useState(true);
  const [includeCoordinatorAudit, setIncludeCoordinatorAudit] = useState(true);
  const [includeDepartmentMatrix, setIncludeDepartmentMatrix] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Get distinct departments
  const departments = Array.from(
    new Set([
      ...students.map((s) => s.department),
      ...faculties.map((f) => f.department),
    ])
  ).sort();

  // Real-time computed summary
  const summary = computeReportAnalytics(
    students,
    faculties,
    classes,
    selectedDepartment
  );

  const handleDownload = () => {
    setIsGenerating(true);
    setDownloadSuccess(false);

    setTimeout(() => {
      try {
        if (selectedFormat === 'pdf') {
          exportDashboardReportPDF(students, faculties, classes, {
            departmentFilter: selectedDepartment,
            includeCohortTrends,
            includeCoordinatorAudit,
            includeDepartmentMatrix,
            activeAcademicYear,
          });
        } else {
          exportDashboardReportCSV(students, faculties, classes, {
            departmentFilter: selectedDepartment,
            activeAcademicYear,
          });
        }

        setDownloadSuccess(true);
        setTimeout(() => {
          setDownloadSuccess(false);
          onClose();
        }, 1200);
      } catch (err) {
        console.error('Error generating report:', err);
      } finally {
        setIsGenerating(false);
      }
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-lg flex items-center gap-2">
                  Academic Analytics Report
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
                    Executive Export
                  </span>
                </h3>
                <p className="text-xs text-indigo-100 mt-0.5">
                  Generate comprehensive PDF or CSV summaries of enrollment trends &amp; faculty ratios
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Format Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                1. Select Export Format
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* PDF Option */}
                <button
                  type="button"
                  onClick={() => setSelectedFormat('pdf')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                    selectedFormat === 'pdf'
                      ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-500/10 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-xl ${
                      selectedFormat === 'pdf'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        PDF Executive Document (.pdf)
                      </h4>
                      {selectedFormat === 'pdf' && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Formatted formal report with KPI boxes, styled matrix tables, and benchmark audit
                    </p>
                  </div>
                </button>

                {/* CSV Option */}
                <button
                  type="button"
                  onClick={() => setSelectedFormat('csv')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                    selectedFormat === 'csv'
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-500/10 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-xl ${
                      selectedFormat === 'csv'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Analytical CSV Data (.csv)
                      </h4>
                      {selectedFormat === 'csv' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Structured tabular data for MS Excel, Google Sheets, or institutional archiving
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Department Scope Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>2. Department Scope</span>
                <span className="text-[11px] font-normal text-slate-400 lowercase">
                  filter report coverage
                </span>
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Departments (Entire Institution)</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Inclusions & Sections (for PDF) */}
            {selectedFormat === 'pdf' && (
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  3. Report Sections Included
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeDepartmentMatrix}
                      onChange={(e) => setIncludeDepartmentMatrix(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Department Ratios</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeCohortTrends}
                      onChange={(e) => setIncludeCohortTrends(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Longitudinal Cohorts</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeCoordinatorAudit}
                      onChange={(e) => setIncludeCoordinatorAudit(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Coordinator Audit</span>
                  </label>
                </div>
              </div>
            )}

            {/* Scope Summary Preview Box */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-slate-800/50 border border-indigo-100 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                  <Info className="w-4 h-4" /> Summary of Included Metrics
                </span>
                <span className="font-mono text-[11px] text-slate-500">
                  {activeAcademicYear?.name || '2024-2025'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-medium block">Students</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                    {summary.totalStudents}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-medium block">Faculty</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {summary.totalFaculties}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-medium block">FSR Ratio</span>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400 font-mono">
                    1 : {summary.overallRatio}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-medium block">Coverage</span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                    {summary.coordinatorCoveragePct}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className={`px-5 py-2.5 rounded-xl text-white text-xs font-semibold shadow-lg flex items-center gap-2 transition-all cursor-pointer ${
                downloadSuccess
                  ? 'bg-emerald-600 shadow-emerald-600/30'
                  : selectedFormat === 'pdf'
                  ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30 hover:scale-105 active:scale-95'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30 hover:scale-105 active:scale-95'
              } ${isGenerating ? 'opacity-70 cursor-wait' : ''}`}
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Downloaded!
                </>
              ) : isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating {selectedFormat.toUpperCase()}...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download {selectedFormat.toUpperCase()} Report
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
