import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  BookOpen,
  Calendar,
  Layers,
  CheckCircle2,
  Database,
  ExternalLink,
  Award,
  Users,
  Clock,
  Sparkles,
  ClipboardList,
  Plus,
  Edit3,
  Trash2,
  FlaskConical,
  Filter,
  MapPin,
  GraduationCap,
  Percent,
  ShieldCheck,
  Shield,
  Crown,
  Info,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { CourseTrackerRecord } from '../../types';
import { SyllabusDeliveryTab } from './SyllabusDeliveryTab';
import { AttendanceControlTab } from './AttendanceControlTab';
import { MarksAssessmentTab } from './MarksAssessmentTab';
import { DefaultersTab } from './DefaultersTab';
import { CourseTrackerModal } from './CourseTrackerModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { canUserDeleteCourse, canUserEditCourse, canUserAddCourse } from '../../utils/rolePermissions';

type CourseTrackerSubTab = 'syllabus' | 'controls' | 'assessments' | 'defaulters';
type CourseFilterType = 'ALL' | 'Theory' | 'Lab';

export const CourseTrackerView: React.FC = () => {
  const {
    courseTrackers,
    studentPerformances,
    updateCourseTracker,
    deleteCourseTracker,
    addSyllabusSession,
    updateSyllabusSession,
    deleteSyllabusSession,
    updateAttendanceControlItem,
    updateStudentPerformance,
    exportCourseTrackerExcel,
    exportCourseTrackerCSV,
    setActiveTab,
    currentUser,
  } = useAcademic();

  const isAdmin = currentUser?.role === 'Admin';
  const isPrincipal = currentUser?.role === 'Principal/Director';
  const isHod = currentUser?.role === 'HOD';
  const isFaculty = currentUser?.role === 'Faculty';
  const userDept = currentUser?.department;

  // Role-scoped base trackers
  const roleScopedTrackers = useMemo(() => {
    if (isAdmin || isPrincipal) {
      return courseTrackers;
    }
    if (isHod) {
      if (!userDept) return courseTrackers;
      const deptMatches = courseTrackers.filter((t) => t.department === userDept);
      return deptMatches.length > 0 ? deptMatches : courseTrackers;
    }
    if (isFaculty) {
      const myCourses = courseTrackers.filter(
        (t) =>
          (currentUser?.id && t.courseOwnerFacultyId === currentUser.id) ||
          (currentUser?.name && t.courseOwner.toLowerCase().includes(currentUser.name.toLowerCase())) ||
          (userDept && t.department === userDept)
      );
      return myCourses.length > 0 ? myCourses : courseTrackers;
    }
    return courseTrackers;
  }, [courseTrackers, isAdmin, isPrincipal, isHod, isFaculty, userDept, currentUser]);

  const [selectedTrackerId, setSelectedTrackerId] = useState<string>(
    roleScopedTrackers[0]?.id || courseTrackers[0]?.id || ''
  );
  const [subTab, setSubTab] = useState<CourseTrackerSubTab>('syllabus');
  const [filterType, setFilterType] = useState<CourseFilterType>('ALL');
  const [presetTypeForModal, setPresetTypeForModal] = useState<'Theory' | 'Lab'>('Theory');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<CourseTrackerRecord | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<CourseTrackerRecord | null>(null);

  // Filter courses by Theory / Lab
  const filteredTrackers = useMemo(() => {
    return roleScopedTrackers.filter((t) => {
      if (filterType === 'Theory') return t.courseType === 'Theory';
      if (filterType === 'Lab') return t.courseType === 'Lab';
      return true;
    });
  }, [roleScopedTrackers, filterType]);

  const theoryCount = roleScopedTrackers.filter((t) => t.courseType === 'Theory').length;
  const labCount = roleScopedTrackers.filter((t) => t.courseType === 'Lab').length;

  // Selected tracker fallback
  const currentTracker =
    roleScopedTrackers.find((t) => t.id === selectedTrackerId) ||
    filteredTrackers[0] ||
    roleScopedTrackers[0] ||
    courseTrackers[0];

  const handleOpenAddCourse = (presetType: 'Theory' | 'Lab' = 'Theory') => {
    setPresetTypeForModal(presetType);
    setCourseToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditCourse = (tracker: CourseTrackerRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCourseToEdit(tracker);
    setIsModalOpen(true);
  };

  const handleOpenDeleteCourse = (tracker: CourseTrackerRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCourseToDelete(tracker);
  };

  const confirmDelete = () => {
    if (!courseToDelete) return;
    const deletedId = courseToDelete.id;
    deleteCourseTracker(deletedId);

    // Update selected tracker if the active one was deleted
    const remaining = roleScopedTrackers.filter((t) => t.id !== deletedId);
    if (remaining.length > 0) {
      setSelectedTrackerId(remaining[0].id);
    } else {
      setSelectedTrackerId('');
    }
    setCourseToDelete(null);
  };

  const isLab = currentTracker?.courseType === 'Lab';

  // Count defaulters
  const defaulterCount = studentPerformances.filter((s) => {
    const att = isLab ? s.labAttendance.percentage : s.theoryAttendance.percentage;
    return att < 75;
  }).length;

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* Role Privilege Scoping Banner */}
      <div
        className={`px-4 py-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          isAdmin
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-200'
            : isPrincipal
            ? 'bg-purple-500/10 border-purple-500/30 text-purple-800 dark:text-purple-200'
            : isHod
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
            : 'bg-blue-500/10 border-blue-500/30 text-blue-800 dark:text-blue-200'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {isAdmin && <ShieldCheck className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />}
          {isPrincipal && <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />}
          {isHod && <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
          {isFaculty && <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
          <div>
            <span className="font-bold">
              {isAdmin && 'Admin Privilege: All Privileges Active'}
              {isPrincipal && 'Principal Oversight: Executive Inspection of All Departments'}
              {isHod && `HOD Authority: Scoped to ${userDept || 'Department'}`}
              {isFaculty && `Faculty Workstation: ${currentUser?.name || 'Assigned Faculty'}`}
            </span>
            <span className="opacity-80 block sm:inline sm:ml-2">
              {isAdmin && 'Full access to add, edit, delete Theory & Lab courses and manage database across all departments.'}
              {isPrincipal && 'Auditing syllabus delivery, attendance rates, and CIA statistics across all academic departments.'}
              {isHod && 'Managing Theory & Lab course registry, syllabus allocations, and faculty assignments for your department only.'}
              {isFaculty && 'Managing assigned subject syllabus delivery, attendance records, CIA assessments, and defaulters.'}
            </span>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full font-bold uppercase text-[10px] bg-white/80 dark:bg-slate-900/80 border border-current">
            {currentUser?.role}
          </span>
        </div>
      </div>

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
              <FileSpreadsheet className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Course Tracker &amp; Curriculum Management
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Institutional syllabus delivery, attendance controls, and continuous assessments (Theory &amp; Lab)
              </p>
            </div>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Add Theory Button */}
          {canUserAddCourse(currentUser?.role) && (
            <button
              onClick={() => handleOpenAddCourse('Theory')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              + Add Theory Course
            </button>
          )}

          {/* Quick Add Lab Button */}
          {canUserAddCourse(currentUser?.role) && (
            <button
              onClick={() => handleOpenAddCourse('Lab')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <FlaskConical className="w-4 h-4" />
              + Add Lab Course
            </button>
          )}

          {currentTracker && (
            <>
              <button
                onClick={() => exportCourseTrackerExcel(currentTracker.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors shadow-xs cursor-pointer"
                title="Download multi-worksheet Excel workbook matching institutional template"
              >
                <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Export Excel (.xls)
              </button>

              <button
                onClick={() => exportCourseTrackerCSV(currentTracker.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
                title="Export CSV assessment matrix"
              >
                <Download className="w-4 h-4 text-slate-500" />
                Export CSV
              </button>
            </>
          )}

          {isAdmin && (
            <button
              onClick={() => setActiveTab('database')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors shadow-xs cursor-pointer"
              title="View database schema & SQL dump (Admin Only)"
            >
              <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              MySQL Tables
            </button>
          )}
        </div>
      </div>

      {/* Course Tracker Selector Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-5">
        {/* Banner Sub-Header: Filter Chips & Course Count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Course Registry:
            </span>
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterType === 'ALL'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Courses ({courseTrackers.length})
              </button>
              <button
                onClick={() => setFilterType('Theory')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterType === 'Theory'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Theory ({theoryCount})
              </button>
              <button
                onClick={() => setFilterType('Lab')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterType === 'Lab'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5" />
                Lab / Practical ({labCount})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenAddCourse('Theory')}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/20 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Theory
            </button>
            <button
              onClick={() => handleOpenAddCourse('Lab')}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/20 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Lab
            </button>
          </div>
        </div>

        {/* Course Cards / Selection List */}
        {filteredTrackers.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              No {filterType !== 'ALL' ? filterType : ''} courses found.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Create your syllabus tracker for Theory lectures or Laboratory sessions.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => handleOpenAddCourse('Theory')}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm cursor-pointer"
              >
                + Add Theory Course
              </button>
              <button
                onClick={() => handleOpenAddCourse('Lab')}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm cursor-pointer"
              >
                + Add Lab Course
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredTrackers.map((t) => {
              const isSelected = t.id === currentTracker?.id;
              const isTTheory = t.courseType === 'Theory';
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTrackerId(t.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer group ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/10 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          isTTheory
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {isTTheory ? (
                          <BookOpen className="w-4 h-4" />
                        ) : (
                          <FlaskConical className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {t.courseCode}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              isTTheory
                                ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300'
                                : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                            }`}
                          >
                            {t.courseType}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate mt-0.5">
                          {t.courseName}
                        </h4>
                      </div>
                    </div>

                    {/* Quick Card Edit & Delete Actions */}
                    <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      {canUserEditCourse(currentUser?.role, userDept, t.department, currentUser?.id, t.courseOwnerFacultyId) && (
                        <button
                          onClick={(e) => handleOpenEditCourse(t, e)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Edit Course Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canUserDeleteCourse(currentUser?.role, userDept, t.department) && (
                        <button
                          onClick={(e) => handleOpenDeleteCourse(t, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete Course"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="truncate">{t.classAndSem}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {t.conductedSessions}/{t.totalSessions} Sessions ({t.completionPercentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Current Active Course Strip */}
        {currentTracker && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-xl">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
                  Class &amp; Sem
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {currentTracker.classAndSem}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
                  Course Faculty
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block truncate">
                  {currentTracker.courseOwner}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
                  Venue / Room
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {currentTracker.classroom || 'Not Assigned'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
                  Credits &amp; Type
                </span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                  {currentTracker.credits} Credits • {currentTracker.courseType}
                </span>
              </div>
            </div>

            {/* Edit & Delete Action Buttons for Currently Selected Course */}
            <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-slate-700/60">
              {canUserEditCourse(
                currentUser?.role,
                userDept,
                currentTracker.department,
                currentUser?.id,
                currentTracker.courseOwnerFacultyId
              ) && (
                <button
                  onClick={() => handleOpenEditCourse(currentTracker)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100/70 dark:bg-indigo-500/20 hover:bg-indigo-200/80 dark:hover:bg-indigo-500/30 rounded-lg transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Course
                </button>
              )}
              {canUserDeleteCourse(currentUser?.role, userDept, currentTracker.department) && (
                <button
                  onClick={() => handleOpenDeleteCourse(currentTracker)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-100/70 dark:bg-rose-500/20 hover:bg-rose-200/80 dark:hover:bg-rose-500/30 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Course
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* If currentTracker exists, render Subtabs */}
      {currentTracker ? (
        <>
          {/* Secondary Tab Navigation (Excel Tabs Representation) */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-2">
            <button
              onClick={() => setSubTab('syllabus')}
              className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                subTab === 'syllabus'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {isLab ? (
                <FlaskConical className="w-4 h-4 text-emerald-500" />
              ) : (
                <BookOpen className="w-4 h-4 text-blue-500" />
              )}
              {isLab ? 'Lab Plan & Practical Delivery' : 'Syllabus & Lecture Delivery'}
              <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {currentTracker.conductedSessions}/{currentTracker.totalSessions}
              </span>
            </button>

            <button
              onClick={() => setSubTab('controls')}
              className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                subTab === 'controls'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Attendance Control Sheets
              <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {currentTracker.attendanceControlItems?.length || 0}
              </span>
            </button>

            <button
              onClick={() => setSubTab('assessments')}
              className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                subTab === 'assessments'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Award className="w-4 h-4" />
              Internal Tests &amp; CIA Marks
              <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {studentPerformances.length}
              </span>
            </button>

            <button
              onClick={() => setSubTab('defaulters')}
              className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                subTab === 'defaulters'
                  ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Defaulters &amp; Risk Monitoring
              {defaulterCount > 0 && (
                <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold">
                  {defaulterCount}
                </span>
              )}
            </button>
          </div>

          {/* Subtab Contents */}
          {subTab === 'syllabus' && (
            <SyllabusDeliveryTab
              tracker={currentTracker}
              onAddSession={(sess) => addSyllabusSession(currentTracker.id, sess)}
              onUpdateSession={(sessId, updates) =>
                updateSyllabusSession(currentTracker.id, sessId, updates)
              }
              onDeleteSession={(sessId) => deleteSyllabusSession(currentTracker.id, sessId)}
            />
          )}

          {subTab === 'controls' && (
            <AttendanceControlTab
              tracker={currentTracker}
              onUpdateItem={(srNo, updates) =>
                updateAttendanceControlItem(currentTracker.id, srNo, updates)
              }
            />
          )}

          {subTab === 'assessments' && (
            <MarksAssessmentTab
              tracker={currentTracker}
              students={studentPerformances}
              onUpdatePerformance={updateStudentPerformance}
            />
          )}

          {subTab === 'defaulters' && (
            <DefaultersTab tracker={currentTracker} students={studentPerformances} />
          )}
        </>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Courses Configured</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
            Get started by adding your first Theory course (with lecture syllabus) or Lab course (with practical experiments).
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => handleOpenAddCourse('Theory')}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md cursor-pointer"
            >
              + Add Theory Course
            </button>
            <button
              onClick={() => handleOpenAddCourse('Lab')}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md cursor-pointer"
            >
              + Add Lab Course
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Course Tracker Modal */}
      <CourseTrackerModal
        isOpen={isModalOpen}
        courseToEdit={courseToEdit}
        presetType={presetTypeForModal}
        onClose={() => {
          setIsModalOpen(false);
          setCourseToEdit(null);
        }}
        onSaved={(trackerId) => {
          setSelectedTrackerId(trackerId);
        }}
      />

      {/* Confirm Deletion Modal */}
      <ConfirmModal
        isOpen={Boolean(courseToDelete)}
        title={`Delete ${courseToDelete?.courseType} Course`}
        message={`Are you sure you want to delete "${courseToDelete?.courseName}" (${courseToDelete?.courseCode})? This will permanently remove its syllabus delivery plan, attendance sheet connections, and assessment records.`}
        confirmLabel="Delete Course"
        confirmVariant="danger"
        onConfirm={confirmDelete}
        onClose={() => setCourseToDelete(null)}
      />
    </div>
  );
};
