import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Calendar, Check, Sparkles } from 'lucide-react';
import { AcademicYear, TermType } from '../../types';
import { useAcademic } from '../../context/AcademicContext';

interface AcademicYearModalProps {
  isOpen: boolean;
  yearToEdit?: AcademicYear | null;
  onClose: () => void;
}

const TERMS: TermType[] = ['ODD', 'EVEN', 'ANNUAL', 'SUMMER'];

export const AcademicYearModal: React.FC<AcademicYearModalProps> = ({
  isOpen,
  yearToEdit,
  onClose,
}) => {
  const { addAcademicYear, updateAcademicYear } = useAcademic();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    term: 'ODD' as TermType,
    startDate: '2025-07-15',
    endDate: '2025-12-20',
    isActive: false,
    notes: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (yearToEdit) {
      setFormData({
        name: yearToEdit.name,
        code: yearToEdit.code,
        term: yearToEdit.term,
        startDate: yearToEdit.startDate,
        endDate: yearToEdit.endDate,
        isActive: yearToEdit.isActive,
        notes: yearToEdit.notes || '',
      });
    } else {
      setFormData({
        name: '2025 - 2026 (Odd Semester)',
        code: 'AY-25-26-ODD',
        term: 'ODD',
        startDate: '2025-07-14',
        endDate: '2025-12-19',
        isActive: false,
        notes: 'Regular academic session',
      });
    }
    setErrors({});
  }, [yearToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Academic year title is required';
    if (!formData.code.trim()) newErrors.code = 'Session code is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (yearToEdit) {
      updateAcademicYear(yearToEdit.id, formData);
    } else {
      addAcademicYear(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                {yearToEdit ? 'Edit Academic Year' : 'Create Academic Year / Session'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Define academic terms and calendar periods</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Academic Year Title *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. 2024 - 2025 (Odd Semester)"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border ${
                errors.name ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
              } text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500`}
            />
            {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Session Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="AY-24-25-ODD"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border ${
                  errors.code ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                } text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500`}
              />
              {errors.code && <p className="text-[11px] text-rose-500 mt-1">{errors.code}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Term Type</label>
              <select
                value={formData.term}
                onChange={(e) => setFormData({ ...formData, term: e.target.value as TermType })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
              >
                {TERMS.map((t) => (
                  <option key={t} value={t}>
                    {t} Term
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Session Start Date *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Session End Date *</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Notes / Description</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Session notes, semester coverage (1st, 3rd, 5th, 7th sem)..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {/* Active status checkbox */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <input
              type="checkbox"
              id="isActiveYear"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 dark:border-slate-600 cursor-pointer"
            />
            <label htmlFor="isActiveYear" className="text-xs text-slate-700 dark:text-slate-200 cursor-pointer">
              <span className="font-semibold block text-slate-900 dark:text-white">Set as Active Academic Session</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Will become the default session for class rosters and coordinator assignments.
              </span>
            </label>
          </div>

          {/* Footer */}
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
              className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {yearToEdit ? 'Save Changes' : 'Create Session'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
