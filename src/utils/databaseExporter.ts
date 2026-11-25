import {
  AcademicYear,
  ClassEntity,
  Faculty,
  Student,
  Subject,
  CoordinatorAssignment,
  ActivityLog,
  CourseTrackerRecord,
  StudentCoursePerformance,
  AppUser,
} from '../types';
import { INITIAL_COURSE_TRACKERS, INITIAL_SECO1_STUDENTS } from '../data/courseTrackerData';
import { INITIAL_USERS } from '../data/userData';

export interface MySQLColumnMeta {
  field: string;
  type: string;
  nullable: boolean;
  key?: 'PRI' | 'UNI' | 'MUL';
  defaultVal?: string;
  extra?: string;
  description: string;
}

export interface MySQLTableMeta {
  name: string;
  description: string;
  rowCount: number;
  columns: MySQLColumnMeta[];
  primaryKey: string;
  foreignKeys?: { column: string; refTable: string; refColumn: string }[];
}

export const MYSQL_TABLES_META: Record<string, MySQLTableMeta> = {
  departments: {
    name: 'departments',
    description: 'Academic faculties and departments (CSE, AIDS, IT, ECE, ME, CE, MBA, CA)',
    rowCount: 8,
    primaryKey: 'id',
    columns: [
      { field: 'id', type: 'VARCHAR(50)', nullable: false, key: 'PRI', description: 'Unique Department Identifier' },
      { field: 'code', type: 'VARCHAR(20)', nullable: false, key: 'UNI', description: 'Department Short Code (e.g. CSE)' },
      { field: 'name', type: 'VARCHAR(150)', nullable: false, key: 'UNI', description: 'Full Department Name' },
      { field: 'hod_name', type: 'VARCHAR(120)', nullable: true, description: 'Head of Department' },
      { field: 'email', type: 'VARCHAR(120)', nullable: true, description: 'Departmental Official Email' },
      { field: 'phone', type: 'VARCHAR(30)', nullable: true, description: 'Contact Phone Number' },
      { field: 'location', type: 'VARCHAR(100)', nullable: true, description: 'Campus Building & Floor Location' },
      { field: 'status', type: "ENUM('Active','Inactive')", nullable: false, defaultVal: "'Active'", description: 'Operational Status' },
      { field: 'created_at', type: 'TIMESTAMP', nullable: false, defaultVal: 'CURRENT_TIMESTAMP', description: 'Record Creation Date' },
    ],
  },
  academic_years: {
    name: 'academic_years',
    description: 'Academic calendars, semester terms (Odd/Even/Annual), and session flags',
    rowCount: 4,
    primaryKey: 'id',
    columns: [
      { field: 'id', type: 'VARCHAR(50)', nullable: false, key: 'PRI', description: 'Unique Session ID' },
      { field: 'code', type: 'VARCHAR(30)', nullable: false, key: 'UNI', description: 'Session Code (e.g. AY-24-25-ODD)' },
      { field: 'name', type: 'VARCHAR(100)', nullable: false, description: 'Academic Year Display Title' },
      { field: 'term', type: "ENUM('ODD','EVEN','ANNUAL')", nullable: false, defaultVal: "'ODD'", description: 'Semester Cycle' },
      { field: 'start_date', type: 'DATE', nullable: false, description: 'Session Start Date' },
      { field: 'end_date', type: 'DATE', nullable: false, description: 'Session End Date' },
      { field: 'is_active', type: 'BOOLEAN', nullable: false, defaultVal: 'FALSE', description: 'Current Active Academic Year Flag' },
      { field: 'notes', type: 'TEXT', nullable: true, description: 'Academic Notes & Directives' },
      { field: 'created_at', type: 'TIMESTAMP', nullable: false, defaultVal: 'CURRENT_TIMESTAMP', description: 'Timestamp' },
    ],
  },
  faculties: {
    name: 'faculties',
    description: 'Professors, lecturers, and academic teaching staff dossiers',
    rowCount: 10,
    primaryKey: 'id',
    columns: [
      { field: 'id', type: 'VARCHAR(50)', nullable: false, key: 'PRI', description: 'Faculty ID' },
      { field: 'employee_code', type: 'VARCHAR(30)', nullable: false, key: 'UNI', description: 'Employee Identification Code' },
      { field: 'first_name', type: 'VARCHAR(80)', nullable: false, description: 'First Name' },
      { field: 'last_name', type: 'VARCHAR(80)', nullable: false, description: 'Last Name' },
      { field: 'email', type: 'VARCHAR(120)', nullable: false, key: 'UNI', description: 'Institutional Email' },
      { field: 'phone', type: 'VARCHAR(30)', nullable: false, description: 'Contact Number' },
      { field: 'department', type: 'VARCHAR(150)', nullable: false, key: 'MUL', description: 'Department Name' },
      { field: 'designation', type: 'VARCHAR(80)', nullable: false, description: 'Academic Rank / Position' },
      { field: 'qualification', type: 'VARCHAR(150)', nullable: false, description: 'Degrees & Universities' },
      { field: 'specialization', type: 'VARCHAR(200)', nullable: true, description: 'Research Domain & Focus Area' },
      { field: 'date_of_joining', type: 'DATE', nullable: false, description: 'Appointment Date' },
      { field: 'experience_years', type: 'INT UNSIGNED', nullable: false, defaultVal: '0', description: 'Years of Experience' },
      { field: 'status', type: "ENUM('Active','On Leave','Resigned','Retired')", nullable: false, defaultVal: "'Active'", description: 'Service Status' },
      { field: 'is_coordinator_eligible', type: 'BOOLEAN', nullable: false, defaultVal: 'TRUE', description: 'Class Teacher Eligibility' },
      { field: 'office_room', type: 'VARCHAR(60)', nullable: true, description: 'Cabin / Office Room' },
      { field: 'created_at', type: 'TIMESTAMP', nullable: false, defaultVal: 'CURRENT_TIMESTAMP', description: 'Record Created' },
    ],
  },
  subjects: {
    name: 'subjects',
    description: 'Curriculum catalog, credit weighting, lecture/practical hours, and syllabi',
    rowCount: 13,
    primaryKey: 'id',
    columns: [
      { field: 'id', type: 'VARCHAR(50)', nullable: false, key: 'PRI', description: 'Unique Subject ID' },
      { field: 'code', type: 'VARCHAR(20)', nullable: false, key: 'UNI', description: 'Subject Code (e.g. CS401)' },
      { field: 'name', type: 'VARCHAR(180)', nullable: false, description: 'Course Title' },
      { field: 'department', type: 'VARCHAR(150)', nullable: false, key: 'MUL', description: 'Offering Department' },
      { field: 'degree', type: 'VARCHAR(50)', nullable: false, description: 'Degree Program (B.Tech/M.Tech/MBA)' },
      { field: 'semester', type: 'TINYINT UNSIGNED', nullable: false, description: 'Curriculum Semester' },
      { field: 'type', type: "ENUM('Theory','Practical / Lab','Elective','Integrated (Theory + Lab)','Seminar / Project')", nullable: false, defaultVal: "'Theory'", description: 'Course Type' },
      { field: 'credits', type: 'TINYINT UNSIGNED', nullable: false, defaultVal: '3', description: 'Course Credit Points' },
      { field: 'lecture_hours_per_week', type: 'TINYINT UNSIGNED', nullable: false, defaultVal: '3', description: 'Lecture Workload' },
      { field: 'practical_hours_per_week', type: 'TINYINT UNSIGNED', nullable: false, defaultVal: '0', description: 'Lab Workload' },
      { field: 'status', type: "ENUM('Active','Draft','Archived')", nullable: false, defaultVal: "'Active'", description: 'Curriculum Status' },
      { field: 'description', type: 'TEXT', nullable: true, description: 'Syllabus Summary' },
      { field: 'created_at', type: 'TIMESTAMP', nullable: false, defaultVal: 'CURRENT_TIMESTAMP', description: 'Record Created' },
    ],
  },
  classes: {
    name: 'classes',
    description: 'Cohort divisions/sections with student capacity and semester allocations',
    rowCount: 10,
    primaryKey: 'id',
    foreignKeys: [{ column: 'academic_year_id', refTable: 'academic_years', refColumn: 'id' }],
    columns: [
      { field: 'id', type: 'VARCHAR(50)', nullable: false, key: 'PRI', description: 'Class Division ID' },
      { field: 'class_code', type: 'VARCHAR(30)', nullable: false, key: 'UNI', description: 'Division Code (e.g. CSE-3A)' },
      { field: 'name', type: 'VARCHAR(120)', nullable: false, description: 'Division Title' },
      { field: 'department', type: 'VARCHAR(150)', nullable: false, description: 'Host Department' },
      { field: 'degree', type: 'VARCHAR(50)', nullable: false, description: 'Degree (B.Tech/MBA/BCA)' },
      { field: 'semester', type: 'TINYINT UNSIGNED', nullable: false, description: 'Semester' },
      { field: 'section', type: 'VARCHAR(10)', nullable: false, description: 'Section Tag (A, B, C)' },
      { field: 'academic_year_id', type: 'VARCHAR(50)', nullable: false, key: 'MUL', description: 'Foreign Key to Academic Year' },
      { field: 'max_capacity', type: 'SMALLINT UNSIGNED', nullable: false, defaultVal: '60', description: 'Seating Capacity' },
      { field: 'room_number', type: 'VARCHAR(50)', nullable: true, description: 'Allocated Classroom' },
      { field: 'status', type: "ENUM('Active','Upcoming','Archived')", nullable: false, defaultVal: "'Active'", description: 'Division Status' },
      { field: 'created_at', type: 'TIMESTAMP', nullable: false, defaultVal: 'CURRENT_TIMESTAMP', description: 'Creation Date' },
    ],
  },
  students: {
    name: 'students',
    description: 'Enrolled student roster, GPA tracking, attendance, and section assignments',
    rowCount: 20,
    primaryKey: 'id',
    foreignKeys: [{ column: 'current_class_id', refTable: 'classes', refColumn: 'id' }],
    columns: [
      { field: 'id', type: 'VARCHAR(50)', nullable: false, key: 'PRI', description: 'Student Primary ID' },
      { field: 'registration_no', type: 'VARCHAR(40)', nullable: false, key: 'UNI', description: 'University Registration ID' },
      { field: 'roll_no', type: 'VARCHAR(30)', nullable: false, key: 'UNI', description: 'Institutional Roll Number' },
      { field: 'first_name', type: 'VARCHAR(80)', nullable: false, description: 'First Name' },
      { field: 'last_name', type: 'VARCHAR(80)', nullable: false, description: 'Last Name' },
      { field: 'email', type: 'VARCHAR(120)', nullable: false, key: 'UNI', description: 'Student Email' },
      { field: 'phone', type: 'VARCHAR(30)', nullable: false, description: 'Student Phone' },
      { field: 'department', type: 'VARCHAR(150)', nullable: false, key: 'MUL', description: 'Enrolled Department' },
      { field: 'degree', type: 'VARCHAR(50)', nullable: false, description: 'Degree Program' },
      { field: 'current_semester', type: 'TINYINT UNSIGNED', nullable: false, description: 'Current Semester' },
      { field: 'current_class_id', type: 'VARCHAR(50)', nullable: true, key: 'MUL', description: 'Class / Section Foreign Key' },
      { field: 'enrollment_date', type: 'DATE', nullable: false, description: 'Admission Date' },
      { field: 'status', type: "ENUM('Active','Inactive','Suspended','Graduated','Alumni')", nullable: false, defaultVal: "'Active'", description: 'Enrollment Status' },
      { field: 'gpa', type: 'DECIMAL(4,2)', nullable: false, defaultVal: '0.00', description: 'Cumulative Grade Point Average' },
      { field: 'attendance_percentage', type: 'DECIMAL(5,2)', nullable: false, defaultVal: '0.00', description: 'Attendance Record %' },
      { field: 'created_at', type: 'TIMESTAMP', nullable: false, defaultVal: 'CURRENT_TIMESTAMP', description: 'Creation Date' },
    ],
  },
  coordinator_assignments: {
    name: 'coordinator_assignments',
    description: 'Class teacher / coordinator appointments linking faculty, classes & terms',
    rowCount: 10,
    primaryKey: 'id',
    foreignKeys: [
      { column: 'class_id', refTable: 'classes', refColumn: 'id' },
      { column: 'faculty_id', refTable: 'faculties', refColumn: 'id' },
      { column: 'academic_year_id', refTable: 'academic_years', refColumn: 'id' },
    ],
    columns: [
      { field: 'id', type: 'VARCHAR(50)', nullable: false, key: 'PRI', description: 'Assignment ID' },
      { field: 'class_id', type: 'VARCHAR(50)', nullable: false, key: 'MUL', description: 'Target Class Foreign Key' },
      { field: 'faculty_id', type: 'VARCHAR(50)', nullable: false, key: 'MUL', description: 'Assigned Faculty Foreign Key' },
      { field: 'academic_year_id', type: 'VARCHAR(50)', nullable: false, key: 'MUL', description: 'Academic Year Foreign Key' },
      { field: 'assigned_date', type: 'DATE', nullable: false, description: 'Appointment Date' },
      { field: 'status', type: "ENUM('Active','Relieved','Transferred')", nullable: false, defaultVal: "'Active'", description: 'Assignment Status' },
      { field: 'remarks', type: 'TEXT', nullable: true, description: 'Administrative Notes' },
      { field: 'load_hours_per_week', type: 'TINYINT UNSIGNED', nullable: false, defaultVal: '3', description: 'Workload Credit' },
      { field: 'created_at', type: 'TIMESTAMP', nullable: false, defaultVal: 'CURRENT_TIMESTAMP', description: 'Creation Date' },
    ],
  },
  faculty_subject_allocations: {
    name: 'faculty_subject_allocations',
    description: 'M-to-N course teaching allocations linking faculty members to curriculum subjects',
    rowCount: 12,
    primaryKey: 'id',
    foreignKeys: [
      { column: 'faculty_id', refTable: 'faculties', refColumn: 'id' },
      { column: 'subject_id', refTable: 'subjects', refColumn: 'id' },
    ],
    columns: [
      { field: 'id', type: 'VARCHAR(50)', nullable: false, key: 'PRI', description: 'Allocation ID' },
      { field: 'faculty_id', type: 'VARCHAR(50)', nullable: false, key: 'MUL', description: 'Faculty Foreign Key' },
      { field: 'subject_id', type: 'VARCHAR(50)', nullable: false, key: 'MUL', description: 'Subject Foreign Key' },
      { field: 'role', type: 'VARCHAR(60)', nullable: false, defaultVal: "'Primary Instructor'", description: 'Teaching Role' },
      { field: 'created_at', type: 'TIMESTAMP', nullable: false, defaultVal: 'CURRENT_TIMESTAMP', description: 'Creation Date' },
    ],
  },
  activity_logs: {
    name: 'activity_logs',
    description: 'Immutable system audit trail tracking administrative actions and data changes',
    rowCount: 8,
    primaryKey: 'id',
    columns: [
      { field: 'id', type: 'VARCHAR(50)', nullable: false, key: 'PRI', description: 'Log Record ID' },
      { field: 'action', type: "ENUM('CREATE','UPDATE','DELETE','ASSIGN','SET_ACTIVE','RESET')", nullable: false, description: 'Action Performed' },
      { field: 'module', type: "ENUM('Students','Faculties','Subjects','Academic Years','Classes','Coordinators','System')", nullable: false, description: 'Target Module' },
      { field: 'description', type: 'TEXT', nullable: false, description: 'Event Summary' },
      { field: 'user_name', type: 'VARCHAR(80)', nullable: false, description: 'Operator Name' },
      { field: 'timestamp', type: 'TIMESTAMP', nullable: false, defaultVal: 'CURRENT_TIMESTAMP', description: 'Log Timestamp' },
    ],
  },
  course_trackers: {
    name: 'course_trackers',
    description: 'Theory and Practical/Lab syllabus trackers, curriculum progress, and subject ownership dossiers',
    rowCount: 2,
    primaryKey: 'id',
    columns: [
      { field: 'id', type: 'VARCHAR(50)', nullable: false, key: 'PRI', description: 'Course Tracker ID' },
      { field: 'course_code', type: 'VARCHAR(20)', nullable: false, key: 'MUL', description: 'Course Catalog Code (e.g. 25COPCC403)' },
      { field: 'course_name', type: 'VARCHAR(180)', nullable: false, description: 'Course Name' },
      { field: 'course_type', type: "ENUM('Theory','Lab')", nullable: false, description: 'Academic Track' },
      { field: 'department', type: 'VARCHAR(150)', nullable: false, description: 'Department Name' },
      { field: 'academic_year', type: 'VARCHAR(30)', nullable: false, description: 'Academic Year Term' },
      { field: 'curriculum', type: 'VARCHAR(30)', nullable: false, description: 'Curriculum Scheme' },
      { field: 'class_and_sem', type: 'VARCHAR(50)', nullable: false, description: 'Class Division & Semester' },
      { field: 'course_owner', type: 'VARCHAR(120)', nullable: false, description: 'Course Incharge Faculty' },
      { field: 'course_owner_faculty_id', type: 'VARCHAR(50)', nullable: true, key: 'MUL', description: 'Faculty Foreign Key' },
      { field: 'total_sessions', type: 'SMALLINT UNSIGNED', nullable: false, defaultVal: '0', description: 'Total Planned Sessions' },
      { field: 'conducted_sessions', type: 'SMALLINT UNSIGNED', nullable: false, defaultVal: '0', description: 'Delivered Sessions' },
      { field: 'pending_sessions', type: 'SMALLINT UNSIGNED', nullable: false, defaultVal: '0', description: 'Remaining Sessions' },
      { field: 'completion_percentage', type: 'DECIMAL(5,2)', nullable: false, defaultVal: '0.00', description: 'Syllabus Completion %' },
      { field: 'average_attendance_percentage', type: 'DECIMAL(5,2)', nullable: false, defaultVal: '0.00', description: 'Average Class Attendance %' },
      { field: 'created_at', type: 'TIMESTAMP', nullable: false, defaultVal: 'CURRENT_TIMESTAMP', description: 'Record Timestamp' },
    ],
  },
  attendance_control_info: {
    name: 'attendance_control_info',
    description: 'Attendance log metadata, Google Sheets sync references, and class coordinator tracking columns',
    rowCount: 10,
    primaryKey: 'id',
    columns: [
      { field: 'id', type: 'VARCHAR(50)', nullable: false, key: 'PRI', description: 'Control Item ID' },
      { field: 'course_tracker_id', type: 'VARCHAR(50)', nullable: false, key: 'MUL', description: 'Course Tracker Reference' },
      { field: 'sr_no', type: 'TINYINT UNSIGNED', nullable: false, description: 'Sequence Serial Number' },
      { field: 'title', type: 'VARCHAR(150)', nullable: false, description: 'Attendance Parameter Title' },
      { field: 'sheet_link', type: 'VARCHAR(255)', nullable: false, description: 'Master Spreadsheet URL' },
      { field: 'column_ref', type: 'VARCHAR(60)', nullable: true, description: 'Excel / Sheets Column Coordinate' },
      { field: 'created_at', type: 'TIMESTAMP', nullable: false, defaultVal: 'CURRENT_TIMESTAMP', description: 'Creation Timestamp' },
    ],
  },
  syllabus_sessions: {
    name: 'syllabus_sessions',
    description: 'Detailed lesson plans, lecture & lab sessions delivery log, planned vs conducted timelines, and pedagogy',
    rowCount: 20,
    primaryKey: 'id',
    columns: [
      { field: 'id', type: 'VARCHAR(50)', nullable: false, key: 'PRI', description: 'Session Unique ID' },
      { field: 'course_tracker_id', type: 'VARCHAR(50)', nullable: false, key: 'MUL', description: 'Parent Tracker ID' },
      { field: 'session_no', type: 'SMALLINT UNSIGNED', nullable: false, description: 'Chronological Session #' },
      { field: 'unit_name', type: 'VARCHAR(150)', nullable: false, description: 'Unit / Module Name' },
      { field: 'topic', type: 'TEXT', nullable: false, description: 'Topics Covered' },
      { field: 'planned_date', type: 'DATE', nullable: false, description: 'Target Date' },
      { field: 'conducted_date', type: 'DATE', nullable: false, description: 'Actual Conducted Date' },
      { field: 'status', type: "ENUM('Conducted','Pending','Rescheduled')", nullable: false, defaultVal: "'Conducted'", description: 'Execution Status' },
      { field: 'pedagogy', type: 'VARCHAR(200)', nullable: true, description: 'Teaching Methodology' },
      { field: 'batch', type: 'VARCHAR(30)', nullable: true, defaultVal: "'All'", description: 'Batch Partition' },
      { field: 'created_at', type: 'TIMESTAMP', nullable: false, defaultVal: 'CURRENT_TIMESTAMP', description: 'Created At' },
    ],
  },
  unit_test_marks: {
    name: 'unit_test_marks',
    description: 'Student continuous internal assessment (CIA 1 & 2) and MSE examination scores with pass/fail telemetry',
    rowCount: 68,
    primaryKey: 'id',
    columns: [
      { field: 'id', type: 'VARCHAR(50)', nullable: false, key: 'PRI', description: 'Evaluation Record ID' },
      { field: 'course_tracker_id', type: 'VARCHAR(50)', nullable: false, key: 'MUL', description: 'Course Tracker Reference' },
      { field: 'student_id', type: 'VARCHAR(50)', nullable: false, key: 'MUL', description: 'Student Foreign Key' },
      { field: 'roll_no', type: 'VARCHAR(30)', nullable: false, description: 'Class Roll No' },
      { field: 'student_name', type: 'VARCHAR(120)', nullable: false, description: 'Student Full Name' },
      { field: 'evaluation_type', type: "ENUM('CIA1','CIA2','MSE','LAB_CIA1','LAB_CIA2')", nullable: false, description: 'Assessment Type' },
      { field: 'marks_obtained', type: 'DECIMAL(5,2)', nullable: false, description: 'Score Scored' },
      { field: 'max_marks', type: 'DECIMAL(5,2)', nullable: false, defaultVal: '20.00', description: 'Maximum Marks' },
      { field: 'is_passed', type: 'BOOLEAN', nullable: false, defaultVal: 'TRUE', description: 'Passing Benchmark (≥40%)' },
      { field: 'remarks', type: 'VARCHAR(200)', nullable: true, description: 'Faculty Evaluation Remarks' },
      { field: 'created_at', type: 'TIMESTAMP', nullable: false, defaultVal: 'CURRENT_TIMESTAMP', description: 'Record Timestamp' },
    ],
  },
  users: {
    name: 'users',
    description: 'System user accounts and authentication credentials for Faculty, HOD, and Principal/Director',
    rowCount: 5,
    primaryKey: 'id',
    columns: [
      { field: 'id', type: 'VARCHAR(50)', nullable: false, key: 'PRI', description: 'Unique User Primary Key' },
      { field: 'employee_code', type: 'VARCHAR(30)', nullable: false, key: 'UNI', description: 'Staff Employee Identification' },
      { field: 'name', type: 'VARCHAR(120)', nullable: false, description: 'Full Name' },
      { field: 'email', type: 'VARCHAR(120)', nullable: false, key: 'UNI', description: 'Institutional Login Email' },
      { field: 'password_hash', type: 'VARCHAR(255)', nullable: false, description: 'Encrypted Credential Hash' },
      { field: 'role', type: "ENUM('Faculty','HOD','Principal/Director')", nullable: false, key: 'MUL', description: 'Institutional Role' },
      { field: 'department', type: 'VARCHAR(150)', nullable: true, key: 'MUL', description: 'Department Affiliation' },
      { field: 'designation', type: 'VARCHAR(100)', nullable: false, description: 'Academic Designation' },
      { field: 'phone', type: 'VARCHAR(30)', nullable: true, description: 'Contact Phone Number' },
      { field: 'status', type: "ENUM('Active','Pending_Approval','Suspended')", nullable: false, defaultVal: "'Active'", description: 'Account Status' },
      { field: 'last_login_at', type: 'TIMESTAMP', nullable: true, description: 'Last Login Timestamp' },
      { field: 'created_at', type: 'TIMESTAMP', nullable: false, defaultVal: 'CURRENT_TIMESTAMP', description: 'Account Creation Date' },
    ],
  },
};

/**
 * Generates an up-to-date, valid MySQL 8.0+ SQL dump string based on the live application state.
 */
export function generateLiveMySQLDump(params: {
  academicYears: AcademicYear[];
  faculties: Faculty[];
  subjects: Subject[];
  classes: ClassEntity[];
  students: Student[];
  assignments: CoordinatorAssignment[];
  activityLogs: ActivityLog[];
  courseTrackers?: CourseTrackerRecord[];
  studentPerformances?: StudentCoursePerformance[];
  users?: AppUser[];
}): string {
  const {
    academicYears,
    faculties,
    subjects,
    classes,
    students,
    assignments,
    activityLogs,
    courseTrackers = INITIAL_COURSE_TRACKERS,
    studentPerformances = INITIAL_SECO1_STUDENTS,
    users = INITIAL_USERS,
  } = params;

  const escapeSql = (str?: string | null): string => {
    if (str === undefined || str === null) return 'NULL';
    return `'${String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  };

  const lines: string[] = [];

  lines.push('-- ============================================================================');
  lines.push('-- MYCAGS: College Academics Governance & Management System');
  lines.push('-- Complete MySQL Database Dump (DDL + DML)');
  lines.push(`-- Generated: ${new Date().toISOString()}`);
  lines.push('-- Target: MySQL 8.0+ / MariaDB 10.5+ | Engine: InnoDB | utf8mb4');
  lines.push('-- ============================================================================');
  lines.push('');
  lines.push('SET FOREIGN_KEY_CHECKS = 0;');
  lines.push('SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";');
  lines.push('SET NAMES utf8mb4;');
  lines.push('');
  lines.push('CREATE DATABASE IF NOT EXISTS `college_academics_db`');
  lines.push('  CHARACTER SET utf8mb4');
  lines.push('  COLLATE utf8mb4_unicode_ci;');
  lines.push('');
  lines.push('USE `college_academics_db`;');
  lines.push('');

  // Drop tables in reverse order
  lines.push('DROP TABLE IF EXISTS `unit_test_marks`;');
  lines.push('DROP TABLE IF EXISTS `syllabus_sessions`;');
  lines.push('DROP TABLE IF EXISTS `attendance_control_info`;');
  lines.push('DROP TABLE IF EXISTS `course_trackers`;');
  lines.push('DROP TABLE IF EXISTS `activity_logs`;');
  lines.push('DROP TABLE IF EXISTS `faculty_subject_allocations`;');
  lines.push('DROP TABLE IF EXISTS `coordinator_assignments`;');
  lines.push('DROP TABLE IF EXISTS `students`;');
  lines.push('DROP TABLE IF EXISTS `classes`;');
  lines.push('DROP TABLE IF EXISTS `subjects`;');
  lines.push('DROP TABLE IF EXISTS `faculties`;');
  lines.push('DROP TABLE IF EXISTS `academic_events`;');
  lines.push('DROP TABLE IF EXISTS `academic_years`;');
  lines.push('DROP TABLE IF EXISTS `users`;');
  lines.push('DROP TABLE IF EXISTS `departments`;');
  lines.push('');

  // 1. Departments Table DDL
  lines.push('-- Table: departments');
  lines.push('CREATE TABLE `departments` (');
  lines.push('  `id` VARCHAR(50) NOT NULL,');
  lines.push('  `code` VARCHAR(20) NOT NULL,');
  lines.push('  `name` VARCHAR(150) NOT NULL,');
  lines.push('  `hod_name` VARCHAR(120) DEFAULT NULL,');
  lines.push('  `email` VARCHAR(120) DEFAULT NULL,');
  lines.push('  `phone` VARCHAR(30) DEFAULT NULL,');
  lines.push('  `location` VARCHAR(100) DEFAULT NULL,');
  lines.push("  `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',");
  lines.push('  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,');
  lines.push('  PRIMARY KEY (`id`),');
  lines.push('  UNIQUE KEY `idx_dept_code` (`code`),');
  lines.push('  UNIQUE KEY `idx_dept_name` (`name`)');
  lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
  lines.push('');

  // Departments Data
  lines.push('INSERT INTO `departments` (`id`, `code`, `name`, `hod_name`, `email`, `phone`, `location`, `status`) VALUES');
  lines.push("('dept-cse', 'CSE', 'Computer Science & Engineering', 'Dr. Rajesh Sharma', 'cse.hod@cags.edu', '+91 98231 44521', 'Academic Block A, 3rd Floor', 'Active'),");
  lines.push("('dept-aids', 'AIDS', 'Artificial Intelligence & Data Science', 'Dr. Vikram Malhotra', 'aids.hod@cags.edu', '+91 98450 11223', 'Academic Block A, 4th Floor', 'Active'),");
  lines.push("('dept-it', 'IT', 'Information Technology', 'Prof. Neha Gupta', 'it.hod@cags.edu', '+91 98111 22334', 'Academic Block A, 2nd Floor', 'Active'),");
  lines.push("('dept-ece', 'ECE', 'Electronics & Communication', 'Dr. Amit Patel', 'ece.hod@cags.edu', '+91 97234 55667', 'Academic Block B, 2nd Floor', 'Active'),");
  lines.push("('dept-me', 'MECH', 'Mechanical Engineering', 'Prof. Sunita Rao', 'mech.hod@cags.edu', '+91 98765 44321', 'Workshop Complex Block C', 'Active'),");
  lines.push("('dept-ce', 'CIVIL', 'Civil Engineering', 'Dr. Sanjay Verma', 'civil.hod@cags.edu', '+91 94567 88990', 'Infrastructure Block D', 'Active'),");
  lines.push("('dept-mba', 'MBA', 'Management Studies (MBA)', 'Prof. Meera Nair', 'mba.hod@cags.edu', '+91 98333 44556', 'Management Tower, 5th Floor', 'Active'),");
  lines.push("('dept-ca', 'CA', 'Computer Applications (BCA/MCA)', 'Dr. Arun Kumar', 'ca.hod@cags.edu', '+91 98222 33445', 'Computer Center Block B', 'Active');");
  lines.push('');

  // 1b. Users Table DDL
  lines.push('-- Table: users (Faculty, HOD, and Principal/Director Authentication & Credentials)');
  lines.push('CREATE TABLE `users` (');
  lines.push('  `id` VARCHAR(50) NOT NULL,');
  lines.push('  `employee_code` VARCHAR(30) NOT NULL,');
  lines.push('  `name` VARCHAR(120) NOT NULL,');
  lines.push('  `email` VARCHAR(120) NOT NULL,');
  lines.push('  `password_hash` VARCHAR(255) NOT NULL,');
  lines.push("  `role` ENUM('Faculty', 'HOD', 'Principal/Director') NOT NULL,");
  lines.push('  `department` VARCHAR(150) DEFAULT NULL,');
  lines.push('  `designation` VARCHAR(100) NOT NULL,');
  lines.push('  `phone` VARCHAR(30) DEFAULT NULL,');
  lines.push("  `status` ENUM('Active', 'Pending_Approval', 'Suspended') NOT NULL DEFAULT 'Active',");
  lines.push('  `last_login_at` TIMESTAMP NULL DEFAULT NULL,');
  lines.push('  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,');
  lines.push('  PRIMARY KEY (`id`),');
  lines.push('  UNIQUE KEY `idx_users_email` (`email`),');
  lines.push('  UNIQUE KEY `idx_users_emp_code` (`employee_code`),');
  lines.push('  KEY `idx_users_role` (`role`),');
  lines.push('  KEY `idx_users_dept` (`department`)');
  lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
  lines.push('');

  if (users.length > 0) {
    lines.push('INSERT INTO `users` (`id`, `employee_code`, `name`, `email`, `password_hash`, `role`, `department`, `designation`, `phone`, `status`, `last_login_at`, `created_at`) VALUES');
    const userRows = users.map((u, idx) => {
      const isLast = idx === users.length - 1;
      const pwdHash = '$2y$10$e8w.pUfXfG1LqX9D4yNeeOJ2aE7wG4b7zXzU7wKzF8mQ/hU8zYvOu'; // Demo bcrypt hash for 'Password@123'
      return `(${escapeSql(u.id)}, ${escapeSql(u.employeeCode)}, ${escapeSql(u.name)}, ${escapeSql(u.email)}, '${pwdHash}', ${escapeSql(u.role)}, ${escapeSql(u.department || null)}, ${escapeSql(u.designation)}, ${escapeSql(u.phone || null)}, ${escapeSql(u.status)}, ${u.lastLoginAt ? escapeSql(u.lastLoginAt.slice(0, 19).replace('T', ' ')) : 'NULL'}, ${escapeSql(u.createdAt.slice(0, 19).replace('T', ' '))})${isLast ? ';' : ','}`;
    });
    lines.push(...userRows);
    lines.push('');
  }
  lines.push('');

  // 2. Academic Years Table DDL
  lines.push('-- Table: academic_years');
  lines.push('CREATE TABLE `academic_years` (');
  lines.push('  `id` VARCHAR(50) NOT NULL,');
  lines.push('  `code` VARCHAR(30) NOT NULL,');
  lines.push('  `name` VARCHAR(100) NOT NULL,');
  lines.push("  `term` ENUM('ODD', 'EVEN', 'ANNUAL') NOT NULL DEFAULT 'ODD',");
  lines.push('  `start_date` DATE NOT NULL,');
  lines.push('  `end_date` DATE NOT NULL,');
  lines.push('  `is_active` BOOLEAN NOT NULL DEFAULT FALSE,');
  lines.push('  `notes` TEXT DEFAULT NULL,');
  lines.push('  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,');
  lines.push('  PRIMARY KEY (`id`),');
  lines.push('  UNIQUE KEY `idx_ay_code` (`code`)');
  lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
  lines.push('');

  if (academicYears.length > 0) {
    lines.push('INSERT INTO `academic_years` (`id`, `code`, `name`, `term`, `start_date`, `end_date`, `is_active`, `notes`) VALUES');
    const ayRows = academicYears.map((ay, idx) => {
      const isLast = idx === academicYears.length - 1;
      return `(${escapeSql(ay.id)}, ${escapeSql(ay.code)}, ${escapeSql(ay.name)}, ${escapeSql(ay.term || 'ODD')}, ${escapeSql(ay.startDate)}, ${escapeSql(ay.endDate)}, ${ay.isActive ? 'TRUE' : 'FALSE'}, ${escapeSql(ay.notes)})${isLast ? ';' : ','}`;
    });
    lines.push(...ayRows);
    lines.push('');
  }

  // 3. Faculties Table DDL
  lines.push('-- Table: faculties');
  lines.push('CREATE TABLE `faculties` (');
  lines.push('  `id` VARCHAR(50) NOT NULL,');
  lines.push('  `employee_code` VARCHAR(30) NOT NULL,');
  lines.push('  `first_name` VARCHAR(80) NOT NULL,');
  lines.push('  `last_name` VARCHAR(80) NOT NULL,');
  lines.push('  `email` VARCHAR(120) NOT NULL,');
  lines.push('  `phone` VARCHAR(30) NOT NULL,');
  lines.push('  `department` VARCHAR(150) NOT NULL,');
  lines.push('  `designation` VARCHAR(80) NOT NULL,');
  lines.push('  `qualification` VARCHAR(150) NOT NULL,');
  lines.push('  `specialization` VARCHAR(200) DEFAULT NULL,');
  lines.push('  `date_of_joining` DATE NOT NULL,');
  lines.push('  `experience_years` INT UNSIGNED NOT NULL DEFAULT 0,');
  lines.push("  `status` ENUM('Active', 'On Leave', 'Resigned', 'Retired') NOT NULL DEFAULT 'Active',");
  lines.push('  `is_coordinator_eligible` BOOLEAN NOT NULL DEFAULT TRUE,');
  lines.push('  `office_room` VARCHAR(60) DEFAULT NULL,');
  lines.push('  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,');
  lines.push('  PRIMARY KEY (`id`),');
  lines.push('  UNIQUE KEY `idx_faculty_emp_code` (`employee_code`),');
  lines.push('  UNIQUE KEY `idx_faculty_email` (`email`)');
  lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
  lines.push('');

  if (faculties.length > 0) {
    lines.push('INSERT INTO `faculties` (`id`, `employee_code`, `first_name`, `last_name`, `email`, `phone`, `department`, `designation`, `qualification`, `specialization`, `date_of_joining`, `experience_years`, `status`, `is_coordinator_eligible`, `office_room`) VALUES');
    const facRows = faculties.map((f, idx) => {
      const isLast = idx === faculties.length - 1;
      return `(${escapeSql(f.id)}, ${escapeSql(f.employeeCode)}, ${escapeSql(f.firstName)}, ${escapeSql(f.lastName)}, ${escapeSql(f.email)}, ${escapeSql(f.phone)}, ${escapeSql(f.department)}, ${escapeSql(f.designation)}, ${escapeSql(f.qualification)}, ${escapeSql(f.specialization || '')}, ${escapeSql(f.dateOfJoining)}, ${Number(f.experienceYears) || 0}, ${escapeSql(f.status)}, ${f.isCoordinatorEligible ? 'TRUE' : 'FALSE'}, ${escapeSql(f.officeRoom || '')})${isLast ? ';' : ','}`;
    });
    lines.push(...facRows);
    lines.push('');
  }

  // 4. Subjects Table DDL
  lines.push('-- Table: subjects');
  lines.push('CREATE TABLE `subjects` (');
  lines.push('  `id` VARCHAR(50) NOT NULL,');
  lines.push('  `code` VARCHAR(20) NOT NULL,');
  lines.push('  `name` VARCHAR(180) NOT NULL,');
  lines.push('  `department` VARCHAR(150) NOT NULL,');
  lines.push('  `degree` VARCHAR(50) NOT NULL,');
  lines.push('  `semester` TINYINT UNSIGNED NOT NULL,');
  lines.push("  `type` ENUM('Theory', 'Practical / Lab', 'Elective', 'Integrated (Theory + Lab)', 'Seminar / Project') NOT NULL DEFAULT 'Theory',");
  lines.push('  `credits` TINYINT UNSIGNED NOT NULL DEFAULT 3,');
  lines.push('  `lecture_hours_per_week` TINYINT UNSIGNED NOT NULL DEFAULT 3,');
  lines.push('  `practical_hours_per_week` TINYINT UNSIGNED NOT NULL DEFAULT 0,');
  lines.push("  `status` ENUM('Active', 'Draft', 'Archived') NOT NULL DEFAULT 'Active',");
  lines.push('  `description` TEXT DEFAULT NULL,');
  lines.push('  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,');
  lines.push('  PRIMARY KEY (`id`),');
  lines.push('  UNIQUE KEY `idx_subject_code` (`code`)');
  lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
  lines.push('');

  if (subjects.length > 0) {
    lines.push('INSERT INTO `subjects` (`id`, `code`, `name`, `department`, `degree`, `semester`, `type`, `credits`, `lecture_hours_per_week`, `practical_hours_per_week`, `status`, `description`) VALUES');
    const subRows = subjects.map((s, idx) => {
      const isLast = idx === subjects.length - 1;
      return `(${escapeSql(s.id)}, ${escapeSql(s.code)}, ${escapeSql(s.name)}, ${escapeSql(s.department)}, ${escapeSql(s.degree)}, ${Number(s.semester) || 1}, ${escapeSql(s.type)}, ${Number(s.credits) || 3}, ${Number(s.lectureHoursPerWeek) || 3}, ${Number(s.practicalHoursPerWeek) || 0}, ${escapeSql(s.status)}, ${escapeSql(s.description || '')})${isLast ? ';' : ','}`;
    });
    lines.push(...subRows);
    lines.push('');
  }

  // 5. Classes Table DDL
  lines.push('-- Table: classes');
  lines.push('CREATE TABLE `classes` (');
  lines.push('  `id` VARCHAR(50) NOT NULL,');
  lines.push('  `class_code` VARCHAR(30) NOT NULL,');
  lines.push('  `name` VARCHAR(120) NOT NULL,');
  lines.push('  `department` VARCHAR(150) NOT NULL,');
  lines.push('  `degree` VARCHAR(50) NOT NULL,');
  lines.push('  `semester` TINYINT UNSIGNED NOT NULL,');
  lines.push('  `section` VARCHAR(10) NOT NULL,');
  lines.push('  `academic_year_id` VARCHAR(50) NOT NULL,');
  lines.push('  `max_capacity` SMALLINT UNSIGNED NOT NULL DEFAULT 60,');
  lines.push('  `room_number` VARCHAR(50) DEFAULT NULL,');
  lines.push("  `status` ENUM('Active', 'Upcoming', 'Archived') NOT NULL DEFAULT 'Active',");
  lines.push('  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,');
  lines.push('  PRIMARY KEY (`id`),');
  lines.push('  UNIQUE KEY `idx_class_code` (`class_code`)');
  lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
  lines.push('');

  if (classes.length > 0) {
    lines.push('INSERT INTO `classes` (`id`, `class_code`, `name`, `department`, `degree`, `semester`, `section`, `academic_year_id`, `max_capacity`, `room_number`, `status`) VALUES');
    const classRows = classes.map((c, idx) => {
      const isLast = idx === classes.length - 1;
      const classCode = c.name.split('-')[0]?.trim() || c.id;
      return `(${escapeSql(c.id)}, ${escapeSql(classCode)}, ${escapeSql(c.name)}, ${escapeSql(c.department)}, ${escapeSql(c.degree)}, ${Number(c.semester) || 1}, ${escapeSql(c.section)}, ${escapeSql(c.academicYearId)}, ${Number(c.capacity) || 60}, ${escapeSql(c.roomNumber || '')}, 'Active')${isLast ? ';' : ','}`;
    });
    lines.push(...classRows);
    lines.push('');
  }

  // 6. Students Table DDL
  lines.push('-- Table: students');
  lines.push('CREATE TABLE `students` (');
  lines.push('  `id` VARCHAR(50) NOT NULL,');
  lines.push('  `registration_no` VARCHAR(40) NOT NULL,');
  lines.push('  `roll_no` VARCHAR(30) NOT NULL,');
  lines.push('  `first_name` VARCHAR(80) NOT NULL,');
  lines.push('  `last_name` VARCHAR(80) NOT NULL,');
  lines.push('  `email` VARCHAR(120) NOT NULL,');
  lines.push('  `phone` VARCHAR(30) NOT NULL,');
  lines.push('  `department` VARCHAR(150) NOT NULL,');
  lines.push('  `degree` VARCHAR(50) NOT NULL,');
  lines.push('  `current_semester` TINYINT UNSIGNED NOT NULL,');
  lines.push('  `current_class_id` VARCHAR(50) DEFAULT NULL,');
  lines.push('  `enrollment_date` DATE NOT NULL,');
  lines.push("  `status` ENUM('Active', 'Inactive', 'Suspended', 'Graduated', 'Alumni') NOT NULL DEFAULT 'Active',");
  lines.push('  `gpa` DECIMAL(4, 2) NOT NULL DEFAULT 0.00,');
  lines.push('  `attendance_percentage` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,');
  lines.push('  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,');
  lines.push('  PRIMARY KEY (`id`),');
  lines.push('  UNIQUE KEY `idx_student_reg_no` (`registration_no`),');
  lines.push('  UNIQUE KEY `idx_student_roll_no` (`roll_no`),');
  lines.push('  UNIQUE KEY `idx_student_email` (`email`)');
  lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
  lines.push('');

  if (students.length > 0) {
    lines.push('INSERT INTO `students` (`id`, `registration_no`, `roll_no`, `first_name`, `last_name`, `email`, `phone`, `department`, `degree`, `current_semester`, `current_class_id`, `enrollment_date`, `status`, `gpa`, `attendance_percentage`) VALUES');
    const stuRows = students.map((s, idx) => {
      const isLast = idx === students.length - 1;
      const regNo = s.prnNo || s.rollNo;
      const enrollDate = s.createdAt?.split('T')[0] || `${s.admissionYear || 2023}-08-01`;
      return `(${escapeSql(s.id)}, ${escapeSql(regNo)}, ${escapeSql(s.rollNo)}, ${escapeSql(s.firstName)}, ${escapeSql(s.lastName)}, ${escapeSql(s.email)}, ${escapeSql(s.phone)}, ${escapeSql(s.department)}, ${escapeSql(s.degree)}, ${Number(s.semester) || 1}, ${escapeSql(s.classId || null)}, ${escapeSql(enrollDate)}, ${escapeSql(s.status)}, ${Number(s.cgpa) || 0}, ${Number(s.attendancePercent) || 0})${isLast ? ';' : ','}`;
    });
    lines.push(...stuRows);
    lines.push('');
  }

  // 7. Coordinator Assignments Table DDL
  lines.push('-- Table: coordinator_assignments');
  lines.push('CREATE TABLE `coordinator_assignments` (');
  lines.push('  `id` VARCHAR(50) NOT NULL,');
  lines.push('  `class_id` VARCHAR(50) NOT NULL,');
  lines.push('  `faculty_id` VARCHAR(50) NOT NULL,');
  lines.push('  `academic_year_id` VARCHAR(50) NOT NULL,');
  lines.push('  `assigned_date` DATE NOT NULL,');
  lines.push("  `status` ENUM('Active', 'Relieved', 'Transferred') NOT NULL DEFAULT 'Active',");
  lines.push('  `remarks` TEXT DEFAULT NULL,');
  lines.push('  `load_hours_per_week` TINYINT UNSIGNED NOT NULL DEFAULT 3,');
  lines.push('  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,');
  lines.push('  PRIMARY KEY (`id`)');
  lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
  lines.push('');

  if (assignments.length > 0) {
    lines.push('INSERT INTO `coordinator_assignments` (`id`, `class_id`, `faculty_id`, `academic_year_id`, `assigned_date`, `status`, `remarks`, `load_hours_per_week`) VALUES');
    const assignRows = assignments.map((a, idx) => {
      const isLast = idx === assignments.length - 1;
      return `(${escapeSql(a.id)}, ${escapeSql(a.classId)}, ${escapeSql(a.facultyId)}, ${escapeSql(a.academicYearId)}, ${escapeSql(a.assignedDate)}, ${escapeSql(a.status)}, ${escapeSql(a.remarks || '')}, ${Number(a.loadHoursPerWeek) || 3})${isLast ? ';' : ','}`;
    });
    lines.push(...assignRows);
    lines.push('');
  }

  // 8. Faculty Subject Allocations
  lines.push('-- Table: faculty_subject_allocations');
  lines.push('CREATE TABLE `faculty_subject_allocations` (');
  lines.push('  `id` VARCHAR(50) NOT NULL,');
  lines.push('  `faculty_id` VARCHAR(50) NOT NULL,');
  lines.push('  `subject_id` VARCHAR(50) NOT NULL,');
  lines.push("  `role` VARCHAR(60) NOT NULL DEFAULT 'Primary Instructor',");
  lines.push('  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,');
  lines.push('  PRIMARY KEY (`id`)');
  lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
  lines.push('');

  const allocRows: string[] = [];
  let allocCounter = 1;
  subjects.forEach((subj) => {
    if (subj.assignedFacultyIds && subj.assignedFacultyIds.length > 0) {
      subj.assignedFacultyIds.forEach((facId) => {
        allocRows.push(
          `('fsa-${String(allocCounter++).padStart(2, '0')}', ${escapeSql(facId)}, ${escapeSql(subj.id)}, 'Primary Instructor')`
        );
      });
    }
  });

  if (allocRows.length > 0) {
    lines.push('INSERT INTO `faculty_subject_allocations` (`id`, `faculty_id`, `subject_id`, `role`) VALUES');
    lines.push(allocRows.join(',\n') + ';');
    lines.push('');
  }

  // 9. Activity Logs
  lines.push('-- Table: activity_logs');
  lines.push('CREATE TABLE `activity_logs` (');
  lines.push('  `id` VARCHAR(50) NOT NULL,');
  lines.push("  `action` ENUM('CREATE', 'UPDATE', 'DELETE', 'ASSIGN', 'SET_ACTIVE', 'RESET') NOT NULL,");
  lines.push("  `module` ENUM('Students', 'Faculties', 'Subjects', 'Academic Years', 'Classes', 'Coordinators', 'System') NOT NULL,");
  lines.push('  `description` TEXT NOT NULL,');
  lines.push('  `user_name` VARCHAR(80) NOT NULL,');
  lines.push('  `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,');
  lines.push('  PRIMARY KEY (`id`)');
  lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
  lines.push('');

  if (activityLogs.length > 0) {
    lines.push('INSERT INTO `activity_logs` (`id`, `action`, `module`, `description`, `user_name`, `timestamp`) VALUES');
    const logRows = activityLogs.map((l, idx) => {
      const isLast = idx === activityLogs.length - 1;
      return `(${escapeSql(l.id)}, ${escapeSql(l.action)}, ${escapeSql(l.module)}, ${escapeSql(l.description)}, ${escapeSql(l.user)}, ${escapeSql(l.timestamp)})${isLast ? ';' : ','}`;
    });
    lines.push(...logRows);
    lines.push('');
  }

  // 10. Course Trackers Table DDL
  lines.push('-- Table: course_trackers');
  lines.push('CREATE TABLE `course_trackers` (');
  lines.push('  `id` VARCHAR(50) NOT NULL,');
  lines.push('  `course_code` VARCHAR(20) NOT NULL,');
  lines.push('  `course_name` VARCHAR(180) NOT NULL,');
  lines.push("  `course_type` ENUM('Theory', 'Lab') NOT NULL,");
  lines.push('  `department` VARCHAR(150) NOT NULL,');
  lines.push('  `academic_year` VARCHAR(30) NOT NULL,');
  lines.push('  `curriculum` VARCHAR(30) NOT NULL,');
  lines.push('  `class_and_sem` VARCHAR(50) NOT NULL,');
  lines.push('  `course_owner` VARCHAR(120) NOT NULL,');
  lines.push('  `course_owner_faculty_id` VARCHAR(50) DEFAULT NULL,');
  lines.push('  `total_sessions` SMALLINT UNSIGNED NOT NULL DEFAULT 0,');
  lines.push('  `conducted_sessions` SMALLINT UNSIGNED NOT NULL DEFAULT 0,');
  lines.push('  `pending_sessions` SMALLINT UNSIGNED NOT NULL DEFAULT 0,');
  lines.push('  `completion_percentage` DECIMAL(5,2) NOT NULL DEFAULT 0.00,');
  lines.push('  `average_attendance_percentage` DECIMAL(5,2) NOT NULL DEFAULT 0.00,');
  lines.push('  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,');
  lines.push('  PRIMARY KEY (`id`),');
  lines.push('  KEY `idx_ct_course_code` (`course_code`),');
  lines.push('  KEY `idx_ct_course_owner_faculty_id` (`course_owner_faculty_id`),');
  lines.push('  CONSTRAINT `fk_ct_faculty` FOREIGN KEY (`course_owner_faculty_id`) REFERENCES `faculties` (`id`) ON DELETE SET NULL ON UPDATE CASCADE');
  lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
  lines.push('');

  if (courseTrackers.length > 0) {
    lines.push('INSERT INTO `course_trackers` (`id`, `course_code`, `course_name`, `course_type`, `department`, `academic_year`, `curriculum`, `class_and_sem`, `course_owner`, `course_owner_faculty_id`, `total_sessions`, `conducted_sessions`, `pending_sessions`, `completion_percentage`, `average_attendance_percentage`) VALUES');
    const ctRows = courseTrackers.map((ct, idx) => {
      const isLast = idx === courseTrackers.length - 1;
      return `(${escapeSql(ct.id)}, ${escapeSql(ct.courseCode)}, ${escapeSql(ct.courseName)}, ${escapeSql(ct.courseType)}, ${escapeSql(ct.department)}, ${escapeSql(ct.academicYear)}, ${escapeSql(ct.curriculum)}, ${escapeSql(ct.classAndSem)}, ${escapeSql(ct.courseOwner)}, ${escapeSql(ct.courseOwnerFacultyId)}, ${ct.totalSessions}, ${ct.conductedSessions}, ${ct.pendingSessions}, ${ct.completionPercentage}, ${ct.averageAttendancePercentage})${isLast ? ';' : ','}`;
    });
    lines.push(...ctRows);
    lines.push('');
  }

  // 11. Attendance Control Info Table DDL
  lines.push('-- Table: attendance_control_info');
  lines.push('CREATE TABLE `attendance_control_info` (');
  lines.push('  `id` VARCHAR(50) NOT NULL,');
  lines.push('  `course_tracker_id` VARCHAR(50) NOT NULL,');
  lines.push('  `sr_no` TINYINT UNSIGNED NOT NULL,');
  lines.push('  `title` VARCHAR(150) NOT NULL,');
  lines.push('  `sheet_link` VARCHAR(255) NOT NULL,');
  lines.push('  `column_ref` VARCHAR(60) DEFAULT NULL,');
  lines.push('  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,');
  lines.push('  PRIMARY KEY (`id`),');
  lines.push('  KEY `idx_aci_course_tracker_id` (`course_tracker_id`),');
  lines.push('  CONSTRAINT `fk_aci_tracker` FOREIGN KEY (`course_tracker_id`) REFERENCES `course_trackers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE');
  lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
  lines.push('');

  const allControlItems = courseTrackers.flatMap((ct) =>
    ct.attendanceControlItems.map((item) => ({
      id: `aci-${ct.id}-${item.srNo}`,
      trackerId: ct.id,
      srNo: item.srNo,
      title: item.title,
      sheetLink: item.sheetLink,
      columnRef: item.columnRef,
    }))
  );

  if (allControlItems.length > 0) {
    lines.push('INSERT INTO `attendance_control_info` (`id`, `course_tracker_id`, `sr_no`, `title`, `sheet_link`, `column_ref`) VALUES');
    const aciRows = allControlItems.map((item, idx) => {
      const isLast = idx === allControlItems.length - 1;
      return `(${escapeSql(item.id)}, ${escapeSql(item.trackerId)}, ${item.srNo}, ${escapeSql(item.title)}, ${escapeSql(item.sheetLink)}, ${escapeSql(item.columnRef)})${isLast ? ';' : ','}`;
    });
    lines.push(...aciRows);
    lines.push('');
  }

  // 12. Syllabus Sessions Table DDL
  lines.push('-- Table: syllabus_sessions');
  lines.push('CREATE TABLE `syllabus_sessions` (');
  lines.push('  `id` VARCHAR(50) NOT NULL,');
  lines.push('  `course_tracker_id` VARCHAR(50) NOT NULL,');
  lines.push('  `session_no` SMALLINT UNSIGNED NOT NULL,');
  lines.push('  `unit_name` VARCHAR(150) NOT NULL,');
  lines.push('  `topic` TEXT NOT NULL,');
  lines.push('  `planned_date` DATE NOT NULL,');
  lines.push('  `conducted_date` DATE NOT NULL,');
  lines.push("  `status` ENUM('Conducted', 'Pending', 'Rescheduled') NOT NULL DEFAULT 'Conducted',");
  lines.push('  `pedagogy` VARCHAR(200) DEFAULT NULL,');
  lines.push("  `batch` VARCHAR(30) DEFAULT 'All',");
  lines.push('  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,');
  lines.push('  PRIMARY KEY (`id`),');
  lines.push('  KEY `idx_ss_course_tracker_id` (`course_tracker_id`),');
  lines.push('  CONSTRAINT `fk_ss_tracker` FOREIGN KEY (`course_tracker_id`) REFERENCES `course_trackers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE');
  lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
  lines.push('');

  const allSyllabusSessions = courseTrackers.flatMap((ct) =>
    ct.syllabusSessions.map((s) => ({
      ...s,
      trackerId: ct.id,
    }))
  );

  if (allSyllabusSessions.length > 0) {
    lines.push('INSERT INTO `syllabus_sessions` (`id`, `course_tracker_id`, `session_no`, `unit_name`, `topic`, `planned_date`, `conducted_date`, `status`, `pedagogy`, `batch`) VALUES');
    const ssRows = allSyllabusSessions.map((s, idx) => {
      const isLast = idx === allSyllabusSessions.length - 1;
      return `(${escapeSql(s.id)}, ${escapeSql(s.trackerId)}, ${s.sessionNo}, ${escapeSql(s.unitName)}, ${escapeSql(s.topic)}, ${escapeSql(s.plannedDate)}, ${escapeSql(s.conductedDate)}, ${escapeSql(s.status)}, ${escapeSql(s.pedagogy || 'Chalk & Board, Packet Tracer')}, ${escapeSql(s.batch || 'All')})${isLast ? ';' : ','}`;
    });
    lines.push(...ssRows);
    lines.push('');
  }

  // 13. Unit Test Marks Table DDL
  lines.push('-- Table: unit_test_marks');
  lines.push('CREATE TABLE `unit_test_marks` (');
  lines.push('  `id` VARCHAR(50) NOT NULL,');
  lines.push('  `course_tracker_id` VARCHAR(50) NOT NULL,');
  lines.push('  `student_id` VARCHAR(50) NOT NULL,');
  lines.push('  `roll_no` VARCHAR(30) NOT NULL,');
  lines.push('  `student_name` VARCHAR(120) NOT NULL,');
  lines.push("  `evaluation_type` ENUM('CIA1', 'CIA2', 'MSE', 'LAB_CIA1', 'LAB_CIA2') NOT NULL,");
  lines.push('  `marks_obtained` DECIMAL(5,2) NOT NULL,');
  lines.push('  `max_marks` DECIMAL(5,2) NOT NULL DEFAULT 20.00,');
  lines.push('  `is_passed` BOOLEAN NOT NULL DEFAULT TRUE,');
  lines.push('  `remarks` VARCHAR(200) DEFAULT NULL,');
  lines.push('  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,');
  lines.push('  PRIMARY KEY (`id`),');
  lines.push('  KEY `idx_utm_course_tracker_id` (`course_tracker_id`),');
  lines.push('  KEY `idx_utm_student_id` (`student_id`),');
  lines.push('  CONSTRAINT `fk_utm_tracker` FOREIGN KEY (`course_tracker_id`) REFERENCES `course_trackers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE');
  lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
  lines.push('');

  const evaluationRows: {
    id: string;
    trackerId: string;
    studentId: string;
    rollNo: string;
    studentName: string;
    evaluationType: string;
    marksObtained: number;
    maxMarks: number;
    isPassed: boolean;
    remarks: string;
  }[] = [];

  studentPerformances.forEach((sp) => {
    evaluationRows.push({
      id: `ev-${sp.studentId}-cia1`,
      trackerId: 'tracker-theory-cn',
      studentId: sp.studentId,
      rollNo: sp.rollNo,
      studentName: sp.studentName,
      evaluationType: 'CIA1',
      marksObtained: sp.theoryMarks.cia1Marks,
      maxMarks: 20,
      isPassed: sp.theoryMarks.cia1Passed,
      remarks: sp.theoryMarks.cia1Passed ? 'Satisfactory' : 'Needs Remedial',
    });
    evaluationRows.push({
      id: `ev-${sp.studentId}-cia2`,
      trackerId: 'tracker-theory-cn',
      studentId: sp.studentId,
      rollNo: sp.rollNo,
      studentName: sp.studentName,
      evaluationType: 'CIA2',
      marksObtained: sp.theoryMarks.cia2Marks,
      maxMarks: 20,
      isPassed: sp.theoryMarks.cia2Passed,
      remarks: sp.theoryMarks.cia2Passed ? 'Satisfactory' : 'Needs Remedial',
    });
    evaluationRows.push({
      id: `ev-${sp.studentId}-mse`,
      trackerId: 'tracker-theory-cn',
      studentId: sp.studentId,
      rollNo: sp.rollNo,
      studentName: sp.studentName,
      evaluationType: 'MSE',
      marksObtained: sp.theoryMarks.mseMarks,
      maxMarks: 30,
      isPassed: sp.theoryMarks.mseMarks >= 12,
      remarks: 'Mid Semester Exam',
    });
    evaluationRows.push({
      id: `ev-${sp.studentId}-lab1`,
      trackerId: 'tracker-lab-cn',
      studentId: sp.studentId,
      rollNo: sp.rollNo,
      studentName: sp.studentName,
      evaluationType: 'LAB_CIA1',
      marksObtained: sp.labMarks.cia1Marks,
      maxMarks: 20,
      isPassed: sp.labMarks.cia1Passed,
      remarks: 'Practical Execution & Viva',
    });
  });

  if (evaluationRows.length > 0) {
    lines.push('INSERT INTO `unit_test_marks` (`id`, `course_tracker_id`, `student_id`, `roll_no`, `student_name`, `evaluation_type`, `marks_obtained`, `max_marks`, `is_passed`, `remarks`) VALUES');
    const evSqlRows = evaluationRows.map((ev, idx) => {
      const isLast = idx === evaluationRows.length - 1;
      return `(${escapeSql(ev.id)}, ${escapeSql(ev.trackerId)}, ${escapeSql(ev.studentId)}, ${escapeSql(ev.rollNo)}, ${escapeSql(ev.studentName)}, ${escapeSql(ev.evaluationType)}, ${ev.marksObtained}, ${ev.maxMarks}, ${ev.isPassed ? 1 : 0}, ${escapeSql(ev.remarks)})${isLast ? ';' : ','}`;
    });
    lines.push(...evSqlRows);
    lines.push('');
  }

  // Views
  lines.push('-- View: vw_active_coordinators');
  lines.push('CREATE OR REPLACE VIEW `vw_active_coordinators` AS');
  lines.push('SELECT');
  lines.push('  ca.id AS assignment_id,');
  lines.push('  c.class_code,');
  lines.push('  c.name AS class_name,');
  lines.push("  CONCAT(f.first_name, ' ', f.last_name) AS coordinator_name,");
  lines.push('  f.email AS faculty_email,');
  lines.push('  f.department,');
  lines.push('  ay.name AS academic_year,');
  lines.push('  ca.load_hours_per_week');
  lines.push('FROM `coordinator_assignments` ca');
  lines.push('JOIN `classes` c ON ca.class_id = c.id');
  lines.push('JOIN `faculties` f ON ca.faculty_id = f.id');
  lines.push('JOIN `academic_years` ay ON ca.academic_year_id = ay.id');
  lines.push("WHERE ca.status = 'Active';");
  lines.push('');

  lines.push('-- View: vw_course_tracker_summary');
  lines.push('CREATE OR REPLACE VIEW `vw_course_tracker_summary` AS');
  lines.push('SELECT');
  lines.push('  ct.id AS tracker_id,');
  lines.push('  ct.course_code,');
  lines.push('  ct.course_name,');
  lines.push('  ct.course_type,');
  lines.push('  ct.department,');
  lines.push('  ct.academic_year,');
  lines.push('  ct.class_and_sem,');
  lines.push('  ct.course_owner,');
  lines.push('  ct.total_sessions,');
  lines.push('  ct.conducted_sessions,');
  lines.push('  ct.pending_sessions,');
  lines.push('  ct.completion_percentage,');
  lines.push('  ct.average_attendance_percentage');
  lines.push('FROM `course_trackers` ct;');
  lines.push('');

  lines.push('-- View: vw_users_by_role');
  lines.push('CREATE OR REPLACE VIEW `vw_users_by_role` AS');
  lines.push('SELECT');
  lines.push('  u.id AS user_id,');
  lines.push('  u.employee_code,');
  lines.push('  u.name AS full_name,');
  lines.push('  u.email,');
  lines.push('  u.role,');
  lines.push("  COALESCE(u.department, 'Institutional Executive') AS department_name,");
  lines.push('  u.designation,');
  lines.push('  u.status,');
  lines.push('  u.last_login_at');
  lines.push('FROM `users` u;');
  lines.push('');

  lines.push('SET FOREIGN_KEY_CHECKS = 1;');
  lines.push('-- End of Dump');

  return lines.join('\n');
}

/**
 * Downloads the MySQL SQL file directly to the user's browser.
 */
export function downloadMySQLDumpFile(filename: string, sqlContent: string) {
  const blob = new Blob([sqlContent], { type: 'application/sql;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
