import React from 'react';
import { motion } from 'motion/react';
import { X, School, Users, GraduationCap, Building, UserCheck } from 'lucide-react';
import { ClassEntity } from '../../types';
import { useAcademic } from '../../context/AcademicContext';

interface ClassStudentsModalProps {
  classItem: ClassEntity | null;
  onClose: () => void;
}

export const ClassStudentsModal: React.FC<ClassStudentsModalProps> = ({
  classItem,
  onClose,
}) => {
  const { getStudentsByClass, getCoordinatorForClass } = useAcademic();

  if (!classItem) return null;

  const classStudents = getStudentsByClass(classItem.id);
  const coordinator = getCoordinatorForClass(classItem.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div>
            <span className="text-xs uppercase font-mono tracking-wider text-purple-600 dark:text-purple-400 font-bold">
              Class Section Enrolled Roster
            </span>
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white mt-0.5">
              {classItem.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Info Banner */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block">Class Coordinator</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mt-0.5">
              {coordinator ? `${coordinator.firstName} ${coordinator.lastName}` : 'Unassigned'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block">Lecture Room</span>
            <span className="font-semibold text-slate-900 dark:text-white block mt-0.5 font-mono">
              {classItem.roomNumber} ({classItem.shift})
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block">Enrolled / Capacity</span>
            <span className="font-semibold text-slate-900 dark:text-white block mt-0.5">
              {classStudents.length} / {classItem.capacity} students
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block">Department</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 block mt-0.5 truncate">
              {classItem.department}
            </span>
          </div>
        </div>

        {/* Student List Table */}
        <div className="p-6 overflow-y-auto flex-1">
          {classStudents.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500">
              <GraduationCap className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-400">No students enrolled in this section yet</p>
              <p className="text-xs text-slate-500 dark:text-slate-500">Enroll students from the Students Module or assign class section.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                  <th className="pb-3 pl-2">Roll No</th>
                  <th className="pb-3">Student Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3 text-center">CGPA</th>
                  <th className="pb-3 text-center">Attendance</th>
                  <th className="pb-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {classStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3 pl-2 font-mono font-semibold text-indigo-600 dark:text-indigo-300">{st.rollNo}</td>
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">
                      {st.firstName} {st.lastName}
                    </td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{st.email}</td>
                    <td className="py-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200">{st.cgpa.toFixed(2)}</td>
                    <td className="py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          st.attendancePercent >= 75
                            ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10'
                            : 'text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/10'
                        }`}
                      >
                        {st.attendancePercent}%
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                        {st.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Showing {classStudents.length} total students enrolled</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
