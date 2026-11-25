import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  UserCheck,
  School,
  Users,
  Search,
  Plus,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Building,
  Mail,
  Phone,
  ArrowRightLeft,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { ClassEntity, Faculty } from '../../types';
import { AssignCoordinatorModal } from './AssignCoordinatorModal';
import { ConfirmModal } from '../common/ConfirmModal';

export const ClassCoordinatorsView: React.FC = () => {
  const {
    classes,
    faculties,
    assignCoordinator,
    getCoordinatorForClass,
    getAssignedClassesForFaculty,
    getStudentsByClass,
  } = useAcademic();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ASSIGNED' | 'VACANT'>('ALL');

  // Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [targetClassId, setTargetClassId] = useState<string | null>(null);
  const [classToUnassign, setClassToUnassign] = useState<ClassEntity | null>(null);

  // Departments
  const departments = useMemo(() => {
    const set = new Set<string>();
    classes.forEach((c) => set.add(c.department));
    return Array.from(set);
  }, [classes]);

  // Summary Metrics
  const totalClasses = classes.length;
  const assignedClassesCount = classes.filter((c) => Boolean(c.coordinatorId)).length;
  const vacantClassesCount = totalClasses - assignedClassesCount;
  const coveragePercent = totalClasses > 0 ? Math.round((assignedClassesCount / totalClasses) * 100) : 0;

  // Active Faculty Coordinators
  const uniqueCoordinatorsCount = useMemo(() => {
    const set = new Set<string>();
    classes.forEach((c) => {
      if (c.coordinatorId) set.add(c.coordinatorId);
    });
    return set.size;
  }, [classes]);

  // Filtered classes
  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      const coordinator = getCoordinatorForClass(cls.id);
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        cls.name.toLowerCase().includes(query) ||
        cls.department.toLowerCase().includes(query) ||
        cls.roomNumber.toLowerCase().includes(query) ||
        (coordinator &&
          `${coordinator.firstName} ${coordinator.lastName}`.toLowerCase().includes(query));

      const matchesDept = selectedDept === 'ALL' || cls.department === selectedDept;

      const isAssigned = Boolean(cls.coordinatorId);
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ASSIGNED' && isAssigned) ||
        (statusFilter === 'VACANT' && !isAssigned);

      return matchesQuery && matchesDept && matchesStatus;
    });
  }, [classes, searchQuery, selectedDept, statusFilter, getCoordinatorForClass]);

  const handleOpenAssign = (classId?: string) => {
    setTargetClassId(classId || null);
    setIsAssignModalOpen(true);
  };

  const handleUnassignConfirm = () => {
    if (classToUnassign) {
      assignCoordinator(classToUnassign.id, null);
      setClassToUnassign(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
              Class Coordinator Allocations
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Assign faculty mentors to class sections to govern student batches, attendance, and welfare
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenAssign()}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Assign Coordinator
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Coordinator Coverage
            </span>
            <div className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white mt-1">
              {coveragePercent}%
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              {assignedClassesCount} of {totalClasses} classes
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Assigned Sections
            </span>
            <div className="text-2xl font-heading font-extrabold text-purple-600 dark:text-purple-400 mt-1">
              {assignedClassesCount}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Active oversight</span>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <School className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Vacant / Unassigned
            </span>
            <div className={`text-2xl font-heading font-extrabold mt-1 ${vacantClassesCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
              {vacantClassesCount}
            </div>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              {vacantClassesCount > 0 ? 'Needs allocation' : 'All classes covered'}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Serving Faculty
            </span>
            <div className="text-2xl font-heading font-extrabold text-teal-600 dark:text-teal-400 mt-1">
              {uniqueCoordinatorsCount}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Coordinators active</span>
          </div>
          <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by class name, coordinator faculty, department..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

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

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">All Allocations ({classes.length})</option>
              <option value="ASSIGNED">Coordinator Assigned ({assignedClassesCount})</option>
              <option value="VACANT">Vacant / Needs Coordinator ({vacantClassesCount})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Class Coordinators Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClasses.map((cls) => {
          const coordinator = getCoordinatorForClass(cls.id);
          const students = getStudentsByClass(cls.id);
          const isVacant = !coordinator;

          return (
            <div
              key={cls.id}
              className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                isVacant
                  ? 'bg-white dark:bg-slate-900/90 border-amber-300 dark:border-amber-500/40 hover:border-amber-500 shadow-lg'
                  : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-purple-500/50 shadow-xl'
              }`}
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold text-[11px] border border-purple-200 dark:border-purple-500/30">
                      {cls.degree} • Sem {cls.semester} ({cls.section})
                    </span>
                    <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white mt-1">
                      {cls.name}
                    </h3>
                  </div>

                  {isVacant ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> VACANT
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> ASSIGNED
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 truncate flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                  {cls.department}
                </p>

                {/* Coordinator Block */}
                {coordinator ? (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 mb-4 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-600/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                        {coordinator.firstName[0]}
                        {coordinator.lastName[0]}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {coordinator.firstName} {coordinator.lastName}
                        </h4>
                        <span className="text-[11px] text-purple-600 dark:text-purple-400 block truncate">
                          {coordinator.designation}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700/40 grid grid-cols-1 gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{coordinator.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{coordinator.phone}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/30 mb-4 text-center space-y-2">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                      No Class Coordinator Assigned
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Assign an eligible faculty member to track batch attendance & academics.
                    </p>
                  </div>
                )}

                {/* Section Details Strip */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 mb-2">
                  <span>Enrolled Students:</span>
                  <span className="font-semibold text-slate-900 dark:text-white font-mono">
                    {students.length} / {cls.capacity}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 mb-4">
                  <span>Lecture Hall:</span>
                  <span className="font-mono text-slate-900 dark:text-white">{cls.roomNumber} ({cls.shift})</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                {coordinator ? (
                  <>
                    <button
                      onClick={() => handleOpenAssign(cls.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Reassign
                    </button>
                    <button
                      onClick={() => setClassToUnassign(cls)}
                      className="px-3 py-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Unassign
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleOpenAssign(cls.id)}
                    className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all hover:scale-105 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Assign Faculty Coordinator
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <AssignCoordinatorModal
        isOpen={isAssignModalOpen}
        preselectedClassId={targetClassId}
        onClose={() => {
          setIsAssignModalOpen(false);
          setTargetClassId(null);
        }}
      />

      <ConfirmModal
        isOpen={Boolean(classToUnassign)}
        title="Unassign Class Coordinator"
        message={`Are you sure you want to remove the class coordinator for "${classToUnassign?.name}"? The position will become vacant.`}
        confirmLabel="Unassign Coordinator"
        confirmVariant="danger"
        onConfirm={handleUnassignConfirm}
        onClose={() => setClassToUnassign(null)}
      />
    </div>
  );
};
