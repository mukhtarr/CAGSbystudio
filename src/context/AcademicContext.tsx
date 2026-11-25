import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  AcademicYear,
  ClassEntity,
  Faculty,
  Student,
  Subject,
  StudentStatus,
  CoordinatorAssignment,
  ActivityLog,
  ToastNotification,
  ActiveTab,
  ThemeMode,
  CourseTrackerRecord,
  StudentCoursePerformance,
  SyllabusSessionItem,
  AttendanceControlItem,
  AppUser,
  UserRole,
  UserRegistrationInput,
} from '../types';
import {
  INITIAL_ACADEMIC_YEARS,
  INITIAL_FACULTIES,
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
  INITIAL_SUBJECTS,
  INITIAL_ASSIGNMENTS,
  INITIAL_ACTIVITY_LOGS,
} from '../data/initialData';
import {
  INITIAL_COURSE_TRACKERS,
  INITIAL_SECO1_STUDENTS,
} from '../data/courseTrackerData';
import {
  INITIAL_USERS,
  INITIAL_USER_CREDENTIALS,
} from '../data/userData';
import {
  exportCourseTrackerToExcel,
  exportCourseTrackerToCSV,
} from '../utils/courseTrackerExporter';
import {
  exportStudentsToCSV,
  exportStudentsToExcel,
  exportFacultiesToCSV,
  exportFacultiesToExcel,
  exportSubjectsToCSV,
  exportSubjectsToExcel,
} from '../utils/exportUtils';
import {
  exportDashboardReportPDF,
  exportDashboardReportCSV,
  ReportGenerationOptions,
} from '../utils/reportGenerator';

interface AcademicContextType {
  // Navigation & UI state
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  toasts: ToastNotification[];
  addToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
  removeToast: (id: string) => void;
  globalSearch: string;
  setGlobalSearch: (search: string) => void;

  // Course Tracker & Excel Syllabus System
  courseTrackers: CourseTrackerRecord[];
  getCourseTrackerById: (id: string) => CourseTrackerRecord | undefined;
  addCourseTracker: (tracker: Omit<CourseTrackerRecord, 'id' | 'createdAt' | 'updatedAt'>) => CourseTrackerRecord;
  updateCourseTracker: (id: string, updates: Partial<CourseTrackerRecord>) => void;
  deleteCourseTracker: (id: string) => void;
  addSyllabusSession: (trackerId: string, session: Omit<SyllabusSessionItem, 'id'>) => void;
  updateSyllabusSession: (trackerId: string, sessionId: string, updates: Partial<SyllabusSessionItem>) => void;
  deleteSyllabusSession: (trackerId: string, sessionId: string) => void;
  updateAttendanceControlItem: (trackerId: string, srNo: number, updates: Partial<AttendanceControlItem>) => void;
  studentPerformances: StudentCoursePerformance[];
  updateStudentPerformance: (studentId: string, updates: Partial<StudentCoursePerformance>) => void;
  exportCourseTrackerExcel: (trackerId: string) => void;
  exportCourseTrackerCSV: (trackerId: string) => void;

  // Academic Years
  academicYears: AcademicYear[];
  activeAcademicYear: AcademicYear | undefined;
  addAcademicYear: (year: Omit<AcademicYear, 'id' | 'createdAt'>) => void;
  updateAcademicYear: (id: string, updates: Partial<AcademicYear>) => void;
  deleteAcademicYear: (id: string) => void;
  setActiveAcademicYear: (id: string) => void;

  // Faculties
  faculties: Faculty[];
  addFaculty: (faculty: Omit<Faculty, 'id' | 'createdAt'>) => void;
  updateFaculty: (id: string, updates: Partial<Faculty>) => void;
  deleteFaculty: (id: string) => void;
  getFacultyById: (id: string) => Faculty | undefined;

  // Subjects & Courses
  subjects: Subject[];
  addSubject: (subject: Omit<Subject, 'id' | 'createdAt'>) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  bulkDeleteSubjects: (ids: string[]) => void;
  getSubjectById: (id: string) => Subject | undefined;
  getSubjectsForFaculty: (facultyId: string) => Subject[];
  getFacultiesForSubject: (subjectId: string) => Faculty[];
  assignFacultyToSubject: (subjectId: string, facultyIds: string[]) => void;
  assignSubjectToFaculty: (facultyId: string, subjectIds: string[]) => void;

  // Classes
  classes: ClassEntity[];
  addClass: (cls: Omit<ClassEntity, 'id' | 'createdAt'>) => void;
  updateClass: (id: string, updates: Partial<ClassEntity>) => void;
  deleteClass: (id: string) => void;
  getClassById: (id: string) => ClassEntity | undefined;

  // Students
  students: Student[];
  addStudent: (student: Omit<Student, 'id' | 'createdAt'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  bulkDeleteStudents: (ids: string[]) => void;
  bulkAssignStudentsToClass: (studentIds: string[], classId: string) => void;
  bulkUpdateStudentsStatus: (studentIds: string[], status: StudentStatus) => void;
  getStudentById: (id: string) => Student | undefined;
  getStudentsByClass: (classId: string) => Student[];
  getStudentsByClassId: (classId: string) => Student[];
  bulkImportStudents: (students: Omit<Student, 'id' | 'createdAt'>[]) => void;

  // Coordinator Assignments
  assignments: CoordinatorAssignment[];
  assignCoordinator: (classId: string, facultyId: string, remarks?: string, loadHours?: number) => void;
  unassignCoordinator: (classId: string) => void;
  getCoordinatorForClass: (classId: string) => Faculty | undefined;
  getAssignedClassesForFaculty: (facultyId: string) => ClassEntity[];

  // Activity Logs
  activityLogs: ActivityLog[];
  logActivity: (action: ActivityLog['action'], module: ActivityLog['module'], description: string) => void;

  // Utilities
  resetToDemoData: () => void;
  exportDatabaseJSON: () => void;
  exportStudentsCSV: (customList?: Student[]) => void;
  exportStudentsExcel: (customList?: Student[]) => void;
  exportFacultiesCSV: (customList?: Faculty[]) => void;
  exportFacultiesExcel: (customList?: Faculty[]) => void;
  exportSubjectsCSV: (customList?: Subject[]) => void;
  exportSubjectsExcel: (customList?: Subject[]) => void;
  exportAnalyticsReportPDF: (options?: ReportGenerationOptions) => void;
  exportAnalyticsReportCSV: (options?: ReportGenerationOptions) => void;

  // Authentication & Role Governance
  currentUser: AppUser | null;
  users: AppUser[];
  login: (identifier: string, password: string) => { success: boolean; error?: string };
  register: (input: UserRegistrationInput) => { success: boolean; error?: string };
  logout: () => void;
  switchUserRole: (role: UserRole) => void;
  loginAsDemoUser: (role: UserRole) => void;

  // Aggregate Stats
  stats: {
    totalStudents: number;
    totalFaculties: number;
    totalClasses: number;
    totalSubjects: number;
    assignedSubjectsCount: number;
    unassignedSubjectsCount: number;
    assignedClassesCount: number;
    unassignedClassesCount: number;
    activeAcademicYearName: string;
    averageCgpa: number;
    averageAttendance: number;
    coordinatorAssignedPercentage: number;
  };
}

const STORAGE_KEYS = {
  YEARS: 'mycags_academic_years',
  FACULTIES: 'mycags_faculties',
  SUBJECTS: 'mycags_subjects',
  CLASSES: 'mycags_classes',
  STUDENTS: 'mycags_students',
  ASSIGNMENTS: 'mycags_assignments',
  LOGS: 'mycags_activity_logs',
  THEME: 'mycags_theme',
  COURSE_TRACKERS: 'mycags_course_trackers',
  COURSE_PERFORMANCES: 'mycags_course_performances',
  USERS: 'mycags_users',
  USER_CREDENTIALS: 'mycags_user_credentials',
  CURRENT_USER: 'mycags_current_user',
};

const AcademicContext = createContext<AcademicContextType | undefined>(undefined);

export const AcademicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & Theme
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark'; // default to existing dark mode
  });

  // Apply theme class to document.documentElement
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    logActivity('UPDATE', 'System', `Switched theme to ${newTheme === 'dark' ? 'Dark Mode' : 'High-Contrast Light Mode'}`);
    addToast('info', 'Theme Changed', `Switched to ${newTheme === 'dark' ? 'Dark Mode' : 'High-Contrast Light Mode'}`);
  };

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };


  // State with LocalStorage fallbacks
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.YEARS);
    return saved ? JSON.parse(saved) : INITIAL_ACADEMIC_YEARS;
  });

  const [faculties, setFaculties] = useState<Faculty[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FACULTIES);
    return saved ? JSON.parse(saved) : INITIAL_FACULTIES;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [classes, setClasses] = useState<ClassEntity[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLASSES);
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [assignments, setAssignments] = useState<CoordinatorAssignment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
  });

  const [courseTrackers, setCourseTrackers] = useState<CourseTrackerRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COURSE_TRACKERS);
    return saved ? JSON.parse(saved) : INITIAL_COURSE_TRACKERS;
  });

  const [studentPerformances, setStudentPerformances] = useState<StudentCoursePerformance[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COURSE_PERFORMANCES);
    return saved ? JSON.parse(saved) : INITIAL_SECO1_STUDENTS;
  });

  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try {
        const parsed: AppUser[] = JSON.parse(saved);
        const hasAdmin = parsed.some((u) => u.role === 'Admin');
        if (!hasAdmin) {
          const adminUser = INITIAL_USERS.find((u) => u.role === 'Admin');
          if (adminUser) return [adminUser, ...parsed];
        }
        return parsed;
      } catch {
        return INITIAL_USERS;
      }
    }
    return INITIAL_USERS;
  });

  const [userCredentials, setUserCredentials] = useState<{ email: string; employeeCode: string; password: string }[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_CREDENTIALS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hasAdmin = parsed.some((c: { email: string; employeeCode: string }) => c.email === 'admin@cags.edu' || c.employeeCode === 'ADM-001');
        if (!hasAdmin) {
          return [
            { email: 'admin@cags.edu', employeeCode: 'ADM-001', password: 'admin123' },
            ...parsed,
          ];
        }
        return parsed;
      } catch {
        // fallback
      }
    }
    return INITIAL_USER_CREDENTIALS.map((c) => ({
      email: c.user.email,
      employeeCode: c.user.employeeCode,
      password: c.password,
    }));
  });

  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_USERS[0];
      }
    }
    return INITIAL_USERS[0]; // Dr. Suresh K. Sharma (Principal/Director) by default
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.YEARS, JSON.stringify(academicYears));
  }, [academicYears]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FACULTIES, JSON.stringify(faculties));
  }, [faculties]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COURSE_TRACKERS, JSON.stringify(courseTrackers));
  }, [courseTrackers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COURSE_PERFORMANCES, JSON.stringify(studentPerformances));
  }, [studentPerformances]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER_CREDENTIALS, JSON.stringify(userCredentials));
  }, [userCredentials]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  // Toast Helpers
  const addToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message, duration: 4000 }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Activity Log Helper
  const logActivity = (action: ActivityLog['action'], module: ActivityLog['module'], description: string) => {
    const newLog: ActivityLog = {
      id: 'act_' + Date.now(),
      action,
      module,
      description,
      timestamp: new Date().toISOString(),
      user: 'Admin Administrator',
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 49)]); // keep recent 50
  };

  // Academic Year CRUD
  const activeAcademicYear = useMemo(() => {
    return academicYears.find((y) => y.isActive) || academicYears[0];
  }, [academicYears]);

  const addAcademicYear = (yearData: Omit<AcademicYear, 'id' | 'createdAt'>) => {
    const newYear: AcademicYear = {
      ...yearData,
      id: 'ay_' + Date.now(),
      createdAt: new Date().toISOString(),
    };

    if (newYear.isActive) {
      setAcademicYears((prev) =>
        prev.map((y) => ({ ...y, isActive: false })).concat(newYear)
      );
    } else {
      setAcademicYears((prev) => [...prev, newYear]);
    }
    logActivity('CREATE', 'Academic Years', `Added academic year "${newYear.name}" (${newYear.code})`);
    addToast('success', 'Academic Year Created', `Successfully created ${newYear.name}`);
  };

  const updateAcademicYear = (id: string, updates: Partial<AcademicYear>) => {
    setAcademicYears((prev) =>
      prev.map((y) => {
        if (y.id === id) {
          const updated = { ...y, ...updates };
          return updated;
        }
        if (updates.isActive && y.id !== id) {
          return { ...y, isActive: false };
        }
        return y;
      })
    );
    logActivity('UPDATE', 'Academic Years', `Updated academic year settings for ID ${id}`);
    addToast('info', 'Academic Year Updated', 'Changes saved successfully');
  };

  const deleteAcademicYear = (id: string) => {
    const target = academicYears.find((y) => y.id === id);
    if (!target) return;
    if (target.isActive) {
      addToast('error', 'Cannot Delete Active Year', 'Please set another academic year active first before deleting.');
      return;
    }
    setAcademicYears((prev) => prev.filter((y) => y.id !== id));
    logActivity('DELETE', 'Academic Years', `Deleted academic year "${target.name}"`);
    addToast('warning', 'Academic Year Deleted', `Removed ${target.name}`);
  };

  const setActiveAcademicYear = (id: string) => {
    const target = academicYears.find((y) => y.id === id);
    if (!target) return;
    setAcademicYears((prev) =>
      prev.map((y) => ({
        ...y,
        isActive: y.id === id,
      }))
    );
    logActivity('SET_ACTIVE', 'Academic Years', `Switched active academic session to "${target.name}"`);
    addToast('success', 'Active Session Changed', `Now managing session ${target.name}`);
  };

  // Faculty CRUD
  const addFaculty = (facData: Omit<Faculty, 'id' | 'createdAt'>) => {
    const newFac: Faculty = {
      ...facData,
      id: 'fac_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setFaculties((prev) => [newFac, ...prev]);
    logActivity('CREATE', 'Faculties', `Added faculty member ${newFac.firstName} ${newFac.lastName} (${newFac.employeeCode})`);
    addToast('success', 'Faculty Added', `Registered ${newFac.firstName} ${newFac.lastName}`);
  };

  const updateFaculty = (id: string, updates: Partial<Faculty>) => {
    setFaculties((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
    logActivity('UPDATE', 'Faculties', `Updated profile of faculty ID ${id}`);
    addToast('info', 'Faculty Profile Updated', 'Faculty details updated successfully');
  };

  const deleteFaculty = (id: string) => {
    const fac = faculties.find((f) => f.id === id);
    if (!fac) return;

    // Check if faculty is assigned as coordinator to any class
    const assignedClass = classes.find((c) => c.coordinatorId === id);
    if (assignedClass) {
      addToast('error', 'Faculty is Assigned', `This faculty is currently coordinator for "${assignedClass.name}". Reassign class first.`);
      return;
    }

    setFaculties((prev) => prev.filter((f) => f.id !== id));
    setAssignments((prev) => prev.filter((a) => a.facultyId !== id));
    logActivity('DELETE', 'Faculties', `Removed faculty member ${fac.firstName} ${fac.lastName}`);
    addToast('warning', 'Faculty Removed', `Removed ${fac.firstName} ${fac.lastName}`);
  };

  const getFacultyById = (id: string) => faculties.find((f) => f.id === id);

  // Subject CRUD & Faculty Allocation
  const addSubject = (subjectData: Omit<Subject, 'id' | 'createdAt'>) => {
    const newSubject: Subject = {
      ...subjectData,
      id: 'sub_' + Date.now(),
      createdAt: new Date().toISOString(),
      assignedFacultyIds: subjectData.assignedFacultyIds || [],
    };

    setSubjects((prev) => [newSubject, ...prev]);

    // Also synchronize assigned faculty members' assignedSubjects list
    if (newSubject.assignedFacultyIds && newSubject.assignedFacultyIds.length > 0) {
      setFaculties((prev) =>
        prev.map((f) => {
          if (newSubject.assignedFacultyIds.includes(f.id)) {
            const currentSubNames = f.assignedSubjects || [];
            if (!currentSubNames.includes(newSubject.name)) {
              return { ...f, assignedSubjects: [...currentSubNames, newSubject.name] };
            }
          }
          return f;
        })
      );
    }

    logActivity('CREATE', 'Subjects', `Created academic subject "${newSubject.name}" (${newSubject.code})`);
    addToast('success', 'Subject Added', `Subject "${newSubject.name}" has been registered.`);
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    const prevSubject = subjects.find((s) => s.id === id);
    if (!prevSubject) return;

    const oldName = prevSubject.name;
    const newName = updates.name !== undefined ? updates.name : oldName;
    const oldFacultyIds = prevSubject.assignedFacultyIds || [];
    const newFacultyIds = updates.assignedFacultyIds !== undefined ? updates.assignedFacultyIds : oldFacultyIds;

    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );

    // Synchronize faculty members' assignedSubjects list
    setFaculties((prev) =>
      prev.map((fac) => {
        let subjectsList = [...fac.assignedSubjects];
        const wasAssigned = oldFacultyIds.includes(fac.id);
        const isNowAssigned = newFacultyIds.includes(fac.id);

        // Remove old name if previously assigned
        if (wasAssigned && (!isNowAssigned || oldName !== newName)) {
          subjectsList = subjectsList.filter((name) => name !== oldName);
        }

        // Add new name if now assigned
        if (isNowAssigned && !subjectsList.includes(newName)) {
          subjectsList.push(newName);
        }

        return { ...fac, assignedSubjects: subjectsList };
      })
    );

    logActivity('UPDATE', 'Subjects', `Updated academic subject "${newName}" (${updates.code || prevSubject.code})`);
    addToast('info', 'Subject Updated', `Subject "${newName}" details saved.`);
  };

  const deleteSubject = (id: string) => {
    const sub = subjects.find((s) => s.id === id);
    if (!sub) return;

    setSubjects((prev) => prev.filter((s) => s.id !== id));

    // Remove subject from faculty assignedSubjects
    setFaculties((prev) =>
      prev.map((fac) => ({
        ...fac,
        assignedSubjects: fac.assignedSubjects.filter((name) => name !== sub.name),
      }))
    );

    logActivity('DELETE', 'Subjects', `Deleted subject "${sub.name}" (${sub.code})`);
    addToast('warning', 'Subject Deleted', `Removed ${sub.name} from academic registry.`);
  };

  const bulkDeleteSubjects = (ids: string[]) => {
    const deletedSubjects = subjects.filter((s) => ids.includes(s.id));
    const deletedNames = new Set(deletedSubjects.map((s) => s.name));

    setSubjects((prev) => prev.filter((s) => !ids.includes(s.id)));

    // Clean up faculty assignedSubjects
    setFaculties((prev) =>
      prev.map((fac) => ({
        ...fac,
        assignedSubjects: fac.assignedSubjects.filter((name) => !deletedNames.has(name)),
      }))
    );

    logActivity('DELETE', 'Subjects', `Bulk deleted ${ids.length} subjects from registry`);
    addToast('warning', 'Subjects Deleted', `Successfully deleted ${ids.length} subjects.`);
  };

  const getSubjectById = (id: string) => subjects.find((s) => s.id === id);

  const getSubjectsForFaculty = (facultyId: string) => {
    return subjects.filter((s) => s.assignedFacultyIds && s.assignedFacultyIds.includes(facultyId));
  };

  const getFacultiesForSubject = (subjectId: string) => {
    const sub = subjects.find((s) => s.id === subjectId);
    if (!sub || !sub.assignedFacultyIds) return [];
    return faculties.filter((f) => sub.assignedFacultyIds.includes(f.id));
  };

  const assignFacultyToSubject = (subjectId: string, facultyIds: string[]) => {
    const sub = subjects.find((s) => s.id === subjectId);
    if (!sub) return;

    updateSubject(subjectId, { assignedFacultyIds: facultyIds });
    logActivity('ASSIGN', 'Subjects', `Assigned ${facultyIds.length} faculties to subject "${sub.name}"`);
    addToast('success', 'Faculty Assigned', `Updated faculty assignments for "${sub.name}".`);
  };

  const assignSubjectToFaculty = (facultyId: string, subjectIds: string[]) => {
    const fac = faculties.find((f) => f.id === facultyId);
    if (!fac) return;

    // Update each subject to include or remove this faculty
    setSubjects((prev) =>
      prev.map((s) => {
        const currentFacIds = s.assignedFacultyIds || [];
        const shouldHave = subjectIds.includes(s.id);
        const hasFaculty = currentFacIds.includes(facultyId);

        if (shouldHave && !hasFaculty) {
          return { ...s, assignedFacultyIds: [...currentFacIds, facultyId] };
        } else if (!shouldHave && hasFaculty) {
          return { ...s, assignedFacultyIds: currentFacIds.filter((id) => id !== facultyId) };
        }
        return s;
      })
    );

    const selectedSubjectNames = subjects.filter((s) => subjectIds.includes(s.id)).map((s) => s.name);
    setFaculties((prev) =>
      prev.map((f) => (f.id === facultyId ? { ...f, assignedSubjects: selectedSubjectNames } : f))
    );

    logActivity('ASSIGN', 'Faculties', `Allocated ${subjectIds.length} subjects to ${fac.firstName} ${fac.lastName}`);
    addToast('success', 'Subjects Allocated', `Assigned ${subjectIds.length} subjects to ${fac.firstName} ${fac.lastName}.`);
  };

  // Class CRUD
  const addClass = (clsData: Omit<ClassEntity, 'id' | 'createdAt'>) => {
    const newClass: ClassEntity = {
      ...clsData,
      id: 'cls_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setClasses((prev) => [newClass, ...prev]);

    if (newClass.coordinatorId) {
      const newAssign: CoordinatorAssignment = {
        id: 'assign_' + Date.now(),
        classId: newClass.id,
        facultyId: newClass.coordinatorId,
        academicYearId: newClass.academicYearId || activeAcademicYear?.id || '',
        assignedDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        remarks: 'Assigned during class creation',
      };
      setAssignments((prev) => [newAssign, ...prev]);
    }

    logActivity('CREATE', 'Classes', `Created class section "${newClass.name}" (Room: ${newClass.roomNumber})`);
    addToast('success', 'Class Created', `Class "${newClass.name}" has been created`);
  };

  const updateClass = (id: string, updates: Partial<ClassEntity>) => {
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const oldCoord = c.coordinatorId;
          const updated = { ...c, ...updates };

          // If coordinator changed
          if (updates.coordinatorId !== undefined && updates.coordinatorId !== oldCoord) {
            if (updates.coordinatorId) {
              const newAssign: CoordinatorAssignment = {
                id: 'assign_' + Date.now(),
                classId: id,
                facultyId: updates.coordinatorId,
                academicYearId: updated.academicYearId || activeAcademicYear?.id || '',
                assignedDate: new Date().toISOString().split('T')[0],
                status: 'Active',
                remarks: 'Updated via class edit',
              };
              setAssignments((aPrev) => [
                newAssign,
                ...aPrev.map((a) => (a.classId === id && a.status === 'Active' ? { ...a, status: 'Relieved' as const } : a)),
              ]);
            } else {
              setAssignments((aPrev) =>
                aPrev.map((a) => (a.classId === id && a.status === 'Active' ? { ...a, status: 'Relieved' as const } : a))
              );
            }
          }
          return updated;
        }
        return c;
      })
    );
    logActivity('UPDATE', 'Classes', `Updated configuration for class ID ${id}`);
    addToast('info', 'Class Updated', 'Class details modified successfully');
  };

  const deleteClass = (id: string) => {
    const target = classes.find((c) => c.id === id);
    if (!target) return;

    // Check if students are in this class
    const enrolledStudents = students.filter((s) => s.classId === id);
    if (enrolledStudents.length > 0) {
      addToast('error', 'Enrolled Students Exist', `Cannot delete class "${target.name}" with ${enrolledStudents.length} enrolled students.`);
      return;
    }

    setClasses((prev) => prev.filter((c) => c.id !== id));
    setAssignments((prev) => prev.filter((a) => a.classId !== id));
    logActivity('DELETE', 'Classes', `Deleted class "${target.name}"`);
    addToast('warning', 'Class Deleted', `Removed class ${target.name}`);
  };

  const getClassById = (id: string) => classes.find((c) => c.id === id);

  // Student CRUD
  const addStudent = (studentData: Omit<Student, 'id' | 'createdAt'>) => {
    const newStudent: Student = {
      ...studentData,
      id: 'stu_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setStudents((prev) => [newStudent, ...prev]);
    logActivity('CREATE', 'Students', `Enrolled student ${newStudent.firstName} ${newStudent.lastName} (${newStudent.rollNo})`);
    addToast('success', 'Student Enrolled', `Registered ${newStudent.firstName} ${newStudent.lastName}`);
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    logActivity('UPDATE', 'Students', `Updated details for student ID ${id}`);
    addToast('info', 'Student Record Updated', 'Student profile updated successfully');
  };

  const deleteStudent = (id: string) => {
    const target = students.find((s) => s.id === id);
    if (!target) return;
    setStudents((prev) => prev.filter((s) => s.id !== id));
    logActivity('DELETE', 'Students', `Removed student ${target.firstName} ${target.lastName} (${target.rollNo})`);
    addToast('warning', 'Student Removed', `Student ${target.firstName} deleted from roster`);
  };

  const bulkDeleteStudents = (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    const idSet = new Set(ids);
    const count = ids.length;
    setStudents((prev) => prev.filter((s) => !idSet.has(s.id)));
    logActivity('DELETE', 'Students', `Bulk removed ${count} students from roster`);
    addToast('warning', 'Bulk Deletion Completed', `Successfully removed ${count} student records`);
  };

  const bulkAssignStudentsToClass = (studentIds: string[], classId: string) => {
    if (!studentIds || studentIds.length === 0) return;
    const targetClass = classes.find((c) => c.id === classId);
    if (!targetClass && classId !== '') {
      addToast('error', 'Class Not Found', 'Target class was not found');
      return;
    }

    const idSet = new Set(studentIds);
    setStudents((prev) =>
      prev.map((s) => {
        if (idSet.has(s.id)) {
          return {
            ...s,
            classId: classId || undefined,
            // Optionally align section and semester if assigning to a real class
            ...(targetClass ? { section: targetClass.section, semester: targetClass.semester, department: targetClass.department } : {}),
          };
        }
        return s;
      })
    );

    const className = targetClass ? targetClass.name : 'Unassigned';
    logActivity('UPDATE', 'Students', `Bulk assigned ${studentIds.length} students to class "${className}"`);
    addToast('success', 'Class Allocation Updated', `Assigned ${studentIds.length} students to ${className}`);
  };

  const bulkUpdateStudentsStatus = (studentIds: string[], status: StudentStatus) => {
    if (!studentIds || studentIds.length === 0) return;
    const idSet = new Set(studentIds);
    setStudents((prev) =>
      prev.map((s) => (idSet.has(s.id) ? { ...s, status } : s))
    );
    logActivity('UPDATE', 'Students', `Bulk updated status of ${studentIds.length} students to "${status}"`);
    addToast('info', 'Status Updated', `Set status to "${status}" for ${studentIds.length} students`);
  };

  const getStudentById = (id: string) => students.find((s) => s.id === id);
  const getStudentsByClassId = (classId: string) => students.filter((s) => s.classId === classId);
  const getStudentsByClass = getStudentsByClassId;

  const bulkImportStudents = (newStudentsData: Omit<Student, 'id' | 'createdAt'>[]) => {
    const formatted: Student[] = newStudentsData.map((s, index) => ({
      ...s,
      id: 'stu_' + (Date.now() + index),
      createdAt: new Date().toISOString(),
    }));
    setStudents((prev) => [...formatted, ...prev]);
    logActivity('CREATE', 'Students', `Bulk imported ${formatted.length} students into roster`);
    addToast('success', 'Bulk Import Success', `Imported ${formatted.length} students into the system`);
  };

  // Class Coordinator Assignment Operations
  const assignCoordinator = (classId: string, facultyId: string, remarks?: string, loadHours: number = 4) => {
    const targetClass = classes.find((c) => c.id === classId);
    const targetFaculty = faculties.find((f) => f.id === facultyId);

    if (!targetClass || !targetFaculty) {
      addToast('error', 'Assignment Failed', 'Invalid class or faculty selected');
      return;
    }

    // Update Class entity
    setClasses((prev) =>
      prev.map((c) => (c.id === classId ? { ...c, coordinatorId: facultyId } : c))
    );

    // Update assignment log
    const newAssignment: CoordinatorAssignment = {
      id: 'assign_' + Date.now(),
      classId,
      facultyId,
      academicYearId: targetClass.academicYearId || activeAcademicYear?.id || '',
      assignedDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      remarks: remarks || `Assigned to ${targetClass.name}`,
      loadHoursPerWeek: loadHours,
    };

    setAssignments((prev) => [
      newAssignment,
      ...prev.map((a) => (a.classId === classId && a.status === 'Active' ? { ...a, status: 'Relieved' as const } : a)),
    ]);

    logActivity('ASSIGN', 'Coordinators', `Assigned ${targetFaculty.firstName} ${targetFaculty.lastName} as Class Coordinator for "${targetClass.name}"`);
    addToast('success', 'Coordinator Assigned', `${targetFaculty.firstName} ${targetFaculty.lastName} assigned to ${targetClass.name}`);
  };

  const unassignCoordinator = (classId: string) => {
    const targetClass = classes.find((c) => c.id === classId);
    if (!targetClass) return;

    setClasses((prev) =>
      prev.map((c) => (c.id === classId ? { ...c, coordinatorId: null } : c))
    );

    setAssignments((prev) =>
      prev.map((a) => (a.classId === classId && a.status === 'Active' ? { ...a, status: 'Relieved' as const } : a))
    );

    logActivity('UPDATE', 'Coordinators', `Unassigned class coordinator from "${targetClass.name}"`);
    addToast('info', 'Coordinator Relieved', `Class coordinator unassigned from ${targetClass.name}`);
  };

  const getCoordinatorForClass = (classId: string) => {
    const targetClass = classes.find((c) => c.id === classId);
    if (!targetClass || !targetClass.coordinatorId) return undefined;
    return faculties.find((f) => f.id === targetClass.coordinatorId);
  };

  const getAssignedClassesForFaculty = (facultyId: string) => {
    return classes.filter((c) => c.coordinatorId === facultyId);
  };

  // Course Tracker Methods
  const getCourseTrackerById = (id: string) => courseTrackers.find((c) => c.id === id);

  const addCourseTracker = (trackerData: Omit<CourseTrackerRecord, 'id' | 'createdAt' | 'updatedAt'>): CourseTrackerRecord => {
    const newId = `ct-${trackerData.courseType.toLowerCase()}-${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const sessions = trackerData.syllabusSessions || [];
    const conducted = sessions.filter((s) => s.status === 'Conducted').length;
    const total = sessions.length;
    const completionPercentage = total > 0 ? Math.round((conducted / total) * 1000) / 10 : 0;

    const newTracker: CourseTrackerRecord = {
      ...trackerData,
      id: newId,
      totalSessions: total,
      conductedSessions: conducted,
      pendingSessions: Math.max(0, total - conducted),
      completionPercentage,
      averageAttendancePercentage: trackerData.averageAttendancePercentage ?? 85.0,
      syllabusSessions: sessions,
      createdAt: now,
      updatedAt: now,
    };

    setCourseTrackers((prev) => [newTracker, ...prev]);
    logActivity('CREATE', 'System', `Created new ${newTracker.courseType} Course Tracker: "${newTracker.courseName}" (${newTracker.courseCode})`);
    addToast('success', `${newTracker.courseType} Course Added`, `Created ${newTracker.courseType} course "${newTracker.courseName}" successfully.`);
    return newTracker;
  };

  const updateCourseTracker = (id: string, updates: Partial<CourseTrackerRecord>) => {
    setCourseTrackers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const updated = { ...t, ...updates, updatedAt: new Date().toISOString() };
        if (updates.syllabusSessions) {
          const sessions = updates.syllabusSessions;
          const conducted = sessions.filter((s) => s.status === 'Conducted').length;
          const total = sessions.length;
          updated.totalSessions = total;
          updated.conductedSessions = conducted;
          updated.pendingSessions = Math.max(0, total - conducted);
          updated.completionPercentage = total > 0 ? Math.round((conducted / total) * 1000) / 10 : 0;
        }
        return updated;
      })
    );
    const target = courseTrackers.find((t) => t.id === id);
    const courseTitle = updates.courseName || target?.courseName || 'Course';
    logActivity('UPDATE', 'System', `Updated course details for "${courseTitle}"`);
    addToast('success', 'Course Updated', `Course "${courseTitle}" details updated successfully.`);
  };

  const deleteCourseTracker = (id: string) => {
    const target = courseTrackers.find((t) => t.id === id);
    if (!target) return;

    setCourseTrackers((prev) => prev.filter((t) => t.id !== id));
    logActivity('DELETE', 'System', `Deleted ${target.courseType} Course Tracker: "${target.courseName}" (${target.courseCode})`);
    addToast('warning', `${target.courseType} Course Deleted`, `Removed course "${target.courseName}" from course trackers.`);
  };

  const addSyllabusSession = (trackerId: string, session: Omit<SyllabusSessionItem, 'id'>) => {
    const newSession: SyllabusSessionItem = {
      ...session,
      id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setCourseTrackers((prev) =>
      prev.map((t) => {
        if (t.id !== trackerId) return t;
        const sessions = [...t.syllabusSessions, newSession];
        const conducted = sessions.filter((s) => s.status === 'Conducted').length;
        const total = sessions.length;
        return {
          ...t,
          syllabusSessions: sessions,
          totalSessions: total,
          conductedSessions: conducted,
          pendingSessions: Math.max(0, total - conducted),
          completionPercentage: total ? Math.round((conducted / total) * 1000) / 10 : 0,
        };
      })
    );
    logActivity('CREATE', 'System', `Added session #${session.sessionNo} to syllabus delivery log`);
    addToast('success', 'Session Added', `Added session #${session.sessionNo} to syllabus`);
  };

  const updateSyllabusSession = (trackerId: string, sessionId: string, updates: Partial<SyllabusSessionItem>) => {
    setCourseTrackers((prev) =>
      prev.map((t) => {
        if (t.id !== trackerId) return t;
        const sessions = t.syllabusSessions.map((s) => (s.id === sessionId ? { ...s, ...updates } : s));
        const conducted = sessions.filter((s) => s.status === 'Conducted').length;
        const total = sessions.length;
        return {
          ...t,
          syllabusSessions: sessions,
          totalSessions: total,
          conductedSessions: conducted,
          pendingSessions: Math.max(0, total - conducted),
          completionPercentage: total ? Math.round((conducted / total) * 1000) / 10 : 0,
        };
      })
    );
    logActivity('UPDATE', 'System', `Updated syllabus session in tracker`);
    addToast('success', 'Session Updated', 'Syllabus session delivery details saved');
  };

  const deleteSyllabusSession = (trackerId: string, sessionId: string) => {
    setCourseTrackers((prev) =>
      prev.map((t) => {
        if (t.id !== trackerId) return t;
        const sessions = t.syllabusSessions.filter((s) => s.id !== sessionId);
        const conducted = sessions.filter((s) => s.status === 'Conducted').length;
        const total = sessions.length;
        return {
          ...t,
          syllabusSessions: sessions,
          totalSessions: total,
          conductedSessions: conducted,
          pendingSessions: Math.max(0, total - conducted),
          completionPercentage: total ? Math.round((conducted / total) * 1000) / 10 : 0,
        };
      })
    );
    logActivity('DELETE', 'System', `Deleted syllabus session from tracker`);
    addToast('info', 'Session Removed', 'Syllabus session removed from tracker');
  };

  const updateAttendanceControlItem = (trackerId: string, srNo: number, updates: Partial<AttendanceControlItem>) => {
    setCourseTrackers((prev) =>
      prev.map((t) => {
        if (t.id !== trackerId) return t;
        return {
          ...t,
          attendanceControlItems: t.attendanceControlItems.map((item) =>
            item.srNo === srNo ? { ...item, ...updates } : item
          ),
        };
      })
    );
    logActivity('UPDATE', 'System', `Updated attendance control sheet item #${srNo}`);
    addToast('success', 'Control Sheet Updated', `Attendance sheet mapping #${srNo} updated`);
  };

  const updateStudentPerformance = (studentId: string, updates: Partial<StudentCoursePerformance>) => {
    setStudentPerformances((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, ...updates } : s))
    );
    logActivity('UPDATE', 'Students', `Updated internal test marks and attendance for student ${studentId}`);
    addToast('success', 'Marks Updated', 'Student internal assessment and attendance updated');
  };

  const exportCourseTrackerExcel = (trackerId: string) => {
    const tracker = courseTrackers.find((t) => t.id === trackerId);
    if (!tracker) {
      addToast('error', 'Export Failed', 'Selected course tracker was not found');
      return;
    }
    exportCourseTrackerToExcel(tracker, studentPerformances);
    logActivity('CREATE', 'System', `Exported ${tracker.courseType} Course Tracker (${tracker.courseCode}) to Excel`);
    addToast('success', 'Excel Exported', `${tracker.courseCode} ${tracker.courseType} Tracker (.xls) generated successfully`);
  };

  const exportCourseTrackerCSV = (trackerId: string) => {
    const tracker = courseTrackers.find((t) => t.id === trackerId);
    if (!tracker) {
      addToast('error', 'Export Failed', 'Selected course tracker was not found');
      return;
    }
    exportCourseTrackerToCSV(tracker, studentPerformances);
    logActivity('CREATE', 'System', `Exported ${tracker.courseType} Course Tracker (${tracker.courseCode}) to CSV`);
    addToast('success', 'CSV Exported', `${tracker.courseCode} ${tracker.courseType} Matrix (.csv) generated`);
  };

  // Authentication Methods
  const login = (identifier: string, password: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPwd = password.trim();

    const cred = userCredentials.find(
      (c) => c.email.toLowerCase() === cleanId || c.employeeCode.toLowerCase() === cleanId
    );

    if (!cred) {
      return { success: false, error: 'No user account found with this email or employee code.' };
    }

    if (cred.password !== cleanPwd) {
      return { success: false, error: 'Invalid password. Please try again.' };
    }

    const user = users.find(
      (u) => u.email.toLowerCase() === cred.email.toLowerCase() || u.employeeCode.toLowerCase() === cred.employeeCode.toLowerCase()
    );

    if (!user) {
      return { success: false, error: 'User profile not found in active directory.' };
    }

    const updatedUser: AppUser = {
      ...user,
      lastLoginAt: new Date().toISOString(),
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    logActivity('UPDATE', 'System', `User ${user.name} (${user.role}) logged in successfully`);
    addToast('success', 'Welcome Back!', `Logged in as ${user.name} (${user.role})`);
    return { success: true };
  };

  const register = (input: UserRegistrationInput) => {
    const cleanEmail = input.email.trim().toLowerCase();
    const cleanCode = input.employeeCode.trim().toUpperCase();

    if (!input.name.trim()) return { success: false, error: 'Full name is required.' };
    if (!cleanEmail) return { success: false, error: 'Institutional email address is required.' };
    if (!cleanCode) return { success: false, error: 'Employee identification code is required.' };
    if (!input.password || input.password.length < 4) return { success: false, error: 'Password must be at least 4 characters.' };

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email address already exists.' };
    }
    if (users.some((u) => u.employeeCode.toUpperCase() === cleanCode)) {
      return { success: false, error: 'An account with this employee code already exists.' };
    }

    const newUser: AppUser = {
      id: `usr-${Date.now().toString(36)}`,
      employeeCode: cleanCode,
      name: input.name.trim(),
      email: cleanEmail,
      role: input.role,
      department: input.department || (input.role === 'Principal/Director' ? 'Institutional Leadership' : 'Computer Science & Engineering'),
      designation: input.designation.trim() || input.role,
      phone: input.phone?.trim() || undefined,
      status: 'Active',
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // If role is Faculty and not yet in faculties list, optionally sync to faculties table so they appear in faculty roster
    if (input.role === 'Faculty') {
      const nameParts = input.name.trim().split(' ');
      const firstName = nameParts[0] || 'Prof.';
      const lastName = nameParts.slice(1).join(' ') || 'Faculty';
      if (!faculties.some((f) => f.employeeCode.toUpperCase() === cleanCode)) {
        addFaculty({
          employeeCode: cleanCode,
          firstName,
          lastName,
          email: cleanEmail,
          phone: input.phone || '+91 98000 00000',
          department: (input.department as any) || 'Computer Science & Engineering',
          designation: (input.designation as any) || 'Assistant Professor',
          qualification: 'M.Tech / Ph.D',
          dateOfJoining: new Date().toISOString().slice(0, 10),
          specialization: 'Core Academics & Research',
          status: 'Active',
          experienceYears: 3,
          assignedSubjects: [],
          isCoordinatorEligible: true,
        });
      }
    }

    setUsers((prev) => [newUser, ...prev]);
    setUserCredentials((prev) => [
      { email: cleanEmail, employeeCode: cleanCode, password: input.password.trim() },
      ...prev,
    ]);
    setCurrentUser(newUser);

    logActivity('CREATE', 'System', `New ${newUser.role} registered: ${newUser.name} (${cleanCode})`);
    addToast('success', 'Registration Successful', `Welcome to MYCAGS, ${newUser.name}!`);
    return { success: true };
  };

  const logout = () => {
    if (currentUser) {
      logActivity('UPDATE', 'System', `User ${currentUser.name} (${currentUser.role}) logged out`);
    }
    setCurrentUser(null);
    addToast('info', 'Signed Out', 'You have been safely signed out from the portal.');
  };

  const switchUserRole = (role: UserRole) => {
    const match = users.find((u) => u.role === role);
    if (match) {
      const updated = { ...match, lastLoginAt: new Date().toISOString() };
      setCurrentUser(updated);
      addToast('success', 'Role Switched', `Active session: ${match.name} (${role})`);
      logActivity('UPDATE', 'System', `Switched active session to ${match.name} (${role})`);
    }
  };

  const loginAsDemoUser = (role: UserRole) => {
    switchUserRole(role);
  };

  // Reset to Demo Data
  const resetToDemoData = () => {
    setAcademicYears(INITIAL_ACADEMIC_YEARS);
    setFaculties(INITIAL_FACULTIES);
    setSubjects(INITIAL_SUBJECTS);
    setClasses(INITIAL_CLASSES);
    setStudents(INITIAL_STUDENTS);
    setAssignments(INITIAL_ASSIGNMENTS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setCourseTrackers(INITIAL_COURSE_TRACKERS);
    setStudentPerformances(INITIAL_SECO1_STUDENTS);
    setUsers(INITIAL_USERS);
    setUserCredentials(INITIAL_USER_CREDENTIALS.map((c) => ({
      email: c.user.email,
      employeeCode: c.user.employeeCode,
      password: c.password,
    })));
    setCurrentUser(INITIAL_USERS[0]);

    localStorage.setItem(STORAGE_KEYS.YEARS, JSON.stringify(INITIAL_ACADEMIC_YEARS));
    localStorage.setItem(STORAGE_KEYS.FACULTIES, JSON.stringify(INITIAL_FACULTIES));
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(INITIAL_SUBJECTS));
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(INITIAL_ASSIGNMENTS));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_ACTIVITY_LOGS));
    localStorage.setItem(STORAGE_KEYS.COURSE_TRACKERS, JSON.stringify(INITIAL_COURSE_TRACKERS));
    localStorage.setItem(STORAGE_KEYS.COURSE_PERFORMANCES, JSON.stringify(INITIAL_SECO1_STUDENTS));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.USER_CREDENTIALS, JSON.stringify(INITIAL_USER_CREDENTIALS.map((c) => ({
      email: c.user.email,
      employeeCode: c.user.employeeCode,
      password: c.password,
    }))));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));

    logActivity('RESET', 'System', 'Restored default academic demo database');
    addToast('info', 'System Reset', 'Demo academic database restored successfully');
  };

  // Export Utilities
  const exportDatabaseJSON = () => {
    const dump = {
      system: 'MYCAGS - College Academics Management System',
      exportedAt: new Date().toISOString(),
      academicYears,
      faculties,
      subjects,
      classes,
      students,
      coordinatorAssignments: assignments,
      activityLogs,
      courseTrackers,
      studentPerformances,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dump, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `MYCAGS_Academics_Export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('success', 'Backup Exported', 'Academic database JSON downloaded');
  };

  const exportStudentsCSV = (customList?: Student[]) => {
    const targetStudents = customList || students;
    exportStudentsToCSV(targetStudents, classes, faculties);
    logActivity('CREATE', 'Students', `Exported ${targetStudents.length} student records to CSV format`);
    addToast('success', 'CSV Exported', `Exported ${targetStudents.length} student academic records to CSV`);
  };

  const exportStudentsExcel = (customList?: Student[]) => {
    const targetStudents = customList || students;
    exportStudentsToExcel(targetStudents, classes, faculties);
    logActivity('CREATE', 'Students', `Exported ${targetStudents.length} student records to Excel spreadsheet`);
    addToast('success', 'Excel Exported', `Exported ${targetStudents.length} student academic records to Excel (.xls)`);
  };

  const exportFacultiesCSV = (customList?: Faculty[]) => {
    const targetFaculties = customList || faculties;
    exportFacultiesToCSV(targetFaculties, classes);
    logActivity('CREATE', 'Faculties', `Exported ${targetFaculties.length} faculty records to CSV format`);
    addToast('success', 'CSV Exported', `Exported ${targetFaculties.length} faculty directory records to CSV`);
  };

  const exportFacultiesExcel = (customList?: Faculty[]) => {
    const targetFaculties = customList || faculties;
    exportFacultiesToExcel(targetFaculties, classes);
    logActivity('CREATE', 'Faculties', `Exported ${targetFaculties.length} faculty records to Excel spreadsheet`);
    addToast('success', 'Excel Exported', `Exported ${targetFaculties.length} faculty records to Excel (.xls)`);
  };

  const exportSubjectsCSV = (customList?: Subject[]) => {
    const targetSubjects = customList || subjects;
    exportSubjectsToCSV(targetSubjects, faculties);
    logActivity('CREATE', 'Subjects', `Exported ${targetSubjects.length} subject records to CSV format`);
    addToast('success', 'CSV Exported', `Exported ${targetSubjects.length} subject records to CSV`);
  };

  const exportSubjectsExcel = (customList?: Subject[]) => {
    const targetSubjects = customList || subjects;
    exportSubjectsToExcel(targetSubjects, faculties);
    logActivity('CREATE', 'Subjects', `Exported ${targetSubjects.length} subject records to Excel spreadsheet`);
    addToast('success', 'Excel Exported', `Exported ${targetSubjects.length} subject records to Excel (.xls)`);
  };

  const exportAnalyticsReportPDF = (options?: ReportGenerationOptions) => {
    exportDashboardReportPDF(students, faculties, classes, {
      ...options,
      activeAcademicYear,
    });
    logActivity('CREATE', 'System', `Generated and downloaded PDF Academic Analytics Report`);
    addToast('success', 'Report Downloaded', 'Academic Analytics Executive PDF report generated');
  };

  const exportAnalyticsReportCSV = (options?: ReportGenerationOptions) => {
    exportDashboardReportCSV(students, faculties, classes, {
      ...options,
      activeAcademicYear,
    });
    logActivity('CREATE', 'System', `Generated and downloaded CSV Academic Analytics Report`);
    addToast('success', 'CSV Downloaded', 'Academic Analytics Summary CSV report generated');
  };

  // Aggregate Statistics
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const totalFaculties = faculties.length;
    const totalClasses = classes.length;
    const totalSubjects = subjects.length;
    const assignedSubjectsCount = subjects.filter((s) => s.assignedFacultyIds && s.assignedFacultyIds.length > 0).length;
    const unassignedSubjectsCount = totalSubjects - assignedSubjectsCount;
    const assignedClassesCount = classes.filter((c) => Boolean(c.coordinatorId)).length;
    const unassignedClassesCount = totalClasses - assignedClassesCount;
    const activeAcademicYearName = activeAcademicYear ? activeAcademicYear.name : 'None Selected';

    const avgCgpaRaw = students.length ? students.reduce((acc, s) => acc + (s.cgpa || 0), 0) / students.length : 0;
    const averageCgpa = Math.round(avgCgpaRaw * 100) / 100;

    const avgAttRaw = students.length ? students.reduce((acc, s) => acc + (s.attendancePercent || 0), 0) / students.length : 0;
    const averageAttendance = Math.round(avgAttRaw);

    const coordinatorAssignedPercentage = totalClasses ? Math.round((assignedClassesCount / totalClasses) * 100) : 0;

    return {
      totalStudents,
      totalFaculties,
      totalClasses,
      totalSubjects,
      assignedSubjectsCount,
      unassignedSubjectsCount,
      assignedClassesCount,
      unassignedClassesCount,
      activeAcademicYearName,
      averageCgpa,
      averageAttendance,
      coordinatorAssignedPercentage,
    };
  }, [students, faculties, classes, subjects, activeAcademicYear]);

  return (
    <AcademicContext.Provider
      value={{
        activeTab,
        setActiveTab,
        theme,
        setTheme,
        toggleTheme,
        toasts,
        addToast,
        removeToast,
        globalSearch,
        setGlobalSearch,
        academicYears,
        activeAcademicYear,
        addAcademicYear,
        updateAcademicYear,
        deleteAcademicYear,
        setActiveAcademicYear,
        faculties,
        addFaculty,
        updateFaculty,
        deleteFaculty,
        getFacultyById,
        subjects,
        addSubject,
        updateSubject,
        deleteSubject,
        bulkDeleteSubjects,
        getSubjectById,
        getSubjectsForFaculty,
        getFacultiesForSubject,
        assignFacultyToSubject,
        assignSubjectToFaculty,
        classes,
        addClass,
        updateClass,
        deleteClass,
        getClassById,
        students,
        addStudent,
        updateStudent,
        deleteStudent,
        bulkDeleteStudents,
        bulkAssignStudentsToClass,
        bulkUpdateStudentsStatus,
        getStudentById,
        getStudentsByClass,
        getStudentsByClassId,
        bulkImportStudents,
        assignments,
        assignCoordinator,
        unassignCoordinator,
        getCoordinatorForClass,
        getAssignedClassesForFaculty,
        activityLogs,
        logActivity,
        courseTrackers,
        getCourseTrackerById,
        addCourseTracker,
        updateCourseTracker,
        deleteCourseTracker,
        addSyllabusSession,
        updateSyllabusSession,
        deleteSyllabusSession,
        updateAttendanceControlItem,
        studentPerformances,
        updateStudentPerformance,
        exportCourseTrackerExcel,
        exportCourseTrackerCSV,
        resetToDemoData,
        exportDatabaseJSON,
        exportStudentsCSV,
        exportStudentsExcel,
        exportFacultiesCSV,
        exportFacultiesExcel,
        exportSubjectsCSV,
        exportSubjectsExcel,
        exportAnalyticsReportPDF,
        exportAnalyticsReportCSV,
        stats,
        currentUser,
        users,
        login,
        register,
        logout,
        switchUserRole,
        loginAsDemoUser,
      }}
    >
      {children}
    </AcademicContext.Provider>
  );
};

export const useAcademic = () => {
  const context = useContext(AcademicContext);
  if (!context) {
    throw new Error('useAcademic must be used within an AcademicProvider');
  }
  return context;
};
