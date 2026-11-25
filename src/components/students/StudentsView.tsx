import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  FileSpreadsheet,
  Edit2,
  Trash2,
  Eye,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  LayoutGrid,
  List,
  Sparkles,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Building,
  ChevronDown,
  FileText,
  Settings2,
  CheckSquare,
  Square,
  School,
  UserCheck,
  UserX,
  Users,
  X,
} from 'lucide-react';
import { Student, DepartmentType, DegreeType, StudentStatus } from '../../types';
import { useAcademic } from '../../context/AcademicContext';
import { StudentModal } from './StudentModal';
import { StudentProfileModal } from './StudentProfileModal';
import { StudentCsvImportModal } from './StudentCsvImportModal';
import { BulkAssignClassModal } from './BulkAssignClassModal';
import { BulkDeleteStudentsModal } from './BulkDeleteStudentsModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { ExportRecordsModal } from '../common/ExportRecordsModal';

export type StudentSortKey =
  | 'name'
  | 'roll'
  | 'dept'
  | 'class'
  | 'cgpa'
  | 'attendance'
  | 'status'
  | 'enrollmentDate';

export const StudentsView: React.FC = () => {
  const {
    students,
    classes,
    faculties,
    deleteStudent,
    updateStudent,
    bulkDeleteStudents,
    bulkAssignStudentsToClass,
    bulkUpdateStudentsStatus,
    getClassById,
    getCoordinatorForClass,
    exportStudentsCSV,
    exportStudentsExcel,
  } = useAcademic();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<StudentSortKey>('roll');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Bulk Selection State
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCsvImportModalOpen, setIsCsvImportModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [profileStudent, setProfileStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);

  // Departments list for filter
  const departments = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => set.add(s.department));
    return Array.from(set);
  }, [students]);

  // Filtered & Sorted Students
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !query ||
          s.firstName.toLowerCase().includes(query) ||
          s.lastName.toLowerCase().includes(query) ||
          s.rollNo.toLowerCase().includes(query) ||
          s.prnNo.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query);

        const matchesDept = selectedDept === 'ALL' || s.department === selectedDept;
        const matchesClass = selectedClass === 'ALL' || s.classId === selectedClass;
        const matchesStatus = selectedStatus === 'ALL' || s.status === selectedStatus;

        return matchesQuery && matchesDept && matchesClass && matchesStatus;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'name') {
          comp = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        } else if (sortBy === 'roll') {
          comp = a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true, sensitivity: 'base' });
        } else if (sortBy === 'dept') {
          comp = a.department.localeCompare(b.department) || a.degree.localeCompare(b.degree) || a.semester - b.semester;
        } else if (sortBy === 'class') {
          const classA = getClassById(a.classId)?.name || '';
          const classB = getClassById(b.classId)?.name || '';
          comp = classA.localeCompare(classB);
        } else if (sortBy === 'cgpa') {
          comp = a.cgpa - b.cgpa;
        } else if (sortBy === 'attendance') {
          comp = a.attendancePercent - b.attendancePercent;
        } else if (sortBy === 'status') {
          comp = a.status.localeCompare(b.status);
        } else if (sortBy === 'enrollmentDate') {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : a.admissionYear || 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : b.admissionYear || 0;
          comp = dateA - dateB;
        }
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [students, searchQuery, selectedDept, selectedClass, selectedStatus, sortBy, sortOrder, getClassById]);

  // Column sort click handler
  const handleSortColumn = (column: StudentSortKey) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      // Default to desc for CGPA & Attendance for faster high-performer inspection, asc for others
      setSortOrder(column === 'cgpa' || column === 'attendance' ? 'desc' : 'asc');
    }
  };

  // Helper to render sortable table header buttons
  const renderSortHeader = (
    key: StudentSortKey,
    label: string,
    align: 'left' | 'center' | 'right' = 'left'
  ) => {
    const isActive = sortBy === key;
    return (
      <button
        type="button"
        onClick={() => handleSortColumn(key)}
        className={`inline-flex items-center gap-1.5 font-semibold transition-colors group cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md px-1.5 py-1 -mx-1.5 ${
          isActive
            ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/70 dark:bg-indigo-950/40'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
        } ${
          align === 'center'
            ? 'justify-center mx-auto'
            : align === 'right'
            ? 'justify-end ml-auto'
            : 'justify-start'
        }`}
        title={`Sort by ${label} (${
          isActive
            ? sortOrder === 'asc'
              ? 'Ascending - Click to invert'
              : 'Descending - Click to invert'
            : 'Click to sort'
        })`}
      >
        <span>{label}</span>
        <span className="shrink-0">
          {isActive ? (
            sortOrder === 'asc' ? (
              <ArrowUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <ArrowDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            )
          ) : (
            <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-40 group-hover:opacity-100 transition-opacity" />
          )}
        </span>
      </button>
    );
  };

  // Quick status breakdown stats
  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter((s) => s.status === 'Active').length;
    const inactive = students.filter((s) => s.status === 'Inactive').length;
    const graduated = students.filter((s) => s.status === 'Graduated').length;
    const suspended = students.filter((s) => s.status === 'Suspended').length;
    const activePercent = total > 0 ? Math.round((active / total) * 100) : 0;
    const inactivePercent = total > 0 ? Math.round((inactive / total) * 100) : 0;

    return {
      total,
      active,
      inactive,
      graduated,
      suspended,
      activePercent,
      inactivePercent,
    };
  }, [students]);

  // Selection helpers
  const selectedStudentsList = useMemo(() => {
    return students.filter((s) => selectedStudentIds.has(s.id));
  }, [students, selectedStudentIds]);

  const isAllFilteredSelected = useMemo(() => {
    return (
      filteredStudents.length > 0 &&
      filteredStudents.every((s) => selectedStudentIds.has(s.id))
    );
  }, [filteredStudents, selectedStudentIds]);

  const isSomeFilteredSelected = useMemo(() => {
    return (
      filteredStudents.some((s) => selectedStudentIds.has(s.id)) &&
      !isAllFilteredSelected
    );
  }, [filteredStudents, selectedStudentIds, isAllFilteredSelected]);

  const toggleSelectStudent = (id: string) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      // Deselect all filtered
      setSelectedStudentIds((prev) => {
        const next = new Set(prev);
        filteredStudents.forEach((s) => next.delete(s.id));
        return next;
      });
    } else {
      // Select all filtered
      setSelectedStudentIds((prev) => {
        const next = new Set(prev);
        filteredStudents.forEach((s) => next.add(s.id));
        return next;
      });
    }
  };

  const handleClearSelection = () => {
    setSelectedStudentIds(new Set());
  };

  const handleBulkStatusChange = (status: StudentStatus) => {
    const ids = Array.from(selectedStudentIds);
    bulkUpdateStudentsStatus(ids, status);
    setIsStatusDropdownOpen(false);
  };

  const handleBulkAssign = (studentIds: string[], classId: string) => {
    bulkAssignStudentsToClass(studentIds, classId);
    handleClearSelection();
  };

  const handleBulkDelete = (ids: string[]) => {
    bulkDeleteStudents(ids);
    handleClearSelection();
  };

  const handleExportSelected = () => {
    if (selectedStudentsList.length > 0) {
      exportStudentsExcel(selectedStudentsList);
    }
  };

  const handleOpenAdd = () => {
    setStudentToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setStudentToEdit(student);
    setIsModalOpen(true);
  };

  const toggleStatus = (student: Student) => {
    const nextStatus: StudentStatus = student.status === 'Active' ? 'Inactive' : 'Active';
    updateStudent(student.id, { status: nextStatus });
  };

  return (
    <div className="space-y-6 pb-16 relative">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
              Students Roster Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage student enrollment, section allocations, attendance, and bulk batch operations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* CSV Import Button */}
          <button
            onClick={() => setIsCsvImportModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            title="Batch Import Students from CSV"
          >
            <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Import CSV</span>
          </button>

          {/* Export Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              title="Export Students Records"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isExportDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsExportDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl z-30 p-2 space-y-1">
                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-700/60 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Export Academic Records
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {filteredStudents.length} matching / {students.length} total
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      exportStudentsExcel(filteredStudents);
                      setIsExportDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>Export to Excel (.xls)</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold">
                      {filteredStudents.length}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      exportStudentsCSV(filteredStudents);
                      setIsExportDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-700 dark:hover:text-blue-400 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-blue-600" />
                      <span>Export to CSV (.csv)</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold">
                      {filteredStudents.length}
                    </span>
                  </button>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-700/60 mt-1">
                    <button
                      onClick={() => {
                        setIsExportDropdownOpen(false);
                        setIsExportModalOpen(true);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Settings2 className="w-4 h-4" />
                      <span>Advanced Export Options...</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Enroll Student
          </button>
        </div>
      </div>

      {/* Quick Stats Overview Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <button
          type="button"
          onClick={() => setSelectedStatus('ALL')}
          className={`p-4 rounded-2xl bg-white dark:bg-slate-900/90 border transition-all text-left shadow-sm flex items-center justify-between group cursor-pointer ${
            selectedStatus === 'ALL'
              ? 'border-indigo-500/80 ring-2 ring-indigo-500/10 shadow-indigo-500/5 bg-indigo-50/20 dark:bg-indigo-950/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Students
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
                {stats.total}
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                enrolled
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              All academic rosters
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5" />
          </div>
        </button>

        {/* Active Students */}
        <button
          type="button"
          onClick={() => setSelectedStatus(selectedStatus === 'Active' ? 'ALL' : 'Active')}
          className={`p-4 rounded-2xl bg-white dark:bg-slate-900/90 border transition-all text-left shadow-sm flex items-center justify-between group cursor-pointer ${
            selectedStatus === 'Active'
              ? 'border-emerald-500/80 ring-2 ring-emerald-500/10 shadow-emerald-500/5 bg-emerald-50/20 dark:bg-emerald-950/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              Active Students
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
                {stats.active}
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/20">
                {stats.activePercent}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Attending &amp; enrolled
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <UserCheck className="w-5 h-5" />
          </div>
        </button>

        {/* Inactive Students */}
        <button
          type="button"
          onClick={() => setSelectedStatus(selectedStatus === 'Inactive' ? 'ALL' : 'Inactive')}
          className={`p-4 rounded-2xl bg-white dark:bg-slate-900/90 border transition-all text-left shadow-sm flex items-center justify-between group cursor-pointer ${
            selectedStatus === 'Inactive'
              ? 'border-amber-500/80 ring-2 ring-amber-500/10 shadow-amber-500/5 bg-amber-50/20 dark:bg-amber-950/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              Inactive Students
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
                {stats.inactive}
              </span>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-500/20">
                {stats.inactivePercent}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Leave / pending status
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <UserX className="w-5 h-5" />
          </div>
        </button>

        {/* Graduated & Other */}
        <button
          type="button"
          onClick={() => setSelectedStatus(selectedStatus === 'Graduated' ? 'ALL' : 'Graduated')}
          className={`p-4 rounded-2xl bg-white dark:bg-slate-900/90 border transition-all text-left shadow-sm flex items-center justify-between group cursor-pointer ${
            selectedStatus === 'Graduated'
              ? 'border-purple-500/80 ring-2 ring-purple-500/10 shadow-purple-500/5 bg-purple-50/20 dark:bg-purple-950/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
              Graduated &amp; Other
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
                {stats.graduated}
              </span>
              {stats.suspended > 0 ? (
                <span className="text-[11px] font-medium text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-1.5 py-0.5 rounded-md border border-rose-200 dark:border-rose-500/20">
                  {stats.suspended} Suspended
                </span>
              ) : (
                <span className="text-[11px] font-medium text-slate-400">
                  alumni
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Alumni &amp; completed
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
        </button>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, roll no, PRN, email..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Departments ({departments.length})</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Class Section Filter */}
          <div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Classes / Sections</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Graduated">Graduated</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Sub-bar: Sort, Selection status and View toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3 flex-wrap">
            <span>
              Showing <strong className="text-slate-900 dark:text-white">{filteredStudents.length}</strong> of {students.length} students
            </span>

            {selectedStudentIds.size > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-500/20">
                <CheckSquare className="w-3.5 h-3.5" />
                {selectedStudentIds.size} selected
                <button
                  onClick={handleClearSelection}
                  className="ml-1 hover:text-indigo-900 dark:hover:text-white cursor-pointer font-bold"
                  title="Clear Selection"
                >
                  ×
                </button>
              </span>
            )}

            {(searchQuery || selectedDept !== 'ALL' || selectedClass !== 'ALL' || selectedStatus !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDept('ALL');
                  setSelectedClass('ALL');
                  setSelectedStatus('ALL');
                }}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as StudentSortKey)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
              >
                <option value="roll">Roll Number</option>
                <option value="name">Student Name</option>
                <option value="dept">Department & Degree</option>
                <option value="class">Class / Section</option>
                <option value="cgpa">CGPA</option>
                <option value="attendance">Attendance %</option>
                <option value="status">Student Status</option>
                <option value="enrollmentDate">Enrollment Date / Year</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                title={`Order: ${sortOrder === 'asc' ? 'Ascending (Click for Descending)' : 'Descending (Click for Ascending)'}`}
              >
                {sortOrder === 'asc' ? (
                  <ArrowUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <ArrowDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                )}
              </button>
            </div>

            {/* View Mode */}
            <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Rendering: Table or Grid */}
      {filteredStudents.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 space-y-3 shadow-md">
          <GraduationCap className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-200">No students match your query</h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search criteria or enroll a new student to get started.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" /> Enroll Student
            </button>
            <button
              onClick={() => setIsCsvImportModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition-all"
            >
              <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Import via CSV
            </button>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View with Checkbox Column */
        <div className="rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  {/* Master Checkbox Column */}
                  <th className="py-3.5 pl-4 pr-2 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={isAllFilteredSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeFilteredSelected;
                      }}
                      onChange={handleToggleSelectAllFiltered}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                      title={isAllFilteredSelected ? 'Deselect all visible students' : 'Select all visible students'}
                    />
                  </th>
                  <th className="py-3.5 pl-2 pr-3">
                    {renderSortHeader('name', 'Student Info')}
                  </th>
                  <th className="py-3.5 px-3">
                    {renderSortHeader('roll', 'Roll & PRN')}
                  </th>
                  <th className="py-3.5 px-3">
                    {renderSortHeader('dept', 'Department & Degree')}
                  </th>
                  <th className="py-3.5 px-3">
                    {renderSortHeader('class', 'Class & Coordinator')}
                  </th>
                  <th className="py-3.5 px-3 text-center">
                    {renderSortHeader('cgpa', 'CGPA', 'center')}
                  </th>
                  <th className="py-3.5 px-3 text-center">
                    {renderSortHeader('attendance', 'Attendance', 'center')}
                  </th>
                  <th className="py-3.5 px-3 text-center">
                    {renderSortHeader('status', 'Status', 'center')}
                  </th>
                  <th className="py-3.5 pr-5 text-right font-semibold text-slate-500 dark:text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {filteredStudents.map((student) => {
                  const assignedClass = getClassById(student.classId);
                  const coordinator = assignedClass ? getCoordinatorForClass(assignedClass.id) : null;
                  const isSelected = selectedStudentIds.has(student.id);

                  return (
                    <tr
                      key={student.id}
                      className={`transition-colors group ${
                        isSelected
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/30'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Row Checkbox */}
                      <td className="py-3.5 pl-4 pr-2 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectStudent(student.id)}
                          className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                          title={`Select ${student.firstName} ${student.lastName}`}
                        />
                      </td>

                      {/* Name & Avatar */}
                      <td className="py-3.5 pl-2 pr-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center border shrink-0 ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/20'
                          }`}>
                            {student.firstName[0]}
                            {student.lastName[0]}
                          </div>
                          <div>
                            <button
                              onClick={() => setProfileStudent(student)}
                              className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 text-left hover:underline cursor-pointer"
                            >
                              {student.firstName} {student.lastName}
                            </button>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate max-w-[160px]">
                              {student.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Roll & PRN */}
                      <td className="py-3.5 px-3">
                        <span className="font-mono font-semibold text-slate-900 dark:text-slate-200 block">
                          {student.rollNo}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 block">
                          {student.prnNo}
                        </span>
                      </td>

                      {/* Department & Degree */}
                      <td className="py-3.5 px-3">
                        <span className="font-medium text-slate-900 dark:text-slate-200 block truncate max-w-[150px]">
                          {student.department}
                        </span>
                        <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                          {student.degree} • Sem {student.semester} ({student.section})
                        </span>
                      </td>

                      {/* Class & Coordinator */}
                      <td className="py-3.5 px-3">
                        {assignedClass ? (
                          <div>
                            <span className="font-medium text-slate-900 dark:text-white block">
                              {assignedClass.name}
                            </span>
                            {coordinator ? (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block truncate max-w-[130px] font-medium">
                                Coord: {coordinator.firstName} {coordinator.lastName}
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-medium">
                                No Coordinator
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      {/* CGPA */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-block px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-white font-mono border border-slate-200 dark:border-slate-700">
                          {student.cgpa.toFixed(2)}
                        </span>
                      </td>

                      {/* Attendance */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md font-bold text-[11px] border ${
                            student.attendancePercent >= 85
                              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                              : student.attendancePercent >= 75
                              ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
                              : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30'
                          }`}
                        >
                          {student.attendancePercent}%
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => toggleStatus(student)}
                          title="Click to toggle status"
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                            student.status === 'Active'
                              ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/30'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              student.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {student.status}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pr-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setProfileStudent(student)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="View Student Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(student)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-sky-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit Student"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setStudentToDelete(student)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View with Selection Capability */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => {
            const assignedClass = getClassById(student.classId);
            const coordinator = assignedClass ? getCoordinatorForClass(assignedClass.id) : null;
            const isSelected = selectedStudentIds.has(student.id);

            return (
              <div
                key={student.id}
                className={`p-5 rounded-3xl bg-white dark:bg-slate-900/90 border transition-all group flex flex-col justify-between relative shadow-xl ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500/40'
                }`}
              >
                <div>
                  {/* Top Bar with Card Checkbox */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectStudent(student.id)}
                          className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                          title="Select student"
                        />
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
                        {student.firstName[0]}
                        {student.lastName[0]}
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                          {student.firstName} {student.lastName}
                        </h3>
                        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                          {student.rollNo} • {student.degree}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        student.status === 'Active'
                          ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {student.status}
                    </span>
                  </div>

                  {/* Department & Class */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-2 truncate">
                    <Building className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    {student.department}
                  </p>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 mb-3 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Section:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {assignedClass ? assignedClass.name : 'Unassigned'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Class Coordinator:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 truncate max-w-[150px]">
                        {coordinator ? `${coordinator.firstName} ${coordinator.lastName}` : 'None'}
                      </span>
                    </div>
                  </div>

                  {/* Stats Bar */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs mb-4">
                    <div className="p-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40">
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">CGPA</div>
                      <div className="font-heading font-extrabold text-slate-900 dark:text-white text-base">
                        {student.cgpa.toFixed(2)}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40">
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Attendance</div>
                      <div className={`font-heading font-extrabold text-base ${student.attendancePercent >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {student.attendancePercent}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <button
                    onClick={() => setProfileStudent(student)}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Full Profile
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(student)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-sky-400 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setStudentToDelete(student)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bulk Operations Toolbar */}
      <AnimatePresence>
        {selectedStudentIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] sm:w-auto min-w-[320px] max-w-4xl p-3 sm:px-5 sm:py-3.5 rounded-3xl bg-slate-900/95 dark:bg-slate-950/95 text-white shadow-2xl backdrop-blur-md border border-slate-700/80 flex flex-wrap items-center justify-between gap-3"
          >
            {/* Left: Count & Status */}
            <div className="flex items-center gap-2.5 sm:pr-4 sm:border-r border-slate-700/80">
              <span className="px-2.5 py-1 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/30">
                {selectedStudentIds.size}
              </span>
              <span className="text-xs font-semibold text-slate-200">
                {selectedStudentIds.size === 1 ? 'Student selected' : 'Students selected'}
              </span>
            </div>

            {/* Middle: Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Assign to Class */}
              <button
                onClick={() => setIsBulkAssignModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 hover:scale-105 active:scale-95 cursor-pointer"
                title="Assign selected students to a class section"
              >
                <School className="w-3.5 h-3.5" />
                <span>Assign to Class</span>
              </button>

              {/* Set Status Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Set Status</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isStatusDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsStatusDropdownOpen(false)}
                    />
                    <div className="absolute left-0 bottom-full mb-2 w-44 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl z-30 p-1.5 space-y-1">
                      <button
                        onClick={() => handleBulkStatusChange('Active')}
                        className="w-full px-3 py-1.5 rounded-xl text-left text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 flex items-center gap-2 cursor-pointer"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Mark Active</span>
                      </button>
                      <button
                        onClick={() => handleBulkStatusChange('Inactive')}
                        className="w-full px-3 py-1.5 rounded-xl text-left text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                      >
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                        <span>Mark Inactive</span>
                      </button>
                      <button
                        onClick={() => handleBulkStatusChange('Graduated')}
                        className="w-full px-3 py-1.5 rounded-xl text-left text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 flex items-center gap-2 cursor-pointer"
                      >
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span>Mark Graduated</span>
                      </button>
                      <button
                        onClick={() => handleBulkStatusChange('Suspended')}
                        className="w-full px-3 py-1.5 rounded-xl text-left text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer"
                      >
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span>Mark Suspended</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Export Selected */}
              <button
                onClick={handleExportSelected}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer"
                title="Export selected student records"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Export</span>
              </button>

              {/* Delete Selected */}
              <button
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-rose-600/20 hover:scale-105 active:scale-95 cursor-pointer"
                title="Delete all selected students"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete ({selectedStudentIds.size})</span>
              </button>
            </div>

            {/* Right: Clear button */}
            <button
              onClick={handleClearSelection}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <BulkAssignClassModal
        isOpen={isBulkAssignModalOpen}
        onClose={() => setIsBulkAssignModalOpen(false)}
        selectedStudents={selectedStudentsList}
        classes={classes}
        faculties={faculties}
        onAssign={handleBulkAssign}
      />

      <BulkDeleteStudentsModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        selectedStudents={selectedStudentsList}
        onConfirmDelete={handleBulkDelete}
      />

      <StudentModal
        isOpen={isModalOpen}
        studentToEdit={studentToEdit}
        onClose={() => {
          setIsModalOpen(false);
          setStudentToEdit(null);
        }}
      />

      <StudentProfileModal
        student={profileStudent}
        onClose={() => setProfileStudent(null)}
        onEdit={(student) => handleOpenEdit(student)}
      />

      <ConfirmModal
        isOpen={Boolean(studentToDelete)}
        title="Delete Student Record"
        message={`Are you sure you want to remove ${studentToDelete?.firstName} ${studentToDelete?.lastName} (${studentToDelete?.rollNo})? This cannot be undone.`}
        confirmLabel="Remove Student"
        confirmVariant="danger"
        onConfirm={() => {
          if (studentToDelete) {
            deleteStudent(studentToDelete.id);
            setStudentToDelete(null);
          }
        }}
        onClose={() => setStudentToDelete(null)}
      />

      <ExportRecordsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        entityType="students"
        filteredRecordsCount={filteredStudents.length}
        totalRecordsCount={students.length}
        filteredStudents={filteredStudents}
      />

      <StudentCsvImportModal
        isOpen={isCsvImportModalOpen}
        onClose={() => setIsCsvImportModalOpen(false)}
      />
    </div>
  );
};
