-- ============================================================================
-- MYCAGS: College Academics Governance & Management System
-- Unified Complete MySQL Database Dump (DDL + DML)
-- Target Database: MySQL 8.0+ / MariaDB 10.5+
-- Storage Engine: InnoDB (utf8mb4_unicode_ci)
-- Generated: 2026-09-02
-- Usage:
--   mysql -u <username> -p < mycags_full_dump.sql
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET NAMES utf8mb4;

-- 1. Create and select the database
CREATE DATABASE IF NOT EXISTS `college_academics_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `college_academics_db`;

-- Drop existing tables if needed
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
-- Table structure for `departments`
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
-- Table structure for `academic_years`
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
-- Table structure for `academic_events`
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
-- Table structure for `faculties`
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
-- Table structure for `subjects`
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
-- Table structure for `classes`
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
-- Table structure for `students`
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
-- Table structure for `coordinator_assignments`
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
-- Table structure for `faculty_subject_allocations`
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
-- Table structure for `activity_logs`
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

-- ----------------------------------------------------------------------------
-- Views
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- INSERT ALL DATA
-- ----------------------------------------------------------------------------

-- Departments
INSERT INTO `departments` (`id`, `code`, `name`, `hod_name`, `email`, `phone`, `location`, `status`) VALUES
('dept-cse', 'CSE', 'Computer Science & Engineering', 'Dr. Rajesh Sharma', 'cse.hod@cags.edu', '+91 98231 44521', 'Academic Block A, 3rd Floor', 'Active'),
('dept-aids', 'AIDS', 'Artificial Intelligence & Data Science', 'Dr. Vikram Malhotra', 'aids.hod@cags.edu', '+91 98450 11223', 'Academic Block A, 4th Floor', 'Active'),
('dept-it', 'IT', 'Information Technology', 'Prof. Neha Gupta', 'it.hod@cags.edu', '+91 98111 22334', 'Academic Block A, 2nd Floor', 'Active'),
('dept-ece', 'ECE', 'Electronics & Communication', 'Dr. Amit Patel', 'ece.hod@cags.edu', '+91 97234 55667', 'Academic Block B, 2nd Floor', 'Active'),
('dept-me', 'MECH', 'Mechanical Engineering', 'Prof. Sunita Rao', 'mech.hod@cags.edu', '+91 98765 44321', 'Workshop Complex Block C', 'Active'),
('dept-ce', 'CIVIL', 'Civil Engineering', 'Dr. Sanjay Verma', 'civil.hod@cags.edu', '+91 94567 88990', 'Infrastructure Block D', 'Active'),
('dept-mba', 'MBA', 'Management Studies (MBA)', 'Prof. Meera Nair', 'mba.hod@cags.edu', '+91 98333 44556', 'Management Tower, 5th Floor', 'Active'),
('dept-ca', 'CA', 'Computer Applications (BCA/MCA)', 'Dr. Arun Kumar', 'ca.hod@cags.edu', '+91 98222 33445', 'Computer Center Block B', 'Active');

-- Academic Years
INSERT INTO `academic_years` (`id`, `code`, `name`, `term`, `start_date`, `end_date`, `is_active`, `notes`) VALUES
('ay-2024-25-odd', 'AY-24-25-ODD', '2024 - 2025 (Odd Semester)', 'ODD', '2024-07-15', '2024-12-20', TRUE, 'Current ongoing academic session for 1st, 3rd, 5th, and 7th semesters.'),
('ay-2024-25-even', 'AY-24-25-EVEN', '2024 - 2025 (Even Semester)', 'EVEN', '2025-01-06', '2025-05-30', FALSE, 'Upcoming session for 2nd, 4th, 6th, and 8th semesters.'),
('ay-2023-24-annual', 'AY-23-24-FULL', '2023 - 2024 (Annual Session)', 'ANNUAL', '2023-07-10', '2024-06-15', FALSE, 'Completed academic year archived.'),
('ay-2025-26-odd', 'AY-25-26-ODD', '2025 - 2026 (Planned Academic Year)', 'ODD', '2025-07-14', '2025-12-19', FALSE, 'Future academic calendar draft.');

-- Academic Events
INSERT INTO `academic_events` (`id`, `academic_year_id`, `title`, `category`, `start_date`, `end_date`, `description`, `priority`, `target_audience`) VALUES
('ev-1', 'ay-2024-25-odd', 'Mid-Term Exam Period (CIE-I)', 'EXAMS', '2024-09-23', '2024-09-28', 'First continuous internal assessment examinations for all departments.', 'high', 'All'),
('ev-2', 'ay-2024-25-odd', 'Mid-Semester Attendance & Defaulter Reporting Cycle', 'REPORTING', '2024-10-05', '2024-10-10', 'Submission of 60-day attendance thresholds (<75%) to HODs and Dean Academics.', 'high', 'Coordinators'),
('ev-3', 'ay-2024-25-odd', 'Continuous Internal Evaluation (CIE-II) & Lab Vivas', 'EXAMS', '2024-11-04', '2024-11-09', 'Second internal assessment cycle, practical lab exams, and mini-project evaluations.', 'medium', 'All'),
('ev-4', 'ay-2024-25-odd', 'Class Coordinator Review & Mentorship Audit', 'AUDIT', '2024-11-18', '2024-11-22', 'Review of student counseling logs, attendance recovery plans, and parent consultations.', 'medium', 'Coordinators'),
('ev-5', 'ay-2024-25-odd', 'Internal Marks & Final Eligibility Upload Closes', 'GRADING', '2024-11-28', '2024-12-02', 'Portal lock for internal sessional marks entry and university exam eligibility hall tickets.', 'high', 'Faculty'),
('ev-6', 'ay-2024-25-odd', 'End-Semester University Theory Examinations', 'EXAMS', '2024-12-09', '2024-12-20', 'Final semester terminal examinations and centralized paper valuation commencement.', 'high', 'All'),
('ev-7', 'ay-2024-25-even', 'Even Semester Course Enrollment & Elective Selection', 'ENROLLMENT', '2025-01-06', '2025-01-15', 'Open elective registrations and departmental honors course allocations.', 'medium', 'Students'),
('ev-8', 'ay-2024-25-even', 'Class Coordinator Appointment Cycle for Even Term', 'REPORTING', '2025-01-10', '2025-01-18', 'Finalizing class teacher nominations and workload verification for even semester.', 'high', 'Coordinators');

-- Faculties
INSERT INTO `faculties` (`id`, `employee_code`, `first_name`, `last_name`, `email`, `phone`, `department`, `designation`, `qualification`, `specialization`, `date_of_joining`, `experience_years`, `status`, `is_coordinator_eligible`, `office_room`) VALUES
('fac-101', 'EMP-CSE-001', 'Dr. Rajesh', 'Sharma', 'r.sharma@cags.edu', '+91 98231 44521', 'Computer Science & Engineering', 'Head of Department (HOD)', 'Ph.D. in Computer Science (IIT Bombay)', 'Distributed Systems & Cloud Computing', '2015-08-10', 16, 'Active', TRUE, 'Tech Block 301'),
('fac-102', 'EMP-CSE-002', 'Prof. Ananya', 'Deshmukh', 'a.deshmukh@cags.edu', '+91 97654 32189', 'Computer Science & Engineering', 'Associate Professor', 'M.Tech in Software Engineering (BITS Pilani)', 'Full Stack Development, Web Technologies', '2018-06-15', 10, 'Active', TRUE, 'Tech Block 305'),
('fac-103', 'EMP-AIDS-003', 'Dr. Vikram', 'Malhotra', 'v.malhotra@cags.edu', '+91 98450 11223', 'Artificial Intelligence & Data Science', 'Professor', 'Ph.D. in Machine Learning (IISc Bangalore)', 'Deep Learning, Computer Vision & NLP', '2019-01-08', 14, 'Active', TRUE, 'Tech Block 402'),
('fac-104', 'EMP-IT-004', 'Prof. Neha', 'Gupta', 'n.gupta@cags.edu', '+91 98111 22334', 'Information Technology', 'Assistant Professor', 'M.Tech in Computer Networks (NIT Trichy)', 'Cybersecurity & High Performance Networks', '2020-07-20', 7, 'Active', TRUE, 'IT Wing 204'),
('fac-105', 'EMP-ECE-005', 'Dr. Amit', 'Patel', 'a.patel@cags.edu', '+91 97234 55667', 'Electronics & Communication', 'Associate Professor', 'Ph.D. in VLSI Systems (IIT Delhi)', 'Embedded Systems, IoT & FPGA Synthesis', '2016-11-01', 12, 'Active', TRUE, 'ECE Lab 102'),
('fac-106', 'EMP-MECH-006', 'Prof. Sunita', 'Rao', 's.rao@cags.edu', '+91 98765 44321', 'Mechanical Engineering', 'Professor', 'Ph.D. in Thermal Engineering (IIT Madras)', 'Computational Fluid Dynamics, Renewable Energy', '2014-04-12', 18, 'Active', TRUE, 'Workshop 01'),
('fac-107', 'EMP-CIVIL-007', 'Dr. Sanjay', 'Verma', 's.verma@cags.edu', '+91 94567 88990', 'Civil Engineering', 'Head of Department (HOD)', 'Ph.D. in Structural Engineering (IIT Roorkee)', 'Earthquake Resistant Structures & Smart Concrete', '2013-09-18', 19, 'Active', TRUE, 'Civil Block 101'),
('fac-108', 'EMP-MBA-008', 'Prof. Meera', 'Nair', 'm.nair@cags.edu', '+91 98333 44556', 'Management Studies (MBA)', 'Associate Professor', 'MBA (IIM Ahmedabad), Ph.D. in Marketing', 'Strategic Operations & Consumer Analytics', '2019-08-01', 11, 'Active', TRUE, 'Mgmt Block 502'),
('fac-109', 'EMP-CA-009', 'Dr. Arun', 'Kumar', 'a.kumar@cags.edu', '+91 98222 33445', 'Computer Applications (BCA/MCA)', 'Assistant Professor', 'MCA, Ph.D. in Information Systems', 'Mobile App Development, Cloud Microservices', '2021-02-15', 6, 'Active', TRUE, 'CA Wing 201'),
('fac-110', 'EMP-CSE-010', 'Prof. Priya', 'Sharma', 'p.sharma@cags.edu', '+91 98999 88776', 'Computer Science & Engineering', 'Assistant Professor', 'M.Tech in Data Science (IIIT Hyderabad)', 'Algorithms, Graph Analytics, Big Data', '2022-08-10', 5, 'Active', TRUE, 'Tech Block 308');

-- Subjects
INSERT INTO `subjects` (`id`, `code`, `name`, `department`, `degree`, `semester`, `type`, `credits`, `lecture_hours_per_week`, `practical_hours_per_week`, `status`, `description`) VALUES
('sub-cse-401', 'CS401', 'Distributed Systems & Cloud Architecture', 'Computer Science & Engineering', 'B.Tech', 5, 'Theory', 4, 3, 2, 'Active', 'Fundamental principles of distributed computing, consensus algorithms, microservices, and multi-region cloud design.'),
('sub-cse-302', 'CS302', 'Full Stack Web Technologies & Frameworks', 'Computer Science & Engineering', 'B.Tech', 5, 'Integrated (Theory + Lab)', 4, 3, 2, 'Active', 'Modern front-end architecture (React/Vite), backend Node.js APIs, responsive UI frameworks, and state managers.'),
('sub-cse-303', 'CS303', 'Database Management Systems & Indexing', 'Computer Science & Engineering', 'B.Tech', 3, 'Theory', 4, 3, 2, 'Active', 'Relational algebra, SQL optimization, ACID guarantees, transaction locks, and distributed NoSQL databases.'),
('sub-aids-301', 'AI301', 'Deep Neural Networks & Machine Learning', 'Artificial Intelligence & Data Science', 'B.Tech', 5, 'Theory', 4, 3, 2, 'Active', 'Backpropagation, Convolutional Networks, Transformer models, Attention mechanisms, and model fine-tuning.'),
('sub-aids-302', 'AI302', 'Computer Vision & Image Processing Lab', 'Artificial Intelligence & Data Science', 'B.Tech', 5, 'Practical / Lab', 2, 0, 4, 'Active', 'Practical image processing, OpenCV filtering, YOLO object detection, and feature matching algorithms.'),
('sub-it-401', 'IT401', 'Network Security & Applied Cryptography', 'Information Technology', 'B.Tech', 7, 'Theory', 3, 3, 0, 'Active', 'Symmetric/Asymmetric encryption, zero-knowledge proofs, TLS handshakes, firewalls, and penetration testing.'),
('sub-ece-201', 'EC201', 'Signals, Linear Systems & Transforms', 'Electronics & Communication', 'B.Tech', 3, 'Theory', 4, 3, 2, 'Active', 'Continuous and discrete Fourier transforms, Laplace domains, Z-transforms, filtering and impulse responses.'),
('sub-mech-101', 'ME101', 'Engineering Mechanics & Statics', 'Mechanical Engineering', 'B.Tech', 1, 'Theory', 3, 3, 0, 'Active', 'Equilibrium of force systems, free body diagrams, friction, centroids, moments of inertia, and truss analysis.'),
('sub-civ-201', 'CE201', 'Surveying & Geomatics Engineering', 'Civil Engineering', 'B.Tech', 3, 'Integrated (Theory + Lab)', 4, 2, 3, 'Active', 'Chain surveying, theodolites, total stations, GPS coordinate systems, contour mapping, and photogrammetry.'),
('sub-mba-101', 'MBA101', 'Organizational Behaviour & Leadership Dynamics', 'Management Studies (MBA)', 'MBA', 1, 'Theory', 3, 3, 0, 'Active', 'Individual personality traits, organizational psychology, negotiation strategies, team dynamics, and conflict management.'),
('sub-cse-el501', 'CS-EL501', 'High Performance Computing (Elective)', 'Computer Science & Engineering', 'B.Tech', 7, 'Elective', 3, 3, 0, 'Active', 'Parallel computing patterns, MPI, CUDA GPU kernel programming, and cluster computing paradigms.'),
('sub-mech-301', 'ME301', 'Fluid Dynamics & Thermodynamics', 'Mechanical Engineering', 'B.Tech', 3, 'Theory', 4, 3, 2, 'Active', 'Navier-Stokes equations, thermodynamic cycles, laminar and turbulent fluid flows, and heat transfer.'),
('sub-civ-301', 'CE301', 'Structural Analysis & Reinforced Concrete', 'Civil Engineering', 'B.Tech', 5, 'Theory', 4, 3, 2, 'Active', 'Determinate and indeterminate structures, moment distribution methods, RCC beam design, and seismic load analysis.');

-- Classes
INSERT INTO `classes` (`id`, `class_code`, `name`, `department`, `degree`, `semester`, `section`, `academic_year_id`, `max_capacity`, `room_number`, `status`) VALUES
('cls-cse-3a', 'CSE-3A', 'B.Tech CSE - 5th Sem - Div A', 'Computer Science & Engineering', 'B.Tech', 5, 'A', 'ay-2024-25-odd', 65, 'Room 302, Tech Block', 'Active'),
('cls-cse-3b', 'CSE-3B', 'B.Tech CSE - 5th Sem - Div B', 'Computer Science & Engineering', 'B.Tech', 5, 'B', 'ay-2024-25-odd', 65, 'Room 304, Tech Block', 'Active'),
('cls-aids-3a', 'AIDS-3A', 'B.Tech AI & DS - 5th Sem - Div A', 'Artificial Intelligence & Data Science', 'B.Tech', 5, 'A', 'ay-2024-25-odd', 60, 'Room 405, Tech Block', 'Active'),
('cls-it-4a', 'IT-4A', 'B.Tech IT - 7th Sem - Div A', 'Information Technology', 'B.Tech', 7, 'A', 'ay-2024-25-odd', 55, 'Room 203, IT Wing', 'Active'),
('cls-ece-2a', 'ECE-2A', 'B.Tech ECE - 3rd Sem - Div A', 'Electronics & Communication', 'B.Tech', 3, 'A', 'ay-2024-25-odd', 60, 'Room 105, ECE Block', 'Active'),
('cls-me-1a', 'ME-1A', 'B.Tech ME - 1st Sem - Div A', 'Mechanical Engineering', 'B.Tech', 1, 'A', 'ay-2024-25-odd', 50, 'Room 012, Workshop Block', 'Active'),
('cls-ce-2a', 'CE-2A', 'B.Tech Civil - 3rd Sem - Div A', 'Civil Engineering', 'B.Tech', 3, 'A', 'ay-2024-25-odd', 50, 'Room 102, Civil Block', 'Active'),
('cls-mba-1a', 'MBA-1A', 'MBA Core - 1st Sem - Div A', 'Management Studies (MBA)', 'MBA', 1, 'A', 'ay-2024-25-odd', 60, 'Room 501, Mgmt Tower', 'Active'),
('cls-bca-2a', 'BCA-2A', 'BCA - 3rd Sem - Div A', 'Computer Applications (BCA/MCA)', 'BCA', 3, 'A', 'ay-2024-25-odd', 55, 'Room 202, CA Wing', 'Active'),
('cls-mca-1a', 'MCA-1A', 'MCA - 1st Sem - Div A', 'Computer Applications (BCA/MCA)', 'MCA', 1, 'A', 'ay-2024-25-odd', 45, 'Room 205, CA Wing', 'Active');

-- Students
INSERT INTO `students` (`id`, `registration_no`, `roll_no`, `first_name`, `last_name`, `email`, `phone`, `department`, `degree`, `current_semester`, `current_class_id`, `enrollment_date`, `status`, `gpa`, `attendance_percentage`) VALUES
('stu-001', 'REG-2022-CSE-001', '22CS001', 'Aarav', 'Sharma', 'aarav.sharma@cags.edu', '+91 98123 45670', 'Computer Science & Engineering', 'B.Tech', 5, 'cls-cse-3a', '2022-08-15', 'Active', 9.24, 94.50),
('stu-002', 'REG-2022-CSE-002', '22CS002', 'Diya', 'Iyer', 'diya.iyer@cags.edu', '+91 98123 45671', 'Computer Science & Engineering', 'B.Tech', 5, 'cls-cse-3a', '2022-08-15', 'Active', 8.86, 91.20),
('stu-003', 'REG-2022-CSE-003', '22CS003', 'Rohan', 'Verma', 'rohan.verma@cags.edu', '+91 98123 45672', 'Computer Science & Engineering', 'B.Tech', 5, 'cls-cse-3a', '2022-08-15', 'Active', 7.45, 82.00),
('stu-004', 'REG-2022-CSE-004', '22CS004', 'Sneha', 'Kulkarni', 'sneha.kulkarni@cags.edu', '+91 98123 45673', 'Computer Science & Engineering', 'B.Tech', 5, 'cls-cse-3a', '2022-08-15', 'Active', 9.60, 98.00),
('stu-005', 'REG-2022-CSE-005', '22CS005', 'Kabir', 'Mehta', 'kabir.mehta@cags.edu', '+91 98123 45674', 'Computer Science & Engineering', 'B.Tech', 5, 'cls-cse-3a', '2022-08-15', 'Active', 6.80, 68.50),
('stu-006', 'REG-2022-CSE-006', '22CS006', 'Ananya', 'Reddy', 'ananya.reddy@cags.edu', '+91 98123 45675', 'Computer Science & Engineering', 'B.Tech', 5, 'cls-cse-3b', '2022-08-15', 'Active', 8.42, 88.00),
('stu-007', 'REG-2022-CSE-007', '22CS007', 'Vikram', 'Chauhan', 'vikram.chauhan@cags.edu', '+91 98123 45676', 'Computer Science & Engineering', 'B.Tech', 5, 'cls-cse-3b', '2022-08-15', 'Active', 7.90, 85.50),
('stu-008', 'REG-2022-CSE-008', '22CS008', 'Pooja', 'Nair', 'pooja.nair@cags.edu', '+91 98123 45677', 'Computer Science & Engineering', 'B.Tech', 5, 'cls-cse-3b', '2022-08-15', 'Active', 9.15, 95.00),
('stu-009', 'REG-2022-AIDS-001', '22AI001', 'Aditya', 'Joshi', 'aditya.joshi@cags.edu', '+91 98234 56780', 'Artificial Intelligence & Data Science', 'B.Tech', 5, 'cls-aids-3a', '2022-08-15', 'Active', 8.95, 92.00),
('stu-010', 'REG-2022-AIDS-002', '22AI002', 'Meera', 'Sen', 'meera.sen@cags.edu', '+91 98234 56781', 'Artificial Intelligence & Data Science', 'B.Tech', 5, 'cls-aids-3a', '2022-08-15', 'Active', 9.40, 96.50),
('stu-011', 'REG-2022-AIDS-003', '22AI003', 'Karan', 'Malhotra', 'karan.malhotra@cags.edu', '+91 98234 56782', 'Artificial Intelligence & Data Science', 'B.Tech', 5, 'cls-aids-3a', '2022-08-15', 'Active', 7.10, 71.00),
('stu-012', 'REG-2021-IT-001', '21IT001', 'Tanvi', 'Desai', 'tanvi.desai@cags.edu', '+91 98345 67890', 'Information Technology', 'B.Tech', 7, 'cls-it-4a', '2021-08-10', 'Active', 8.70, 89.00),
('stu-013', 'REG-2021-IT-002', '21IT002', 'Arjun', 'Singh', 'arjun.singh@cags.edu', '+91 98345 67891', 'Information Technology', 'B.Tech', 7, 'cls-it-4a', '2021-08-10', 'Active', 9.05, 93.00),
('stu-014', 'REG-2023-ECE-001', '23EC001', 'Ishaan', 'Gupta', 'ishaan.gupta@cags.edu', '+91 98456 78901', 'Electronics & Communication', 'B.Tech', 3, 'cls-ece-2a', '2023-08-20', 'Active', 8.10, 84.00),
('stu-015', 'REG-2023-ECE-002', '23EC002', 'Riya', 'Bose', 'riya.bose@cags.edu', '+91 98456 78902', 'Electronics & Communication', 'B.Tech', 3, 'cls-ece-2a', '2023-08-20', 'Active', 8.65, 90.00),
('stu-016', 'REG-2024-ME-001', '24ME001', 'Siddharth', 'Rao', 'siddharth.rao@cags.edu', '+91 98567 89012', 'Mechanical Engineering', 'B.Tech', 1, 'cls-me-1a', '2024-08-05', 'Active', 8.20, 86.00),
('stu-017', 'REG-2023-CE-001', '23CE001', 'Kavya', 'Menon', 'kavya.menon@cags.edu', '+91 98678 90123', 'Civil Engineering', 'B.Tech', 3, 'cls-ce-2a', '2023-08-20', 'Active', 8.50, 87.50),
('stu-018', 'REG-2024-MBA-001', '24MB001', 'Varun', 'Nambiar', 'varun.nambiar@cags.edu', '+91 98789 01234', 'Management Studies (MBA)', 'MBA', 1, 'cls-mba-1a', '2024-08-01', 'Active', 9.10, 94.00),
('stu-019', 'REG-2023-BCA-001', '23BC001', 'Neha', 'Saxena', 'neha.saxena@cags.edu', '+91 98890 12345', 'Computer Applications (BCA/MCA)', 'BCA', 3, 'cls-bca-2a', '2023-08-20', 'Active', 8.35, 88.50),
('stu-020', 'REG-2024-MCA-001', '24MC001', 'Abhishek', 'Yadav', 'abhishek.yadav@cags.edu', '+91 98901 23456', 'Computer Applications (BCA/MCA)', 'MCA', 1, 'cls-mca-1a', '2024-08-01', 'Active', 8.80, 91.00);

-- Coordinator Assignments
INSERT INTO `coordinator_assignments` (`id`, `class_id`, `faculty_id`, `academic_year_id`, `assigned_date`, `status`, `remarks`, `load_hours_per_week`) VALUES
('coord-01', 'cls-cse-3a', 'fac-101', 'ay-2024-25-odd', '2024-07-15', 'Active', 'Lead coordinator overseeing 5th sem syllabus pace and CIE marks entry.', 4),
('coord-02', 'cls-cse-3b', 'fac-102', 'ay-2024-25-odd', '2024-07-15', 'Active', 'Class teacher managing Section B mentor-mentee meetings.', 3),
('coord-03', 'cls-aids-3a', 'fac-103', 'ay-2024-25-odd', '2024-07-16', 'Active', 'AI & Data Science division mentor for lab project guidance.', 3),
('coord-04', 'cls-it-4a', 'fac-104', 'ay-2024-25-odd', '2024-07-16', 'Active', 'Final year placement coordinator and project mentor.', 4),
('coord-05', 'cls-ece-2a', 'fac-105', 'ay-2024-25-odd', '2024-07-17', 'Active', 'Second year ECE coordinator monitoring attendance thresholds.', 3),
('coord-06', 'cls-me-1a', 'fac-106', 'ay-2024-25-odd', '2024-07-18', 'Active', 'Freshmen induction and foundational mechanics mentor.', 3),
('coord-07', 'cls-ce-2a', 'fac-107', 'ay-2024-25-odd', '2024-07-18', 'Active', 'Civil engineering department student mentor for lab sessions.', 3),
('coord-08', 'cls-mba-1a', 'fac-108', 'ay-2024-25-odd', '2024-07-19', 'Active', 'MBA cohort advisor overseeing industry guest lectures.', 4),
('coord-09', 'cls-bca-2a', 'fac-109', 'ay-2024-25-odd', '2024-07-19', 'Active', 'BCA coordinator managing web technologies lab curriculum.', 3),
('coord-10', 'cls-mca-1a', 'fac-110', 'ay-2024-25-odd', '2024-07-20', 'Active', 'MCA post-graduate program advisor and internship supervisor.', 3);

-- Faculty Subject Allocations
INSERT INTO `faculty_subject_allocations` (`id`, `faculty_id`, `subject_id`, `role`) VALUES
('fsa-01', 'fac-101', 'sub-cse-401', 'Course Coordinator & Primary Lecturer'),
('fsa-02', 'fac-101', 'sub-cse-303', 'Guest Lecturer & Subject Advisor'),
('fsa-03', 'fac-102', 'sub-cse-302', 'Primary Theory & Lab Instructor'),
('fsa-04', 'fac-102', 'sub-cse-303', 'Lead Professor & Lab Supervisor'),
('fsa-05', 'fac-103', 'sub-aids-301', 'Lead Lecturer & Course Lead'),
('fsa-06', 'fac-103', 'sub-aids-302', 'Lead Practical Examiner'),
('fsa-07', 'fac-104', 'sub-it-401', 'Primary Instructor'),
('fsa-08', 'fac-105', 'sub-ece-201', 'Primary Theory Instructor'),
('fsa-09', 'fac-106', 'sub-mech-101', 'Lead Lecturer'),
('fsa-10', 'fac-107', 'sub-civ-201', 'Course In-Charge & Field Surveyor'),
('fsa-11', 'fac-108', 'sub-mba-101', 'Lead Professor'),
('fsa-12', 'fac-110', 'sub-cse-el501', 'Elective Subject Instructor');

-- Activity Logs
INSERT INTO `activity_logs` (`id`, `action`, `module`, `description`, `user_name`, `timestamp`) VALUES
('log-01', 'CREATE', 'Academic Years', 'Created academic session 2024 - 2025 (Odd Semester)', 'Super Admin', '2024-07-10 09:30:00'),
('log-02', 'SET_ACTIVE', 'Academic Years', 'Set 2024 - 2025 (Odd Semester) as current active term', 'Super Admin', '2024-07-10 09:35:00'),
('log-03', 'CREATE', 'Faculties', 'Onboarded Dr. Rajesh Sharma as Head of Department for CSE', 'Admin', '2024-07-11 11:20:00'),
('log-04', 'CREATE', 'Subjects', 'Registered curriculum course CS401 Distributed Systems & Cloud', 'Academic Dean', '2024-07-12 14:15:00'),
('log-05', 'CREATE', 'Classes', 'Created division CSE-3A (Room 302, Max 65)', 'Registrar', '2024-07-14 10:00:00'),
('log-06', 'ASSIGN', 'Coordinators', 'Assigned Dr. Rajesh Sharma as Class Coordinator for CSE-3A', 'Dean Academics', '2024-07-15 11:00:00'),
('log-07', 'ASSIGN', 'Subjects', 'Allocated Prof. Ananya Deshmukh to CS302 Full Stack Web Technologies', 'HOD CSE', '2024-07-16 15:30:00'),
('log-08', 'CREATE', 'Students', 'Enrolled 20 students into 2024-25 odd semester rosters', 'Admissions Office', '2024-08-01 16:45:00');

SET FOREIGN_KEY_CHECKS = 1;
