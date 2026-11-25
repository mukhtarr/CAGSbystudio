-- ============================================================================
-- MYCAGS: College Academics Governance & Management System
-- Database Seed Data: Complete Initial Academic Records
-- Compatible with MySQL 8.0+ / MariaDB 10.5+
-- ============================================================================

USE `college_academics_db`;

START TRANSACTION;

-- ----------------------------------------------------------------------------
-- 1. INSERT DEPARTMENTS
-- ----------------------------------------------------------------------------
INSERT INTO `departments` (`id`, `code`, `name`, `hod_name`, `email`, `phone`, `location`, `status`) VALUES
('dept-cse', 'CSE', 'Computer Science & Engineering', 'Dr. Rajesh Sharma', 'cse.hod@cags.edu', '+91 98231 44521', 'Academic Block A, 3rd Floor', 'Active'),
('dept-aids', 'AIDS', 'Artificial Intelligence & Data Science', 'Dr. Vikram Malhotra', 'aids.hod@cags.edu', '+91 98450 11223', 'Academic Block A, 4th Floor', 'Active'),
('dept-it', 'IT', 'Information Technology', 'Prof. Neha Gupta', 'it.hod@cags.edu', '+91 98111 22334', 'Academic Block A, 2nd Floor', 'Active'),
('dept-ece', 'ECE', 'Electronics & Communication', 'Dr. Amit Patel', 'ece.hod@cags.edu', '+91 97234 55667', 'Academic Block B, 2nd Floor', 'Active'),
('dept-me', 'MECH', 'Mechanical Engineering', 'Prof. Sunita Rao', 'mech.hod@cags.edu', '+91 98765 44321', 'Workshop Complex Block C', 'Active'),
('dept-ce', 'CIVIL', 'Civil Engineering', 'Dr. Sanjay Verma', 'civil.hod@cags.edu', '+91 94567 88990', 'Infrastructure Block D', 'Active'),
('dept-mba', 'MBA', 'Management Studies (MBA)', 'Prof. Meera Nair', 'mba.hod@cags.edu', '+91 98333 44556', 'Management Tower, 5th Floor', 'Active'),
('dept-ca', 'CA', 'Computer Applications (BCA/MCA)', 'Dr. Arun Kumar', 'ca.hod@cags.edu', '+91 98222 33445', 'Computer Center Block B', 'Active');

-- ----------------------------------------------------------------------------
-- 2. INSERT ACADEMIC YEARS
-- ----------------------------------------------------------------------------
INSERT INTO `academic_years` (`id`, `code`, `name`, `term`, `start_date`, `end_date`, `is_active`, `notes`) VALUES
('ay-2024-25-odd', 'AY-24-25-ODD', '2024 - 2025 (Odd Semester)', 'ODD', '2024-07-15', '2024-12-20', TRUE, 'Current ongoing academic session for 1st, 3rd, 5th, and 7th semesters.'),
('ay-2024-25-even', 'AY-24-25-EVEN', '2024 - 2025 (Even Semester)', 'EVEN', '2025-01-06', '2025-05-30', FALSE, 'Upcoming session for 2nd, 4th, 6th, and 8th semesters.'),
('ay-2023-24-annual', 'AY-23-24-FULL', '2023 - 2024 (Annual Session)', 'ANNUAL', '2023-07-10', '2024-06-15', FALSE, 'Completed academic year archived.'),
('ay-2025-26-odd', 'AY-25-26-ODD', '2025 - 2026 (Planned Academic Year)', 'ODD', '2025-07-14', '2025-12-19', FALSE, 'Future academic calendar draft.');

-- ----------------------------------------------------------------------------
-- 3. INSERT ACADEMIC EVENTS
-- ----------------------------------------------------------------------------
INSERT INTO `academic_events` (`id`, `academic_year_id`, `title`, `category`, `start_date`, `end_date`, `description`, `priority`, `target_audience`) VALUES
('ev-1', 'ay-2024-25-odd', 'Mid-Term Exam Period (CIE-I)', 'EXAMS', '2024-09-23', '2024-09-28', 'First continuous internal assessment examinations for all departments.', 'high', 'All'),
('ev-2', 'ay-2024-25-odd', 'Mid-Semester Attendance & Defaulter Reporting Cycle', 'REPORTING', '2024-10-05', '2024-10-10', 'Submission of 60-day attendance thresholds (<75%) to HODs and Dean Academics.', 'high', 'Coordinators'),
('ev-3', 'ay-2024-25-odd', 'Continuous Internal Evaluation (CIE-II) & Lab Vivas', 'EXAMS', '2024-11-04', '2024-11-09', 'Second internal assessment cycle, practical lab exams, and mini-project evaluations.', 'medium', 'All'),
('ev-4', 'ay-2024-25-odd', 'Class Coordinator Review & Mentorship Audit', 'AUDIT', '2024-11-18', '2024-11-22', 'Review of student counseling logs, attendance recovery plans, and parent consultations.', 'medium', 'Coordinators'),
('ev-5', 'ay-2024-25-odd', 'Internal Marks & Final Eligibility Upload Closes', 'GRADING', '2024-11-28', '2024-12-02', 'Portal lock for internal sessional marks entry and university exam eligibility hall tickets.', 'high', 'Faculty'),
('ev-6', 'ay-2024-25-odd', 'End-Semester University Theory Examinations', 'EXAMS', '2024-12-09', '2024-12-20', 'Final semester terminal examinations and centralized paper valuation commencement.', 'high', 'All'),
('ev-7', 'ay-2024-25-even', 'Even Semester Course Enrollment & Elective Selection', 'ENROLLMENT', '2025-01-06', '2025-01-15', 'Open elective registrations and departmental honors course allocations.', 'medium', 'Students'),
('ev-8', 'ay-2024-25-even', 'Class Coordinator Appointment Cycle for Even Term', 'REPORTING', '2025-01-10', '2025-01-18', 'Finalizing class teacher nominations and workload verification for even semester.', 'high', 'Coordinators');

-- ----------------------------------------------------------------------------
-- 4. INSERT FACULTIES
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 5. INSERT SUBJECTS
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 6. INSERT CLASSES
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 7. INSERT STUDENTS
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 8. INSERT CLASS COORDINATOR ASSIGNMENTS
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 9. INSERT FACULTY SUBJECT ALLOCATIONS
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 10. INSERT ACTIVITY LOGS
-- ----------------------------------------------------------------------------
INSERT INTO `activity_logs` (`id`, `action`, `module`, `description`, `user_name`, `timestamp`) VALUES
('log-01', 'CREATE', 'Academic Years', 'Created academic session 2024 - 2025 (Odd Semester)', 'Super Admin', '2024-07-10 09:30:00'),
('log-02', 'SET_ACTIVE', 'Academic Years', 'Set 2024 - 2025 (Odd Semester) as current active term', 'Super Admin', '2024-07-10 09:35:00'),
('log-03', 'CREATE', 'Faculties', 'Onboarded Dr. Rajesh Sharma as Head of Department for CSE', 'Admin', '2024-07-11 11:20:00'),
('log-04', 'CREATE', 'Subjects', 'Registered curriculum course CS401 Distributed Systems & Cloud', 'Academic Dean', '2024-07-12 14:15:00'),
('log-05', 'CREATE', 'Classes', 'Created division CSE-3A (Room 302, Max 65)', 'Registrar', '2024-07-14 10:00:00'),
('log-06', 'ASSIGN', 'Coordinators', 'Assigned Dr. Rajesh Sharma as Class Coordinator for CSE-3A', 'Dean Academics', '2024-07-15 11:00:00'),
('log-07', 'ASSIGN', 'Subjects', 'Allocated Prof. Ananya Deshmukh to CS302 Full Stack Web Technologies', 'HOD CSE', '2024-07-16 15:30:00'),
('log-08', 'CREATE', 'Students', 'Enrolled 20 students into 2024-25 odd semester rosters', 'Admissions Office', '2024-08-01 16:45:00');

COMMIT;
