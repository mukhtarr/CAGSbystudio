# MYCAGS - College Academics Database (MySQL)

This directory contains the complete, production-ready MySQL database schema, relational constraints, foreign keys, views, and seed data for the **MYCAGS College Academics Governance & Management System**.

---

## 📁 Files Included

| File | Description |
| :--- | :--- |
| `mycags_full_dump.sql` | **All-in-one consolidated dump**: Creates database `college_academics_db`, all 10 tables, views, and inserts all seed data in a single run. |
| `mysql_schema.sql` | **DDL Schema**: `CREATE DATABASE`, table definitions, primary & foreign keys, indexes, and database views. |
| `mysql_seed_data.sql` | **DML Seed Data**: All insert statements for departments, faculties, subjects, classes, students, coordinator assignments, and audit logs. |

---

## 🏗️ Database Architecture & Tables

Database Name: `college_academics_db`  
Charset: `utf8mb4` | Collation: `utf8mb4_unicode_ci` | Engine: `InnoDB`

### Table Schema Summary

1. **`departments`**: Academic departments (CSE, AIDS, IT, ECE, Mechanical, Civil, MBA, BCA/MCA) with HOD and contact info.
2. **`academic_years`**: Academic sessions (e.g. `2024-2025 ODD`, `2024-2025 EVEN`), dates, terms, and active session flags.
3. **`academic_events`**: Academic calendar events (CIE-I, CIE-II, Attendance submission, End-Sem exams, Audits).
4. **`faculties`**: Teaching staff profiles, employee codes, designations, qualifications, contact details, coordinator eligibility, and workload.
5. **`subjects`**: Curriculum course catalog (Theory, Labs, Electives, Integrated), credits, weekly L/P hours, and syllabus descriptions.
6. **`classes`**: Cohort divisions/sections (e.g., `CSE-3A`, `AIDS-3A`), room allocations, capacity, and academic year foreign keys.
7. **`students`**: Student records, registration numbers, roll numbers, current class IDs, GPA, and attendance percentages.
8. **`coordinator_assignments`**: Class teacher/coordinator appointments linking faculty, classes, and academic sessions with load hours.
9. **`faculty_subject_allocations`**: M-to-N junction table linking teaching faculties to assigned course subjects.
10. **`activity_logs`**: System audit trail of create, update, delete, and assignment operations.

### Useful Database Views
- `vw_active_coordinators`: Consolidates active coordinator appointments with teacher details, class info, and room assignments.
- `vw_student_directory`: Joins students with their assigned section and respective class coordinator.
- `vw_subject_faculty_allocations`: Aggregates curriculum courses with their assigned lead instructors and lab examiners.

---

## 🚀 How to Import into MySQL

### Option 1: MySQL Command Line (Recommended)

```bash
# 1. Connect to MySQL and import the full dump:
mysql -u root -p < database/mycags_full_dump.sql

# 2. Or connect to MySQL interactive shell and run:
mysql -u root -p
mysql> source /path/to/database/mycags_full_dump.sql;
```

### Option 2: Docker (Instant MySQL Server)

```bash
# Run a MySQL 8.0 container with the dump mounted
docker run --name mycags-mysql \
  -e MYSQL_ROOT_PASSWORD=secret \
  -e MYSQL_DATABASE=college_academics_db \
  -v $(pwd)/database/mycags_full_dump.sql:/docker-entrypoint-initdb.d/init.sql \
  -p 3306:3306 -d mysql:8.0
```

### Option 3: GUI Tools (phpMyAdmin / DBeaver / MySQL Workbench)
1. Open your MySQL client (e.g., **DBeaver**, **MySQL Workbench**, or **phpMyAdmin**).
2. Open or import file `database/mycags_full_dump.sql`.
3. Click **Execute / Run**.

---

## 🔍 Sample Verification Queries

```sql
USE `college_academics_db`;

-- Check table row counts
SELECT 'departments' AS tbl, COUNT(*) AS count FROM departments
UNION ALL SELECT 'academic_years', COUNT(*) FROM academic_years
UNION ALL SELECT 'faculties', COUNT(*) FROM faculties
UNION ALL SELECT 'subjects', COUNT(*) FROM subjects
UNION ALL SELECT 'classes', COUNT(*) FROM classes
UNION ALL SELECT 'students', COUNT(*) FROM students
UNION ALL SELECT 'coordinator_assignments', COUNT(*) FROM coordinator_assignments;

-- View Active Class Coordinators
SELECT * FROM vw_active_coordinators;

-- View Top Students by GPA
SELECT roll_no, CONCAT(first_name, ' ', last_name) AS student_name, department, gpa, attendance_percentage 
FROM students 
WHERE status = 'Active' 
ORDER BY gpa DESC 
LIMIT 5;
```
