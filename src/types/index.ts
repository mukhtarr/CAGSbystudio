export type DepartmentType =
  | 'Computer Science & Engineering'
  | 'Information Technology'
  | 'Electronics & Communication'
  | 'Mechanical Engineering'
  | 'Civil Engineering'
  | 'Artificial Intelligence & Data Science'
  | 'Management Studies (MBA)'
  | 'Computer Applications (BCA/MCA)';

export type DegreeType = 'B.Tech' | 'BCA' | 'M.Tech' | 'MCA' | 'MBA' | 'B.Sc';

export type SemesterType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type SectionType = 'A' | 'B' | 'C' | 'D';

export type StudentStatus = 'Active' | 'Inactive' | 'Graduated' | 'Suspended';

export type FacultyDesignation =
  | 'Head of Department (HOD)'
  | 'Professor'
  | 'Associate Professor'
  | 'Assistant Professor'
  | 'Lecturer'
  | 'Visiting Faculty';

export type FacultyStatus = 'Active' | 'On Leave' | 'Visiting' | 'Retired';

export type TermType = 'ODD' | 'EVEN' | 'ANNUAL' | 'SUMMER';

export type SubjectType =
  | 'Theory'
  | 'Practical / Lab'
  | 'Elective'
  | 'Integrated (Theory + Lab)'
  | 'Seminar / Project';

export type SubjectStatus = 'Active' | 'Archived' | 'Draft';

export interface Subject {
  id: string;
  code: string;
  name: string;
  department: DepartmentType;
  degree: DegreeType;
  semester: SemesterType;
  type: SubjectType;
  credits: number;
  lectureHoursPerWeek: number;
  practicalHoursPerWeek: number;
  assignedFacultyIds: string[];
  description?: string;
  status: SubjectStatus;
  createdAt: string;
}

export type DeadlineCategory =
  | 'EXAMS'
  | 'REPORTING'
  | 'GRADING'
  | 'ENROLLMENT'
  | 'AUDIT'
  | 'GENERAL';

export interface AcademicEvent {
  id: string;
  title: string;
  category: DeadlineCategory;
  startDate: string;
  endDate?: string;
  description: string;
  priority?: 'high' | 'medium' | 'low';
  targetAudience?: 'Faculty' | 'Students' | 'Coordinators' | 'All';
  actionUrlTab?: ActiveTab;
}

export interface AcademicYear {
  id: string;
  name: string; // e.g. "2024 - 2025"
  code: string; // e.g. "AY-2024-25"
  term: TermType;
  startDate: string;
  endDate: string;
  isActive: boolean;
  notes?: string;
  events?: AcademicEvent[];
  createdAt: string;
}

export interface ClassEntity {
  id: string;
  name: string; // e.g. "B.Tech CSE - 4th Sem (Sec A)"
  courseName: string;
  degree: DegreeType;
  department: DepartmentType;
  semester: SemesterType;
  section: SectionType;
  academicYearId: string;
  coordinatorId: string | null; // Faculty ID assigned as Class Coordinator
  roomNumber: string;
  capacity: number;
  shift: 'Morning' | 'Afternoon' | 'Evening';
  createdAt: string;
}

export interface Student {
  id: string;
  rollNo: string;
  prnNo: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  department: DepartmentType;
  degree: DegreeType;
  academicYearId: string;
  classId: string;
  semester: SemesterType;
  section: SectionType;
  admissionYear: number;
  cgpa: number;
  attendancePercent: number;
  status: StudentStatus;
  bloodGroup?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Faculty {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: DepartmentType;
  designation: FacultyDesignation;
  qualification: string;
  dateOfJoining: string;
  specialization: string;
  experienceYears: number;
  status: FacultyStatus;
  assignedSubjects: string[];
  isCoordinatorEligible: boolean;
  officeRoom?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface CoordinatorAssignment {
  id: string;
  classId: string;
  facultyId: string;
  academicYearId: string;
  assignedDate: string;
  status: 'Active' | 'Relieved' | 'Transferred';
  remarks?: string;
  loadHoursPerWeek?: number;
}

export interface ActivityLog {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ASSIGN' | 'SET_ACTIVE' | 'RESET';
  module: 'Students' | 'Faculties' | 'Subjects' | 'Academic Years' | 'Classes' | 'Coordinators' | 'System';
  description: string;
  timestamp: string;
  user: string;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

export type ActiveTab =
  | 'dashboard'
  | 'students'
  | 'faculties'
  | 'subjects'
  | 'course-tracker'
  | 'academic-years'
  | 'classes'
  | 'coordinators'
  | 'database'
  | 'settings';

export type ThemeMode = 'dark' | 'light';

// Course Academic Tracker types based on Theory and Lab Excel formats
export interface AttendanceControlItem {
  srNo: number;
  title: string;
  sheetLink: string;
  columnRef?: string;
  link?: string;
  column?: string;
}

export interface UnitTestAnalysis {
  cia: {
    averageMarks: number;
    thresholdAbove15Count: number;
    thresholdBelow8Count: number;
    passedPercentage: number;
    totalEvaluated: number;
  };
  mse: {
    averageMarks: number;
    thresholdAbove12Count: number;
    thresholdBelow10Count: number;
    passedPercentage: number;
    totalEvaluated: number;
  };
}

export interface LabCIAAnalysis {
  averageMarks: number;
  passedPercentage: number;
  thresholdAbove15Count: number;
  thresholdBelow15Count: number;
  totalEvaluated: number;
}

export interface SyllabusSessionItem {
  id: string;
  sessionNo: number;
  unitName: string;
  topic: string;
  plannedDate: string;
  conductedDate?: string;
  status: 'Conducted' | 'Scheduled' | 'Rescheduled' | 'Pending';
  pedagogy?: string;
  batch?: string;
  unit?: string;
}

export interface AttendanceStatusInfo {
  totalSessions: number;
  averageAttendancePct: number;
  totalStudents: number;
  below50Count?: number; // Theory: < 50%
  above60Count?: number; // Theory: > 60%
  below10Count?: number; // Lab: < 10%
  above99Count?: number; // Lab: > 99%
  between50And75Count?: number;
  above75Count?: number;
}

export interface StudentCoursePerformance {
  studentId: string;
  rollNo: string;
  studentName: string;
  name?: string;
  batch: string;
  theoryMarks: {
    cia1Marks: number;
    cia1Passed: boolean;
    cia2Marks: number;
    cia2Passed: boolean;
    mseMarks: number;
  };
  labMarks: {
    cia1Marks: number;
    cia1Passed: boolean;
    cia2Marks: number;
    cia2Passed: boolean;
  };
  theoryAttendance: {
    totalConducted: number;
    attended: number;
    percentage: number;
    category: 'Good (>=75%)' | 'Warning (50-75%)' | 'Critical (<50%)' | 'Severe (<10%)';
  };
  labAttendance: {
    totalConducted: number;
    attended: number;
    percentage: number;
    category: 'Good (>=75%)' | 'Warning (50-75%)' | 'Critical (<50%)' | 'Severe (<10%)';
  };
  overallGrade: string;
  theoryAttendancePct?: number;
  labAttendancePct?: number;
  theoryCiaMarks?: number;
  theoryMseMarks?: number;
  labCiaMarks?: number;
  isDefaulter?: boolean;
  remarks?: string;
}

export interface CourseTrackerRecord {
  id: string;
  courseType: 'Theory' | 'Lab';
  courseCode: string;
  courseName: string;
  department: string;
  academicYear: string;
  curriculum: string;
  classAndSem: string;
  courseOwner: string;
  courseOwnerFacultyId?: string;
  classroom?: string;
  credits?: number;
  totalSessions: number;
  conductedSessions: number;
  pendingSessions: number;
  completionPercentage: number;
  averageAttendancePercentage: number;
  attendanceControlItems: AttendanceControlItem[];
  attendanceControlInfo?: AttendanceControlItem[];
  syllabusSessions: SyllabusSessionItem[];
  syllabusCompletion?: {
    totalSessions: number;
    conductedSessions: number;
    pendingSessions: number;
    completionPercentage: number;
    sessions: SyllabusSessionItem[];
  };
  marksAnalysis?: UnitTestAnalysis;
  labCiaAnalysis?: LabCIAAnalysis;
  attendanceStatus?: AttendanceStatusInfo;
  createdAt: string;
  updatedAt: string;
}

// User Authentication & Role-Based Governance Types
export type UserRole = 'Admin' | 'Principal/Director' | 'HOD' | 'Faculty';

export interface AppUser {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  role: UserRole;
  department?: DepartmentType | string;
  designation: string;
  phone?: string;
  status: 'Active' | 'Pending_Approval' | 'Suspended';
  lastLoginAt?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface UserRegistrationInput {
  employeeCode: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department?: string;
  designation: string;
  phone?: string;
}

