import React from 'react';
import { motion } from 'motion/react';
import {
  X,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  Award,
  BookOpen,
  MapPin,
  Heart,
  Shield,
  User,
  CheckCircle,
  Building,
  School,
} from 'lucide-react';
import { Student } from '../../types';
import { useAcademic } from '../../context/AcademicContext';

interface StudentProfileModalProps {
  student: Student | null;
  onClose: () => void;
  onEdit: (student: Student) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  onClose,
  onEdit,
}) => {
  const { getClassById, getCoordinatorForClass } = useAcademic();

  if (!student) return null;

  const assignedClass = getClassById(student.classId);
  const coordinator = assignedClass ? getCoordinatorForClass(assignedClass.id) : null;

  const getAttendanceColor = (att: number) => {
    if (att >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (att >= 75) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider text-indigo-600 dark:text-indigo-400 font-bold">
              Student ID Card & Dossier
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Header ID Card Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 dark:from-indigo-900/60 via-indigo-100/40 dark:via-slate-900 to-purple-50 dark:to-purple-950/50 border border-indigo-200 dark:border-indigo-500/30 relative overflow-hidden shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-indigo-600/10 dark:bg-indigo-600/30 border-2 border-indigo-300 dark:border-indigo-400/40 text-indigo-700 dark:text-indigo-200 flex items-center justify-center font-heading font-extrabold text-2xl shadow-inner shrink-0">
                {student.firstName[0]}
                {student.lastName[0]}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-xl font-heading font-extrabold text-slate-900 dark:text-white">
                    {student.firstName} {student.lastName}
                  </h2>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                    {student.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-mono bg-white dark:bg-slate-800/80 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                    Roll: {student.rollNo}
                  </span>
                  <span className="font-mono text-slate-500 dark:text-slate-400">{student.prnNo}</span>
                  <span className="text-indigo-600 dark:text-indigo-300 font-semibold">{student.degree}</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  {student.department}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-center">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Current CGPA</div>
              <div className="text-xl font-heading font-extrabold text-slate-900 dark:text-white mt-0.5">
                {student.cgpa.toFixed(2)}
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Scale 10.0</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-center">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Attendance</div>
              <div className={`text-xl font-heading font-extrabold mt-0.5 ${student.attendancePercent >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {student.attendancePercent}%
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {student.attendancePercent >= 75 ? 'Satisfactory' : 'Shortage'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-center">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Semester</div>
              <div className="text-xl font-heading font-extrabold text-slate-900 dark:text-white mt-0.5">
                Sem {student.semester}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Sec {student.section}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-center">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Admission</div>
              <div className="text-xl font-heading font-extrabold text-slate-900 dark:text-white mt-0.5">
                {student.admissionYear}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Batch</span>
            </div>
          </div>

          {/* Academic Class & Coordinator Section */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
              <School className="w-4 h-4" /> Class Section & Coordinator Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Assigned Class Section:</span>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {assignedClass ? assignedClass.name : 'Not Allocated'}
                </p>
                {assignedClass && (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    Room: {assignedClass.roomNumber} • Shift: {assignedClass.shift}
                  </span>
                )}
              </div>

              <div>
                <span className="text-slate-500 dark:text-slate-400">Designated Class Coordinator:</span>
                {coordinator ? (
                  <div className="mt-0.5">
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {coordinator.firstName} {coordinator.lastName}
                    </p>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {coordinator.designation} ({coordinator.email})
                    </span>
                  </div>
                ) : (
                  <p className="text-rose-500 dark:text-rose-400 font-medium mt-0.5">No Coordinator Assigned</p>
                )}
              </div>
            </div>
          </div>

          {/* Personal & Contact Dossier */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-2">
              <User className="w-4 h-4" /> Contact & Guardian Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                <Mail className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Email Address</span>
                  <span className="font-medium text-slate-900 dark:text-white">{student.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                <Phone className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Mobile Phone</span>
                  <span className="font-medium text-slate-900 dark:text-white">{student.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                <Calendar className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Date of Birth & Gender</span>
                  <span className="font-medium text-slate-900 dark:text-white">{student.dob} ({student.gender})</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                <Heart className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Blood Group</span>
                  <span className="font-medium text-slate-900 dark:text-white">{student.bloodGroup || 'Not Specified'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                <Shield className="w-4 h-4 text-purple-500 dark:text-purple-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Guardian Name</span>
                  <span className="font-medium text-slate-900 dark:text-white">{student.guardianName || 'N/A'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                <Phone className="w-4 h-4 text-purple-500 dark:text-purple-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Guardian Phone</span>
                  <span className="font-medium text-slate-900 dark:text-white">{student.guardianPhone || 'N/A'}</span>
                </div>
              </div>

              {student.address && (
                <div className="sm:col-span-2 flex items-start gap-2.5 text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-700/40">
                  <MapPin className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Permanent Residence</span>
                    <span className="font-medium text-slate-900 dark:text-white">{student.address}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Registered in MYCAGS on {new Date(student.createdAt).toLocaleDateString()}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(student);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
