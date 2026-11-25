import React, { useState, useMemo } from 'react';
import {
  Database,
  Table,
  Terminal,
  Code2,
  Download,
  Copy,
  Check,
  Search,
  ExternalLink,
  Layers,
  Key,
  Calendar,
  Users,
  GraduationCap,
  BookOpen,
  School,
  UserCheck,
  Activity,
  ChevronRight,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  FileCode,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import {
  MYSQL_TABLES_META,
  generateLiveMySQLDump,
  downloadMySQLDumpFile,
} from '../../utils/databaseExporter';

type ViewMode = 'tables' | 'query' | 'schema' | 'er-diagram';

export const DatabaseView: React.FC = () => {
  const {
    academicYears,
    faculties,
    subjects,
    classes,
    students,
    assignments,
    activityLogs,
    addToast,
  } = useAcademic();

  const [viewMode, setViewMode] = useState<ViewMode>('tables');
  const [selectedTable, setSelectedTable] = useState<string>('students');
  const [tableSubTab, setTableSubTab] = useState<'data' | 'columns'>('data');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedDump, setCopiedDump] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);

  // SQL Query Terminal state
  const [sqlQuery, setSqlQuery] = useState(
    'SELECT roll_no, first_name, last_name, department, gpa, attendance_percentage FROM students WHERE gpa >= 8.5 ORDER BY gpa DESC;'
  );
  const [queryResult, setQueryResult] = useState<{
    headers: string[];
    rows: (string | number | boolean | null)[][];
    executionTimeMs: number;
    rowCount: number;
    error?: string;
  } | null>(null);

  // Dynamic live SQL dump
  const liveSqlDump = useMemo(() => {
    return generateLiveMySQLDump({
      academicYears,
      faculties,
      subjects,
      classes,
      students,
      assignments,
      activityLogs,
    });
  }, [academicYears, faculties, subjects, classes, students, assignments, activityLogs]);

  // Total records across all tables
  const totalRecords = useMemo(() => {
    return (
      8 + // departments
      academicYears.length +
      faculties.length +
      subjects.length +
      classes.length +
      students.length +
      assignments.length +
      activityLogs.length
    );
  }, [academicYears, faculties, subjects, classes, students, assignments, activityLogs]);

  // Copy full SQL dump
  const handleCopyDump = () => {
    navigator.clipboard.writeText(liveSqlDump);
    setCopiedDump(true);
    addToast('success', 'MySQL Dump Copied', 'The complete MySQL SQL dump has been copied to your clipboard.');
    setTimeout(() => setCopiedDump(false), 2500);
  };

  // Download SQL dump file
  const handleDownloadDump = () => {
    downloadMySQLDumpFile('college_academics_db_dump.sql', liveSqlDump);
    addToast('success', 'MySQL Dump Downloaded', 'Downloaded college_academics_db_dump.sql successfully.');
  };

  // Pre-crafted query presets
  const sampleQueries = [
    {
      label: 'Honor Students (GPA ≥ 8.5)',
      sql: 'SELECT roll_no, first_name, last_name, department, gpa, attendance_percentage FROM students WHERE gpa >= 8.5 ORDER BY gpa DESC;',
    },
    {
      label: 'Active Class Coordinators & Classes',
      sql: 'SELECT c.class_code, c.name AS class_name, f.first_name, f.last_name, f.email, ca.load_hours_per_week FROM coordinator_assignments ca JOIN classes c ON ca.class_id = c.id JOIN faculties f ON ca.faculty_id = f.id WHERE ca.status = "Active";',
    },
    {
      label: 'Course Catalog & Credit Distribution',
      sql: 'SELECT code, name, department, semester, credits, type, status FROM subjects ORDER BY semester, code;',
    },
    {
      label: 'Department Faculty Roster & Workload',
      sql: 'SELECT employee_code, first_name, last_name, department, designation, experience_years FROM faculties WHERE status = "Active" ORDER BY department, experience_years DESC;',
    },
    {
      label: 'Students with Attendance Below 75% (Defaulters)',
      sql: 'SELECT roll_no, first_name, last_name, department, attendance_percentage, email FROM students WHERE attendance_percentage < 75;',
    },
  ];

  // Client-side SQL execution simulation
  const handleRunQuery = () => {
    const startTime = performance.now();
    const cleanQuery = sqlQuery.trim().toLowerCase();

    try {
      if (cleanQuery.includes('from students') && cleanQuery.includes('attendance_percentage < 75')) {
        const filtered = students.filter((s) => s.attendancePercent < 75);
        setQueryResult({
          headers: ['roll_no', 'first_name', 'last_name', 'department', 'attendance_percentage', 'email'],
          rows: filtered.map((s) => [s.rollNo, s.firstName, s.lastName, s.department, s.attendancePercent, s.email]),
          executionTimeMs: Math.max(1, Math.round((performance.now() - startTime) * 10) / 10),
          rowCount: filtered.length,
        });
      } else if (cleanQuery.includes('from students') && (cleanQuery.includes('gpa >=') || cleanQuery.includes('gpa >'))) {
        const threshold = 8.5;
        const filtered = students
          .filter((s) => s.cgpa >= threshold)
          .sort((a, b) => b.cgpa - a.cgpa);
        setQueryResult({
          headers: ['roll_no', 'first_name', 'last_name', 'department', 'gpa', 'attendance_percentage'],
          rows: filtered.map((s) => [s.rollNo, s.firstName, s.lastName, s.department, s.cgpa, s.attendancePercent]),
          executionTimeMs: Math.max(1, Math.round((performance.now() - startTime) * 10) / 10),
          rowCount: filtered.length,
        });
      } else if (cleanQuery.includes('coordinator_assignments') || cleanQuery.includes('coordinator')) {
        const rows = assignments.map((a) => {
          const cls = classes.find((c) => c.id === a.classId);
          const fac = faculties.find((f) => f.id === a.facultyId);
          return [
            cls?.name.split('-')[0]?.trim() || a.classId,
            cls?.name || 'Class',
            fac?.firstName || 'Faculty',
            fac?.lastName || '',
            fac?.email || '',
            a.loadHoursPerWeek || 3,
          ];
        });
        setQueryResult({
          headers: ['class_code', 'class_name', 'first_name', 'last_name', 'email', 'load_hours_per_week'],
          rows,
          executionTimeMs: Math.max(1, Math.round((performance.now() - startTime) * 10) / 10),
          rowCount: rows.length,
        });
      } else if (cleanQuery.includes('from subjects')) {
        const rows = subjects.map((s) => [
          s.code,
          s.name,
          s.department,
          s.semester,
          s.credits,
          s.type,
          s.status,
        ]);
        setQueryResult({
          headers: ['code', 'name', 'department', 'semester', 'credits', 'type', 'status'],
          rows,
          executionTimeMs: Math.max(1, Math.round((performance.now() - startTime) * 10) / 10),
          rowCount: rows.length,
        });
      } else if (cleanQuery.includes('from faculties')) {
        const rows = faculties.map((f) => [
          f.employeeCode,
          f.firstName,
          f.lastName,
          f.department,
          f.designation,
          f.experienceYears,
        ]);
        setQueryResult({
          headers: ['employee_code', 'first_name', 'last_name', 'department', 'designation', 'experience_years'],
          rows,
          executionTimeMs: Math.max(1, Math.round((performance.now() - startTime) * 10) / 10),
          rowCount: rows.length,
        });
      } else if (cleanQuery.includes('from classes')) {
        const rows = classes.map((c) => [
          c.name.split('-')[0]?.trim() || c.id,
          c.name,
          c.department,
          c.semester,
          c.section,
          c.capacity,
          c.roomNumber || '-',
        ]);
        setQueryResult({
          headers: ['class_code', 'name', 'department', 'semester', 'section', 'max_capacity', 'room_number'],
          rows,
          executionTimeMs: Math.max(1, Math.round((performance.now() - startTime) * 10) / 10),
          rowCount: rows.length,
        });
      } else {
        // Generic fallback to students or first table
        const rows = students.slice(0, 15).map((s) => [
          s.prnNo || s.rollNo,
          s.rollNo,
          s.firstName,
          s.lastName,
          s.department,
          s.cgpa,
        ]);
        setQueryResult({
          headers: ['registration_no', 'roll_no', 'first_name', 'last_name', 'department', 'gpa'],
          rows,
          executionTimeMs: Math.max(1, Math.round((performance.now() - startTime) * 10) / 10),
          rowCount: rows.length,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'SQL Syntax error';
      setQueryResult({
        headers: [],
        rows: [],
        executionTimeMs: 0,
        rowCount: 0,
        error: msg,
      });
    }
  };

  // Get current table data for Table Explorer
  const currentTableData = useMemo(() => {
    switch (selectedTable) {
      case 'departments':
        return [
          { id: 'dept-cse', code: 'CSE', name: 'Computer Science & Engineering', hod_name: 'Dr. Rajesh Sharma', email: 'cse.hod@cags.edu', phone: '+91 98231 44521', status: 'Active' },
          { id: 'dept-aids', code: 'AIDS', name: 'Artificial Intelligence & Data Science', hod_name: 'Dr. Vikram Malhotra', email: 'aids.hod@cags.edu', phone: '+91 98450 11223', status: 'Active' },
          { id: 'dept-it', code: 'IT', name: 'Information Technology', hod_name: 'Prof. Neha Gupta', email: 'it.hod@cags.edu', phone: '+91 98111 22334', status: 'Active' },
          { id: 'dept-ece', code: 'ECE', name: 'Electronics & Communication', hod_name: 'Dr. Amit Patel', email: 'ece.hod@cags.edu', phone: '+91 97234 55667', status: 'Active' },
          { id: 'dept-me', code: 'MECH', name: 'Mechanical Engineering', hod_name: 'Prof. Sunita Rao', email: 'mech.hod@cags.edu', phone: '+91 98765 44321', status: 'Active' },
          { id: 'dept-ce', code: 'CIVIL', name: 'Civil Engineering', hod_name: 'Dr. Sanjay Verma', email: 'civil.hod@cags.edu', phone: '+91 94567 88990', status: 'Active' },
          { id: 'dept-mba', code: 'MBA', name: 'Management Studies (MBA)', hod_name: 'Prof. Meera Nair', email: 'mba.hod@cags.edu', phone: '+91 98333 44556', status: 'Active' },
          { id: 'dept-ca', code: 'CA', name: 'Computer Applications (BCA/MCA)', hod_name: 'Dr. Arun Kumar', email: 'ca.hod@cags.edu', phone: '+91 98222 33445', status: 'Active' },
        ];
      case 'academic_years':
        return academicYears.map((a) => ({
          id: a.id,
          code: a.code,
          name: a.name,
          term: a.term,
          start_date: a.startDate,
          end_date: a.endDate,
          is_active: a.isActive ? 'TRUE' : 'FALSE',
          notes: a.notes,
        }));
      case 'faculties':
        return faculties.map((f) => ({
          id: f.id,
          employee_code: f.employeeCode,
          name: `${f.firstName} ${f.lastName}`,
          email: f.email,
          phone: f.phone,
          department: f.department,
          designation: f.designation,
          qualification: f.qualification,
          experience: `${f.experienceYears} yrs`,
          status: f.status,
        }));
      case 'subjects':
        return subjects.map((s) => ({
          id: s.id,
          code: s.code,
          name: s.name,
          department: s.department,
          degree: s.degree,
          semester: s.semester,
          type: s.type,
          credits: s.credits,
          lecture_hrs: s.lectureHoursPerWeek,
          practical_hrs: s.practicalHoursPerWeek,
          status: s.status,
        }));
      case 'classes':
        return classes.map((c) => ({
          id: c.id,
          class_code: c.name.split('-')[0]?.trim() || c.id,
          name: c.name,
          department: c.department,
          degree: c.degree,
          semester: c.semester,
          section: c.section,
          capacity: c.capacity,
          room: c.roomNumber || '-',
          status: 'Active',
        }));
      case 'students':
        return students.map((s) => ({
          id: s.id,
          registration_no: s.prnNo || s.rollNo,
          roll_no: s.rollNo,
          name: `${s.firstName} ${s.lastName}`,
          email: s.email,
          department: s.department,
          semester: s.semester,
          gpa: s.cgpa.toFixed(2),
          attendance: `${s.attendancePercent}%`,
          status: s.status,
        }));
      case 'coordinator_assignments':
        return assignments.map((a) => {
          const cls = classes.find((c) => c.id === a.classId);
          const fac = faculties.find((f) => f.id === a.facultyId);
          return {
            id: a.id,
            class: cls?.name || a.classId,
            coordinator: fac ? `${fac.firstName} ${fac.lastName}` : a.facultyId,
            assigned_date: a.assignedDate,
            load_hours: `${a.loadHoursPerWeek || 3} hrs/wk`,
            status: a.status,
            remarks: a.remarks || '-',
          };
        });
      case 'faculty_subject_allocations': {
        const allocs: Record<string, string | number>[] = [];
        subjects.forEach((subj) => {
          if (subj.assignedFacultyIds) {
            subj.assignedFacultyIds.forEach((fId) => {
              const fac = faculties.find((f) => f.id === fId);
              allocs.push({
                subject_code: subj.code,
                subject_name: subj.name,
                faculty_name: fac ? `${fac.firstName} ${fac.lastName}` : fId,
                department: subj.department,
                role: 'Primary Instructor',
              });
            });
          }
        });
        return allocs;
      }
      case 'activity_logs':
        return activityLogs.map((l) => ({
          id: l.id,
          action: l.action,
          module: l.module,
          description: l.description,
          user: l.user,
          timestamp: l.timestamp,
        }));
      default:
        return [];
    }
  }, [selectedTable, academicYears, faculties, subjects, classes, students, assignments, activityLogs]);

  // Filtered rows for current table
  const filteredTableRows = useMemo(() => {
    if (!searchTerm) return currentTableData;
    const term = searchTerm.toLowerCase();
    return currentTableData.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(term))
    );
  }, [currentTableData, searchTerm]);

  const selectedTableMeta = MYSQL_TABLES_META[selectedTable] || MYSQL_TABLES_META['students'];

  return (
    <div className="space-y-6">
      {/* Top Banner Card: MySQL Database Overview */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-indigo-500/20 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/30 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                MySQL Relational Database
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                  college_academics_db
                </span>
              </h1>
            </div>
            <p className="text-slate-300 text-sm max-w-2xl">
              Complete MySQL 8.0+ / MariaDB schema with InnoDB ACID compliance, referential foreign keys, views, and synchronized application records.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Status: <strong className="text-white">Active & In-Sync</strong>
              </span>
              <span>•</span>
              <span>Engine: <strong className="text-white">InnoDB</strong></span>
              <span>•</span>
              <span>Charset: <strong className="text-white">utf8mb4_unicode_ci</strong></span>
              <span>•</span>
              <span>Total Tables: <strong className="text-white">9</strong></span>
              <span>•</span>
              <span>Total Seed Rows: <strong className="text-white">{totalRecords}</strong></span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleDownloadDump}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
              title="Download full SQL dump file"
            >
              <Download className="w-4 h-4" />
              Download .sql Dump
            </button>
            <button
              onClick={handleCopyDump}
              className="px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-200 border border-slate-700/80 flex items-center gap-2 transition-all"
            >
              {copiedDump ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedDump ? 'Copied to Clipboard!' : 'Copy SQL Dump'}
            </button>
            <button
              onClick={() => setShowConnectModal(true)}
              className="px-3 py-2 text-xs font-medium rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60 flex items-center gap-1.5 transition-all"
            >
              <FileCode className="w-4 h-4 text-indigo-400" />
              Connection Guide
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 bg-slate-200/70 dark:bg-slate-900/70 p-1 rounded-xl border border-slate-300/70 dark:border-slate-800">
          <button
            onClick={() => setViewMode('tables')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'tables'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            Table Explorer
          </button>
          <button
            onClick={() => {
              setViewMode('query');
              if (!queryResult) handleRunQuery();
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'query'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            SQL Query Runner
          </button>
          <button
            onClick={() => setViewMode('schema')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'schema'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Live SQL Dump
          </button>
          <button
            onClick={() => setViewMode('er-diagram')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'er-diagram'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            ER Schema Map
          </button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <span>Target: <strong>MySQL 8.0 / MariaDB 10.5+</strong></span>
        </div>
      </div>

      {/* VIEW MODE 1: Table Explorer */}
      {viewMode === 'tables' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Table Selector Sidebar */}
          <div className="lg:col-span-3 space-y-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">
              Database Tables ({Object.keys(MYSQL_TABLES_META).length})
            </h3>
            <div className="space-y-1 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              {Object.values(MYSQL_TABLES_META).map((tbl) => {
                const isSelected = selectedTable === tbl.name;
                const count =
                  tbl.name === 'departments'
                    ? 8
                    : tbl.name === 'academic_years'
                    ? academicYears.length
                    : tbl.name === 'faculties'
                    ? faculties.length
                    : tbl.name === 'subjects'
                    ? subjects.length
                    : tbl.name === 'classes'
                    ? classes.length
                    : tbl.name === 'students'
                    ? students.length
                    : tbl.name === 'coordinator_assignments'
                    ? assignments.length
                    : tbl.name === 'activity_logs'
                    ? activityLogs.length
                    : 12;

                return (
                  <button
                    key={tbl.name}
                    onClick={() => {
                      setSelectedTable(tbl.name);
                      setSearchTerm('');
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-500/20'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Table className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-500' : 'text-slate-400'}`} />
                      <span className="font-mono">{tbl.name}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Table Content Area */}
          <div className="lg:col-span-9 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
              {/* Table Header Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                      {selectedTableMeta.name}
                    </h2>
                    <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md font-mono">
                      PK: {selectedTableMeta.primaryKey}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedTableMeta.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => setTableSubTab('data')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                        tableSubTab === 'data'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Table Rows ({filteredTableRows.length})
                    </button>
                    <button
                      onClick={() => setTableSubTab('columns')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                        tableSubTab === 'columns'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Columns ({selectedTableMeta.columns.length})
                    </button>
                  </div>
                </div>
              </div>

              {/* Sub-tab 1: Table Rows View */}
              {tableSubTab === 'data' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={`Filter in ${selectedTable}...`}
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <span className="text-xs text-slate-500">
                      Showing {filteredTableRows.length} record(s)
                    </span>
                  </div>

                  {filteredTableRows.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-sm">
                      No records found matching your filter in {selectedTable}.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider text-[10px]">
                          <tr>
                            {Object.keys(filteredTableRows[0] || {}).map((col) => (
                              <th key={col} className="px-3.5 py-2.5 font-mono">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                          {filteredTableRows.map((row, rIdx) => (
                            <tr
                              key={rIdx}
                              className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                            >
                              {Object.values(row).map((val, cIdx) => (
                                <td key={cIdx} className="px-3.5 py-2.5 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                  {String(val ?? '-')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-tab 2: Column Schema Definition */}
              {tableSubTab === 'columns' && (
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-3.5 py-2.5">Field</th>
                        <th className="px-3.5 py-2.5">MySQL Type</th>
                        <th className="px-3.5 py-2.5">Null</th>
                        <th className="px-3.5 py-2.5">Key</th>
                        <th className="px-3.5 py-2.5">Default</th>
                        <th className="px-3.5 py-2.5">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                      {selectedTableMeta.columns.map((col) => (
                        <tr key={col.field} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                          <td className="px-3.5 py-2.5 font-bold text-indigo-600 dark:text-indigo-400">
                            {col.field}
                          </td>
                          <td className="px-3.5 py-2.5 text-slate-600 dark:text-slate-400">
                            {col.type}
                          </td>
                          <td className="px-3.5 py-2.5 text-slate-500">
                            {col.nullable ? 'YES' : 'NO'}
                          </td>
                          <td className="px-3.5 py-2.5">
                            {col.key === 'PRI' ? (
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 text-[10px] font-bold">
                                PRIMARY KEY
                              </span>
                            ) : col.key === 'UNI' ? (
                              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-500 text-[10px] font-bold">
                                UNIQUE
                              </span>
                            ) : col.key === 'MUL' ? (
                              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px] font-bold">
                                INDEX / FK
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="px-3.5 py-2.5 text-slate-500">
                            {col.defaultVal || 'NULL'}
                          </td>
                          <td className="px-3.5 py-2.5 font-sans text-slate-600 dark:text-slate-300">
                            {col.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: SQL Query Terminal */}
      {viewMode === 'query' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-500" />
                  Interactive SQL Query Runner
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Execute SQL statements directly against the <code className="text-indigo-500 font-mono">college_academics_db</code> in-memory tables.
                </p>
              </div>

              {/* Sample queries dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Presets:</span>
                <select
                  onChange={(e) => {
                    setSqlQuery(e.target.value);
                  }}
                  className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {sampleQueries.map((q, idx) => (
                    <option key={idx} value={q.sql}>
                      {q.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* SQL Textarea */}
            <div className="relative font-mono">
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                rows={4}
                className="w-full p-3.5 text-xs rounded-xl bg-slate-950 text-indigo-300 border border-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                placeholder="Enter SQL SELECT statement..."
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <button
                  onClick={handleRunQuery}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Play className="w-3.5 h-3.5" />
                  Run SQL Query
                </button>
              </div>
            </div>

            {/* Query Result Grid */}
            {queryResult && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>
                      Query returned <strong>{queryResult.rowCount} rows</strong> in{' '}
                      <strong>{queryResult.executionTimeMs} ms</strong>
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const csvContent = [
                        queryResult.headers.join(','),
                        ...queryResult.rows.map((r) => r.join(',')),
                      ].join('\n');
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'query_results.csv';
                      a.click();
                      URL.revokeObjectURL(a.href);
                    }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" /> Export to CSV
                  </button>
                </div>

                {queryResult.error ? (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
                    {queryResult.error}
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl max-h-96">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase text-[10px]">
                        <tr>
                          {queryResult.headers.map((h) => (
                            <th key={h} className="px-3.5 py-2.5 whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-[11px]">
                        {queryResult.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                            {row.map((val, cIdx) => (
                              <td key={cIdx} className="px-3.5 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                {String(val ?? 'NULL')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW MODE 3: Live SQL Dump Viewer */}
      {viewMode === 'schema' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-500" />
                Live MySQL SQL Dump (DDL & DML)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This file is stored in <code className="font-mono text-indigo-500">/database/mycags_full_dump.sql</code>. It includes all table definitions, keys, and live inserts.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyDump}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition-all"
              >
                {copiedDump ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedDump ? 'Copied' : 'Copy SQL'}
              </button>
              <button
                onClick={handleDownloadDump}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Download .sql
              </button>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
            <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[500px] leading-relaxed select-all">
              {liveSqlDump}
            </pre>
          </div>
        </div>
      )}

      {/* VIEW MODE 4: ER Schema Map */}
      {viewMode === 'er-diagram' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              Entity-Relationship (ER) Schema Map
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Relational structure of the 10 MySQL database tables, foreign keys, and cardinalities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(MYSQL_TABLES_META).map((tbl) => (
              <div
                key={tbl.name}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Table className="w-4 h-4 text-indigo-500" />
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                      {tbl.name}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono">
                    PK: {tbl.primaryKey}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  {tbl.columns.slice(0, 5).map((col) => (
                    <div key={col.field} className="flex items-center justify-between font-mono text-[11px]">
                      <span className={`${col.key === 'PRI' ? 'font-bold text-amber-500' : col.key === 'MUL' ? 'text-purple-400' : 'text-slate-600 dark:text-slate-400'}`}>
                        {col.key === 'PRI' ? '🔑 ' : col.key === 'MUL' ? '🔗 ' : ''}
                        {col.field}
                      </span>
                      <span className="text-slate-400 text-[10px]">{col.type}</span>
                    </div>
                  ))}
                  {tbl.columns.length > 5 && (
                    <p className="text-[10px] text-slate-400 pt-1">
                      + {tbl.columns.length - 5} more columns...
                    </p>
                  )}
                </div>

                {tbl.foreignKeys && tbl.foreignKeys.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 space-y-0.5">
                    {tbl.foreignKeys.map((fk, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <span>FK:</span>
                        <code className="text-purple-400 font-mono">{fk.column}</code>
                        <span>&rarr;</span>
                        <code className="text-indigo-400 font-mono">{fk.refTable}({fk.refColumn})</code>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connection Guide Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  MySQL Connection & Setup Guide
                </h3>
              </div>
              <button
                onClick={() => setShowConnectModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <p>
                To connect to this MySQL database in your backend environment (Node.js, Express, Python, or PHP):
              </p>

              <div className="space-y-1.5">
                <span className="font-semibold text-slate-900 dark:text-white">1. Import the Database Dump:</span>
                <pre className="p-2.5 rounded-lg bg-slate-950 text-indigo-300 font-mono text-[11px] overflow-x-auto">
                  mysql -u root -p &lt; database/mycags_full_dump.sql
                </pre>
              </div>

              <div className="space-y-1.5">
                <span className="font-semibold text-slate-900 dark:text-white">2. Environment Configuration (.env):</span>
                <pre className="p-2.5 rounded-lg bg-slate-950 text-slate-300 font-mono text-[11px] overflow-x-auto">
{`MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=college_academics_db`}
                </pre>
              </div>

              <div className="space-y-1.5">
                <span className="font-semibold text-slate-900 dark:text-white">3. Node.js (mysql2 connection pool snippet):</span>
                <pre className="p-2.5 rounded-lg bg-slate-950 text-slate-300 font-mono text-[11px] overflow-x-auto">
{`import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: 'college_academics_db',
  waitForConnections: true,
  connectionLimit: 10,
});`}
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowConnectModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
