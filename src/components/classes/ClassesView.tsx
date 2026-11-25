import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  School,
  Plus,
  Search,
  Users,
  UserCheck,
  Edit2,
  Trash2,
  Eye,
  Building,
  GraduationCap,
  Sparkles,
  LayoutGrid,
  List,
  DoorOpen,
  SunMedium,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { ClassEntity, DepartmentType, DegreeType, SemesterType } from '../../types';
import { useAcademic } from '../../context/AcademicContext';
import { ClassModal } from './ClassModal';
import { ClassStudentsModal } from './ClassStudentsModal';
import { ConfirmModal } from '../common/ConfirmModal';

interface ClassesViewProps {
  onNavigateToCoordinator?: () => void;
}

export const ClassesView: React.FC<ClassesViewProps> = ({ onNavigateToCoordinator }) => {
  const {
    classes,
    deleteClass,
    getCoordinatorForClass,
    getStudentsByClass,
  } = useAcademic();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedSem, setSelectedSem] = useState<string>('ALL');
  const [selectedDegree, setSelectedDegree] = useState<string>('ALL');
  const [coordinatorFilter, setCoordinatorFilter] = useState<'ALL' | 'ASSIGNED' | 'UNASSIGNED'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classToEdit, setClassToEdit] = useState<ClassEntity | null>(null);
  const [classToViewStudents, setClassToViewStudents] = useState<ClassEntity | null>(null);
  const [classToDelete, setClassToDelete] = useState<ClassEntity | null>(null);

  // Departments
  const departments = useMemo(() => {
    const set = new Set<string>();
    classes.forEach((c) => set.add(c.department));
    return Array.from(set);
  }, [classes]);

  // Filtered classes
  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        c.name.toLowerCase().includes(query) ||
        c.roomNumber.toLowerCase().includes(query) ||
        c.department.toLowerCase().includes(query);

      const matchesDept = selectedDept === 'ALL' || c.department === selectedDept;
      const matchesSem = selectedSem === 'ALL' || c.semester.toString() === selectedSem;
      const matchesDegree = selectedDegree === 'ALL' || c.degree === selectedDegree;

      const hasCoord = Boolean(c.coordinatorId);
      const matchesCoord =
        coordinatorFilter === 'ALL' ||
        (coordinatorFilter === 'ASSIGNED' && hasCoord) ||
        (coordinatorFilter === 'UNASSIGNED' && !hasCoord);

      return matchesQuery && matchesDept && matchesSem && matchesDegree && matchesCoord;
    });
  }, [classes, searchQuery, selectedDept, selectedSem, selectedDegree, coordinatorFilter]);

  const handleOpenAdd = () => {
    setClassToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: ClassEntity) => {
    setClassToEdit(c);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <School className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
              Classes & Sections Architecture
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage degree programs, batches, lecture room assignments, and class coordinators
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {onNavigateToCoordinator && (
            <button
              onClick={onNavigateToCoordinator}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-purple-700 dark:text-purple-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 transition-all cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Assign Coordinators</span>
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Class Section
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by class name, room no, department..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Department */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">All Departments ({departments.length})</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div>
            <select
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s.toString()}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          {/* Coordinator filter */}
          <div>
            <select
              value={coordinatorFilter}
              onChange={(e) => setCoordinatorFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">All Coordinator Statuses</option>
              <option value="ASSIGNED">Coordinator Assigned</option>
              <option value="UNASSIGNED">Coordinator Unassigned</option>
            </select>
          </div>
        </div>

        {/* Sub-bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Showing <strong className="text-slate-900 dark:text-white">{filteredClasses.length}</strong> of {classes.length} classes</span>
            {(searchQuery || selectedDept !== 'ALL' || selectedSem !== 'ALL' || coordinatorFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDept('ALL');
                  setSelectedSem('ALL');
                  setCoordinatorFilter('ALL');
                }}
                className="text-purple-600 dark:text-purple-400 hover:underline font-medium ml-2 cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Class List Render */}
      {filteredClasses.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 space-y-3 shadow-md">
          <School className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-200">No classes found</h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search criteria or create a new class section.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Class
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClasses.map((cls) => {
            const coordinator = getCoordinatorForClass(cls.id);
            const enrolled = getStudentsByClass(cls.id);
            const capacityPercent = Math.min(100, Math.round((enrolled.length / cls.capacity) * 100));

            return (
              <div
                key={cls.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-purple-500/40 shadow-xl transition-all group flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-200 dark:border-purple-500/30">
                          {cls.degree} • Sem {cls.semester} ({cls.section})
                        </span>
                      </div>
                      <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white mt-1.5 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                        {cls.name}
                      </h3>
                    </div>

                    <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1 shrink-0">
                      <DoorOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      {cls.roomNumber}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 truncate flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                    {cls.department}
                  </p>

                  {/* Coordinator block */}
                  <div
                    className={`p-3 rounded-2xl border mb-3 transition-colors ${
                      coordinator
                        ? 'bg-purple-50/70 dark:bg-purple-950/20 border-purple-200 dark:border-purple-500/30 text-purple-800 dark:text-purple-200'
                        : 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-200'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-bold tracking-wider flex items-center justify-between mb-1">
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5" /> Class Coordinator
                      </span>
                      {coordinator ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">Assigned</span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-bold">Vacant</span>
                      )}
                    </div>
                    {coordinator ? (
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {coordinator.firstName} {coordinator.lastName}
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-normal">
                          {coordinator.designation}
                        </span>
                      </p>
                    ) : (
                      <p className="text-xs text-amber-700 dark:text-amber-300/80">
                        No faculty coordinator currently assigned
                      </p>
                    )}
                  </div>

                  {/* Student Intake Bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" /> Student Enrollment:
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white font-mono">
                        {enrolled.length} / {cls.capacity} ({capacityPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700/60">
                      <div
                        className={`h-full rounded-full transition-all ${
                          capacityPercent >= 90
                            ? 'bg-rose-500'
                            : capacityPercent >= 70
                            ? 'bg-purple-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${capacityPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <button
                    onClick={() => setClassToViewStudents(cls)}
                    className="text-purple-600 dark:text-purple-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Roster ({enrolled.length})
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(cls)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-sky-400 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setClassToDelete(cls)}
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
        /* Table Mode */
        <div className="rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 pl-5">Class Section</th>
                  <th className="py-3.5 px-3">Department</th>
                  <th className="py-3.5 px-3">Room & Shift</th>
                  <th className="py-3.5 px-3">Designated Coordinator</th>
                  <th className="py-3.5 px-3 text-center">Enrollment</th>
                  <th className="py-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {filteredClasses.map((cls) => {
                  const coordinator = getCoordinatorForClass(cls.id);
                  const enrolled = getStudentsByClass(cls.id);

                  return (
                    <tr key={cls.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 pl-5">
                        <span className="font-semibold text-slate-900 dark:text-white block">{cls.name}</span>
                        <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                          {cls.degree} • Sem {cls.semester} ({cls.section})
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="text-slate-700 dark:text-slate-300">{cls.department}</span>
                      </td>

                      <td className="py-3.5 px-3 font-mono">
                        <span className="text-slate-900 dark:text-white block">{cls.roomNumber}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{cls.shift}</span>
                      </td>

                      <td className="py-3.5 px-3">
                        {coordinator ? (
                          <div>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400 block">
                              {coordinator.firstName} {coordinator.lastName}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">{coordinator.designation}</span>
                          </div>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 text-xs italic font-medium">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-center font-mono">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {enrolled.length} / {cls.capacity}
                        </span>
                      </td>

                      <td className="py-3.5 pr-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setClassToViewStudents(cls)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-purple-400 dark:hover:bg-slate-800 cursor-pointer"
                            title="View Enrolled Students"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(cls)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-sky-400 dark:hover:bg-slate-800 cursor-pointer"
                            title="Edit Class"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setClassToDelete(cls)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-slate-800 cursor-pointer"
                            title="Delete Class"
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
      <ClassModal
        isOpen={isModalOpen}
        classToEdit={classToEdit}
        onClose={() => {
          setIsModalOpen(false);
          setClassToEdit(null);
        }}
      />

      <ClassStudentsModal
        classItem={classToViewStudents}
        onClose={() => setClassToViewStudents(null)}
      />

      <ConfirmModal
        isOpen={Boolean(classToDelete)}
        title="Delete Class Section"
        message={`Are you sure you want to remove "${classToDelete?.name}"? Students enrolled in this section will become unassigned.`}
        confirmLabel="Delete Class"
        confirmVariant="danger"
        onConfirm={() => {
          if (classToDelete) {
            deleteClass(classToDelete.id);
            setClassToDelete(null);
          }
        }}
        onClose={() => setClassToDelete(null)}
      />
    </div>
  );
};
