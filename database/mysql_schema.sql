-- ============================================================================
-- MYCAGS: College Academics Governance & Management System
-- Database Schema: MySQL 8.0+ / MariaDB 10.5+
-- Charset: utf8mb4, Collation: utf8mb4_unicode_ci
-- Storage Engine: InnoDB (Full ACID & Foreign Key Support)
-- ============================================================================

-- Create Database
CREATE DATABASE IF NOT EXISTS `college_academics_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `college_academics_db`;

-- Drop Tables in reverse dependency order for clean recreation
DROP TABLE IF EXISTS `activity_logs`;
DROP TABLE IF EXISTS `faculty_subject_allocations`;
DROP TABLE IF EXISTS `coordinator_assignments`;
DROP TABLE IF EXISTS `students`;
DROP TABLE IF EXISTS `classes`;
DROP TABLE IF EXISTS `subjects`;
DROP TABLE IF EXISTS `faculties`;
DROP TABLE IF EXISTS `academic_events`;
DROP TABLE IF EXISTS `academic_years`;
DROP TABLE IF EXISTS `departments`;

-- ----------------------------------------------------------------------------
-- 1. DEPARTMENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE `departments` (
  `id` VARCHAR(50) NOT NULL,
  `code` VARCHAR(20) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `hod_name` VARCHAR(120) DEFAULT NULL,
  `email` VARCHAR(120) DEFAULT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `location` VARCHAR(100) DEFAULT NULL,
  `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_dept_code` (`code`),
  UNIQUE KEY `idx_dept_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. ACADEMIC YEARS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE `academic_years` (
  `id` VARCHAR(50) NOT NULL,
  `code` VARCHAR(30) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `term` ENUM('ODD', 'EVEN', 'ANNUAL') NOT NULL DEFAULT 'ODD',
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT FALSE,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_ay_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. ACADEMIC EVENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE `academic_events` (
  `id` VARCHAR(50) NOT NULL,
  `academic_year_id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `category` ENUM('EXAMS', 'ENROLLMENT', 'AUDIT', 'REPORTING', 'GRADING', 'HOLIDAY', 'OTHER') NOT NULL DEFAULT 'EXAMS',
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `description` TEXT DEFAULT NULL,
  `priority` ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  `target_audience` VARCHAR(50) DEFAULT 'All',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_event_academic_year` (`academic_year_id`),
  CONSTRAINT `fk_events_academic_year`
    FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. FACULTIES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE `faculties` (
  `id` VARCHAR(50) NOT NULL,
  `employee_code` VARCHAR(30) NOT NULL,
  `first_name` VARCHAR(80) NOT NULL,
  `last_name` VARCHAR(80) NOT NULL,
  `email` VARCHAR(120) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `department` VARCHAR(150) NOT NULL,
  `designation` VARCHAR(80) NOT NULL,
  `qualification` VARCHAR(150) NOT NULL,
  `specialization` VARCHAR(200) DEFAULT NULL,
  `date_of_joining` DATE NOT NULL,
  `experience_years` INT UNSIGNED NOT NULL DEFAULT 0,
  `status` ENUM('Active', 'On Leave', 'Resigned', 'Retired') NOT NULL DEFAULT 'Active',
  `is_coordinator_eligible` BOOLEAN NOT NULL DEFAULT TRUE,
  `office_room` VARCHAR(60) DEFAULT NULL,
  `avatar_url` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_faculty_emp_code` (`employee_code`),
  UNIQUE KEY `idx_faculty_email` (`email`),
  KEY `idx_faculty_dept` (`department`),
  KEY `idx_faculty_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. SUBJECTS (COURSES & CURRICULUM) TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE `subjects` (
  `id` VARCHAR(50) NOT NULL,
  `code` VARCHAR(20) NOT NULL,
  `name` VARCHAR(180) NOT NULL,
  `department` VARCHAR(150) NOT NULL,
  `degree` VARCHAR(50) NOT NULL,
  `semester` TINYINT UNSIGNED NOT NULL,
  `type` ENUM('Theory', 'Practical / Lab', 'Elective', 'Integrated (Theory + Lab)', 'Seminar / Project') NOT NULL DEFAULT 'Theory',
  `credits` TINYINT UNSIGNED NOT NULL DEFAULT 3,
  `lecture_hours_per_week` TINYINT UNSIGNED NOT NULL DEFAULT 3,
  `practical_hours_per_week` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `status` ENUM('Active', 'Draft', 'Archived') NOT NULL DEFAULT 'Active',
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_subject_code` (`code`),
  KEY `idx_subject_dept_sem` (`department`, `semester`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. CLASSES (DIVISIONS / SECTIONS) TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE `classes` (
  `id` VARCHAR(50) NOT NULL,
  `class_code` VARCHAR(30) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `department` VARCHAR(150) NOT NULL,
  `degree` VARCHAR(50) NOT NULL,
  `semester` TINYINT UNSIGNED NOT NULL,
  `section` VARCHAR(10) NOT NULL,
  `academic_year_id` VARCHAR(50) NOT NULL,
  `max_capacity` SMALLINT UNSIGNED NOT NULL DEFAULT 60,
  `room_number` VARCHAR(50) DEFAULT NULL,
  `status` ENUM('Active', 'Upcoming', 'Archived') NOT NULL DEFAULT 'Active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_class_code` (`class_code`),
  KEY `idx_class_ay` (`academic_year_id`),
  CONSTRAINT `fk_classes_academic_year`
    FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. STUDENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE `students` (
  `id` VARCHAR(50) NOT NULL,
  `registration_no` VARCHAR(40) NOT NULL,
  `roll_no` VARCHAR(30) NOT NULL,
  `first_name` VARCHAR(80) NOT NULL,
  `last_name` VARCHAR(80) NOT NULL,
  `email` VARCHAR(120) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `department` VARCHAR(150) NOT NULL,
  `degree` VARCHAR(50) NOT NULL,
  `current_semester` TINYINT UNSIGNED NOT NULL,
  `current_class_id` VARCHAR(50) DEFAULT NULL,
  `enrollment_date` DATE NOT NULL,
  `status` ENUM('Active', 'Inactive', 'Suspended', 'Graduated', 'Alumni') NOT NULL DEFAULT 'Active',
  `gpa` DECIMAL(4, 2) NOT NULL DEFAULT 0.00,
  `attendance_percentage` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  `avatar_url` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_student_reg_no` (`registration_no`),
  UNIQUE KEY `idx_student_roll_no` (`roll_no`),
  UNIQUE KEY `idx_student_email` (`email`),
  KEY `idx_student_class` (`current_class_id`),
  KEY `idx_student_dept_sem` (`department`, `current_semester`),
  CONSTRAINT `fk_students_class`
    FOREIGN KEY (`current_class_id`) REFERENCES `classes` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. CLASS COORDINATOR ASSIGNMENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE `coordinator_assignments` (
  `id` VARCHAR(50) NOT NULL,
  `class_id` VARCHAR(50) NOT NULL,
  `faculty_id` VARCHAR(50) NOT NULL,
  `academic_year_id` VARCHAR(50) NOT NULL,
  `assigned_date` DATE NOT NULL,
  `status` ENUM('Active', 'Relieved', 'Transferred') NOT NULL DEFAULT 'Active',
  `remarks` TEXT DEFAULT NULL,
  `load_hours_per_week` TINYINT UNSIGNED NOT NULL DEFAULT 3,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_coord_class` (`class_id`),
  KEY `idx_coord_faculty` (`faculty_id`),
  KEY `idx_coord_ay` (`academic_year_id`),
  CONSTRAINT `fk_coord_class`
    FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_coord_faculty`
    FOREIGN KEY (`faculty_id`) REFERENCES `faculties` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_coord_ay`
    FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 9. FACULTY SUBJECT ALLOCATIONS (M-TO-N JUNCTION TABLE)
-- ----------------------------------------------------------------------------
CREATE TABLE `faculty_subject_allocations` (
  `id` VARCHAR(50) NOT NULL,
  `faculty_id` VARCHAR(50) NOT NULL,
  `subject_id` VARCHAR(50) NOT NULL,
  `role` VARCHAR(60) NOT NULL DEFAULT 'Primary Instructor',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_fac_sub_unique` (`faculty_id`, `subject_id`),
  KEY `idx_alloc_sub` (`subject_id`),
  CONSTRAINT `fk_alloc_faculty`
    FOREIGN KEY (`faculty_id`) REFERENCES `faculties` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_alloc_subject`
    FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 10. ACTIVITY LOGS (AUDIT TRAIL) TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE `activity_logs` (
  `id` VARCHAR(50) NOT NULL,
  `action` ENUM('CREATE', 'UPDATE', 'DELETE', 'ASSIGN', 'SET_ACTIVE', 'RESET') NOT NULL,
  `module` ENUM('Students', 'Faculties', 'Subjects', 'Academic Years', 'Classes', 'Coordinators', 'System') NOT NULL,
  `description` TEXT NOT NULL,
  `user_name` VARCHAR(80) NOT NULL,
  `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_log_module` (`module`),
  KEY `idx_log_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- USEFUL DATABASE VIEWS
-- ============================================================================

-- Active Class Coordinators with full Faculty, Class and Academic Year details
CREATE OR REPLACE VIEW `vw_active_coordinators` AS
SELECT
  ca.id AS assignment_id,
  ca.assigned_date,
  ca.status AS assignment_status,
  ca.load_hours_per_week,
  ca.remarks,
  c.id AS class_id,
  c.class_code,
  c.name AS class_name,
  c.degree,
  c.semester,
  c.section,
  c.room_number,
  f.id AS faculty_id,
  f.employee_code,
  CONCAT(f.first_name, ' ', f.last_name) AS faculty_full_name,
  f.email AS faculty_email,
  f.phone AS faculty_phone,
  f.designation AS faculty_designation,
  f.department AS faculty_department,
  ay.id AS academic_year_id,
  ay.name AS academic_year_name,
  ay.code AS academic_year_code
FROM `coordinator_assignments` ca
JOIN `classes` c ON ca.class_id = c.id
JOIN `faculties` f ON ca.faculty_id = f.id
JOIN `academic_years` ay ON ca.academic_year_id = ay.id
WHERE ca.status = 'Active';

-- Student Directory with Class and Coordinator details
CREATE OR REPLACE VIEW `vw_student_directory` AS
SELECT
  s.id AS student_id,
  s.registration_no,
  s.roll_no,
  CONCAT(s.first_name, ' ', s.last_name) AS full_name,
  s.email,
  s.phone,
  s.department,
  s.degree,
  s.current_semester,
  s.status AS student_status,
  s.gpa,
  s.attendance_percentage,
  c.id AS class_id,
  c.class_code,
  c.name AS class_name,
  c.section,
  CONCAT(f.first_name, ' ', f.last_name) AS coordinator_name,
  f.email AS coordinator_email
FROM `students` s
LEFT JOIN `classes` c ON s.current_class_id = c.id
LEFT JOIN `coordinator_assignments` ca ON ca.class_id = c.id AND ca.status = 'Active'
LEFT JOIN `faculties` f ON ca.faculty_id = f.id;

-- Subject Teaching Faculty Allocation Summary
CREATE OR REPLACE VIEW `vw_subject_faculty_allocations` AS
SELECT
  s.id AS subject_id,
  s.code AS subject_code,
  s.name AS subject_name,
  s.department,
  s.degree,
  s.semester,
  s.type AS course_type,
  s.credits,
  s.lecture_hours_per_week,
  s.practical_hours_per_week,
  f.id AS faculty_id,
  f.employee_code,
  CONCAT(f.first_name, ' ', f.last_name) AS faculty_name,
  f.designation,
  fsa.role AS teaching_role
FROM `subjects` s
LEFT JOIN `faculty_subject_allocations` fsa ON s.id = fsa.subject_id
LEFT JOIN `faculties` f ON fsa.faculty_id = f.id;
