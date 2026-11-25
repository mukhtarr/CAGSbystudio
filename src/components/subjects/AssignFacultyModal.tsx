import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Users, BookOpen, Check, Search, UserCheck, Sparkles, Building } from 'lucide-react';
import { Subject, Faculty } from '../../types';
import { useAcademic } from '../../context/AcademicContext';

interface AssignFacultyModalProps {
  isOpen: boolean;
  subject: Subject | null;
  onClose: () => void;
}

export const AssignFacultyModal: React.FC<AssignFacultyModalProps> = ({
  isOpen,
  subject,
  onClose,
}) => {
  const { faculties, assignFacultyToSubject } = useAcademic();
  const [selectedFacultyIds, setSelectedFacultyIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  useEffect(() => {
    if (subject) {
      setSelectedFacultyIds(subject.assignedFacultyIds || []);
      setSearchQuery('');
      setSelectedDepartment('all');
    }
  }, [subject, isOpen]);

  if (!isOpen || !subject) return null;

  const toggleFaculty = (id: string) => {
    setSelectedFacultyIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllDepartment = () => {
    const deptFacs = filteredFaculties.map((f) => f.id);
    const newIds = Array.from(new Set([...selectedFacultyIds, ...deptFacs]));
    setSelectedFacultyIds(newIds);
  };

  const handleClearAll = () => {
    setSelectedFacultyIds([]);
  };

  const handleSave = () => {
    assignFacultyToSubject(subject.id, selectedFacultyIds);
    onClose();
  };

  const departments = Array.from(new Set(faculties.map((f) => f.department)));

  const filteredFaculties = faculties.filter((f) => {
    const matchesSearch =
      `${f.firstName} ${f.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.specialization.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDepartment === 'all' || f.department === selectedDepartment;

    return matchesSearch && matchesDept;
  });

  return (
    <div id="assign-faculty-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.2 }}
        id="assign-faculty-modal-dialog"
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div id="assign-faculty-modal-header" className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Allocate Faculty Members
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {subject.code}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Course: <span className="text-slate-200 font-medium">{subject.name}</span> &bull; {subject.department}
              </p>
            </div>
          </div>
          <button
            id="assign-faculty-modal-close-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter and search bar */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-950/40 shrink-0 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                id="assign-faculty-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search faculty name, code, specialization..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
            <select
              id="assign-faculty-dept-select"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full sm:w-56 px-3 py-1.5 text-xs bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="all">All Departments ({faculties.length})</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing <strong className="text-slate-200">{filteredFaculties.length}</strong> faculties &bull;{' '}
              <strong className="text-indigo-400">{selectedFacultyIds.length}</strong> allocated
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllDepartment}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Select visible
              </button>
              <span className="text-slate-600">&bull;</span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>
        </div>

        {/* Faculty List */}
        <div className="p-6 overflow-y-auto space-y-2 flex-1 custom-scrollbar">
          {filteredFaculties.length === 0 ? (
            <div className="text-center py-10">
              <Users className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-medium text-slate-400">No faculty members found</p>
              <p className="text-xs text-slate-500">Try adjusting your department filter or search criteria.</p>
            </div>
          ) : (
            filteredFaculties.map((fac) => {
              const isSelected = selectedFacultyIds.includes(fac.id);
              const isSameDept = fac.department === subject.department;

              return (
                <div
                  key={fac.id}
                  id={`assign-faculty-item-${fac.id}`}
                  onClick={() => toggleFaculty(fac.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/60 shadow-sm shadow-indigo-950/50'
                      : 'bg-slate-800/40 border-slate-800/90 hover:bg-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                          : 'border-slate-600 bg-slate-900 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>

                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-300 shrink-0">
                      {fac.firstName.charAt(0)}
                      {fac.lastName.charAt(0)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-100">
                          {fac.firstName} {fac.lastName}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          {fac.employeeCode}
                        </span>
                        {isSameDept && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
                            Target Dept
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {fac.designation} &bull; {fac.department}
                        {fac.specialization && ` &bull; ${fac.specialization}`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-medium text-slate-300 block">
                      {fac.experienceYears} Years Exp
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {fac.assignedSubjects?.length || 0} active courses
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div id="assign-faculty-modal-footer" className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            <strong className="text-slate-200">{selectedFacultyIds.length}</strong> faculties will be allocated to teach{' '}
            <strong className="text-indigo-400">{subject.code}</strong>.
          </span>

          <div className="flex items-center gap-3">
            <button
              id="assign-faculty-cancel-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              id="assign-faculty-save-btn"
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              Save Allocations
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
