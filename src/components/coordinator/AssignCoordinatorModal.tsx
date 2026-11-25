import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, UserCheck, School, Check, AlertCircle, Sparkles, Building, User } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import confetti from 'canvas-confetti';

interface AssignCoordinatorModalProps {
  isOpen: boolean;
  preselectedClassId?: string | null;
  onClose: () => void;
}

export const AssignCoordinatorModal: React.FC<AssignCoordinatorModalProps> = ({
  isOpen,
  preselectedClassId,
  onClose,
}) => {
  const { classes, faculties, assignCoordinator, getAssignedClassesForFaculty } = useAcademic();

  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (preselectedClassId) {
      setSelectedClassId(preselectedClassId);
      const targetClass = classes.find((c) => c.id === preselectedClassId);
      if (targetClass?.coordinatorId) {
        setSelectedFacultyId(targetClass.coordinatorId);
      } else {
        setSelectedFacultyId('');
      }
    } else if (classes.length > 0) {
      setSelectedClassId(classes[0].id);
      setSelectedFacultyId(classes[0].coordinatorId || '');
    }
    setError('');
  }, [preselectedClassId, classes, isOpen]);

  if (!isOpen) return null;

  const targetClass = classes.find((c) => c.id === selectedClassId);
  const eligibleFaculties = faculties.filter((f) => f.isCoordinatorEligible && f.status === 'Active');
  const selectedFaculty = faculties.find((f) => f.id === selectedFacultyId);
  const facultyAssignedClasses = selectedFaculty ? getAssignedClassesForFaculty(selectedFaculty.id) : [];

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    const cls = classes.find((c) => c.id === classId);
    setSelectedFacultyId(cls?.coordinatorId || '');
    setError('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) {
      setError('Please select a target class section');
      return;
    }

    assignCoordinator(selectedClassId, selectedFacultyId ? selectedFacultyId : null);

    if (selectedFacultyId) {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-purple-600 dark:text-purple-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                Assign Class Coordinator
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Map faculty leadership to academic classes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* 1. Target Class Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <School className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Select Target Class Section
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.department}) {cls.coordinatorId ? '• [Coordinator Assigned]' : '• [VACANT]'}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Class Snapshot */}
          {targetClass && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Department:</span>
                <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">{targetClass.department}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Room & Shift:</span>
                <span className="font-mono text-slate-800 dark:text-white">{targetClass.roomNumber} ({targetClass.shift})</span>
              </div>
            </div>
          )}

          {/* 2. Faculty Coordinator Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Designate Faculty Member
            </label>
            <select
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
            >
              <option value="">-- Remove / Leave Vacant (No Coordinator) --</option>
              {eligibleFaculties.map((fac) => {
                const assigned = getAssignedClassesForFaculty(fac.id);
                return (
                  <option key={fac.id} value={fac.id}>
                    {fac.firstName} {fac.lastName} — {fac.designation} ({fac.department}) [Currently leading {assigned.length} classes]
                  </option>
                );
              })}
            </select>
          </div>

          {/* Selected Faculty Snapshot */}
          {selectedFaculty && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                  {selectedFaculty.firstName} {selectedFaculty.lastName}
                </span>
                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">{selectedFaculty.employeeCode}</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                {selectedFaculty.designation} • {selectedFaculty.email}
              </p>
              <div className="pt-1 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                Total assigned classes after this: {facultyAssignedClasses.filter(c => c.id !== selectedClassId).length + 1}
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {selectedFacultyId ? 'Assign Coordinator' : 'Unassign Coordinator'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
