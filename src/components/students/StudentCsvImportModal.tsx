import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import confetti from 'canvas-confetti';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  Eye,
  Edit3,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Users,
  Check,
  Building,
  GraduationCap,
  Layers,
  ChevronDown,
  Info,
  Database,
  HelpCircle,
} from 'lucide-react';
import {
  Student,
  DepartmentType,
  DegreeType,
  SemesterType,
  SectionType,
  StudentStatus,
  ClassEntity,
  AcademicYear,
} from '../../types';
import { useAcademic } from '../../context/AcademicContext';

interface StudentCsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedStudentRow {
  uid: string; // internal tracking key
  originalIndex: number;
  isSelected: boolean;
  status: 'valid' | 'warning' | 'error' | 'duplicate';
  statusMessages: string[];
  // Student properties
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
  classNamePreview?: string;
  semester: SemesterType;
  section: SectionType;
  admissionYear: number;
  cgpa: number;
  attendancePercent: number;
  studentStatus: StudentStatus;
  bloodGroup?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
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
const SEMESTERS: SemesterType[] = [1, 2, 3, 4, 5, 6, 7, 8];
const SECTIONS: SectionType[] = ['A', 'B', 'C', 'D'];
const STATUSES: StudentStatus[] = ['Active', 'Inactive', 'Graduated', 'Suspended'];

// Sample CSV content for downloading template & quick loading
const SAMPLE_CSV_DATA = `rollNo,prnNo,firstName,lastName,email,phone,gender,dob,department,degree,semester,section,admissionYear,cgpa,attendancePercent,status,bloodGroup,guardianName,guardianPhone,address
24CS101,PRN2024001,Aarav,Sharma,aarav.sharma@campus.edu,+91 98765 43210,Male,2004-03-15,Computer Science & Engineering,B.Tech,5,A,2022,8.95,92,Active,O+,Rajesh Sharma,+91 98765 00001,"Flat 402, Greenfield Apts, Tech Park Road"
24CS102,PRN2024002,Ananya,Iyer,ananya.iyer@campus.edu,+91 98765 43211,Female,2004-07-22,Computer Science & Engineering,B.Tech,5,A,2022,9.40,96,Active,A+,Subramanian Iyer,+91 98765 00002,"12-B Temple Street, Indiranagar"
24IT105,PRN2024003,Rohan,Verma,rohan.verma@campus.edu,+91 98765 43212,Male,2004-11-05,Information Technology,B.Tech,3,A,2023,7.85,84,Active,B+,Kailash Verma,+91 98765 00003,"Sector 14, Hiranandani Gardens"
24AI110,PRN2024004,Sneha,Patel,sneha.patel@campus.edu,+91 98765 43213,Female,2004-09-18,Artificial Intelligence & Data Science,B.Tech,3,B,2023,8.70,88,Active,AB+,Dinesh Patel,+91 98765 00004,"Plot 55, Silicon Heights, Whitefield"
24EC115,PRN2024005,Vikram,Aditya,vikram.aditya@campus.edu,+91 98765 43214,Male,2003-12-30,Electronics & Communication,B.Tech,7,A,2021,8.15,78,Active,O-,Sanjay Aditya,+91 98765 00005,"Tower 3, Central Park Enclave"`;

export const StudentCsvImportModal: React.FC<StudentCsvImportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    students,
    classes,
    academicYears,
    activeAcademicYear,
    bulkImportStudents,
    updateStudent,
    addToast,
  } = useAcademic();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal Stepper State
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isDragging, setIsDragging] = useState(false);
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Parsed and Processed Data
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [filterMode, setFilterMode] = useState<'all' | 'valid' | 'issues'>('all');
  const [duplicateHandling, setDuplicateHandling] = useState<'skip' | 'update' | 'new_roll'>('skip');
  const [defaultClassId, setDefaultClassId] = useState<string>(classes[0]?.id || '');
  const [defaultAcademicYearId, setDefaultAcademicYearId] = useState<string>(
    activeAcademicYear?.id || (academicYears.length > 0 ? academicYears[0].id : '')
  );

  // Final Results summary
  const [importResults, setImportResults] = useState<{
    totalImported: number;
    totalUpdated: number;
    totalSkipped: number;
  }>({
    totalImported: 0,
    totalUpdated: 0,
    totalSkipped: 0,
  });

  // Reset state when modal opens/closes
  const handleReset = () => {
    setStep(1);
    setFileName('');
    setFileSize('');
    setPastedText('');
    setParseError(null);
    setParsedRows([]);
    setFilterMode('all');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleModalClose = () => {
    handleReset();
    onClose();
  };

  // Helper: Normalize & Fuzzy Match Department
  const normalizeDepartment = (deptInput?: string): DepartmentType => {
    if (!deptInput) return 'Computer Science & Engineering';
    const clean = deptInput.trim().toLowerCase();

    if (clean.includes('comp') || clean.includes('cse') || clean.includes('computer')) {
      return 'Computer Science & Engineering';
    }
    if (clean.includes('info') || clean.includes('it') || clean.includes('information')) {
      return 'Information Technology';
    }
    if (clean.includes('ai') || clean.includes('data') || clean.includes('aids') || clean.includes('intelligence')) {
      return 'Artificial Intelligence & Data Science';
    }
    if (clean.includes('elect') || clean.includes('ece') || clean.includes('communication')) {
      return 'Electronics & Communication';
    }
    if (clean.includes('mech') || clean.includes('mechanical')) {
      return 'Mechanical Engineering';
    }
    if (clean.includes('civil')) {
      return 'Civil Engineering';
    }
    if (clean.includes('mba') || clean.includes('manage')) {
      return 'Management Studies (MBA)';
    }
    if (clean.includes('bca') || clean.includes('mca') || clean.includes('applicat')) {
      return 'Computer Applications (BCA/MCA)';
    }

    const matched = DEPARTMENTS.find((d) => d.toLowerCase() === clean);
    return matched || 'Computer Science & Engineering';
  };

  // Helper: Normalize Degree
  const normalizeDegree = (degInput?: string): DegreeType => {
    if (!degInput) return 'B.Tech';
    const clean = degInput.trim().toUpperCase();
    if (clean.includes('B.TECH') || clean.includes('BTECH') || clean.includes('B.E') || clean.includes('BE')) {
      return 'B.Tech';
    }
    if (clean.includes('BCA')) return 'BCA';
    if (clean.includes('M.TECH') || clean.includes('MTECH')) return 'M.Tech';
    if (clean.includes('MCA')) return 'MCA';
    if (clean.includes('MBA')) return 'MBA';
    if (clean.includes('B.SC') || clean.includes('BSC')) return 'B.Sc';
    return 'B.Tech';
  };

  // Helper: Normalize Section
  const normalizeSection = (secInput?: string): SectionType => {
    if (!secInput) return 'A';
    const clean = secInput.trim().toUpperCase();
    if (['A', 'B', 'C', 'D'].includes(clean)) {
      return clean as SectionType;
    }
    if (clean.includes('A')) return 'A';
    if (clean.includes('B')) return 'B';
    if (clean.includes('C')) return 'C';
    if (clean.includes('D')) return 'D';
    return 'A';
  };

  // Helper: Find Best Class Match
  const findMatchingClass = (
    classIdOrNameInput?: string,
    department?: DepartmentType,
    semester?: number,
    section?: SectionType
  ): ClassEntity | undefined => {
    if (classIdOrNameInput) {
      const trimmed = classIdOrNameInput.trim();
      const byId = classes.find((c) => c.id === trimmed);
      if (byId) return byId;

      const byName = classes.find(
        (c) => c.name.toLowerCase() === trimmed.toLowerCase() || c.courseName.toLowerCase().includes(trimmed.toLowerCase())
      );
      if (byName) return byName;
    }

    // Try matching by department + semester + section
    if (department && semester && section) {
      const match = classes.find(
        (c) =>
          c.department === department &&
          c.semester === semester &&
          c.section === section
      );
      if (match) return match;
    }

    // Try matching by department + semester
    if (department && semester) {
      const matchDeptSem = classes.find(
        (c) => c.department === department && c.semester === semester
      );
      if (matchDeptSem) return matchDeptSem;
    }

    // Fallback to default class
    return classes.find((c) => c.id === defaultClassId) || classes[0];
  };

  // Process raw parsed JSON objects into validated student rows
  const processRawRecords = (rawData: any[]) => {
    const existingRolls = new Set(students.map((s) => s.rollNo.trim().toUpperCase()));
    const existingPrns = new Set(students.map((s) => s.prnNo.trim().toUpperCase()));
    const existingEmails = new Set(students.map((s) => s.email.trim().toLowerCase()));

    const seenRollsInFile = new Set<string>();

    const rows: ParsedStudentRow[] = rawData.map((raw, index) => {
      // Flexible field extractors (case-insensitive lookup across common alias names)
      const getVal = (...keys: string[]) => {
        for (const k of keys) {
          // exact
          if (raw[k] !== undefined && raw[k] !== null && String(raw[k]).trim() !== '') {
            return String(raw[k]).trim();
          }
          // lower-cased lookup
          const foundKey = Object.keys(raw).find(
            (rk) => rk.toLowerCase().replace(/[^a-z0-9]/g, '') === k.toLowerCase().replace(/[^a-z0-9]/g, '')
          );
          if (foundKey && raw[foundKey] !== undefined && raw[foundKey] !== null && String(raw[foundKey]).trim() !== '') {
            return String(raw[foundKey]).trim();
          }
        }
        return '';
      };

      // Extract Name (supports firstName/lastName or combined name)
      let firstName = getVal('firstName', 'first_name', 'fname', 'given_name');
      let lastName = getVal('lastName', 'last_name', 'lname', 'surname');
      const fullName = getVal('name', 'full_name', 'student_name');

      if (!firstName && fullName) {
        const parts = fullName.split(' ');
        firstName = parts[0] || 'Student';
        lastName = parts.slice(1).join(' ') || 'Candidate';
      }

      if (!firstName) firstName = `Student_${index + 1}`;
      if (!lastName) lastName = '';

      // Extract Roll No & PRN
      let rollNo = getVal('rollNo', 'roll_no', 'roll', 'rollno', 'roll_number', 'id');
      if (!rollNo) {
        rollNo = `24CS${Math.floor(100 + Math.random() * 899)}`;
      }

      let prnNo = getVal('prnNo', 'prn_no', 'prn', 'registration_no', 'reg_no');
      if (!prnNo) {
        prnNo = `PRN2024${String(100 + index).padStart(4, '0')}`;
      }

      // Email & Contact
      let email = getVal('email', 'student_email', 'mail');
      if (!email) {
        const cleanName = `${firstName}.${lastName || 'stu'}`.toLowerCase().replace(/[^a-z0-9.]/g, '');
        email = `${cleanName}@campus.edu`;
      }

      const phone = getVal('phone', 'mobile', 'contact', 'phone_number') || '+91 98765 00000';
      const rawGender = getVal('gender', 'sex').toLowerCase();
      const gender: 'Male' | 'Female' | 'Other' =
        rawGender.startsWith('f') ? 'Female' : rawGender.startsWith('o') ? 'Other' : 'Male';

      const dob = getVal('dob', 'date_of_birth', 'birth_date') || '2004-05-15';

      // Department, Degree, Semester, Section
      const department = normalizeDepartment(getVal('department', 'dept', 'branch'));
      const degree = normalizeDegree(getVal('degree', 'course', 'program'));

      const rawSem = parseInt(getVal('semester', 'sem', 'current_semester'), 10);
      const semester: SemesterType = (!isNaN(rawSem) && rawSem >= 1 && rawSem <= 8 ? rawSem : 5) as SemesterType;

      const section = normalizeSection(getVal('section', 'sec'));

      // Academic Year & Class Resolution
      const academicYearId =
        getVal('academicYearId', 'academic_year', 'ay_id') ||
        defaultAcademicYearId ||
        activeAcademicYear?.id ||
        '';

      const explicitClass = getVal('classId', 'class', 'class_name', 'section_name');
      const matchedClass = findMatchingClass(explicitClass, department, semester, section);
      const classId = matchedClass?.id || defaultClassId || classes[0]?.id || '';
      const classNamePreview = matchedClass?.name || 'Assigned via System';

      // Admission Year, CGPA, Attendance
      const rawAdmYear = parseInt(getVal('admissionYear', 'admission_year', 'batch'), 10);
      const admissionYear = !isNaN(rawAdmYear) && rawAdmYear >= 2000 ? rawAdmYear : 2022;

      const rawCgpa = parseFloat(getVal('cgpa', 'gpa', 'score', 'marks'));
      const cgpa = !isNaN(rawCgpa) ? Math.min(10, Math.max(0, parseFloat(rawCgpa.toFixed(2)))) : 8.5;

      const rawAtt = parseFloat(getVal('attendancePercent', 'attendance_percent', 'attendance', 'att'));
      const attendancePercent = !isNaN(rawAtt) ? Math.min(100, Math.max(0, Math.round(rawAtt))) : 90;

      // Status
      const rawStatus = getVal('status', 'student_status').toLowerCase();
      let studentStatus: StudentStatus = 'Active';
      if (rawStatus.includes('inact')) studentStatus = 'Inactive';
      else if (rawStatus.includes('grad')) studentStatus = 'Graduated';
      else if (rawStatus.includes('susp')) studentStatus = 'Suspended';

      // Optional details
      const bloodGroup = getVal('bloodGroup', 'blood_group', 'blood') || 'O+';
      const address = getVal('address', 'residence') || '';
      const guardianName = getVal('guardianName', 'guardian_name', 'parent_name', 'father_name') || '';
      const guardianPhone = getVal('guardianPhone', 'guardian_phone', 'parent_phone') || '';

      // Validation Checks
      const statusMessages: string[] = [];
      let rowStatus: 'valid' | 'warning' | 'error' | 'duplicate' = 'valid';

      // Email regex check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        statusMessages.push('Invalid email format');
        rowStatus = 'warning';
      }

      // Check duplicates in database
      const rollUpper = rollNo.trim().toUpperCase();
      const isExistingInDb = existingRolls.has(rollUpper);
      if (isExistingInDb) {
        statusMessages.push(`Roll number "${rollNo}" already exists in roster`);
        rowStatus = 'duplicate';
      }

      // Check duplicates within the file itself
      if (seenRollsInFile.has(rollUpper)) {
        statusMessages.push(`Duplicate roll number "${rollNo}" inside this CSV file`);
        rowStatus = 'error';
      } else {
        seenRollsInFile.add(rollUpper);
      }

      if (!matchedClass) {
        statusMessages.push('No exact class match found (using fallback)');
        if (rowStatus === 'valid') rowStatus = 'warning';
      }

      return {
        uid: `csv_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 5)}`,
        originalIndex: index + 1,
        isSelected: rowStatus !== 'error',
        status: rowStatus,
        statusMessages,
        rollNo,
        prnNo,
        firstName,
        lastName,
        email,
        phone,
        gender,
        dob,
        department,
        degree,
        academicYearId,
        classId,
        classNamePreview,
        semester,
        section,
        admissionYear,
        cgpa,
        attendancePercent,
        studentStatus,
        bloodGroup,
        address,
        guardianName,
        guardianPhone,
      };
    });

    setParsedRows(rows);
    setStep(2);
    setIsParsing(false);
  };

  // Handle File Upload
  const handleFileUpload = (file: File) => {
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setParseError('Please upload a valid .csv file format');
      return;
    }

    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(1) + ' KB');
    setIsParsing(true);
    setParseError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          setParseError('The CSV file is empty or could not be parsed.');
          setIsParsing(false);
          return;
        }
        processRawRecords(results.data);
      },
      error: (error) => {
        setParseError(`PapaParse Error: ${error.message}`);
        setIsParsing(false);
      },
    });
  };

  // Handle Direct Pasted Text Parse
  const handleParsePastedText = () => {
    if (!pastedText.trim()) {
      setParseError('Please paste your CSV text before parsing.');
      return;
    }

    setIsParsing(true);
    setParseError(null);
    setFileName('Pasted CSV Data');
    setFileSize(`${(pastedText.length / 1024).toFixed(1)} KB`);

    Papa.parse(pastedText.trim(), {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          setParseError('Pasted text contains no valid CSV data rows.');
          setIsParsing(false);
          return;
        }
        processRawRecords(results.data);
      },
      error: (error) => {
        setParseError(`Failed to parse CSV text: ${error.message}`);
        setIsParsing(false);
      },
    });
  };

  // Load Sample Data Handler
  const handleLoadSampleData = () => {
    setIsParsing(true);
    setParseError(null);
    setFileName('sample_students_dataset.csv');
    setFileSize('1.2 KB');

    Papa.parse(SAMPLE_CSV_DATA, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        processRawRecords(results.data);
      },
    });
  };

  // Download Sample CSV Template
  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV_DATA], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'cags_students_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('info', 'Template Downloaded', 'Sample students CSV template downloaded');
  };

  // Toggle selection for a single row
  const toggleRowSelection = (uid: string) => {
    setParsedRows((prev) =>
      prev.map((r) => (r.uid === uid ? { ...r, isSelected: !r.isSelected } : r))
    );
  };

  // Toggle select all
  const toggleSelectAll = (checked: boolean) => {
    setParsedRows((prev) =>
      prev.map((r) => ({
        ...r,
        isSelected: checked && r.status !== 'error',
      }))
    );
  };

  // Remove a row from the preview table
  const handleRemoveRow = (uid: string) => {
    setParsedRows((prev) => prev.filter((r) => r.uid !== uid));
  };

  // Filtered rows for the preview table
  const displayedRows = useMemo(() => {
    if (filterMode === 'valid') {
      return parsedRows.filter((r) => r.status === 'valid');
    }
    if (filterMode === 'issues') {
      return parsedRows.filter((r) => r.status === 'warning' || r.status === 'duplicate' || r.status === 'error');
    }
    return parsedRows;
  }, [parsedRows, filterMode]);

  // Statistics counters
  const stats = useMemo(() => {
    const total = parsedRows.length;
    const selected = parsedRows.filter((r) => r.isSelected).length;
    const valid = parsedRows.filter((r) => r.status === 'valid').length;
    const warnings = parsedRows.filter((r) => r.status === 'warning').length;
    const duplicates = parsedRows.filter((r) => r.status === 'duplicate').length;
    const errors = parsedRows.filter((r) => r.status === 'error').length;
    const issues = warnings + duplicates + errors;

    return { total, selected, valid, warnings, duplicates, errors, issues };
  }, [parsedRows]);

  // Final Execution: Perform Import
  const handleExecuteImport = () => {
    const selectedRows = parsedRows.filter((r) => r.isSelected);

    if (selectedRows.length === 0) {
      addToast('error', 'No Students Selected', 'Please select at least one valid student record to import');
      return;
    }

    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    const newStudentsToInsert: Omit<Student, 'id' | 'createdAt'>[] = [];

    selectedRows.forEach((row) => {
      const existingStudent = students.find(
        (s) => s.rollNo.trim().toUpperCase() === row.rollNo.trim().toUpperCase()
      );

      if (existingStudent) {
        if (duplicateHandling === 'skip') {
          skippedCount++;
          return;
        } else if (duplicateHandling === 'update') {
          // Update existing student
          updateStudent(existingStudent.id, {
            prnNo: row.prnNo,
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            phone: row.phone,
            gender: row.gender,
            dob: row.dob,
            department: row.department,
            degree: row.degree,
            semester: row.semester,
            section: row.section,
            classId: row.classId,
            academicYearId: row.academicYearId,
            cgpa: row.cgpa,
            attendancePercent: row.attendancePercent,
            status: row.studentStatus,
            bloodGroup: row.bloodGroup,
            address: row.address,
            guardianName: row.guardianName,
            guardianPhone: row.guardianPhone,
          });
          updatedCount++;
          return;
        } else if (duplicateHandling === 'new_roll') {
          // Generate new roll number suffix
          row.rollNo = `${row.rollNo}_NEW_${Math.floor(100 + Math.random() * 899)}`;
        }
      }

      newStudentsToInsert.push({
        rollNo: row.rollNo,
        prnNo: row.prnNo,
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        phone: row.phone,
        gender: row.gender,
        dob: row.dob,
        department: row.department,
        degree: row.degree,
        academicYearId: row.academicYearId || activeAcademicYear?.id || '',
        classId: row.classId || defaultClassId || classes[0]?.id || '',
        semester: row.semester,
        section: row.section,
        admissionYear: row.admissionYear,
        cgpa: row.cgpa,
        attendancePercent: row.attendancePercent,
        status: row.studentStatus,
        bloodGroup: row.bloodGroup,
        address: row.address,
        guardianName: row.guardianName,
        guardianPhone: row.guardianPhone,
      });

      importedCount++;
    });

    if (newStudentsToInsert.length > 0) {
      bulkImportStudents(newStudentsToInsert);
    }

    setImportResults({
      totalImported: importedCount,
      totalUpdated: updatedCount,
      totalSkipped: skippedCount,
    });

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b'],
      });
    } catch {
      // ignore
    }

    setStep(3);
  };

  if (!isOpen) return null;

  return (
    <div
      id="csv-import-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-50 to-indigo-50/40 dark:from-slate-900 dark:to-indigo-950/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  Batch Import Students via CSV
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  PapaParse Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Bulk upload, automatically parse, validate, and assign student cohorts in seconds
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-xs cursor-pointer"
              title="Download Sample CSV template"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Sample Template</span>
            </button>

            <button
              onClick={handleModalClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 sm:gap-6 w-full max-w-2xl">
            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  step === 1
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-600/20'
                    : step > 1
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                }`}
              >
                {step > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
              </span>
              <span className={`font-semibold ${step === 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>
                Upload &amp; Parse
              </span>
            </div>

            <div className="h-0.5 flex-1 bg-slate-200 dark:bg-slate-700 mx-2" />

            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  step === 2
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-600/20'
                    : step > 2
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                }`}
              >
                {step > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
              </span>
              <span className={`font-semibold ${step === 2 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>
                Validate &amp; Preview
              </span>
            </div>

            <div className="h-0.5 flex-1 bg-slate-200 dark:bg-slate-700 mx-2" />

            {/* Step 3 */}
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  step === 3
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-600/20'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                }`}
              >
                3
              </span>
              <span className={`font-semibold ${step === 3 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                Completed
              </span>
            </div>
          </div>

          {step === 2 && (
            <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <FileText className="w-3.5 h-3.5" />
              <span>{fileName} ({fileSize})</span>
            </div>
          )}
        </div>

        {/* Modal Body Container */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* ================= STEP 1: UPLOAD OR PASTE ================= */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Input Mode Selector */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
                  <button
                    onClick={() => setInputMode('upload')}
                    className={`px-4 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                      inputMode === 'upload'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Upload CSV File
                  </button>
                  <button
                    onClick={() => setInputMode('paste')}
                    className={`px-4 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                      inputMode === 'paste'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Paste Raw CSV Text
                  </button>
                </div>

                <button
                  onClick={handleLoadSampleData}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Load Sample Student Data</span>
                </button>
              </div>

              {/* Upload Drop Zone */}
              {inputMode === 'upload' && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer relative group ${
                    isDragging
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 scale-[0.99]'
                      : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv,text/plain"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />

                  <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-4 group-hover:scale-110 transition-transform">
                    {isParsing ? (
                      <RefreshCw className="w-7 h-7 animate-spin" />
                    ) : (
                      <Upload className="w-7 h-7" />
                    )}
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {isParsing ? 'Parsing CSV Records with PapaParse...' : 'Choose a CSV file or drag & drop here'}
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                    Supports standard comma-separated, semicolon-separated, or tab-delimited files (.csv or .txt).
                  </p>

                  <div className="mt-4 flex items-center justify-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs">
                      Max 2,000 Rows per batch
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs">
                      UTF-8 Encoded
                    </span>
                  </div>
                </div>
              )}

              {/* Paste Raw Text Box */}
              {inputMode === 'paste' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Paste CSV Content (Include Header Row)
                    </label>
                    <button
                      onClick={() => setPastedText(SAMPLE_CSV_DATA)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
                    >
                      Paste Sample Rows
                    </button>
                  </div>

                  <textarea
                    rows={8}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="rollNo,prnNo,firstName,lastName,email,phone,gender,department,degree,semester,section,cgpa,attendancePercent&#10;24CS101,PRN001,John,Doe,john.doe@campus.edu,+919876543210,Male,Computer Science & Engineering,B.Tech,5,A,8.5,90"
                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-none"
                  />

                  <div className="flex justify-end">
                    <button
                      onClick={handleParsePastedText}
                      disabled={isParsing || !pastedText.trim()}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      {isParsing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      <span>Parse CSV Data</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Parse Error Notification */}
              {parseError && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold block">CSV Parsing Issue</strong>
                    <span>{parseError}</span>
                  </div>
                </div>
              )}

              {/* Supported Columns Guide Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                  <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Supported Column Headers &amp; Auto-Mapping</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700">
                    <strong className="text-indigo-600 dark:text-indigo-400 block font-mono">rollNo / roll</strong>
                    <span className="text-slate-500 dark:text-slate-400">Roll number identifier</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700">
                    <strong className="text-indigo-600 dark:text-indigo-400 block font-mono">firstName, lastName</strong>
                    <span className="text-slate-500 dark:text-slate-400">Or single `name` column</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700">
                    <strong className="text-indigo-600 dark:text-indigo-400 block font-mono">department, degree</strong>
                    <span className="text-slate-500 dark:text-slate-400">Branch (e.g. CSE, IT, AI)</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700">
                    <strong className="text-indigo-600 dark:text-indigo-400 block font-mono">semester, section</strong>
                    <span className="text-slate-500 dark:text-slate-400">Sem (1-8), Sec (A-D)</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700">
                    <strong className="text-indigo-600 dark:text-indigo-400 block font-mono">email, phone</strong>
                    <span className="text-slate-500 dark:text-slate-400">Student contact info</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700">
                    <strong className="text-indigo-600 dark:text-indigo-400 block font-mono">cgpa, attendancePercent</strong>
                    <span className="text-slate-500 dark:text-slate-400">GPA (0-10), Att (0-100%)</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700">
                    <strong className="text-indigo-600 dark:text-indigo-400 block font-mono">classId / class</strong>
                    <span className="text-slate-500 dark:text-slate-400">Auto-links to matching section</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700">
                    <strong className="text-indigo-600 dark:text-indigo-400 block font-mono">guardianName, phone</strong>
                    <span className="text-slate-500 dark:text-slate-400">Parent / emergency contact</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: VALIDATE & PREVIEW ================= */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Batch Configuration & Fallback Toolbar */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-bold text-slate-900 dark:text-white">
                      Batch Import Settings &amp; Allocation Defaults
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Parsed from: <strong className="text-slate-800 dark:text-slate-200">{fileName}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {/* Default Target Class */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Fallback Class (for unmapped rows)
                    </label>
                    <select
                      value={defaultClassId}
                      onChange={(e) => setDefaultClassId(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Default Academic Year */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Target Academic Session
                    </label>
                    <select
                      value={defaultAcademicYearId}
                      onChange={(e) => setDefaultAcademicYearId(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      {academicYears.map((ay) => (
                        <option key={ay.id} value={ay.id}>
                          {ay.name} ({ay.code}) {ay.isActive ? '• Active' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Duplicate Handling Mode */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Existing Student Conflicts
                    </label>
                    <select
                      value={duplicateHandling}
                      onChange={(e) => setDuplicateHandling(e.target.value as any)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="skip">Skip Existing Roll Numbers</option>
                      <option value="update">Overwrite &amp; Update Existing</option>
                      <option value="new_roll">Import as New (Suffix Roll No)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Statistics & Filter Badges */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
                  <button
                    onClick={() => setFilterMode('all')}
                    className={`px-3 py-1 rounded-xl font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      filterMode === 'all'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>All Rows ({stats.total})</span>
                  </button>

                  <button
                    onClick={() => setFilterMode('valid')}
                    className={`px-3 py-1 rounded-xl font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      filterMode === 'valid'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Valid Records ({stats.valid})</span>
                  </button>

                  {stats.issues > 0 && (
                    <button
                      onClick={() => setFilterMode('issues')}
                      className={`px-3 py-1 rounded-xl font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        filterMode === 'issues'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-amber-600 dark:text-amber-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Issues / Conflicts ({stats.issues})</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">
                    <strong className="text-indigo-600 dark:text-indigo-400">{stats.selected}</strong> of {stats.total} selected for import
                  </span>

                  <button
                    onClick={() => toggleSelectAll(stats.selected < stats.total)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    {stats.selected === stats.total ? 'Deselect All' : 'Select All Valid'}
                  </button>
                </div>
              </div>

              {/* Interactive Preview Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
                <div className="overflow-x-auto max-h-[380px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800/90 backdrop-blur-xs text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="py-2.5 pl-4 pr-2 w-10">
                          <input
                            type="checkbox"
                            checked={stats.selected > 0 && stats.selected === stats.total}
                            onChange={(e) => toggleSelectAll(e.target.checked)}
                            className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        </th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Roll &amp; PRN</th>
                        <th className="py-2.5 px-3">Student Name</th>
                        <th className="py-2.5 px-3">Email &amp; Phone</th>
                        <th className="py-2.5 px-3">Dept &amp; Degree</th>
                        <th className="py-2.5 px-3">Sem &amp; Sec</th>
                        <th className="py-2.5 px-3">Allocated Class</th>
                        <th className="py-2.5 px-3 text-center">CGPA</th>
                        <th className="py-2.5 px-3 text-center">Att %</th>
                        <th className="py-2.5 pr-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {displayedRows.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="py-10 text-center text-slate-400">
                            No student rows match the current filter.
                          </td>
                        </tr>
                      ) : (
                        displayedRows.map((row) => (
                          <tr
                            key={row.uid}
                            className={`transition-colors ${
                              !row.isSelected
                                ? 'opacity-50 bg-slate-50/50 dark:bg-slate-900/40'
                                : row.status === 'error'
                                ? 'bg-rose-50/30 dark:bg-rose-950/20'
                                : row.status === 'duplicate'
                                ? 'bg-amber-50/30 dark:bg-amber-950/20'
                                : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            {/* Checkbox */}
                            <td className="py-2.5 pl-4 pr-2">
                              <input
                                type="checkbox"
                                checked={row.isSelected}
                                disabled={row.status === 'error'}
                                onChange={() => toggleRowSelection(row.uid)}
                                className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              />
                            </td>

                            {/* Status Badge */}
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              {row.status === 'valid' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                  <Check className="w-3 h-3" /> Valid
                                </span>
                              )}
                              {row.status === 'warning' && (
                                <span
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                                  title={row.statusMessages.join(', ')}
                                >
                                  <AlertTriangle className="w-3 h-3" /> Warning
                                </span>
                              )}
                              {row.status === 'duplicate' && (
                                <span
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
                                  title={row.statusMessages.join(', ')}
                                >
                                  <RefreshCw className="w-3 h-3" /> In Roster
                                </span>
                              )}
                              {row.status === 'error' && (
                                <span
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                                  title={row.statusMessages.join(', ')}
                                >
                                  <AlertCircle className="w-3 h-3" /> Conflict
                                </span>
                              )}
                            </td>

                            {/* Roll No */}
                            <td className="py-2.5 px-3">
                              <span className="font-mono font-bold text-slate-900 dark:text-white block">
                                {row.rollNo}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400 block">
                                {row.prnNo}
                              </span>
                            </td>

                            {/* Name */}
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span className="font-semibold text-slate-900 dark:text-white block">
                                {row.firstName} {row.lastName}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {row.gender} • {row.dob}
                              </span>
                            </td>

                            {/* Email */}
                            <td className="py-2.5 px-3">
                              <span className="text-slate-700 dark:text-slate-300 block truncate max-w-[150px]">
                                {row.email}
                              </span>
                              <span className="text-[10px] text-slate-400 block font-mono">
                                {row.phone}
                              </span>
                            </td>

                            {/* Dept & Degree */}
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span className="font-medium text-slate-800 dark:text-slate-200 block truncate max-w-[140px]">
                                {row.department}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                {row.degree} • {row.admissionYear}
                              </span>
                            </td>

                            {/* Sem & Sec */}
                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                Sem {row.semester}
                              </span>
                              <span className="text-slate-400 text-[10px] block">
                                Sec {row.section}
                              </span>
                            </td>

                            {/* Class */}
                            <td className="py-2.5 px-3">
                              <span className="text-indigo-600 dark:text-indigo-400 font-medium block truncate max-w-[150px]">
                                {row.classNamePreview}
                              </span>
                            </td>

                            {/* CGPA */}
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                              {row.cgpa.toFixed(2)}
                            </td>

                            {/* Attendance */}
                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`font-mono text-[11px] font-bold ${
                                  row.attendancePercent >= 75
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-rose-600 dark:text-rose-400'
                                }`}
                              >
                                {row.attendancePercent}%
                              </span>
                            </td>

                            {/* Remove Row */}
                            <td className="py-2.5 pr-4 text-right">
                              <button
                                onClick={() => handleRemoveRow(row.uid)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                title="Remove from import"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: SUCCESS RESULTS ================= */}
          {step === 3 && (
            <div className="py-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-600/20">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div className="space-y-1.5">
                <h3 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white">
                  Batch Import Complete!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Student records have been processed and enrolled into the institutional roster.
                </p>
              </div>

              {/* Import Summary Badges */}
              <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto text-xs">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                  <div className="text-2xl font-black font-heading mb-1">
                    {importResults.totalImported}
                  </div>
                  <span className="font-semibold block">Enrolled as New</span>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300">
                  <div className="text-2xl font-black font-heading mb-1">
                    {importResults.totalUpdated}
                  </div>
                  <span className="font-semibold block">Updated Records</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                  <div className="text-2xl font-black font-heading mb-1">
                    {importResults.totalSkipped}
                  </div>
                  <span className="font-semibold block">Skipped / Ignored</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 flex items-center justify-between shrink-0 text-xs">
          {step === 1 && (
            <>
              <button
                type="button"
                onClick={handleModalClose}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Get Sample Template</span>
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Upload</span>
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleExecuteImport}
                  disabled={stats.selected === 0}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Import {stats.selected} Students</span>
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="w-full flex items-center justify-end">
              <button
                type="button"
                onClick={handleModalClose}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                View Updated Students Roster
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
