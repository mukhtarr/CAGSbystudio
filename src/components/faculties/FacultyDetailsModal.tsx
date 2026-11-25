import React from 'react';
import { motion } from 'motion/react';
import {
  X,
  Users,
  Mail,
  Phone,
  Building,
  Award,
  BookOpen,
  Calendar,
  School,
  CheckCircle,
  Briefcase,
  UserCheck,
} from 'lucide-react';
import { Faculty } from '../../types';
import { useAcademic } from '../../context/AcademicContext';

interface FacultyDetailsModalProps {
  faculty: Faculty | null;
  onClose: () => void;
  onEdit: (faculty: Faculty) => void;
}

export const FacultyDetailsModal: React.FC<FacultyDetailsModalProps> = ({
  faculty,
  onClose,
  onEdit,
}) => {
  const { getAssignedClassesForFaculty } = useAcademic();

  if (!faculty) return null;

  const assignedClasses = getAssignedClassesForFaculty(faculty.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Top Bar */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <span className="text-xs uppercase font-mono tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
            Faculty Profile & Dossier
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Header Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 dark:from-emerald-950/60 via-emerald-100/40 dark:via-slate-900 to-indigo-50 dark:to-indigo-950/50 border border-emerald-200 dark:border-emerald-500/30 relative overflow-hidden shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-emerald-600/10 dark:bg-emerald-600/20 border-2 border-emerald-300 dark:border-emerald-400/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-heading font-extrabold text-2xl shadow-inner shrink-0">
                {faculty.firstName[0]}
                {faculty.lastName[0]}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-xl font-heading font-extrabold text-slate-900 dark:text-white">
                    {faculty.firstName} {faculty.lastName}
                  </h2>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                    {faculty.status}
                  </span>
                </div>

                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {faculty.designation}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300 mt-2">
                  <span className="font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                    {faculty.employeeCode}
                  </span>
                  <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                    <Building className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                    {faculty.department}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-center">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Experience</div>
              <div className="text-xl font-heading font-extrabold text-slate-900 dark:text-white mt-0.5">
                {faculty.experienceYears} Years
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Academic</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-center">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Coordinating</div>
              <div className="text-xl font-heading font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">
                {assignedClasses.length} Classes
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Assigned Batch</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-center">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Coordinator Role</div>
              <div className="text-sm font-heading font-bold text-slate-900 dark:text-white mt-1.5">
                {faculty.isCoordinatorEligible ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Eligible
                  </span>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500">Ineligible</span>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-center">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Office Room</div>
              <div className="text-sm font-heading font-bold text-slate-900 dark:text-white mt-1.5 font-mono truncate">
                {faculty.officeRoom || 'TBA'}
              </div>
            </div>
          </div>

          {/* Academic Credentials & Specialization */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <Award className="w-4 h-4" /> Qualifications & Research Domain
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Highest Qualification:</span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm mt-0.5 block">
                  {faculty.qualification}
                </span>
              </div>

              {faculty.specialization && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/40">
                  <span className="text-slate-500 dark:text-slate-400 block">Research Specialization:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200 mt-0.5 block">
                    {faculty.specialization}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Assigned Classes as Coordinator */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-2">
              <UserCheck className="w-4 h-4" /> Class Coordinator Assignments
            </h4>
            {assignedClasses.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                Currently not assigned as Class Coordinator to any class section.
              </p>
            ) : (
              <div className="space-y-2">
                {assignedClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-purple-200 dark:border-purple-500/30 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">{cls.name}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {cls.department} • Room: {cls.roomNumber} ({cls.shift})
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-semibold text-[10px]">
                      Active Coordinator
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assigned Subjects */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Assigned Teaching Subjects
            </h4>
            <div className="flex flex-wrap gap-2 pt-1">
              {faculty.assignedSubjects && faculty.assignedSubjects.length > 0 ? (
                faculty.assignedSubjects.map((sub, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-medium"
                  >
                    {sub}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 dark:text-slate-400 italic">No subjects assigned yet</span>
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
              <Mail className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Email</span>
                <span className="font-medium text-slate-900 dark:text-white">{faculty.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
              <Phone className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Phone</span>
                <span className="font-medium text-slate-900 dark:text-white">{faculty.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Joined on {new Date(faculty.dateOfJoining).toLocaleDateString()}
          </span>
          <button
            onClick={() => {
              onClose();
              onEdit(faculty);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Edit Profile
          </button>
        </div>
      </motion.div>
    </div>
  );
};
