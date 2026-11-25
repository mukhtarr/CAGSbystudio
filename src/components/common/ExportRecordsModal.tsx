import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileSpreadsheet,
  Download,
  X,
  FileText,
  CheckCircle2,
  Filter,
  Layers,
  Sparkles,
  Info,
  Calendar,
} from 'lucide-react';
import { Student, Faculty, ClassEntity } from '../../types';
import {
  exportStudentsToCSV,
  exportStudentsToExcel,
  exportFacultiesToCSV,
  exportFacultiesToExcel,
} from '../../utils/exportUtils';
import { useAcademic } from '../../context/AcademicContext';

interface ExportRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'students' | 'faculties';
  filteredRecordsCount: number;
  totalRecordsCount: number;
  filteredStudents?: Student[];
  filteredFaculties?: Faculty[];
}

export const ExportRecordsModal: React.FC<ExportRecordsModalProps> = ({
  isOpen,
  onClose,
  entityType,
  filteredRecordsCount,
  totalRecordsCount,
  filteredStudents,
  filteredFaculties,
}) => {
  const { students, faculties, classes, logActivity, addToast } = useAcademic();

  const [exportScope, setExportScope] = useState<'filtered' | 'all'>('filtered');
  const [fileFormat, setFileFormat] = useState<'csv' | 'excel'>('excel');
  const [customPrefix, setCustomPrefix] = useState<string>(
    entityType === 'students' ? 'MYCAGS_Students_Roster' : 'MYCAGS_Faculty_Directory'
  );
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const targetCount = exportScope === 'filtered' ? filteredRecordsCount : totalRecordsCount;

  const handleExport = () => {
    setIsExporting(true);

    try {
      if (entityType === 'students') {
        const targetStudents =
          exportScope === 'filtered' && filteredStudents ? filteredStudents : students;

        if (fileFormat === 'csv') {
          exportStudentsToCSV(targetStudents, classes, faculties, customPrefix.trim() || 'MYCAGS_Students_Roster');
        } else {
          exportStudentsToExcel(targetStudents, classes, faculties, customPrefix.trim() || 'MYCAGS_Students_Records');
        }

        logActivity(
          'CREATE',
          'Students',
          `Exported ${targetStudents.length} student records in ${fileFormat.toUpperCase()} format (${exportScope} scope)`
        );
        addToast(
          'success',
          'Export Completed',
          `Successfully exported ${targetStudents.length} student records as ${fileFormat.toUpperCase()}`
        );
      } else {
        const targetFaculties =
          exportScope === 'filtered' && filteredFaculties ? filteredFaculties : faculties;

        if (fileFormat === 'csv') {
          exportFacultiesToCSV(targetFaculties, classes, customPrefix.trim() || 'MYCAGS_Faculty_Directory');
        } else {
          exportFacultiesToExcel(targetFaculties, classes, customPrefix.trim() || 'MYCAGS_Faculty_Directory');
        }

        logActivity(
          'CREATE',
          'Faculties',
          `Exported ${targetFaculties.length} faculty records in ${fileFormat.toUpperCase()} format (${exportScope} scope)`
        );
        addToast(
          'success',
          'Export Completed',
          `Successfully exported ${targetFaculties.length} faculty records as ${fileFormat.toUpperCase()}`
        );
      }

      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 500);
    } catch (err) {
      setIsExporting(false);
      addToast('error', 'Export Failed', 'An error occurred during file generation.');
    }
  };

  const studentFields = [
    'Roll & PRN Numbers',
    'Student Full Name',
    'Email & Mobile Phone',
    'Gender & Date of Birth',
    'Department & Degree Program',
    'Semester & Section Allocation',
    'Assigned Class Section Name',
    'Classroom Room & Shift',
    'Designated Class Coordinator',
    'Coordinator Email',
    'Admission Year',
    'Current CGPA',
    'Attendance %',
    'Academic Status',
    'Blood Group & Residential Address',
    'Guardian Contact Details',
    'Enrollment Date',
  ];

  const facultyFields = [
    'Employee Code',
    'Faculty Full Name',
    'Email & Phone Number',
    'Office Room Location',
    'Academic Department',
    'Faculty Designation (HOD, Prof, etc.)',
    'Highest Qualification',
    'Teaching Experience (Years)',
    'Research Specialization Domain',
    'Assigned Teaching Subjects',
    'Coordinator Duty Eligibility',
    'Currently Coordinated Classes',
    'Total Assigned Classes Count',
    'Employment Status',
    'Date of Joining',
  ];

  const activeFields = entityType === 'students' ? studentFields : facultyFields;
  const isStudent = entityType === 'students';
  const brandColor = isStudent ? 'indigo' : 'emerald';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3.5">
            <div
              className={`p-2.5 rounded-2xl ${
                isStudent
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                  : 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                Export Academic {isStudent ? 'Students' : 'Faculty'} Records
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate formatted CSV or Excel (.xls) spreadsheets with enriched metadata
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Export Scope Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-slate-500" /> Select Records Scope
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setExportScope('filtered')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  exportScope === 'filtered'
                    ? isStudent
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 text-indigo-950 dark:text-white ring-1 ring-indigo-500'
                      : 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-white ring-1 ring-emerald-500'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs">Filtered Results</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      exportScope === 'filtered'
                        ? isStudent
                          ? 'bg-indigo-600 text-white'
                          : 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {filteredRecordsCount} Records
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Export only the records matching your active search query and filters.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setExportScope('all')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  exportScope === 'all'
                    ? isStudent
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 text-indigo-950 dark:text-white ring-1 ring-indigo-500'
                      : 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-white ring-1 ring-emerald-500'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs">Entire Directory</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      exportScope === 'all'
                        ? isStudent
                          ? 'bg-indigo-600 text-white'
                          : 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {totalRecordsCount} Total
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Export all stored records regardless of current table filters.
                </p>
              </button>
            </div>
          </div>

          {/* Export File Format */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-500" /> Target File Format
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFileFormat('excel')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  fileFormat === 'excel'
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-white ring-1 ring-emerald-500'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 rounded-md bg-emerald-600 text-white font-bold text-[10px]">
                    XLS
                  </div>
                  <span className="font-bold text-xs">Microsoft Excel (.xls)</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Formatted spreadsheet with styled headers, custom column widths, and cell data types.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFileFormat('csv')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  fileFormat === 'csv'
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 text-blue-950 dark:text-white ring-1 ring-blue-500'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 rounded-md bg-blue-600 text-white font-bold text-[10px]">
                    CSV
                  </div>
                  <span className="font-bold text-xs">CSV Text File (.csv)</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Universal standard RFC 4180 format with UTF-8 BOM encoding for universal import.
                </p>
              </button>
            </div>
          </div>

          {/* Filename Customization */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              File Name Prefix
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customPrefix}
                onChange={(e) => setCustomPrefix(e.target.value)}
                placeholder="MYCAGS_Academic_Export"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
              <span className="text-xs text-slate-400 font-mono shrink-0">
                _{new Date().toISOString().slice(0, 10)}.{fileFormat === 'excel' ? 'xls' : 'csv'}
              </span>
            </div>
          </div>

          {/* Included Fields Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Comprehensive Columns Included ({activeFields.length} Attributes)
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Auto-Enriched</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
              {activeFields.map((field, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px]"
                >
                  {field}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Exporting <strong className="text-slate-900 dark:text-white">{targetCount}</strong> records
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting || targetCount === 0}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold text-white shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                isStudent
                  ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
              }`}
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Generating...' : `Download ${fileFormat.toUpperCase()}`}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
