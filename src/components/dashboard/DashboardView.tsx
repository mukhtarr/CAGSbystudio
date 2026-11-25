import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  GraduationCap,
  Users,
  School,
  UserCheck,
  Calendar,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Sparkles,
  TrendingUp,
  Clock,
  ChevronRight,
  ShieldCheck,
  Building,
  Download,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { ActiveTab } from '../../types';
import { DepartmentEnrollmentCard } from './DepartmentEnrollmentCard';
import { StudentEnrollmentGrowthCard } from './StudentEnrollmentGrowthCard';
import { FacultyDistributionCard } from './FacultyDistributionCard';
import { AcademicAnalyticsCharts } from './AcademicAnalyticsCharts';
import { UpcomingDeadlinesCard } from './UpcomingDeadlinesCard';
import { DownloadReportModal } from './DownloadReportModal';

interface DashboardViewProps {
  onNavigate?: (tab: ActiveTab) => void;
  onOpenAssignModal?: (classId: string) => void;
  onOpenAddStudent?: () => void;
  onOpenAddFaculty?: () => void;
  onOpenAddClass?: () => void;
  onOpenAddYear?: () => void;
  onOpenAssignCoordinator?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenAssignModal,
  onOpenAddStudent,
  onOpenAddFaculty,
  onOpenAddClass,
  onOpenAddYear,
  onOpenAssignCoordinator,
}) => {
  const {
    students,
    faculties,
    classes,
    academicYears,
    activeAcademicYear,
    stats,
    setActiveTab,
    getCoordinatorForClass,
    getStudentsByClassId,
    activityLogs,
    theme,
  } = useAcademic();

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const navigateTo = (tab: ActiveTab) => {
    if (onNavigate) onNavigate(tab);
    else setActiveTab(tab);
  };

  const isDark = theme === 'dark';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & Academic Session Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 dark:from-slate-900 dark:via-indigo-950/80 dark:to-slate-900 border border-indigo-500/20 p-6 lg:p-8 shadow-xl text-white">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> MYCAGS Academic Governance Portal
            </div>
            <h1 className="text-2xl lg:text-3xl font-heading font-extrabold text-white tracking-tight">
              Academic Administration Dashboard
            </h1>
            <p className="text-sm text-indigo-100 dark:text-slate-300 leading-relaxed">
              Monitoring active session <span className="text-white font-bold underline decoration-indigo-400 underline-offset-2">{activeAcademicYear?.name || 'Academic Session'}</span> ({activeAcademicYear?.code}). Manage students, faculty rosters, section capacities, and class coordinator allocations.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Download PDF or CSV Summary Report"
            >
              <Download className="w-4 h-4" /> Download Report
            </button>
            <button
              onClick={() => (onOpenAddStudent ? onOpenAddStudent() : navigateTo('students'))}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Student
            </button>
            <button
              onClick={() => (onOpenAddFaculty ? onOpenAddFaculty() : navigateTo('faculties'))}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Faculty
            </button>
            <button
              onClick={() => navigateTo('coordinators')}
              className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600/80 text-slate-100 hover:text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-purple-300" /> Coordinator Hub
            </button>
            <button
              onClick={() => navigateTo('course-tracker')}
              className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
              title="Open Course Tracker for Theory and Lab"
            >
              <FileSpreadsheet className="w-4 h-4 text-teal-200" /> Course Tracker
            </button>
          </div>
        </div>
      </div>

      {/* Unassigned Coordinator Alert if any */}
      {stats.unassignedClassesCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 flex items-center justify-between gap-4 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                {stats.unassignedClassesCount} Class Section{stats.unassignedClassesCount > 1 ? 's require' : ' requires'} a Class Coordinator
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300/80">
                Ensure all class sections have an active faculty coordinator assigned for student mentoring and academic oversight.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigateTo('coordinators')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            Assign Now <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div
          onClick={() => navigateTo('students')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-all duration-200 shadow-md group relative overflow-hidden"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-500/20 flex items-center gap-1">
              Active Roster <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="text-3xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
            {stats.totalStudents}
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Enrolled Students</div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
            <span>Avg CGPA: <strong className="text-slate-900 dark:text-slate-200">{stats.averageCgpa}</strong></span>
            <span>Avg Att: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{stats.averageAttendance}%</strong></span>
          </div>
        </div>

        {/* Faculties Strength */}
        <div
          onClick={() => navigateTo('faculties')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all duration-200 shadow-md group relative overflow-hidden"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-1">
              Faculty Staff <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="text-3xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
            {stats.totalFaculties}
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Academic Faculties</div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
            <span>Eligible for Coord: <strong className="text-slate-900 dark:text-slate-200">{faculties.filter(f => f.isCoordinatorEligible).length}</strong></span>
            <span>Departments: <strong className="text-slate-900 dark:text-slate-200">6</strong></span>
          </div>
        </div>

        {/* Classes & Sections */}
        <div
          onClick={() => navigateTo('classes')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-purple-500/40 cursor-pointer transition-all duration-200 shadow-md group relative overflow-hidden"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <School className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-500/20 flex items-center gap-1">
              All Sections <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="text-3xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
            {stats.totalClasses}
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Classes & Sections</div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
            <span>Total Intake: <strong className="text-slate-900 dark:text-slate-200">{classes.reduce((a, c) => a + c.capacity, 0)}</strong></span>
            <span>Active AY: <strong className="text-slate-900 dark:text-slate-200">100%</strong></span>
          </div>
        </div>

        {/* Class Coordinators Coverage */}
        <div
          onClick={() => navigateTo('coordinators')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all duration-200 shadow-md group relative overflow-hidden"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <UserCheck className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/20 flex items-center gap-1">
              Assignment Rate <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="text-3xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
            {stats.coordinatorAssignedPercentage}%
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            {stats.assignedClassesCount} of {stats.totalClasses} Assigned
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
            <span>Pending: <strong className={stats.unassignedClassesCount > 0 ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-bold'}>{stats.unassignedClassesCount} classes</strong></span>
            <span>Target: <strong className="text-emerald-600 dark:text-emerald-400">100%</strong></span>
          </div>
        </div>
      </div>

      {/* Visual Analytics: Student Enrollment Growth & Faculty Distribution (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StudentEnrollmentGrowthCard
          students={students}
          isDark={isDark}
          onNavigate={navigateTo}
        />
        <FacultyDistributionCard
          faculties={faculties}
          isDark={isDark}
          onNavigate={navigateTo}
        />
      </div>

      {/* Department Student Enrollment Summary Card with Recharts */}
      <DepartmentEnrollmentCard
        students={students}
        classes={classes}
        academicYears={academicYears}
        activeAcademicYear={activeAcademicYear}
        isDark={isDark}
        onNavigate={navigateTo}
      />

      {/* Academic Analytics & Trends Visualization */}
      <AcademicAnalyticsCharts
        students={students}
        faculties={faculties}
        classes={classes}
        academicYears={academicYears}
        activeAcademicYear={activeAcademicYear}
        isDark={isDark}
      />

      {/* Upcoming Academic Deadlines & Exam Periods Card */}
      <UpcomingDeadlinesCard
        academicYears={academicYears}
        activeAcademicYear={activeAcademicYear}
        onNavigate={navigateTo}
        isDark={isDark}
      />

      {/* Class Coordinator Matrix Preview & Fast Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classes & Coordinator Matrix Table */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Class Coordinator Overview
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Class sections and their designated faculty coordinators</p>
            </div>
            <button
              onClick={() => navigateTo('coordinators')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 hover:underline cursor-pointer"
            >
              Full Coordinator Hub <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                  <th className="pb-3 pl-2">Class / Section</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Room & Shift</th>
                  <th className="pb-3">Assigned Coordinator</th>
                  <th className="pb-3 pr-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {classes.slice(0, 5).map((cls) => {
                  const coord = getCoordinatorForClass(cls.id);
                  return (
                    <tr key={cls.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 pl-2">
                        <div className="font-bold text-slate-900 dark:text-white">{cls.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">Sem {cls.semester} • Sec {cls.section}</div>
                      </td>
                      <td className="py-3">
                        <span className="text-slate-700 dark:text-slate-300 truncate block max-w-[140px]">{cls.department}</span>
                      </td>
                      <td className="py-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {cls.roomNumber} ({cls.shift})
                      </td>
                      <td className="py-3">
                        {coord ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                              {coord.firstName[0]}{coord.lastName[0]}
                            </div>
                            <div className="truncate">
                              <span className="font-semibold text-slate-900 dark:text-slate-200 block truncate">
                                {coord.firstName} {coord.lastName}
                              </span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">{coord.designation}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-[10px] font-bold">
                            <AlertTriangle className="w-3 h-3" /> Not Assigned
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-2 text-right">
                        <button
                          onClick={() => navigateTo('coordinators')}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold text-[11px] border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                        >
                          {coord ? 'Reassign' : 'Assign'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Launchpad & Academic Activities */}
        <div className="space-y-6">
          {/* Quick Shortcuts */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Management Launchpad
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => navigateTo('students')}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-600/20 border border-slate-200 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-500/40 text-left transition-all group cursor-pointer"
              >
                <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-1.5 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-900 dark:text-white">Students</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Roster & Profiles</div>
              </button>

              <button
                onClick={() => navigateTo('faculties')}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-600/20 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-300 dark:hover:border-emerald-500/40 text-left transition-all group cursor-pointer"
              >
                <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-900 dark:text-white">Faculties</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Staff & Designations</div>
              </button>

              <button
                onClick={() => navigateTo('classes')}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-purple-50 dark:hover:bg-purple-600/20 border border-slate-200 dark:border-slate-700/80 hover:border-purple-300 dark:hover:border-purple-500/40 text-left transition-all group cursor-pointer"
              >
                <School className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-1.5 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-900 dark:text-white">Classes</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Rooms & Capacity</div>
              </button>

              <button
                onClick={() => navigateTo('academic-years')}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-amber-50 dark:hover:bg-amber-600/20 border border-slate-200 dark:border-slate-700/80 hover:border-amber-300 dark:hover:border-amber-500/40 text-left transition-all group cursor-pointer"
              >
                <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400 mb-1.5 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-900 dark:text-white">Academic Years</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Sessions & Terms</div>
              </button>
            </div>
          </div>

          {/* Recent Audit Trail */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" /> Recent Audit Actions
              </h3>
            </div>
            <div className="space-y-3">
              {activityLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="text-xs border-l-2 border-indigo-600 dark:border-indigo-500 pl-3 py-0.5">
                  <p className="text-slate-800 dark:text-slate-200 font-medium line-clamp-1">{log.description}</p>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{log.module} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Download Report Modal */}
      <DownloadReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        students={students}
        faculties={faculties}
        classes={classes}
        academicYears={academicYears}
        activeAcademicYear={activeAcademicYear}
      />
    </div>
  );
};

