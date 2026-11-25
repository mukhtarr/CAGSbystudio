import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, X, Users, AlertOctagon } from 'lucide-react';
import { Student } from '../../types';

interface BulkDeleteStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStudents: Student[];
  onConfirmDelete: (ids: string[]) => void;
}

export const BulkDeleteStudentsModal: React.FC<BulkDeleteStudentsModalProps> = ({
  isOpen,
  onClose,
  selectedStudents,
  onConfirmDelete,
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirmDelete(selectedStudents.map((s) => s.id));
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 shrink-0">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white">
                Delete {selectedStudents.length} Student Records
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Are you sure you want to permanently delete these <strong className="text-rose-600 dark:text-rose-400">{selectedStudents.length} student records</strong>? This will remove all their enrollment data, attendance, and academic history.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List of affected students */}
          <div className="p-6 space-y-3 overflow-y-auto flex-1 text-xs">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-rose-500" />
                Records to be Removed ({selectedStudents.length})
              </span>
              <span className="text-[11px] text-rose-500 font-medium">Irreversible</span>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 divide-y divide-slate-100 dark:divide-slate-800 max-h-56 overflow-y-auto bg-slate-50 dark:bg-slate-950/40">
              {selectedStudents.map((student) => (
                <div
                  key={student.id}
                  className="p-3 flex items-center justify-between gap-3 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center justify-center shrink-0">
                      {student.firstName[0]}
                      {student.lastName[0]}
                    </div>
                    <div className="truncate">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {student.rollNo} • {student.department}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono shrink-0">
                    Sem {student.semester} ({student.section})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between gap-3">
            <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" /> Action cannot be undone
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
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete {selectedStudents.length} Students</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
