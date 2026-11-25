import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Users, User, Mail, Phone, BookOpen, Award, Check, Building, Briefcase } from 'lucide-react';
import { Faculty, DepartmentType, FacultyDesignation, FacultyStatus } from '../../types';
import { useAcademic } from '../../context/AcademicContext';

interface FacultyModalProps {
  isOpen: boolean;
  facultyToEdit?: Faculty | null;
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

const DESIGNATIONS: FacultyDesignation[] = [
  'Head of Department (HOD)',
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Lecturer',
  'Visiting Faculty',
];

const STATUSES: FacultyStatus[] = ['Active', 'On Leave', 'Visiting', 'Retired'];

export const FacultyModal: React.FC<FacultyModalProps> = ({
  isOpen,
  facultyToEdit,
  onClose,
}) => {
  const { addFaculty, updateFaculty } = useAcademic();

  const [formData, setFormData] = useState({
    employeeCode: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'Computer Science & Engineering' as DepartmentType,
    designation: 'Assistant Professor' as FacultyDesignation,
    qualification: '',
    dateOfJoining: '2020-08-01',
    specialization: '',
    experienceYears: 5,
    status: 'Active' as FacultyStatus,
    assignedSubjectsInput: '',
    isCoordinatorEligible: true,
    officeRoom: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (facultyToEdit) {
      setFormData({
        employeeCode: facultyToEdit.employeeCode,
        firstName: facultyToEdit.firstName,
        lastName: facultyToEdit.lastName,
        email: facultyToEdit.email,
        phone: facultyToEdit.phone,
        department: facultyToEdit.department,
        designation: facultyToEdit.designation,
        qualification: facultyToEdit.qualification,
        dateOfJoining: facultyToEdit.dateOfJoining,
        specialization: facultyToEdit.specialization,
        experienceYears: facultyToEdit.experienceYears,
        status: facultyToEdit.status,
        assignedSubjectsInput: facultyToEdit.assignedSubjects.join(', '),
        isCoordinatorEligible: facultyToEdit.isCoordinatorEligible,
        officeRoom: facultyToEdit.officeRoom || '',
      });
    } else {
      setFormData({
        employeeCode: `EMP-${Math.floor(100 + Math.random() * 900)}`,
        firstName: '',
        lastName: '',
        email: '',
        phone: '+91 98',
        department: 'Computer Science & Engineering',
        designation: 'Assistant Professor',
        qualification: 'M.Tech / Ph.D',
        dateOfJoining: new Date().toISOString().split('T')[0],
        specialization: '',
        experienceYears: 5,
        status: 'Active',
        assignedSubjectsInput: 'Operating Systems, Algorithms',
        isCoordinatorEligible: true,
        officeRoom: 'Block A-204',
      });
    }
    setErrors({});
  }, [facultyToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.employeeCode.trim()) newErrors.employeeCode = 'Employee Code is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.qualification.trim()) newErrors.qualification = 'Qualification is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const subjects = formData.assignedSubjectsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const facultyPayload = {
      employeeCode: formData.employeeCode,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      designation: formData.designation,
      qualification: formData.qualification,
      dateOfJoining: formData.dateOfJoining,
      specialization: formData.specialization,
      experienceYears: Number(formData.experienceYears),
      status: formData.status,
      assignedSubjects: subjects,
      isCoordinatorEligible: formData.isCoordinatorEligible,
      officeRoom: formData.officeRoom,
    };

    if (facultyToEdit) {
      updateFaculty(facultyToEdit.id, facultyPayload);
    } else {
      addFaculty(facultyPayload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                {facultyToEdit ? 'Edit Faculty Record' : 'Register New Faculty Member'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {facultyToEdit ? `Updating ID: ${facultyToEdit.employeeCode}` : 'Add academic credentials and designation'}
              </p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Personal & Identification */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <User className="w-4 h-4" /> Personal & Identification
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Employee Code *
                </label>
                <input
                  type="text"
                  value={formData.employeeCode}
                  onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                  placeholder="EMP-CSE-001"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border ${
                    errors.employeeCode ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  } text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500`}
                />
                {errors.employeeCode && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.employeeCode}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Dr. Rajesh"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border ${
                    errors.firstName ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  } text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500`}
                />
                {errors.firstName && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Sharma"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border ${
                    errors.lastName ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  } text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500`}
                />
                {errors.lastName && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.lastName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="faculty@cags.edu"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border ${
                    errors.email ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  } text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500`}
                />
                {errors.email && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Office Room</label>
                <input
                  type="text"
                  value={formData.officeRoom}
                  onChange={(e) => setFormData({ ...formData, officeRoom: e.target.value })}
                  placeholder="Tech Block 301"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Academic Rank & Specialization */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Designation & Academic Role
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value as DepartmentType })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Designation</label>
                <select
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value as FacultyDesignation })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  {DESIGNATIONS.map((des) => (
                    <option key={des} value={des}>
                      {des}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Highest Qualification *
                </label>
                <input
                  type="text"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  placeholder="Ph.D. in Computer Science (IIT Bombay)"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border ${
                    errors.qualification ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  } text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500`}
                />
                {errors.qualification && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.qualification}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Experience (Years)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Research Specialization / Domain
                </label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="Distributed Systems, Cloud Architecture, Big Data"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Subjects (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.assignedSubjectsInput}
                  onChange={(e) => setFormData({ ...formData, assignedSubjectsInput: e.target.value })}
                  placeholder="e.g. Distributed Systems, Database Management Systems"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Employment Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as FacultyStatus })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  {STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Coordinator Eligibility Switch */}
              <div className="sm:col-span-2 flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  id="coordEligible"
                  checked={formData.isCoordinatorEligible}
                  onChange={(e) => setFormData({ ...formData, isCoordinatorEligible: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-0 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                />
                <label htmlFor="coordEligible" className="text-xs text-slate-700 dark:text-slate-200 cursor-pointer">
                  <span className="font-semibold block text-slate-900 dark:text-white">Eligible for Class Coordinator Duty</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Can be assigned to oversee classes, mentors, and batch attendance.</span>
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {facultyToEdit ? 'Save Changes' : 'Register Faculty'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
