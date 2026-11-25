import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, School, Building, UserCheck, Check } from 'lucide-react';
import { ClassEntity, DepartmentType, DegreeType, SemesterType, SectionType } from '../../types';
import { useAcademic } from '../../context/AcademicContext';

interface ClassModalProps {
  isOpen: boolean;
  classToEdit?: ClassEntity | null;
  onClose: () => void;
}

const DEPARTMENTS: DepartmentType[] = [
  'Computer Science & Engineering',
  'Information Technology',
  'Artificial Intelligence & Data Science',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Management Studies (MBA)',
  'Computer Applications (BCA/MCA)',
];

const DEGREES: DegreeType[] = ['B.Tech', 'BCA', 'M.Tech', 'MCA', 'MBA', 'B.Sc'];
const SEMESTERS: SemesterType[] = [1, 2, 3, 4, 5, 6, 7, 8];
const SECTIONS: SectionType[] = ['A', 'B', 'C', 'D'];

export const ClassModal: React.FC<ClassModalProps> = ({
  isOpen,
  classToEdit,
  onClose,
}) => {
  const { faculties, academicYears, activeAcademicYear, addClass, updateClass } = useAcademic();

  const [formData, setFormData] = useState({
    name: '',
    courseName: 'Computer Science & Engineering',
    degree: 'B.Tech' as DegreeType,
    department: 'Computer Science & Engineering' as DepartmentType,
    semester: 5 as SemesterType,
    section: 'A' as SectionType,
    academicYearId: activeAcademicYear?.id || '',
    coordinatorId: '' as string | '',
    roomNumber: 'LHC-301',
    capacity: 60,
    shift: 'Morning' as 'Morning' | 'Afternoon' | 'Evening',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (classToEdit) {
      setFormData({
        name: classToEdit.name,
        courseName: classToEdit.courseName,
        degree: classToEdit.degree,
        department: classToEdit.department,
        semester: classToEdit.semester,
        section: classToEdit.section,
        academicYearId: classToEdit.academicYearId || activeAcademicYear?.id || '',
        coordinatorId: classToEdit.coordinatorId || '',
        roomNumber: classToEdit.roomNumber,
        capacity: classToEdit.capacity,
        shift: classToEdit.shift,
      });
    } else {
      setFormData({
        name: 'B.Tech CSE - Sem 5 (Sec A)',
        courseName: 'Computer Science & Engineering',
        degree: 'B.Tech',
        department: 'Computer Science & Engineering',
        semester: 5,
        section: 'A',
        academicYearId: activeAcademicYear?.id || '',
        coordinatorId: '',
        roomNumber: 'LHC-301',
        capacity: 60,
        shift: 'Morning',
      });
    }
    setErrors({});
  }, [classToEdit, isOpen, activeAcademicYear]);

  // Auto-generate name when degree, dept, sem, sec change
  const handleAutoName = (degree: DegreeType, sem: SemesterType, sec: SectionType, dept: DepartmentType) => {
    const deptShort = dept.replace('Computer Science & Engineering', 'CSE')
      .replace('Information Technology', 'IT')
      .replace('Electronics & Communication', 'ECE')
      .replace('Mechanical Engineering', 'MECH')
      .replace('Civil Engineering', 'CIVIL')
      .replace('Artificial Intelligence & Data Science', 'AI&DS')
      .replace('Management Studies (MBA)', 'MBA')
      .replace('Computer Applications (BCA/MCA)', 'BCA');

    return `${degree} ${deptShort} - Sem ${sem} (Sec ${sec})`;
  };

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Class name is required';
    if (!formData.roomNumber.trim()) newErrors.roomNumber = 'Room number is required';
    if (formData.capacity <= 0) newErrors.capacity = 'Capacity must be greater than 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: formData.name,
      courseName: formData.courseName,
      degree: formData.degree,
      department: formData.department,
      semester: formData.semester,
      section: formData.section,
      academicYearId: formData.academicYearId,
      coordinatorId: formData.coordinatorId ? formData.coordinatorId : null,
      roomNumber: formData.roomNumber,
      capacity: Number(formData.capacity),
      shift: formData.shift,
    };

    if (classToEdit) {
      updateClass(classToEdit.id, payload);
    } else {
      addClass(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-purple-600 dark:text-purple-400">
              <School className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                {classToEdit ? 'Edit Class Section' : 'Create New Class Section'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configure degree batch, room number, and capacity</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Class / Section Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. B.Tech CSE - Sem 5 (Sec A)"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border ${
                errors.name ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
              } text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500`}
            />
            {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => {
                  const newDept = e.target.value as DepartmentType;
                  setFormData({
                    ...formData,
                    department: newDept,
                    courseName: newDept,
                    name: handleAutoName(formData.degree, formData.semester, formData.section, newDept),
                  });
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Degree Program</label>
              <select
                value={formData.degree}
                onChange={(e) => {
                  const newDeg = e.target.value as DegreeType;
                  setFormData({
                    ...formData,
                    degree: newDeg,
                    name: handleAutoName(newDeg, formData.semester, formData.section, formData.department),
                  });
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
              >
                {DEGREES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Semester</label>
              <select
                value={formData.semester}
                onChange={(e) => {
                  const newSem = Number(e.target.value) as SemesterType;
                  setFormData({
                    ...formData,
                    semester: newSem,
                    name: handleAutoName(formData.degree, newSem, formData.section, formData.department),
                  });
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
              >
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Section</label>
              <select
                value={formData.section}
                onChange={(e) => {
                  const newSec = e.target.value as SectionType;
                  setFormData({
                    ...formData,
                    section: newSec,
                    name: handleAutoName(formData.degree, formData.semester, newSec, formData.department),
                  });
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
              >
                {SECTIONS.map((sec) => (
                  <option key={sec} value={sec}>
                    Section {sec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Assigned Academic Year</label>
              <select
                value={formData.academicYearId}
                onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
              >
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id}>
                    {ay.name} {ay.isActive ? '(Active)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Class Shift</label>
              <select
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="Morning">Morning (8:30 AM - 2:30 PM)</option>
                <option value="Afternoon">Afternoon (11:00 AM - 5:00 PM)</option>
                <option value="Evening">Evening (2:00 PM - 7:30 PM)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Lecture Hall / Room *</label>
              <input
                type="text"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                placeholder="e.g. LHC-301, Lab-2"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border ${
                  errors.roomNumber ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                } text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500`}
              />
              {errors.roomNumber && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.roomNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Student Intake Capacity *</label>
              <input
                type="number"
                min="1"
                max="200"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Coordinator Selection */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Designate Class Coordinator (Faculty)
            </label>
            <select
              value={formData.coordinatorId}
              onChange={(e) => setFormData({ ...formData, coordinatorId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
            >
              <option value="">-- No Coordinator Assigned (Unassigned) --</option>
              {faculties
                .filter((f) => f.isCoordinatorEligible)
                .map((fac) => (
                  <option key={fac.id} value={fac.id}>
                    {fac.firstName} {fac.lastName} ({fac.designation} - {fac.department})
                  </option>
                ))}
            </select>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Faculty assigned will oversee batch attendance, academic mentoring, and student performance.
            </p>
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
              className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {classToEdit ? 'Save Changes' : 'Create Class'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
