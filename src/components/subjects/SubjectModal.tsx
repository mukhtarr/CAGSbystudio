import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, BookOpen, Code, Layers, GraduationCap, Clock, Check, Users, FileText, CheckCircle, FlaskConical } from 'lucide-react';
import { Subject, SubjectType, SubjectStatus, DepartmentType, DegreeType } from '../../types';
import { useAcademic } from '../../context/AcademicContext';
import {
  DEFAULT_ATTENDANCE_CONTROL_ITEMS,
  generateTheorySyllabusSessions,
  generateLabSyllabusSessions,
  DEFAULT_THEORY_ANALYSIS,
  DEFAULT_LAB_ANALYSIS,
  DEFAULT_ATTENDANCE_STATUS,
} from '../../utils/courseTemplateHelper';

interface SubjectModalProps {
  isOpen: boolean;
  subjectToEdit?: Subject | null;
  presetType?: SubjectType;
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

const SUBJECT_TYPES: SubjectType[] = [
  'Theory',
  'Practical / Lab',
  'Elective',
  'Integrated (Theory + Lab)',
  'Seminar / Project',
];

const SUBJECT_STATUSES: SubjectStatus[] = ['Active', 'Draft', 'Archived'];

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  subjectToEdit,
  presetType,
  onClose,
}) => {
  const { addSubject, updateSubject, faculties, addCourseTracker, activeAcademicYear, currentUser } = useAcademic();

  const isHod = currentUser?.role === 'HOD';
  const isFaculty = currentUser?.role === 'Faculty';
  const userDept = (currentUser?.department as DepartmentType) || 'Computer Science & Engineering';

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    department: 'Computer Science & Engineering' as DepartmentType,
    degree: 'B.Tech' as DegreeType,
    semester: 3,
    credits: 4,
    lectureHoursPerWeek: 3,
    practicalHoursPerWeek: 0,
    type: 'Theory' as SubjectType,
    status: 'Active' as SubjectStatus,
    description: '',
    assignedFacultyIds: [] as string[],
  });

  const [syncToCourseTracker, setSyncToCourseTracker] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (subjectToEdit) {
      setFormData({
        code: subjectToEdit.code,
        name: subjectToEdit.name,
        department: subjectToEdit.department,
        degree: subjectToEdit.degree,
        semester: subjectToEdit.semester,
        credits: subjectToEdit.credits,
        lectureHoursPerWeek: subjectToEdit.lectureHoursPerWeek,
        practicalHoursPerWeek: subjectToEdit.practicalHoursPerWeek,
        type: subjectToEdit.type,
        status: subjectToEdit.status,
        description: subjectToEdit.description || '',
        assignedFacultyIds: subjectToEdit.assignedFacultyIds || [],
      });
      setSyncToCourseTracker(false);
    } else {
      const initialType = presetType || 'Theory';
      const isLab = initialType === 'Practical / Lab';
      const targetDept = (isHod || isFaculty) && userDept ? userDept : 'Computer Science & Engineering';
      const facultyIdList: string[] = [];
      if (isFaculty && currentUser?.id) {
        facultyIdList.push(currentUser.id);
      }

      setFormData({
        code: isLab ? `CSL${Math.floor(200 + Math.random() * 500)}` : `CS${Math.floor(200 + Math.random() * 500)}`,
        name: '',
        department: targetDept,
        degree: 'B.Tech',
        semester: 3,
        credits: isLab ? 2 : 3,
        lectureHoursPerWeek: isLab ? 0 : 3,
        practicalHoursPerWeek: isLab ? 3 : 0,
        type: initialType,
        status: 'Active',
        description: '',
        assignedFacultyIds: facultyIdList,
      });
      setSyncToCourseTracker(true);
    }
    setErrors({});
  }, [subjectToEdit, isOpen, presetType, isHod, isFaculty, userDept, currentUser]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.code.trim()) newErrors.code = 'Subject code is required';
    if (!formData.name.trim()) newErrors.name = 'Subject title is required';
    if (formData.credits < 1 || formData.credits > 12) newErrors.credits = 'Credits must be between 1 and 12';
    if (formData.semester < 1 || formData.semester > 8) newErrors.semester = 'Semester must be between 1 and 8';
    if (formData.lectureHoursPerWeek < 0) newErrors.lectureHoursPerWeek = 'Hours cannot be negative';
    if (formData.practicalHoursPerWeek < 0) newErrors.practicalHoursPerWeek = 'Hours cannot be negative';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (subjectToEdit) {
      updateSubject(subjectToEdit.id, formData);
    } else {
      addSubject(formData);

      // If user enabled automatic Course Tracker creation
      if (syncToCourseTracker) {
        const isLabCourse = formData.type === 'Practical / Lab';
        const assignedFac = faculties.find((f) => formData.assignedFacultyIds.includes(f.id));
        const courseOwner = assignedFac ? `${assignedFac.firstName} ${assignedFac.lastName}` : 'Prof. In-Charge';
        const sessions = isLabCourse
          ? generateLabSyllabusSessions(formData.name)
          : generateTheorySyllabusSessions(formData.name);
        const conducted = sessions.filter((s) => s.status === 'Conducted').length;
        const total = sessions.length;

        addCourseTracker({
          courseType: isLabCourse ? 'Lab' : 'Theory',
          courseCode: formData.code.trim().toUpperCase(),
          courseName: formData.name.trim(),
          department: formData.department,
          academicYear: activeAcademicYear?.name || '2025-26',
          curriculum: '2024-28',
          classAndSem: `SE / Sem ${formData.semester}`,
          courseOwner,
          courseOwnerFacultyId: assignedFac?.id,
          classroom: isLabCourse ? 'Lab 304 - Systems Lab' : 'LHC-204',
          credits: formData.credits,
          totalSessions: total,
          conductedSessions: conducted,
          pendingSessions: Math.max(0, total - conducted),
          completionPercentage: total ? Math.round((conducted / total) * 1000) / 10 : 0,
          averageAttendancePercentage: isLabCourse ? 91.2 : 88.5,
          attendanceControlItems: DEFAULT_ATTENDANCE_CONTROL_ITEMS,
          attendanceControlInfo: DEFAULT_ATTENDANCE_CONTROL_ITEMS,
          syllabusSessions: sessions,
          marksAnalysis: isLabCourse ? undefined : DEFAULT_THEORY_ANALYSIS,
          labCiaAnalysis: isLabCourse ? DEFAULT_LAB_ANALYSIS : undefined,
          attendanceStatus: DEFAULT_ATTENDANCE_STATUS(isLabCourse),
        });
      }
    }
    onClose();
  };

  const toggleFacultyAssignment = (facultyId: string) => {
    setFormData((prev) => {
      const exists = prev.assignedFacultyIds.includes(facultyId);
      const updated = exists
        ? prev.assignedFacultyIds.filter((id) => id !== facultyId)
        : [...prev.assignedFacultyIds, facultyId];
      return { ...prev, assignedFacultyIds: updated };
    });
  };

  // Filter faculties by selected department first or show all
  const departmentFaculties = faculties.filter((f) => f.department === formData.department);
  const otherFaculties = faculties.filter((f) => f.department !== formData.department);

  return (
    <div id="subject-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.2 }}
        id="subject-modal-dialog"
        className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8"
      >
        {/* Modal Header */}
        <div id="subject-modal-header" className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                {subjectToEdit ? 'Edit Academic Subject' : 'Register New Subject'}
              </h3>
              <p className="text-xs text-slate-400">
                Configure curriculum specs, credit weights, and assigned teaching faculty.
              </p>
            </div>
          </div>
          <button
            id="subject-modal-close-btn"
            onClick={onClose}
            type="button"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} id="subject-modal-form">
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
            {/* Row 1: Code & Name */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Subject Code *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Code className="w-4 h-4" />
                  </div>
                  <input
                    id="subject-form-code"
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. CS401"
                    className={`w-full pl-9 pr-3 py-2 text-sm bg-slate-800/80 border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 ${
                      errors.code ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-700 focus:ring-indigo-500/30'
                    }`}
                  />
                </div>
                {errors.code && <p className="text-xs text-rose-400 mt-1">{errors.code}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Subject Title *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <input
                    id="subject-form-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Operating Systems & System Programming"
                    className={`w-full pl-9 pr-3 py-2 text-sm bg-slate-800/80 border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 ${
                      errors.name ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-700 focus:ring-indigo-500/30'
                    }`}
                  />
                </div>
                {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
              </div>
            </div>

            {/* Row 2: Department & Degree */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Department</span>
                  {isHod && (
                    <span className="text-[10px] text-emerald-400 font-normal">HOD Scoped</span>
                  )}
                </label>
                <select
                  id="subject-form-department"
                  value={formData.department}
                  disabled={isHod}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value as DepartmentType })}
                  className={`w-full px-3 py-2 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                    isHod ? 'opacity-90 cursor-not-allowed bg-slate-800' : ''
                  }`}
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept} className="bg-slate-900 text-slate-100">
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Degree Program
                  </label>
                  <select
                    id="subject-form-degree"
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value as DegreeType })}
                    className="w-full px-3 py-2 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  >
                    {DEGREES.map((deg) => (
                      <option key={deg} value={deg} className="bg-slate-900 text-slate-100">
                        {deg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Semester
                  </label>
                  <select
                    id="subject-form-semester"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem} className="bg-slate-900 text-slate-100">
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Course Type Preset Toggle (Theory vs Lab) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Curriculum Classification (Theory vs Lab)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      type: 'Theory',
                      lectureHoursPerWeek: 3,
                      practicalHoursPerWeek: 0,
                      credits: 3,
                    }))
                  }
                  className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                    formData.type === 'Theory'
                      ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/20 text-slate-100'
                      : 'border-slate-700/80 bg-slate-800/40 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${formData.type === 'Theory' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                      Theory Course
                      {formData.type === 'Theory' && <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">Selected</span>}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">3-4 Credits • Classroom Lecture Syllabus</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      type: 'Practical / Lab',
                      lectureHoursPerWeek: 0,
                      practicalHoursPerWeek: 2,
                      credits: 2,
                    }))
                  }
                  className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                    formData.type === 'Practical / Lab'
                      ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20 text-slate-100'
                      : 'border-slate-700/80 bg-slate-800/40 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${formData.type === 'Practical / Lab' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <FlaskConical className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                      Practical / Lab Course
                      {formData.type === 'Practical / Lab' && <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">Selected</span>}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">1.5-2 Credits • Hands-on Experiments</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Row 3: Type, Credits & Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Subject Type
                </label>
                <select
                  id="subject-form-type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as SubjectType })}
                  className="w-full px-3 py-2 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  {SUBJECT_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-slate-900 text-slate-100">
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Credits *
                </label>
                <div className="relative">
                  <input
                    id="subject-form-credits"
                    type="number"
                    min="1"
                    max="12"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Lecture Hrs/Wk (L)
                </label>
                <input
                  id="subject-form-lecture-hours"
                  type="number"
                  min="0"
                  max="20"
                  value={formData.lectureHoursPerWeek}
                  onChange={(e) => setFormData({ ...formData, lectureHoursPerWeek: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Practical Hrs/Wk (P)
                </label>
                <input
                  id="subject-form-practical-hours"
                  type="number"
                  min="0"
                  max="20"
                  value={formData.practicalHoursPerWeek}
                  onChange={(e) => setFormData({ ...formData, practicalHoursPerWeek: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            </div>

            {/* Row 4: Status & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <select
                  id="subject-form-status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as SubjectStatus })}
                  className="w-full px-3 py-2 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  {SUBJECT_STATUSES.map((st) => (
                    <option key={st} value={st} className="bg-slate-900 text-slate-100">
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Syllabus Description / Notes
                </label>
                <input
                  id="subject-form-description"
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief syllabus outline or course objectives..."
                  className="w-full px-3 py-2 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            </div>

            {/* Row 5: Faculty Allocation (Provision to Assign Faculties) */}
            <div id="subject-form-faculty-allocation-section" className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2.5">
                <div>
                  <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    Assign Teaching Faculties ({formData.assignedFacultyIds.length} Selected)
                  </label>
                  <p className="text-xs text-slate-400">
                    Select faculty members qualified to teach and deliver this course.
                  </p>
                </div>
                {formData.assignedFacultyIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, assignedFacultyIds: [] })}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 max-h-48 overflow-y-auto space-y-1.5 custom-scrollbar">
                {faculties.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No faculties available in registry</p>
                ) : (
                  <>
                    {departmentFaculties.length > 0 && (
                      <div className="mb-2">
                        <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider block mb-1">
                          {formData.department} (Matching Dept)
                        </span>
                        <div className="space-y-1">
                          {departmentFaculties.map((fac) => {
                            const isSelected = formData.assignedFacultyIds.includes(fac.id);
                            return (
                              <div
                                key={fac.id}
                                onClick={() => toggleFacultyAssignment(fac.id)}
                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border ${
                                  isSelected
                                    ? 'bg-indigo-950/40 border-indigo-600/60 text-slate-100'
                                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                                      isSelected
                                        ? 'bg-indigo-600 border-indigo-500 text-white'
                                        : 'border-slate-600 bg-slate-800'
                                    }`}
                                  >
                                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <div>
                                    <span className="text-xs font-medium text-slate-200">
                                      {fac.firstName} {fac.lastName}
                                    </span>
                                    <span className="text-[11px] text-slate-400 ml-2">
                                      ({fac.employeeCode} &bull; {fac.designation})
                                    </span>
                                  </div>
                                </div>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                                  {fac.experienceYears}y exp
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {otherFaculties.length > 0 && (
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                          Other Departments
                        </span>
                        <div className="space-y-1">
                          {otherFaculties.map((fac) => {
                            const isSelected = formData.assignedFacultyIds.includes(fac.id);
                            return (
                              <div
                                key={fac.id}
                                onClick={() => toggleFacultyAssignment(fac.id)}
                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border ${
                                  isSelected
                                    ? 'bg-indigo-950/40 border-indigo-600/60 text-slate-100'
                                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                                      isSelected
                                        ? 'bg-indigo-600 border-indigo-500 text-white'
                                        : 'border-slate-600 bg-slate-800'
                                    }`}
                                  >
                                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <div>
                                    <span className="text-xs font-medium text-slate-200">
                                      {fac.firstName} {fac.lastName}
                                    </span>
                                    <span className="text-[11px] text-slate-400 ml-2">
                                      ({fac.department} &bull; {fac.employeeCode})
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Course Tracker Sync Option */}
            {!subjectToEdit && (
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncToCourseTracker}
                    onChange={(e) => setSyncToCourseTracker(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-slate-700"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">
                      Also initialize in Course Tracker module ({formData.type === 'Practical / Lab' ? 'Lab Experiments' : 'Theory Lectures'})
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Automatically setups institutional syllabus delivery sessions, attendance control sheets, and CIA assessment tracking.
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div id="subject-modal-footer" className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end gap-3">
            <button
              id="subject-modal-cancel-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              id="subject-modal-submit-btn"
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {subjectToEdit ? 'Save Changes' : 'Register Subject'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
