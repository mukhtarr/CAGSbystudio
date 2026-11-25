import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  X,
  BookOpen,
  FlaskConical,
  Sparkles,
  Building,
  GraduationCap,
  Users,
  MapPin,
  Layers,
  Award,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { CourseTrackerRecord, DepartmentType, DegreeType } from '../../types';
import { useAcademic } from '../../context/AcademicContext';
import {
  DEFAULT_ATTENDANCE_CONTROL_ITEMS,
  generateTheorySyllabusSessions,
  generateLabSyllabusSessions,
  DEFAULT_THEORY_ANALYSIS,
  DEFAULT_LAB_ANALYSIS,
  DEFAULT_ATTENDANCE_STATUS,
} from '../../utils/courseTemplateHelper';

interface CourseTrackerModalProps {
  isOpen: boolean;
  courseToEdit?: CourseTrackerRecord | null;
  presetType?: 'Theory' | 'Lab';
  onClose: () => void;
  onSaved?: (trackerId: string) => void;
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

export const CourseTrackerModal: React.FC<CourseTrackerModalProps> = ({
  isOpen,
  courseToEdit,
  presetType,
  onClose,
  onSaved,
}) => {
  const {
    addCourseTracker,
    updateCourseTracker,
    faculties,
    classes,
    addSubject,
    subjects,
    activeAcademicYear,
    currentUser,
  } = useAcademic();

  const isHod = currentUser?.role === 'HOD';
  const isFaculty = currentUser?.role === 'Faculty';
  const userDept = (currentUser?.department as DepartmentType) || 'Computer Science & Engineering';

  const isEditing = Boolean(courseToEdit);

  const [formData, setFormData] = useState({
    courseType: 'Theory' as 'Theory' | 'Lab',
    courseCode: '',
    courseName: '',
    department: 'Computer Science & Engineering' as DepartmentType,
    academicYear: activeAcademicYear?.name || '2025-26',
    curriculum: '2024-28',
    classAndSem: 'SECO1 / IV',
    courseOwner: 'Prof. Mukhtar Ansari',
    courseOwnerFacultyId: '',
    classroom: 'LHC-204',
    credits: 3,
    autoGenerateSessions: true,
    syncToSubjectsCatalog: true,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (courseToEdit) {
      setFormData({
        courseType: courseToEdit.courseType,
        courseCode: courseToEdit.courseCode,
        courseName: courseToEdit.courseName,
        department: (courseToEdit.department as DepartmentType) || 'Computer Science & Engineering',
        academicYear: courseToEdit.academicYear,
        curriculum: courseToEdit.curriculum,
        classAndSem: courseToEdit.classAndSem,
        courseOwner: courseToEdit.courseOwner,
        courseOwnerFacultyId: courseToEdit.courseOwnerFacultyId || '',
        classroom: courseToEdit.classroom || (courseToEdit.courseType === 'Theory' ? 'LHC-204' : 'Lab 304'),
        credits: courseToEdit.credits || (courseToEdit.courseType === 'Theory' ? 3 : 1.5),
        autoGenerateSessions: false,
        syncToSubjectsCatalog: false,
      });
    } else {
      const type = presetType || 'Theory';
      const isLab = type === 'Lab';
      const dept = (isHod || isFaculty) && userDept ? userDept : 'Computer Science & Engineering';
      const defaultFaculty = isFaculty && currentUser
        ? faculties.find((f) => f.id === currentUser.id) || faculties.find((f) => f.department === dept) || faculties[0]
        : faculties.find((f) => f.department === dept) || faculties[0];

      setFormData({
        courseType: type,
        courseCode: isLab ? `25COPCL${Math.floor(400 + Math.random() * 80)}` : `25COPCC${Math.floor(400 + Math.random() * 80)}`,
        courseName: '',
        department: dept,
        academicYear: activeAcademicYear?.name || '2025-26',
        curriculum: '2024-28',
        classAndSem: classes[0]?.name || 'SECO1 / IV',
        courseOwner: defaultFaculty ? `${defaultFaculty.firstName} ${defaultFaculty.lastName}` : (currentUser?.name || 'Prof. Faculty In-Charge'),
        courseOwnerFacultyId: defaultFaculty?.id || currentUser?.id || '',
        classroom: isLab ? 'Lab 304 - Systems Lab' : 'LHC-204',
        credits: isLab ? 1.5 : 3,
        autoGenerateSessions: true,
        syncToSubjectsCatalog: true,
      });
    }
    setErrors({});
  }, [courseToEdit, isOpen, presetType, activeAcademicYear, isHod, isFaculty, userDept, currentUser]);

  if (!isOpen) return null;

  const handleTypeChange = (type: 'Theory' | 'Lab') => {
    if (formData.courseType === type) return;

    const isTheory = type === 'Theory';
    const currentName = formData.courseName;
    let suggestedName = currentName;

    if (type === 'Lab' && currentName && !currentName.toLowerCase().includes('lab')) {
      suggestedName = `${currentName} Laboratory`;
    } else if (type === 'Theory' && currentName.toLowerCase().includes(' laboratory')) {
      suggestedName = currentName.replace(/ Laboratory/gi, '');
    } else if (type === 'Theory' && currentName.toLowerCase().includes(' lab')) {
      suggestedName = currentName.replace(/ Lab/gi, '');
    }

    setFormData((prev) => ({
      ...prev,
      courseType: type,
      courseName: suggestedName,
      classroom: isTheory ? 'LHC-204' : 'Lab 304 - Systems Lab',
      credits: isTheory ? 3 : 1.5,
      courseCode: prev.courseCode ? prev.courseCode : isTheory ? '25COPCC405' : '25COPCL405',
    }));
  };

  const handleFacultySelect = (facultyId: string) => {
    const fac = faculties.find((f) => f.id === facultyId);
    if (fac) {
      setFormData((prev) => ({
        ...prev,
        courseOwnerFacultyId: fac.id,
        courseOwner: `${fac.firstName} ${fac.lastName}`,
        department: (fac.department as DepartmentType) || prev.department,
      }));
    }
  };

  const generateCourseCode = () => {
    const deptPrefix = formData.department.includes('Computer')
      ? 'CO'
      : formData.department.includes('Information')
      ? 'IT'
      : formData.department.includes('Electronics')
      ? 'EC'
      : formData.department.includes('Mechanical')
      ? 'ME'
      : 'CS';
    const typeCode = formData.courseType === 'Theory' ? 'PCC' : 'PCL';
    const semNum = 4;
    const randNum = Math.floor(10 + Math.random() * 89);
    const code = `25${deptPrefix}${typeCode}${semNum}${randNum}`;
    setFormData((prev) => ({ ...prev, courseCode: code }));
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.courseCode.trim()) errs.courseCode = 'Course code is required';
    if (!formData.courseName.trim()) errs.courseName = 'Course title is required';
    if (!formData.classAndSem.trim()) errs.classAndSem = 'Class and semester is required';
    if (!formData.courseOwner.trim()) errs.courseOwner = 'Course faculty owner is required';
    if (!formData.classroom.trim()) errs.classroom = 'Venue / Classroom is required';
    if (formData.credits <= 0) errs.credits = 'Credits must be greater than 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEditing && courseToEdit) {
      updateCourseTracker(courseToEdit.id, {
        courseType: formData.courseType,
        courseCode: formData.courseCode.trim().toUpperCase(),
        courseName: formData.courseName.trim(),
        department: formData.department,
        academicYear: formData.academicYear,
        curriculum: formData.curriculum,
        classAndSem: formData.classAndSem.trim(),
        courseOwner: formData.courseOwner.trim(),
        courseOwnerFacultyId: formData.courseOwnerFacultyId,
        classroom: formData.classroom.trim(),
        credits: Number(formData.credits),
      });
      if (onSaved) onSaved(courseToEdit.id);
      onClose();
    } else {
      // New Course
      const isLab = formData.courseType === 'Lab';
      const sessions = formData.autoGenerateSessions
        ? isLab
          ? generateLabSyllabusSessions(formData.courseName)
          : generateTheorySyllabusSessions(formData.courseName)
        : [];

      const conductedSessions = sessions.filter((s) => s.status === 'Conducted').length;
      const totalSessions = sessions.length;
      const completionPercentage = totalSessions ? Math.round((conductedSessions / totalSessions) * 1000) / 10 : 0;

      const newTracker = addCourseTracker({
        courseType: formData.courseType,
        courseCode: formData.courseCode.trim().toUpperCase(),
        courseName: formData.courseName.trim(),
        department: formData.department,
        academicYear: formData.academicYear,
        curriculum: formData.curriculum,
        classAndSem: formData.classAndSem.trim(),
        courseOwner: formData.courseOwner.trim(),
        courseOwnerFacultyId: formData.courseOwnerFacultyId,
        classroom: formData.classroom.trim(),
        credits: Number(formData.credits),
        totalSessions,
        conductedSessions,
        pendingSessions: Math.max(0, totalSessions - conductedSessions),
        completionPercentage,
        averageAttendancePercentage: isLab ? 91.2 : 88.5,
        attendanceControlItems: DEFAULT_ATTENDANCE_CONTROL_ITEMS,
        attendanceControlInfo: DEFAULT_ATTENDANCE_CONTROL_ITEMS,
        syllabusSessions: sessions,
        marksAnalysis: isLab ? undefined : DEFAULT_THEORY_ANALYSIS,
        labCiaAnalysis: isLab ? DEFAULT_LAB_ANALYSIS : undefined,
        attendanceStatus: DEFAULT_ATTENDANCE_STATUS(isLab),
      });

      // Synchronize with Subjects & Curriculum catalog if option checked
      if (formData.syncToSubjectsCatalog) {
        const existingSubject = subjects.find(
          (s) => s.code.toUpperCase() === formData.courseCode.trim().toUpperCase()
        );
        if (!existingSubject) {
          addSubject({
            code: formData.courseCode.trim().toUpperCase(),
            name: formData.courseName.trim(),
            department: formData.department,
            degree: 'B.Tech',
            semester: 4,
            type: formData.courseType === 'Theory' ? 'Theory' : 'Practical / Lab',
            credits: Number(formData.credits),
            lectureHoursPerWeek: formData.courseType === 'Theory' ? 3 : 0,
            practicalHoursPerWeek: formData.courseType === 'Lab' ? 2 : 0,
            assignedFacultyIds: formData.courseOwnerFacultyId ? [formData.courseOwnerFacultyId] : [],
            status: 'Active',
            description: `${formData.courseType} course tracking for ${formData.courseName} (${formData.classAndSem})`,
          });
        }
      }

      if (onSaved) onSaved(newTracker.id);
      onClose();
    }
  };

  return (
    <div
      id="course-tracker-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.18 }}
        id="course-tracker-modal-dialog"
        className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                formData.courseType === 'Theory'
                  ? 'bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400'
                  : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {formData.courseType === 'Theory' ? (
                <BookOpen className="w-5 h-5" />
              ) : (
                <FlaskConical className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isEditing ? `Edit ${formData.courseType} Course` : `Add New Course (${formData.courseType})`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Institutional syllabus delivery, attendance controls &amp; assessments (Theory &amp; Lab)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[78vh] overflow-y-auto custom-scrollbar">
          {/* Section 1: Course Type Selection (Theory vs Lab) */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Select Course Type *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Theory Card */}
              <button
                type="button"
                onClick={() => handleTypeChange('Theory')}
                className={`p-4 rounded-xl border text-left transition-all relative flex items-start gap-3.5 ${
                  formData.courseType === 'Theory'
                    ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-500/10 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div
                  className={`p-2.5 rounded-lg ${
                    formData.courseType === 'Theory'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">Theory Course</span>
                    {formData.courseType === 'Theory' && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Classroom lectures, continuous internal evaluations (CIA 1 &amp; 2, MSE), and end-sem theory.
                  </p>
                  <div className="mt-2 text-[11px] font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <span>Standard 3-4 Credits</span> • <span>28 Lecture Sessions</span>
                  </div>
                </div>
              </button>

              {/* Lab Card */}
              <button
                type="button"
                onClick={() => handleTypeChange('Lab')}
                className={`p-4 rounded-xl border text-left transition-all relative flex items-start gap-3.5 ${
                  formData.courseType === 'Lab'
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-500/10 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div
                  className={`p-2.5 rounded-lg ${
                    formData.courseType === 'Lab'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">Laboratory / Practical</span>
                    {formData.courseType === 'Lab' && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Hands-on practical experiments, programming testbeds, journal checking &amp; oral viva-voce.
                  </p>
                  <div className="mt-2 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <span>Standard 1.5-2 Credits</span> • <span>15 Lab Experiments</span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: Course Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Course Code *
                </label>
                <button
                  type="button"
                  onClick={generateCourseCode}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" /> Auto
                </button>
              </div>
              <input
                type="text"
                value={formData.courseCode}
                onChange={(e) => setFormData({ ...formData, courseCode: e.target.value.toUpperCase() })}
                placeholder={formData.courseType === 'Theory' ? 'e.g. 25COPCC403' : 'e.g. 25COPCL403'}
                className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${
                  errors.courseCode
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/30'
                }`}
              />
              {errors.courseCode && <p className="text-xs text-rose-500 mt-1">{errors.courseCode}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Course Title / Name *
              </label>
              <input
                type="text"
                value={formData.courseName}
                onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                placeholder={
                  formData.courseType === 'Theory'
                    ? 'e.g. Computer Networks'
                    : 'e.g. Computer Networks Laboratory'
                }
                className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${
                  errors.courseName
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/30'
                }`}
              />
              {errors.courseName && <p className="text-xs text-rose-500 mt-1">{errors.courseName}</p>}
            </div>
          </div>

          {/* Section 3: Department & Academic Cohort */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Department</span>
                {isHod && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">HOD Scoped</span>
                )}
              </label>
              <select
                value={formData.department}
                disabled={isHod}
                onChange={(e) => setFormData({ ...formData, department: e.target.value as DepartmentType })}
                className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                  isHod ? 'opacity-90 cursor-not-allowed bg-slate-100 dark:bg-slate-800/80' : ''
                }`}
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Class &amp; Semester *
              </label>
              <input
                type="text"
                value={formData.classAndSem}
                onChange={(e) => setFormData({ ...formData, classAndSem: e.target.value })}
                placeholder="e.g. SECO1 / IV"
                className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${
                  errors.classAndSem
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/30'
                }`}
              />
              {errors.classAndSem && <p className="text-xs text-rose-500 mt-1">{errors.classAndSem}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Academic Year &amp; Batch
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  placeholder="2025-26"
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
                <input
                  type="text"
                  value={formData.curriculum}
                  onChange={(e) => setFormData({ ...formData, curriculum: e.target.value })}
                  placeholder="2024-28"
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Faculty, Venue & Credits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Faculty In-Charge *
              </label>
              <select
                value={formData.courseOwnerFacultyId}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setFormData({ ...formData, courseOwnerFacultyId: 'custom' });
                  } else {
                    handleFacultySelect(e.target.value);
                  }
                }}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                {faculties.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.firstName} {f.lastName} ({f.employeeCode})
                  </option>
                ))}
                <option value="custom">Other / Custom Name...</option>
              </select>

              {formData.courseOwnerFacultyId === 'custom' && (
                <input
                  type="text"
                  value={formData.courseOwner}
                  onChange={(e) => setFormData({ ...formData, courseOwner: e.target.value })}
                  placeholder="Enter faculty full name"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white mt-2 focus:outline-none"
                />
              )}
              {errors.courseOwner && <p className="text-xs text-rose-500 mt-1">{errors.courseOwner}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Venue / Room *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={formData.classroom}
                  onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
                  placeholder={formData.courseType === 'Theory' ? 'e.g. LHC-204' : 'e.g. Lab 304 - Systems Lab'}
                  className={`w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${
                    errors.classroom
                      ? 'border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/30'
                  }`}
                />
              </div>
              {errors.classroom && <p className="text-xs text-rose-500 mt-1">{errors.classroom}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Course Credits *
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="10"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: parseFloat(e.target.value) || 1 })}
                className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                  errors.credits
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/30'
                }`}
              />
              {errors.credits && <p className="text-xs text-rose-500 mt-1">{errors.credits}</p>}
            </div>
          </div>

          {/* Section 5: Initialization Options (Only for Add mode) */}
          {!isEditing && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Curriculum &amp; Template Initialization
              </span>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.autoGenerateSessions}
                  onChange={(e) => setFormData({ ...formData, autoGenerateSessions: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white block">
                    {formData.courseType === 'Theory'
                      ? 'Pre-populate standard 28 Theory syllabus delivery sessions'
                      : 'Pre-populate standard 15 Hands-on Lab experiments & Viva plan'}
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Generates a complete session-by-session syllabus roadmap with planned dates, unit categories, and pedagogical approaches.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-slate-200 dark:border-slate-700/60">
                <input
                  type="checkbox"
                  checked={formData.syncToSubjectsCatalog}
                  onChange={(e) => setFormData({ ...formData, syncToSubjectsCatalog: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white block">
                    Also register in Institutional Subjects &amp; Curriculum Catalog
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Ensures this course automatically reflects in the central Subjects view, faculty workload matrices, and database export scripts.
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-sm font-semibold text-white rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 ${
                formData.courseType === 'Theory'
                  ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isEditing ? 'Save Changes' : `Create ${formData.courseType} Course`}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
