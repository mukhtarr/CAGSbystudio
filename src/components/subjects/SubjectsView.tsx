import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  Edit2,
  Trash2,
  Eye,
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
  CheckSquare,
  Square,
  Users,
  UserCheck,
  UserPlus,
  X,
  GraduationCap,
  Award,
  FlaskConical,
  ShieldCheck,
  Shield,
  Crown,
} from 'lucide-react';
import { Subject, SubjectType, SubjectStatus, DepartmentType, DegreeType, Faculty } from '../../types';
import { useAcademic } from '../../context/AcademicContext';
import { SubjectModal } from './SubjectModal';
import { AssignFacultyModal } from './AssignFacultyModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { canUserAddCourse, canUserEditCourse, canUserDeleteCourse, canUserManageDepartment } from '../../utils/rolePermissions';

export type SubjectSortKey =
  | 'code'
  | 'name'
  | 'department'
  | 'semester'
  | 'credits'
  | 'type'
  | 'facultyCount'
  | 'status'
  | 'createdAt';

export const SubjectsView: React.FC = () => {
  const {
    subjects,
    faculties,
    deleteSubject,
    bulkDeleteSubjects,
    exportSubjectsCSV,
    exportSubjectsExcel,
    currentUser,
  } = useAcademic();

  const isAdmin = currentUser?.role === 'Admin';
  const isPrincipal = currentUser?.role === 'Principal/Director';
  const isHod = currentUser?.role === 'HOD';
  const isFaculty = currentUser?.role === 'Faculty';
  const userDept = currentUser?.department;

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>(isHod && userDept ? userDept : 'ALL');
  const [selectedSemester, setSelectedSemester] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedAllocation, setSelectedAllocation] = useState<'ALL' | 'ASSIGNED' | 'UNASSIGNED'>('ALL');
  const [facultyOnlyFilter, setFacultyOnlyFilter] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SubjectSortKey>('code');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Bulk Selection State
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Modals state
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [presetTypeForModal, setPresetTypeForModal] = useState<SubjectType | undefined>(undefined);
  const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [subjectForFacultyAssign, setSubjectForFacultyAssign] = useState<Subject | null>(null);
  const [subjectForDetails, setSubjectForDetails] = useState<Subject | null>(null);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);

  // Role Scoped Base Subjects
  const baseSubjects = useMemo(() => {
    if (isAdmin || isPrincipal) {
      return subjects;
    }
    if (isHod) {
      if (!userDept) return subjects;
      const deptSubjects = subjects.filter((s) => s.department === userDept);
      return deptSubjects.length > 0 ? deptSubjects : subjects;
    }
    if (isFaculty) {
      if (facultyOnlyFilter && currentUser?.id) {
        return subjects.filter((s) => s.assignedFacultyIds?.includes(currentUser.id));
      }
      if (userDept) {
        return subjects.filter(
          (s) => s.department === userDept || (currentUser?.id && s.assignedFacultyIds?.includes(currentUser.id))
        );
      }
      return subjects;
    }
    return subjects;
  }, [subjects, isAdmin, isPrincipal, isHod, isFaculty, userDept, facultyOnlyFilter, currentUser]);

  // Departments list for filter
  const departments = useMemo(() => {
    const set = new Set<string>();
    baseSubjects.forEach((s) => set.add(s.department));
    return Array.from(set);
  }, [baseSubjects]);

  // Quick stats calculation
  const stats = useMemo(() => {
    const total = baseSubjects.length;
    const core = baseSubjects.filter((s) => s.type === 'Theory').length;
    const elective = baseSubjects.filter((s) => s.type === 'Elective').length;
    const labs = baseSubjects.filter((s) => s.type === 'Practical / Lab' || s.type === 'Integrated (Theory + Lab)').length;
    const assigned = baseSubjects.filter((s) => s.assignedFacultyIds && s.assignedFacultyIds.length > 0).length;
    const unassigned = total - assigned;
    const totalCredits = baseSubjects.reduce((sum, s) => sum + s.credits, 0);

    return {
      total,
      core,
      elective,
      labs,
      assigned,
      unassigned,
      totalCredits,
      assignedPercentage: total > 0 ? Math.round((assigned / total) * 100) : 0,
    };
  }, [baseSubjects]);

  // Filtered & Sorted Subjects
  const filteredSubjects = useMemo(() => {
    return baseSubjects
      .filter((sub) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          sub.code.toLowerCase().includes(query) ||
          sub.name.toLowerCase().includes(query) ||
          sub.department.toLowerCase().includes(query) ||
          (sub.description && sub.description.toLowerCase().includes(query));

        const matchesDept = selectedDept === 'ALL' || sub.department === selectedDept;
        const matchesSemester = selectedSemester === 'ALL' || sub.semester.toString() === selectedSemester;
        const matchesType = selectedType === 'ALL' || sub.type === selectedType;
        const matchesStatus = selectedStatus === 'ALL' || sub.status === selectedStatus;

        const hasFaculty = sub.assignedFacultyIds && sub.assignedFacultyIds.length > 0;
        const matchesAllocation =
          selectedAllocation === 'ALL' ||
          (selectedAllocation === 'ASSIGNED' && hasFaculty) ||
          (selectedAllocation === 'UNASSIGNED' && !hasFaculty);

        return matchesSearch && matchesDept && matchesSemester && matchesType && matchesStatus && matchesAllocation;
      })
      .sort((a, b) => {
        let valA: any = a[sortBy as keyof Subject] ?? '';
        let valB: any = b[sortBy as keyof Subject] ?? '';

        if (sortBy === 'facultyCount') {
          valA = a.assignedFacultyIds?.length || 0;
          valB = b.assignedFacultyIds?.length || 0;
        }

        if (typeof valA === 'string') {
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });
  }, [baseSubjects, searchQuery, selectedDept, selectedSemester, selectedType, selectedStatus, selectedAllocation, sortBy, sortOrder]);

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedSubjectIds.size === filteredSubjects.length && filteredSubjects.length > 0) {
      setSelectedSubjectIds(new Set());
    } else {
      setSelectedSubjectIds(new Set(filteredSubjects.map((s) => s.id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedSubjectIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedSubjectIds(next);
  };

  const handleSort = (key: SubjectSortKey) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const renderSortIndicator = (key: SubjectSortKey) => {
    if (sortBy !== key) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 opacity-60 group-hover:opacity-100" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-indigo-400" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
    );
  };

  const getFacultyNames = (facultyIds?: string[]): Faculty[] => {
    if (!facultyIds || facultyIds.length === 0) return [];
    const facultyMap = new Map(faculties.map((f) => [f.id, f]));
    return facultyIds
      .map((id) => facultyMap.get(id))
      .filter((fac): fac is Faculty => fac !== undefined);
  };

  const getTypeColor = (type: SubjectType) => {
    switch (type) {
      case 'Theory':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Elective':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Practical / Lab':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Integrated (Theory + Lab)':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Seminar / Project':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const canEditSubject = (sub: Subject) => {
    const isAssigned = Boolean(currentUser?.id && sub.assignedFacultyIds?.includes(currentUser.id));
    return canUserEditCourse(
      currentUser?.role,
      currentUser?.department,
      sub.department,
      currentUser?.id,
      isAssigned ? currentUser?.id : sub.assignedFacultyIds?.[0]
    );
  };

  const canDeleteSubject = (sub: Subject) => {
    return canUserDeleteCourse(currentUser?.role, currentUser?.department, sub.department);
  };

  const canManageFacultyAlloc = (sub: Subject) => {
    return canUserManageDepartment(currentUser?.role, currentUser?.department, sub.department);
  };

  return (
    <div id="subjects-view-container" className="space-y-6">
      {/* Role Scoping Banner */}
      <div
        id="subjects-role-banner"
        className={`p-3.5 rounded-2xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          isAdmin
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-200'
            : isPrincipal
            ? 'bg-purple-500/10 border-purple-500/30 text-purple-800 dark:text-purple-200'
            : isHod
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
            : 'bg-blue-500/10 border-blue-500/30 text-blue-800 dark:text-blue-200'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {isAdmin && <ShieldCheck className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />}
          {isPrincipal && <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />}
          {isHod && <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
          {isFaculty && <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
          <div>
            <span className="font-bold">
              {isAdmin && 'Admin Privilege: Institutional Academic Registry (All Departments)'}
              {isPrincipal && 'Principal Oversight: Executive Inspection & Curriculum Audit'}
              {isHod && `HOD Authority: Scoped to ${userDept || 'Department'}`}
              {isFaculty && `Faculty Workstation: ${currentUser?.name || 'Assigned Instructor'}`}
            </span>
            <span className="opacity-80 block sm:inline sm:ml-2">
              {isAdmin && 'Full permission to register, edit, and archive Theory & Lab courses across all departments.'}
              {isPrincipal && 'Auditing curriculum credits, weekly contact hours, and faculty assignments across college departments.'}
              {isHod && 'Manage course syllabi, assign teaching faculty, and register courses for your department.'}
              {isFaculty && (userDept ? `Viewing ${userDept} curriculum & your assigned teaching subjects.` : 'Viewing curriculum & your assigned teaching subjects.')}
            </span>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full font-bold uppercase text-[10px] bg-white/80 dark:bg-slate-900/80 border border-current">
            {currentUser?.role || 'Guest'}
          </span>
        </div>
      </div>

      {/* Page Header */}
      <div id="subjects-header-bar" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">Academic Subjects &amp; Curriculum</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {subjects.length} Courses
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Manage course registry, syllabus credits, weekly workload hours, and allocate qualified faculty instructors.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Export Dropdown */}
          <div className="relative">
            <button
              id="export-subjects-btn"
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              className="px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Export Records
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isExportDropdownOpen && (
              <div
                id="export-subjects-dropdown"
                className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-30 py-1 overflow-hidden"
              >
                <button
                  onClick={() => {
                    exportSubjectsCSV(filteredSubjects);
                    setIsExportDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  Export to CSV (.csv)
                </button>
                <button
                  onClick={() => {
                    exportSubjectsExcel(filteredSubjects);
                    setIsExportDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  Export to Excel (.xls)
                </button>
              </div>
            )}
          </div>

          {/* Add Subject / Course Buttons */}
          {canUserAddCourse(currentUser?.role) && (
            <div className="flex items-center gap-2">
              <button
                id="add-subject-lab-btn"
                onClick={() => {
                  setSubjectToEdit(null);
                  setPresetTypeForModal('Practical / Lab');
                  setIsSubjectModalOpen(true);
                }}
                className="px-3 py-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                title="Quick Add Practical / Lab Course"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                Add Lab Course
              </button>

              <button
                id="add-subject-primary-btn"
                onClick={() => {
                  setSubjectToEdit(null);
                  setPresetTypeForModal('Theory');
                  setIsSubjectModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Theory Course
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div id="subjects-stats-banner" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setSelectedType('ALL')}
          className={`bg-slate-900/80 border rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all ${
            selectedType === 'ALL'
              ? 'border-indigo-500 ring-1 ring-indigo-500/30'
              : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Courses</span>
            <BookOpen className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{stats.total}</div>
          <div className="text-[11px] text-slate-400 mt-1">{stats.totalCredits} Total Credits</div>
        </div>

        <div
          onClick={() => setSelectedType(selectedType === 'Theory' ? 'ALL' : 'Theory')}
          className={`bg-slate-900/80 border rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all ${
            selectedType === 'Theory'
              ? 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-950/20'
              : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Core Theory</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400">{stats.core}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {selectedType === 'Theory' ? 'Filtered • Click to reset' : 'Classroom Lectures'}
          </div>
        </div>

        <div
          onClick={() => setSelectedType(selectedType === 'Elective' ? 'ALL' : 'Elective')}
          className={`bg-slate-900/80 border rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all ${
            selectedType === 'Elective'
              ? 'border-purple-500 ring-2 ring-purple-500/30 bg-purple-950/20'
              : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Electives</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">{stats.elective}</div>
          <div className="text-[11px] text-slate-400 mt-1">Dept &amp; Open Electives</div>
        </div>

        <div
          onClick={() => setSelectedType(selectedType === 'Practical / Lab' ? 'ALL' : 'Practical / Lab')}
          className={`bg-slate-900/80 border rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all ${
            selectedType === 'Practical / Lab'
              ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-950/20'
              : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Labs &amp; Practicals</span>
            <GraduationCap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats.labs}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {selectedType === 'Practical / Lab' ? 'Filtered • Click to reset' : 'Hands-on Experiments'}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Faculty Assigned</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats.assigned}</div>
          <div className="text-[11px] text-emerald-400/90 mt-1">{stats.assignedPercentage}% Allocation Rate</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Unassigned Faculty</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{stats.unassigned}</div>
          <div className="text-[11px] text-amber-400/80 mt-1">Needs Teacher Allocation</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div id="subjects-filter-toolbar" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="subjects-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by subject code, title, department, or keyword..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950/60 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
          </div>

          {/* Filters Group */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Faculty Specific Toggle: My Assigned Subjects vs All Department */}
            {isFaculty && (
              <div className="flex items-center bg-slate-950/60 border border-slate-700/80 rounded-xl p-0.5 shrink-0">
                <button
                  id="faculty-all-subjects-btn"
                  onClick={() => setFacultyOnlyFilter(false)}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors font-medium ${
                    !facultyOnlyFilter ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All Dept Courses
                </button>
                <button
                  id="faculty-my-subjects-btn"
                  onClick={() => setFacultyOnlyFilter(true)}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors font-medium ${
                    facultyOnlyFilter ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  My Assigned
                </button>
              </div>
            )}

            {/* Department Filter */}
            {isHod && userDept ? (
              <div className="px-2.5 py-2 text-xs bg-slate-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 flex items-center gap-1.5 font-medium shrink-0">
                <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate max-w-[160px]">{userDept}</span>
              </div>
            ) : (
              <select
                id="subjects-dept-filter"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-2.5 py-2 text-xs bg-slate-950/60 border border-slate-700/80 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                <option value="ALL">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            )}

            {/* Semester Filter */}
            <select
              id="subjects-semester-filter"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-2.5 py-2 text-xs bg-slate-950/60 border border-slate-700/80 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="ALL">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem.toString()}>
                  Sem {sem}
                </option>
              ))}
            </select>

            {/* Subject Type Filter */}
            <select
              id="subjects-type-filter"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-2.5 py-2 text-xs bg-slate-950/60 border border-slate-700/80 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="ALL">All Course Types</option>
              <option value="Theory">Theory</option>
              <option value="Elective">Elective</option>
              <option value="Practical / Lab">Practical / Lab</option>
              <option value="Integrated (Theory + Lab)">Integrated (Theory + Lab)</option>
              <option value="Seminar / Project">Seminar / Project</option>
            </select>

            {/* Allocation Status Filter */}
            <select
              id="subjects-allocation-filter"
              value={selectedAllocation}
              onChange={(e) => setSelectedAllocation(e.target.value as any)}
              className="px-2.5 py-2 text-xs bg-slate-950/60 border border-slate-700/80 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="ALL">All Faculty Status</option>
              <option value="ASSIGNED">Faculty Assigned</option>
              <option value="UNASSIGNED">Unassigned Only</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-950/60 border border-slate-700/80 rounded-xl p-0.5 shrink-0">
              <button
                id="subjects-view-table-btn"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                id="subjects-view-grid-btn"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Grid Card View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Action Toolbar */}
        {selectedSubjectIds.size > 0 && (
          <div
            id="subjects-bulk-toolbar"
            className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-indigo-300">
                {selectedSubjectIds.size} {selectedSubjectIds.size === 1 ? 'subject' : 'subjects'} selected
              </span>
              <button
                onClick={() => setSelectedSubjectIds(new Set())}
                className="text-slate-400 hover:text-slate-200 underline ml-2"
              >
                Clear selection
              </button>
            </div>

            <div className="flex items-center gap-2">
              {(isAdmin || isHod) ? (
                <button
                  id="subjects-bulk-delete-btn"
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                  className="px-3 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 flex items-center gap-1.5 transition-colors font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Selected ({selectedSubjectIds.size})
                </button>
              ) : (
                <span className="text-[11px] text-slate-400 italic">
                  Deletion restricted to Admin / HOD
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area: Table or Grid */}
      {filteredSubjects.length === 0 ? (
        <div
          id="subjects-empty-state"
          className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center"
        >
          <BookOpen className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No subjects matching criteria</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Try adjusting your search terms, department filters, or semester filters to find registered courses.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDept('ALL');
              setSelectedSemester('ALL');
              setSelectedType('ALL');
              setSelectedStatus('ALL');
              setSelectedAllocation('ALL');
            }}
            className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div
          id="subjects-table-wrapper"
          className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl"
        >
          <div className="overflow-x-auto custom-scrollbar">
            <table id="subjects-records-table" className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                  <th className="p-3.5 w-10 text-center">
                    <button
                      id="subjects-select-all-btn"
                      onClick={handleSelectAll}
                      className="text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {selectedSubjectIds.size === filteredSubjects.length && filteredSubjects.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-indigo-400" />
                      ) : selectedSubjectIds.size > 0 ? (
                        <div className="w-4 h-4 rounded bg-indigo-600/30 border border-indigo-500 flex items-center justify-center text-[10px] text-white">
                          -
                        </div>
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th
                    className="p-3.5 cursor-pointer hover:text-slate-200 group transition-colors"
                    onClick={() => handleSort('code')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Code</span>
                      {renderSortIndicator('code')}
                    </div>
                  </th>
                  <th
                    className="p-3.5 cursor-pointer hover:text-slate-200 group transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Subject Title</span>
                      {renderSortIndicator('name')}
                    </div>
                  </th>
                  <th
                    className="p-3.5 cursor-pointer hover:text-slate-200 group transition-colors"
                    onClick={() => handleSort('department')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Department &amp; Sem</span>
                      {renderSortIndicator('department')}
                    </div>
                  </th>
                  <th
                    className="p-3.5 cursor-pointer hover:text-slate-200 group transition-colors"
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Course Type</span>
                      {renderSortIndicator('type')}
                    </div>
                  </th>
                  <th
                    className="p-3.5 text-center cursor-pointer hover:text-slate-200 group transition-colors"
                    onClick={() => handleSort('credits')}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Credits (L-P)</span>
                      {renderSortIndicator('credits')}
                    </div>
                  </th>
                  <th
                    className="p-3.5 cursor-pointer hover:text-slate-200 group transition-colors"
                    onClick={() => handleSort('facultyCount')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Assigned Teaching Faculties</span>
                      {renderSortIndicator('facultyCount')}
                    </div>
                  </th>
                  <th
                    className="p-3.5 text-center cursor-pointer hover:text-slate-200 group transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Status</span>
                      {renderSortIndicator('status')}
                    </div>
                  </th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSubjects.map((sub) => {
                  const isSelected = selectedSubjectIds.has(sub.id);
                  const assignedFaculties = getFacultyNames(sub.assignedFacultyIds);

                  return (
                    <tr
                      key={sub.id}
                      id={`subject-row-${sub.id}`}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-indigo-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleToggleSelect(sub.id)}
                          className="text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Code */}
                      <td className="p-3.5 font-mono font-bold text-indigo-400 whitespace-nowrap">
                        {sub.code}
                      </td>

                      {/* Name */}
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-100 max-w-xs truncate" title={sub.name}>
                          {sub.name}
                        </div>
                        {sub.description && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xs" title={sub.description}>
                            {sub.description}
                          </div>
                        )}
                      </td>

                      {/* Department & Semester */}
                      <td className="p-3.5">
                        <div className="text-slate-200 font-medium truncate max-w-[200px]" title={sub.department}>
                          {sub.department}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-semibold">
                            {sub.degree}
                          </span>
                          <span>Semester {sub.semester}</span>
                        </div>
                      </td>

                      {/* Course Type */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${getTypeColor(
                            sub.type
                          )}`}
                        >
                          {sub.type}
                        </span>
                      </td>

                      {/* Credits & L-P */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 font-bold border border-slate-700">
                          {sub.credits} Credits
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">
                          L: {sub.lectureHoursPerWeek}h | P: {sub.practicalHoursPerWeek}h
                        </div>
                      </td>

                      {/* Assigned Teaching Faculties */}
                      <td className="p-3.5">
                        {assignedFaculties.length === 0 ? (
                          canManageFacultyAlloc(sub) ? (
                            <button
                              id={`subject-assign-fac-btn-${sub.id}`}
                              onClick={() => setSubjectForFacultyAssign(sub)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                            >
                              <UserPlus className="w-3 h-3" />
                              Assign Faculty
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-500 italic">Unassigned</span>
                          )
                        ) : (
                          <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                            {assignedFaculties.slice(0, 2).map((fac) => (
                              <span
                                key={fac.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-indigo-950/60 text-indigo-200 border border-indigo-700/50"
                                title={`${fac.firstName} ${fac.lastName} (${fac.designation})`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                                {fac.firstName} {fac.lastName}
                              </span>
                            ))}
                            {assignedFaculties.length > 2 && (
                              <button
                                onClick={() => setSubjectForFacultyAssign(sub)}
                                className="px-1.5 py-0.5 rounded-md text-[10px] bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                              >
                                +{assignedFaculties.length - 2} more
                              </button>
                            )}
                            {canManageFacultyAlloc(sub) && (
                              <button
                                onClick={() => setSubjectForFacultyAssign(sub)}
                                className="p-1 text-slate-500 hover:text-indigo-400 transition-colors"
                                title="Modify Assigned Faculty"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            sub.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : sub.status === 'Draft'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {canManageFacultyAlloc(sub) && (
                            <button
                              id={`subject-quick-assign-${sub.id}`}
                              onClick={() => setSubjectForFacultyAssign(sub)}
                              className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                              title="Assign Teaching Faculties"
                            >
                              <Users className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            id={`subject-quick-details-${sub.id}`}
                            onClick={() => setSubjectForDetails(sub)}
                            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="View Course Syllabus &amp; Specs"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {canEditSubject(sub) ? (
                            <button
                              id={`subject-edit-btn-${sub.id}`}
                              onClick={() => {
                                setSubjectToEdit(sub);
                                setIsSubjectModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                              title="Edit Subject"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              disabled
                              className="p-1.5 text-slate-600 cursor-not-allowed rounded-lg opacity-40"
                              title="Edit permission restricted to HOD or assigned faculty"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {canDeleteSubject(sub) ? (
                            <button
                              id={`subject-delete-btn-${sub.id}`}
                              onClick={() => setSubjectToDelete(sub)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                              title="Delete Subject"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              disabled
                              className="p-1.5 text-slate-600 cursor-not-allowed rounded-lg opacity-40"
                              title="Delete permission restricted to Admin / HOD"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-3.5 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing <strong className="text-slate-200">{filteredSubjects.length}</strong> of{' '}
              <strong className="text-slate-200">{subjects.length}</strong> total registered subjects
            </span>
            <div className="flex items-center gap-4">
              <span>
                Total Credits:{' '}
                <strong className="text-indigo-400">
                  {filteredSubjects.reduce((acc, s) => acc + s.credits, 0)}
                </strong>
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Grid Card View */
        <div id="subjects-grid-cards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.map((sub) => {
            const isSelected = selectedSubjectIds.has(sub.id);
            const assignedFaculties = getFacultyNames(sub.assignedFacultyIds);

            return (
              <motion.div
                key={sub.id}
                layout
                id={`subject-card-${sub.id}`}
                className={`bg-slate-900/90 border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-indigo-500/80 shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-500/50'
                    : 'border-slate-800 hover:border-slate-700/80 hover:shadow-lg hover:shadow-black/40'
                }`}
              >
                <div>
                  {/* Card Top Row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => handleToggleSelect(sub.id)}
                        className="text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono font-bold text-xs">
                        {sub.code}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getTypeColor(
                        sub.type
                      )}`}
                    >
                      {sub.type}
                    </span>
                  </div>

                  {/* Title & Department */}
                  <h3 className="text-sm font-bold text-slate-100 mb-1 line-clamp-1" title={sub.name}>
                    {sub.name}
                  </h3>
                  <p className="text-xs text-slate-400 mb-3 line-clamp-1">{sub.department}</p>

                  {/* Course Specs Badges */}
                  <div className="flex items-center gap-2 flex-wrap mb-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-semibold border border-slate-700">
                      {sub.degree} &bull; Sem {sub.semester}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-semibold border border-slate-700">
                      {sub.credits} Credits
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ({sub.lectureHoursPerWeek}L + {sub.practicalHoursPerWeek}P hrs/wk)
                    </span>
                  </div>

                  {/* Assigned Faculty Section */}
                  <div className="pt-3 border-t border-slate-800/80 mb-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="flex items-center gap-1 font-medium">
                        <Users className="w-3.5 h-3.5 text-indigo-400" />
                        Teaching Faculty ({assignedFaculties.length})
                      </span>
                      {canManageFacultyAlloc(sub) && (
                        <button
                          onClick={() => setSubjectForFacultyAssign(sub)}
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                        >
                          {assignedFaculties.length === 0 ? '+ Assign' : 'Manage'}
                        </button>
                      )}
                    </div>

                    {assignedFaculties.length === 0 ? (
                      <p className="text-[11px] text-amber-400/90 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 text-center">
                        No instructor allocated yet
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {assignedFaculties.map((fac) => (
                          <div
                            key={fac.id}
                            className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60"
                          >
                            <span className="font-medium text-slate-200 truncate">
                              {fac.firstName} {fac.lastName}
                            </span>
                            <span className="text-[10px] text-slate-400">{fac.designation}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      sub.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : sub.status === 'Draft'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {sub.status}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSubjectForDetails(sub)}
                      className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Course Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {canEditSubject(sub) ? (
                      <button
                        onClick={() => {
                          setSubjectToEdit(sub);
                          setIsSubjectModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit Subject"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        disabled
                        className="p-1.5 text-slate-600 cursor-not-allowed rounded-lg opacity-40"
                        title="Edit permission restricted to HOD or assigned faculty"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {canDeleteSubject(sub) ? (
                      <button
                        onClick={() => setSubjectToDelete(sub)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        disabled
                        className="p-1.5 text-slate-600 cursor-not-allowed rounded-lg opacity-40"
                        title="Delete permission restricted to Admin / HOD"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Subject Add/Edit Modal */}
      <SubjectModal
        isOpen={isSubjectModalOpen}
        subjectToEdit={subjectToEdit}
        presetType={presetTypeForModal}
        onClose={() => {
          setIsSubjectModalOpen(false);
          setSubjectToEdit(null);
          setPresetTypeForModal(undefined);
        }}
      />

      {/* Faculty Assignment Modal */}
      <AssignFacultyModal
        isOpen={Boolean(subjectForFacultyAssign)}
        subject={subjectForFacultyAssign}
        onClose={() => setSubjectForFacultyAssign(null)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(subjectToDelete)}
        title="Delete Academic Subject"
        message={`Are you sure you want to delete the subject "${subjectToDelete?.name}" (${subjectToDelete?.code})? This will unassign it from all faculties.`}
        confirmText="Delete Subject"
        confirmVariant="danger"
        onConfirm={() => {
          if (subjectToDelete) {
            deleteSubject(subjectToDelete.id);
            setSubjectToDelete(null);
          }
        }}
        onCancel={() => setSubjectToDelete(null)}
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isBulkDeleteModalOpen}
        title="Bulk Delete Subjects"
        message={`Are you sure you want to permanently delete the ${selectedSubjectIds.size} selected subjects?`}
        confirmText={`Delete ${selectedSubjectIds.size} Subjects`}
        confirmVariant="danger"
        onConfirm={() => {
          bulkDeleteSubjects(Array.from(selectedSubjectIds));
          setSelectedSubjectIds(new Set());
          setIsBulkDeleteModalOpen(false);
        }}
        onCancel={() => setIsBulkDeleteModalOpen(false)}
      />

      {/* Course Details Modal */}
      {subjectForDetails && (
        <div
          id="subject-details-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            id="subject-details-dialog"
            className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8"
          >
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    {subjectForDetails.code}: {subjectForDetails.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {subjectForDetails.department} &bull; {subjectForDetails.degree} Semester {subjectForDetails.semester}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSubjectForDetails(null)}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Overview Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1 font-semibold">
                    Credits
                  </span>
                  <span className="text-xl font-bold text-indigo-400">{subjectForDetails.credits}</span>
                </div>
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1 font-semibold">
                    Lecture Hours
                  </span>
                  <span className="text-xl font-bold text-slate-200">
                    {subjectForDetails.lectureHoursPerWeek} hrs/wk
                  </span>
                </div>
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1 font-semibold">
                    Practical Hours
                  </span>
                  <span className="text-xl font-bold text-slate-200">
                    {subjectForDetails.practicalHoursPerWeek} hrs/wk
                  </span>
                </div>
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1 font-semibold">
                    Course Type
                  </span>
                  <span className="text-xs font-semibold text-slate-200 block truncate">
                    {subjectForDetails.type}
                  </span>
                </div>
              </div>

              {/* Syllabus Outline */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  Syllabus Description &amp; Objectives
                </h4>
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 leading-relaxed">
                  {subjectForDetails.description || 'No syllabus description entered yet for this course.'}
                </div>
              </div>

              {/* Assigned Teaching Staff */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    Assigned Teaching Staff ({subjectForDetails.assignedFacultyIds?.length || 0})
                  </h4>
                  {canManageFacultyAlloc(subjectForDetails) && (
                    <button
                      onClick={() => {
                        const cur = subjectForDetails;
                        setSubjectForDetails(null);
                        setSubjectForFacultyAssign(cur);
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-semibold"
                    >
                      Manage Allocations
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {getFacultyNames(subjectForDetails.assignedFacultyIds).length === 0 ? (
                    <p className="text-xs text-slate-500 bg-slate-950/40 p-4 rounded-xl text-center">
                      No faculty assigned to teach this course.
                    </p>
                  ) : (
                    getFacultyNames(subjectForDetails.assignedFacultyIds).map((fac) => (
                      <div
                        key={fac.id}
                        className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-semibold text-slate-200">
                            {fac.firstName} {fac.lastName}
                          </span>
                          <span className="text-slate-400 ml-2">
                            ({fac.employeeCode} &bull; {fac.designation})
                          </span>
                          <p className="text-[11px] text-slate-500">{fac.department}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                          {fac.experienceYears}y exp
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end gap-3">
              {canEditSubject(subjectForDetails) && (
                <button
                  onClick={() => {
                    const cur = subjectForDetails;
                    setSubjectForDetails(null);
                    setSubjectToEdit(cur);
                    setIsSubjectModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit Subject
                </button>
              )}
              <button
                onClick={() => setSubjectForDetails(null)}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
