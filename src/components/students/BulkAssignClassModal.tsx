import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  School,
  Users,
  CheckCircle2,
  AlertCircle,
  Building,
  UserCheck,
  GraduationCap,
  ArrowRight,
} from 'lucide-react';
import { Student, ClassEntity, Faculty } from '../../types';

interface BulkAssignClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStudents: Student[];
  classes: ClassEntity[];
  faculties: Faculty[];
  onAssign: (studentIds: string[], classId: string) => void;
}

export const BulkAssignClassModal: React.FC<BulkAssignClassModalProps> = ({
  isOpen,
  onClose,
  selectedStudents,
  classes,
  faculties,
  onAssign,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [isSyncingDept, setIsSyncingDept] = useState(true);

  if (!isOpen) return null;

  const targetClass = classes.find((c) => c.id === selectedClassId);
  const targetCoordinator = targetClass
    ? faculties.find((f) => f.id === targetClass.coordinatorId)
    : null;

  const handleConfirm = () => {
    onAssign(
      selectedStudents.map((s) => s.id),
      selectedClassId
    );
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                <School className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white">
                  Bulk Assign to Class
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Assign <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedStudents.length} selected students</span> to an academic section
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
            {/* Selected Students Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Selected Students ({selectedStudents.length})
                </span>
                <span className="text-[11px] text-slate-400">Will be updated</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 max-h-32 overflow-y-auto space-y-1.5">
                <div className="flex flex-wrap gap-1.5">
                  {selectedStudents.map((student) => (
                    <span
                      key={student.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium text-[11px] shadow-2xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <span>
                        {student.firstName} {student.lastName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({student.rollNo})
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Target Class Selection */}
            <div className="space-y-2">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold">
                Select Target Class Section <span className="text-rose-500">*</span>
              </label>

              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Unassign from Any Class --</option>
                {classes.map((cls) => {
                  const coord = faculties.find((f) => f.id === cls.coordinatorId);
                  return (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} • {cls.department} (Sem {cls.semester} - Sec {cls.section}) {coord ? `[Coord: ${coord.firstName} ${coord.lastName}]` : '[No Coord]'}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Class Details Summary Preview */}
            {targetClass ? (
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/60 space-y-2.5">
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                  <span className="text-sm text-indigo-950 dark:text-indigo-300 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                    {targetClass.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 text-[10px] font-mono font-bold">
                    Room {targetClass.roomNumber}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Department</span>
                    <span className="font-semibold">{targetClass.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Semester &amp; Section</span>
                    <span className="font-semibold">
                      Semester {targetClass.semester} ({targetClass.section})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Assigned Coordinator</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {targetCoordinator
                        ? `${targetCoordinator.firstName} ${targetCoordinator.lastName}`
                        : 'Unassigned'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900/40 text-[11px] text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>
                    All {selectedStudents.length} selected students will have their Class ID and section records updated.
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Selected students will be unassigned from their current class sections.</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Total to update: <strong>{selectedStudents.length}</strong>
            </span>
            <div className="flex items-center gap-2.5">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Assign {selectedStudents.length} Students</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
