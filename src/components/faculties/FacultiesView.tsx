import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  LayoutGrid,
  List,
  Mail,
  Phone,
  Building,
  UserCheck,
  Award,
  BookOpen,
  FileSpreadsheet,
  Download,
  ChevronDown,
  Settings2,
} from 'lucide-react';
import { Faculty, DepartmentType, FacultyDesignation, FacultyStatus } from '../../types';
import { useAcademic } from '../../context/AcademicContext';
import { FacultyModal } from './FacultyModal';
import { FacultyDetailsModal } from './FacultyDetailsModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { ExportRecordsModal } from '../common/ExportRecordsModal';

export const FacultiesView: React.FC = () => {
  const {
    faculties,
    classes,
    deleteFaculty,
    updateFaculty,
    getAssignedClassesForFaculty,
    exportFacultiesCSV,
    exportFacultiesExcel,
  } = useAcademic();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedDesignation, setSelectedDesignation] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [coordinatorOnly, setCoordinatorOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [facultyToEdit, setFacultyToEdit] = useState<Faculty | null>(null);
  const [detailsFaculty, setDetailsFaculty] = useState<Faculty | null>(null);
  const [facultyToDelete, setFacultyToDelete] = useState<Faculty | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);

  // Departments list
  const departments = useMemo(() => {
    const set = new Set<string>();
    faculties.forEach((f) => set.add(f.department));
    return Array.from(set);
  }, [faculties]);

  // Designations list
  const designations = useMemo(() => {
    const set = new Set<string>();
    faculties.forEach((f) => set.add(f.designation));
    return Array.from(set);
  }, [faculties]);

  // Filtered faculties
  const filteredFaculties = useMemo(() => {
    return faculties.filter((f) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        f.firstName.toLowerCase().includes(query) ||
        f.lastName.toLowerCase().includes(query) ||
        f.employeeCode.toLowerCase().includes(query) ||
        f.email.toLowerCase().includes(query) ||
        f.specialization.toLowerCase().includes(query);

      const matchesDept = selectedDept === 'ALL' || f.department === selectedDept;
      const matchesDesig = selectedDesignation === 'ALL' || f.designation === selectedDesignation;
      const matchesStatus = selectedStatus === 'ALL' || f.status === selectedStatus;

      const assignedClasses = getAssignedClassesForFaculty(f.id);
      const matchesCoord = !coordinatorOnly || assignedClasses.length > 0;

      return matchesQuery && matchesDept && matchesDesig && matchesStatus && matchesCoord;
    });
  }, [
    faculties,
    searchQuery,
    selectedDept,
    selectedDesignation,
    selectedStatus,
    coordinatorOnly,
    getAssignedClassesForFaculty,
  ]);

  const handleOpenAdd = () => {
    setFacultyToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (fac: Faculty) => {
    setFacultyToEdit(fac);
    setIsModalOpen(true);
  };

  const toggleStatus = (fac: Faculty) => {
    const nextStatus: FacultyStatus = fac.status === 'Active' ? 'On Leave' : 'Active';
    updateFaculty(fac.id, { status: nextStatus });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
              Faculty Directory & Governance
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Professors, lecturers, subject specializations, and class coordinator eligibility
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Export Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              title="Export Faculty Records"
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
                      Export Faculty Directory
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {filteredFaculties.length} matching / {faculties.length} total
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      exportFacultiesExcel(filteredFaculties);
                      setIsExportDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>Export to Excel (.xls)</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold">
                      {filteredFaculties.length}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      exportFacultiesCSV(filteredFaculties);
                      setIsExportDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-700 dark:hover:text-blue-400 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-blue-600" />
                      <span>Export to CSV (.csv)</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold">
                      {filteredFaculties.length}
                    </span>
                  </button>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-700/60 mt-1">
                    <button
                      onClick={() => {
                        setIsExportDropdownOpen(false);
                        setIsExportModalOpen(true);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 flex items-center gap-2 transition-colors cursor-pointer"
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
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Faculty Member
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search faculty name, emp code, specialization..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Departments ({departments.length})</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Designation Filter */}
          <div>
            <select
              value={selectedDesignation}
              onChange={(e) => setSelectedDesignation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Designations ({designations.length})</option>
              {designations.map((desig) => (
                <option key={desig} value={desig}>
                  {desig}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Visiting">Visiting</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
        </div>

        {/* Sub-bar: Coordinator Toggle and View mode */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span>Showing <strong className="text-slate-900 dark:text-white">{filteredFaculties.length}</strong> of {faculties.length} faculties</span>

            <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 select-none">
              <input
                type="checkbox"
                checked={coordinatorOnly}
                onChange={(e) => setCoordinatorOnly(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
              <span className="text-xs">Active Class Coordinators Only</span>
            </label>

            {(searchQuery || selectedDept !== 'ALL' || selectedDesignation !== 'ALL' || selectedStatus !== 'ALL' || coordinatorOnly) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDept('ALL');
                  setSelectedDesignation('ALL');
                  setSelectedStatus('ALL');
                  setCoordinatorOnly(false);
                }}
                className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Faculty List Rendering */}
      {filteredFaculties.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 space-y-3 shadow-md">
          <Users className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-200">No faculty members found</h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search criteria or register a new faculty member.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Faculty
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFaculties.map((fac) => {
            const assignedClasses = getAssignedClassesForFaculty(fac.id);

            return (
              <div
                key={fac.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 shadow-xl transition-all group flex flex-col justify-between"
              >
                <div>
                  {/* Top Row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
                        {fac.firstName[0]}
                        {fac.lastName[0]}
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                          {fac.firstName} {fac.lastName}
                        </h3>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold block">
                          {fac.designation}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        fac.status === 'Active'
                          ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                          : 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
                      }`}
                    >
                      {fac.status}
                    </span>
                  </div>

                  {/* Dept & Emp Code */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-2 truncate">
                    <Building className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    {fac.department}
                  </p>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 mb-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                      <span>Employee Code:</span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">{fac.employeeCode}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                      <span>Experience:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{fac.experienceYears} Years</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                      <span>Coordinator Duty:</span>
                      {assignedClasses.length > 0 ? (
                        <span className="font-bold text-purple-600 dark:text-purple-400">
                          {assignedClasses.length} Class Assigned
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Not Assigned</span>
                      )}
                    </div>
                  </div>

                  {/* Assigned Classes Pill if any */}
                  {assignedClasses.length > 0 && (
                    <div className="mb-3 p-2 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-[11px] text-purple-700 dark:text-purple-300">
                      <span className="font-semibold block">Coordinator for:</span>
                      <span className="text-slate-900 dark:text-white truncate block">
                        {assignedClasses.map((c) => c.name).join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Subjects */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {fac.assignedSubjects.slice(0, 2).map((sub, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 truncate max-w-[140px]"
                      >
                        {sub}
                      </span>
                    ))}
                    {fac.assignedSubjects.length > 2 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
                        +{fac.assignedSubjects.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <button
                    onClick={() => setDetailsFaculty(fac)}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Full Dossier
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(fac)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-sky-400 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setFacultyToDelete(fac)}
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
      ) : (
        /* Table View */
        <div className="rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 pl-5">Faculty Member</th>
                  <th className="py-3.5 px-3">Emp Code</th>
                  <th className="py-3.5 px-3">Designation & Department</th>
                  <th className="py-3.5 px-3">Qualification</th>
                  <th className="py-3.5 px-3">Class Coordinator Roles</th>
                  <th className="py-3.5 px-3 text-center">Status</th>
                  <th className="py-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {filteredFaculties.map((fac) => {
                  const assignedClasses = getAssignedClassesForFaculty(fac.id);

                  return (
                    <tr
                      key={fac.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-3.5 pl-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center border border-emerald-200 dark:border-emerald-500/20 shrink-0">
                            {fac.firstName[0]}
                            {fac.lastName[0]}
                          </div>
                          <div>
                            <button
                              onClick={() => setDetailsFaculty(fac)}
                              className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 text-left hover:underline cursor-pointer"
                            >
                              {fac.firstName} {fac.lastName}
                            </button>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate max-w-[160px]">
                              {fac.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {fac.employeeCode}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-slate-900 dark:text-white block">
                          {fac.designation}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate max-w-[160px]">
                          {fac.department}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="text-slate-700 dark:text-slate-200 block truncate max-w-[180px]">
                          {fac.qualification}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {fac.experienceYears} Years Exp
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        {assignedClasses.length > 0 ? (
                          <div>
                            <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-[10px] font-bold border border-purple-200 dark:border-purple-500/30">
                              Coordinator ({assignedClasses.length})
                            </span>
                            <span className="text-[11px] text-slate-600 dark:text-slate-300 block mt-0.5 truncate max-w-[150px]">
                              {assignedClasses.map((c) => c.name).join(', ')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">None</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => toggleStatus(fac)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                            fac.status === 'Active'
                              ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/30'
                              : 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30 hover:bg-amber-100 dark:hover:bg-amber-500/30'
                          }`}
                        >
                          {fac.status}
                        </button>
                      </td>

                      <td className="py-3.5 pr-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setDetailsFaculty(fac)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-emerald-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="View Faculty Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(fac)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-sky-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit Faculty"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setFacultyToDelete(fac)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Delete Faculty"
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
      )}

      {/* Modals */}
      <FacultyModal
        isOpen={isModalOpen}
        facultyToEdit={facultyToEdit}
        onClose={() => {
          setIsModalOpen(false);
          setFacultyToEdit(null);
        }}
      />

      <FacultyDetailsModal
        faculty={detailsFaculty}
        onClose={() => setDetailsFaculty(null)}
        onEdit={(fac) => handleOpenEdit(fac)}
      />

      <ConfirmModal
        isOpen={Boolean(facultyToDelete)}
        title="Remove Faculty Member"
        message={`Are you sure you want to remove ${facultyToDelete?.firstName} ${facultyToDelete?.lastName} (${facultyToDelete?.employeeCode})?`}
        confirmLabel="Remove Faculty"
        confirmVariant="danger"
        onConfirm={() => {
          if (facultyToDelete) {
            deleteFaculty(facultyToDelete.id);
            setFacultyToDelete(null);
          }
        }}
        onClose={() => setFacultyToDelete(null)}
      />

      <ExportRecordsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        entityType="faculties"
        filteredRecordsCount={filteredFaculties.length}
        totalRecordsCount={faculties.length}
        filteredFaculties={filteredFaculties}
      />
    </div>
  );
};
