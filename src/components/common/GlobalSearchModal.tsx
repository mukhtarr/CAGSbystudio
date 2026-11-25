import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  User,
  GraduationCap,
  School,
  Calendar,
  ArrowRight,
  X,
  Sparkles,
  Users,
  Award,
  Layers,
  ChevronRight,
  Eye,
  Mail,
  Phone,
  BookOpen,
  Filter,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { ActiveTab, Student, Faculty, ClassEntity, AcademicYear } from '../../types';

export type SearchCategory =
  | 'all'
  | 'students'
  | 'faculties'
  | 'classes'
  | 'academic-years'
  | 'coordinators';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (tab: ActiveTab) => void;
  onViewStudent?: (student: Student) => void;
  onViewFaculty?: (faculty: Faculty) => void;
}

interface CategoryFilterOption {
  id: SearchCategory;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  badgeColor: string;
  activeColor: string;
  tabKey?: ActiveTab;
}

const CATEGORY_OPTIONS: CategoryFilterOption[] = [
  {
    id: 'all',
    label: 'All Categories',
    shortLabel: 'All',
    icon: Sparkles,
    badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300',
    activeColor: 'bg-indigo-600 text-white shadow-indigo-500/25',
  },
  {
    id: 'students',
    label: 'Students',
    shortLabel: 'Students',
    icon: GraduationCap,
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
    activeColor: 'bg-blue-600 text-white shadow-blue-500/25',
    tabKey: 'students',
  },
  {
    id: 'faculties',
    label: 'Faculties',
    shortLabel: 'Faculties',
    icon: Users,
    badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
    activeColor: 'bg-emerald-600 text-white shadow-emerald-500/25',
    tabKey: 'faculties',
  },
  {
    id: 'classes',
    label: 'Classes & Sections',
    shortLabel: 'Classes',
    icon: School,
    badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
    activeColor: 'bg-purple-600 text-white shadow-purple-500/25',
    tabKey: 'classes',
  },
  {
    id: 'academic-years',
    label: 'Academic Years',
    shortLabel: 'Years',
    icon: Calendar,
    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    activeColor: 'bg-amber-600 text-white shadow-amber-500/25',
    tabKey: 'academic-years',
  },
  {
    id: 'coordinators',
    label: 'Coordinators Matrix',
    shortLabel: 'Coordinators',
    icon: Award,
    badgeColor: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/60 dark:text-cyan-300',
    activeColor: 'bg-cyan-600 text-white shadow-cyan-500/25',
    tabKey: 'coordinators',
  },
];

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onViewStudent,
  onViewFaculty,
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    students,
    faculties,
    classes,
    academicYears,
    assignments,
    setActiveTab,
  } = useAcademic();

  // Reset category and query on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Global Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const cleanQuery = query.toLowerCase().trim();

  // 1. Matched Students
  const matchingStudents = useMemo(() => {
    if (!cleanQuery) return students;
    return students.filter((s) => {
      const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
      return (
        fullName.includes(cleanQuery) ||
        s.rollNo.toLowerCase().includes(cleanQuery) ||
        s.prnNo.toLowerCase().includes(cleanQuery) ||
        s.department.toLowerCase().includes(cleanQuery) ||
        s.degree.toLowerCase().includes(cleanQuery) ||
        s.email.toLowerCase().includes(cleanQuery) ||
        s.phone.toLowerCase().includes(cleanQuery) ||
        s.status.toLowerCase().includes(cleanQuery)
      );
    });
  }, [students, cleanQuery]);

  // 2. Matched Faculties
  const matchingFaculties = useMemo(() => {
    if (!cleanQuery) return faculties;
    return faculties.filter((f) => {
      const fullName = `${f.firstName} ${f.lastName}`.toLowerCase();
      return (
        fullName.includes(cleanQuery) ||
        f.employeeCode.toLowerCase().includes(cleanQuery) ||
        f.department.toLowerCase().includes(cleanQuery) ||
        f.designation.toLowerCase().includes(cleanQuery) ||
        f.specialization.toLowerCase().includes(cleanQuery) ||
        f.email.toLowerCase().includes(cleanQuery) ||
        f.qualification.toLowerCase().includes(cleanQuery)
      );
    });
  }, [faculties, cleanQuery]);

  // 3. Matched Classes
  const matchingClasses = useMemo(() => {
    if (!cleanQuery) return classes;
    return classes.filter((c) => {
      const coordinatorFaculty = faculties.find((f) => f.id === c.coordinatorId);
      const coordName = coordinatorFaculty
        ? `${coordinatorFaculty.firstName} ${coordinatorFaculty.lastName}`.toLowerCase()
        : '';
      return (
        c.name.toLowerCase().includes(cleanQuery) ||
        c.courseName.toLowerCase().includes(cleanQuery) ||
        c.department.toLowerCase().includes(cleanQuery) ||
        c.degree.toLowerCase().includes(cleanQuery) ||
        c.roomNumber.toLowerCase().includes(cleanQuery) ||
        c.shift.toLowerCase().includes(cleanQuery) ||
        coordName.includes(cleanQuery)
      );
    });
  }, [classes, faculties, cleanQuery]);

  // 4. Matched Academic Years
  const matchingYears = useMemo(() => {
    if (!cleanQuery) return academicYears;
    return academicYears.filter((y) => {
      return (
        y.name.toLowerCase().includes(cleanQuery) ||
        y.code.toLowerCase().includes(cleanQuery) ||
        y.term.toLowerCase().includes(cleanQuery) ||
        (y.notes && y.notes.toLowerCase().includes(cleanQuery))
      );
    });
  }, [academicYears, cleanQuery]);

  // 5. Matched Coordinator Assignments
  const matchingCoordinators = useMemo(() => {
    const list = assignments.map((assign) => {
      const cls = classes.find((c) => c.id === assign.classId);
      const faculty = faculties.find((f) => f.id === assign.facultyId);
      const ay = academicYears.find((y) => y.id === assign.academicYearId);
      return { assign, cls, faculty, ay };
    });

    if (!cleanQuery) return list;

    return list.filter(({ cls, faculty, ay, assign }) => {
      const facultyName = faculty ? `${faculty.firstName} ${faculty.lastName}`.toLowerCase() : '';
      const facultyCode = faculty ? faculty.employeeCode.toLowerCase() : '';
      const className = cls ? cls.name.toLowerCase() : '';
      const yearName = ay ? ay.name.toLowerCase() : '';
      const remarks = assign.remarks ? assign.remarks.toLowerCase() : '';
      return (
        facultyName.includes(cleanQuery) ||
        facultyCode.includes(cleanQuery) ||
        className.includes(cleanQuery) ||
        yearName.includes(cleanQuery) ||
        remarks.includes(cleanQuery)
      );
    });
  }, [assignments, classes, faculties, academicYears, cleanQuery]);

  // Dynamic counts for each category pill
  const categoryCounts = useMemo(() => {
    return {
      all:
        matchingStudents.length +
        matchingFaculties.length +
        matchingClasses.length +
        matchingYears.length +
        matchingCoordinators.length,
      students: matchingStudents.length,
      faculties: matchingFaculties.length,
      classes: matchingClasses.length,
      'academic-years': matchingYears.length,
      coordinators: matchingCoordinators.length,
    };
  }, [
    matchingStudents,
    matchingFaculties,
    matchingClasses,
    matchingYears,
    matchingCoordinators,
  ]);

  const totalMatches = categoryCounts.all;

  const handleTabNavigation = (tab: ActiveTab) => {
    if (onNavigate) {
      onNavigate(tab);
    } else {
      setActiveTab(tab);
    }
    onClose();
  };

  const handleInspectStudent = (student: Student) => {
    if (onViewStudent) {
      onViewStudent(student);
      onClose();
    } else {
      handleTabNavigation('students');
    }
  };

  const handleInspectFaculty = (faculty: Faculty) => {
    if (onViewFaculty) {
      onViewFaculty(faculty);
      onClose();
    } else {
      handleTabNavigation('faculties');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="global-search-modal-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Top Search Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Search className="w-4 h-4" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              activeCategory === 'all'
                ? 'Search students, faculty, classes, roll no, PRN, or academic year...'
                : `Search in ${CATEGORY_OPTIONS.find((c) => c.id === activeCategory)?.label}...`
            }
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm sm:text-base font-medium focus:outline-none"
          />

          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <kbd className="hidden sm:inline-block px-2.5 py-1 text-[10px] font-mono font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 rounded-lg shadow-xs shrink-0">
            ESC
          </kbd>

          <button
            onClick={onClose}
            className="sm:hidden text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Pill-Shaped Filter Toggles */}
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-x-auto scrollbar-none shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1 hidden md:inline-flex items-center gap-1">
              <Filter className="w-3 h-3" /> Category:
            </span>

            {CATEGORY_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = activeCategory === opt.id;
              const count = categoryCounts[opt.id];

              return (
                <button
                  key={opt.id}
                  id={`pill-filter-${opt.id}`}
                  onClick={() => setActiveCategory(opt.id)}
                  className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer select-none ${
                    isSelected
                      ? `${opt.activeColor} shadow-md scale-[1.02]`
                      : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'opacity-70'}`} />
                  <span>{opt.shortLabel}</span>

                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ml-0.5 transition-colors ${
                      isSelected
                        ? 'bg-white/25 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Results Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-5 divide-y divide-slate-100 dark:divide-slate-800/50">
          {/* Case 1: No results found */}
          {cleanQuery && totalMatches === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No matches found for &ldquo;{query}&rdquo;
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try checking for typos or switch category filter to{' '}
                  <button
                    onClick={() => setActiveCategory('all')}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                  >
                    All Categories
                  </button>
                  .
                </p>
              </div>
            </div>
          ) : !cleanQuery && activeCategory === 'all' ? (
            /* Case 2: Clean Query & All categories -> Quick academic navigator */
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Universal Academic Search &amp; Cohort Explorer
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-md mx-auto">
                  Type any name, roll number, employee code, section, or click category pills above to explore specific rosters.
                </p>
              </div>

              {/* Quick Jump Shortcuts */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 max-w-lg mx-auto text-left">
                <button
                  onClick={() => setActiveCategory('students')}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700/80 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2 font-semibold text-xs text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    <GraduationCap className="w-4 h-4 text-blue-500" />
                    <span>Students ({students.length})</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Roll numbers, PRN &amp; CGPA</p>
                </button>

                <button
                  onClick={() => setActiveCategory('faculties')}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700/80 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2 font-semibold text-xs text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    <Users className="w-4 h-4 text-emerald-500" />
                    <span>Faculty ({faculties.length})</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Professors, HODs &amp; Codes</p>
                </button>

                <button
                  onClick={() => setActiveCategory('classes')}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50/60 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-700/80 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2 font-semibold text-xs text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                    <School className="w-4 h-4 text-purple-500" />
                    <span>Classes ({classes.length})</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Sections &amp; Rooms</p>
                </button>

                <button
                  onClick={() => setActiveCategory('coordinators')}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-cyan-50/60 dark:hover:bg-cyan-950/40 border border-slate-200 dark:border-slate-700/80 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2 font-semibold text-xs text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                    <Award className="w-4 h-4 text-cyan-500" />
                    <span>Coordinators</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Faculty class allocations</p>
                </button>

                <button
                  onClick={() => setActiveCategory('academic-years')}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50/60 dark:hover:bg-amber-950/40 border border-slate-200 dark:border-slate-700/80 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2 font-semibold text-xs text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <span>Academic Years</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Active terms &amp; calendars</p>
                </button>

                <button
                  onClick={() => handleTabNavigation('dashboard')}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700/80 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2 font-semibold text-xs text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    <span>Analytics</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Overview dashboard</p>
                </button>
              </div>
            </div>
          ) : (
            /* Results Presentation */
            <div className="space-y-6">
              {/* SECTION: Students */}
              {(activeCategory === 'all' || activeCategory === 'students') &&
                matchingStudents.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Students</span>
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                          {matchingStudents.length}
                        </span>
                      </div>

                      {activeCategory === 'all' && matchingStudents.length > 4 ? (
                        <button
                          onClick={() => setActiveCategory('students')}
                          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>View all {matchingStudents.length} students</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleTabNavigation('students')}
                          className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer"
                        >
                          <span>Go to Students view</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {(activeCategory === 'students'
                        ? matchingStudents
                        : matchingStudents.slice(0, 4)
                      ).map((s) => (
                        <div
                          key={s.id}
                          onClick={() => handleInspectStudent(s)}
                          className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 hover:bg-blue-50/70 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-extrabold text-xs flex items-center justify-center shrink-0 border border-blue-500/20">
                              {s.firstName[0]}
                              {s.lastName ? s.lastName[0] : ''}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                                  {s.firstName} {s.lastName}
                                </span>
                                <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                                  {s.rollNo}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                    s.status === 'Active'
                                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                      : s.status === 'Graduated'
                                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                      : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                  }`}
                                >
                                  {s.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                {s.degree} • {s.department} (Sem {s.semester}-{s.section}) • CGPA:{' '}
                                <strong className="text-slate-800 dark:text-slate-200">{s.cgpa}</strong> • Att:{' '}
                                <strong className="text-slate-800 dark:text-slate-200">{s.attendancePercent}%</strong>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                              <Eye className="w-3.5 h-3.5" /> View Profile
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* SECTION: Faculties */}
              {(activeCategory === 'all' || activeCategory === 'faculties') &&
                matchingFaculties.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Faculties</span>
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                          {matchingFaculties.length}
                        </span>
                      </div>

                      {activeCategory === 'all' && matchingFaculties.length > 4 ? (
                        <button
                          onClick={() => setActiveCategory('faculties')}
                          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>View all {matchingFaculties.length} faculty</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleTabNavigation('faculties')}
                          className="text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
                        >
                          <span>Go to Faculty view</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {(activeCategory === 'faculties'
                        ? matchingFaculties
                        : matchingFaculties.slice(0, 4)
                      ).map((f) => (
                        <div
                          key={f.id}
                          onClick={() => handleInspectFaculty(f)}
                          className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 hover:bg-emerald-50/70 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs flex items-center justify-center shrink-0 border border-emerald-500/20">
                              {f.firstName[0]}
                              {f.lastName ? f.lastName[0] : ''}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
                                  {f.firstName} {f.lastName}
                                </span>
                                <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                                  {f.employeeCode}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shrink-0">
                                  {f.designation}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                {f.department} • {f.specialization || f.qualification} • {f.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:underline">
                              <Eye className="w-3.5 h-3.5" /> Details
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* SECTION: Classes */}
              {(activeCategory === 'all' || activeCategory === 'classes') &&
                matchingClasses.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        <School className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span>Classes &amp; Sections</span>
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                          {matchingClasses.length}
                        </span>
                      </div>

                      <button
                        onClick={() => handleTabNavigation('classes')}
                        className="text-xs font-semibold text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Manage Classes</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {(activeCategory === 'classes'
                        ? matchingClasses
                        : matchingClasses.slice(0, 4)
                      ).map((c) => {
                        const coordinatorFaculty = faculties.find((f) => f.id === c.coordinatorId);
                        return (
                          <div
                            key={c.id}
                            onClick={() => handleTabNavigation('classes')}
                            className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 hover:bg-purple-50/70 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 hover:border-purple-300 dark:hover:border-purple-700 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-2xl bg-purple-600/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-extrabold text-xs flex items-center justify-center shrink-0 border border-purple-500/20">
                                <School className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 truncate">
                                    {c.name}
                                  </span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 shrink-0">
                                    Room: {c.roomNumber}
                                  </span>
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                                    {c.shift} Shift
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                  {c.department} • Capacity: {c.capacity} students
                                  {coordinatorFaculty && (
                                    <span>
                                      {' '}
                                      • Coordinator: <strong className="text-slate-700 dark:text-slate-300">{coordinatorFaculty.firstName} {coordinatorFaculty.lastName}</strong>
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>

                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* SECTION: Coordinators */}
              {(activeCategory === 'all' || activeCategory === 'coordinators') &&
                matchingCoordinators.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        <Award className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        <span>Coordinator Allocations</span>
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-cyan-100 dark:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300">
                          {matchingCoordinators.length}
                        </span>
                      </div>

                      <button
                        onClick={() => handleTabNavigation('coordinators')}
                        className="text-xs font-semibold text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Coordinators Matrix</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {(activeCategory === 'coordinators'
                        ? matchingCoordinators
                        : matchingCoordinators.slice(0, 3)
                      ).map(({ assign, cls, faculty, ay }) => (
                        <div
                          key={assign.id}
                          onClick={() => handleTabNavigation('coordinators')}
                          className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 hover:bg-cyan-50/70 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 hover:border-cyan-300 dark:hover:border-cyan-700 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-2xl bg-cyan-600/10 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-extrabold text-xs flex items-center justify-center shrink-0 border border-cyan-500/20">
                              <Award className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 truncate">
                                  {cls?.name || 'Class Section'}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 shrink-0">
                                  {assign.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                Coordinator:{' '}
                                <strong className="text-slate-800 dark:text-slate-200">
                                  {faculty ? `${faculty.firstName} ${faculty.lastName} (${faculty.employeeCode})` : 'Unassigned'}
                                </strong>
                                {assign.loadHoursPerWeek ? ` • ${assign.loadHoursPerWeek} hrs/wk` : ''}
                              </p>
                            </div>
                          </div>

                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* SECTION: Academic Years */}
              {(activeCategory === 'all' || activeCategory === 'academic-years') &&
                matchingYears.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>Academic Sessions</span>
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                          {matchingYears.length}
                        </span>
                      </div>

                      <button
                        onClick={() => handleTabNavigation('academic-years')}
                        className="text-xs font-semibold text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Manage Sessions</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {(activeCategory === 'academic-years'
                        ? matchingYears
                        : matchingYears.slice(0, 3)
                      ).map((y) => (
                        <div
                          key={y.id}
                          onClick={() => handleTabNavigation('academic-years')}
                          className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 hover:bg-amber-50/70 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 hover:border-amber-300 dark:hover:border-amber-700 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-2xl bg-amber-600/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold text-xs flex items-center justify-center shrink-0 border border-amber-500/20">
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate">
                                  {y.name}
                                </span>
                                <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                                  {y.code}
                                </span>
                                {y.isActive && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shrink-0">
                                    Active Session
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                Term: {y.term} • {y.startDate} to {y.endDate} {y.notes ? `• ${y.notes}` : ''}
                              </p>
                            </div>
                          </div>

                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">
              Showing <strong className="text-slate-700 dark:text-slate-300">{totalMatches}</strong> total records
            </span>
            {activeCategory !== 'all' && (
              <button
                onClick={() => setActiveCategory('all')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
              >
                Reset to All Categories
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-400">CAGS Academic Portal</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
