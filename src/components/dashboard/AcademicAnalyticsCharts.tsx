import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Users,
  GraduationCap,
  Award,
  Scale,
  Sparkles,
  Info,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Building,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  Settings2,
  BarChart3,
  Sliders,
  HelpCircle,
  Briefcase,
  UserPlus,
} from 'lucide-react';
import { Student, Faculty, ClassEntity, AcademicYear } from '../../types';
import { DownloadReportModal } from './DownloadReportModal';
import {
  exportDashboardReportPDF,
  exportDashboardReportCSV,
} from '../../utils/reportGenerator';

interface AcademicAnalyticsChartsProps {
  students: Student[];
  faculties: Faculty[];
  classes: ClassEntity[];
  academicYears: AcademicYear[];
  activeAcademicYear?: AcademicYear;
  isDark: boolean;
}

type AnalyticsViewMode = 'all' | 'enrollment' | 'ratio';
type EnrollmentSubMode = 'degree' | 'department' | 'growth';
type BenchmarkStandard = 'UGC' | 'AICTE' | 'NAAC';

interface BenchmarkConfig {
  id: BenchmarkStandard;
  name: string;
  targetRatio: number;
  moderateThreshold: number;
  description: string;
  badgeColor: string;
}

const BENCHMARK_CONFIGS: Record<BenchmarkStandard, BenchmarkConfig> = {
  UGC: {
    id: 'UGC',
    name: 'UGC Benchmark (1:15)',
    targetRatio: 15,
    moderateThreshold: 20,
    description: 'University Grants Commission standard for higher education institutions',
    badgeColor: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20',
  },
  AICTE: {
    id: 'AICTE',
    name: 'AICTE Technical (1:20)',
    targetRatio: 20,
    moderateThreshold: 25,
    description: 'All India Council for Technical Education engineering faculty standard',
    badgeColor: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20',
  },
  NAAC: {
    id: 'NAAC',
    name: 'NAAC A++ Accr. (1:12)',
    targetRatio: 12,
    moderateThreshold: 16,
    description: 'National Assessment and Accreditation Council elite tier ratio',
    badgeColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
  },
};

const DEPT_SHORT_COLORS: Record<string, string> = {
  CSE: '#4f46e5',
  IT: '#06b6d4',
  ECE: '#8b5cf6',
  MECH: '#10b981',
  'AI & DS': '#f59e0b',
  MBA: '#ec4899',
  BCA: '#3b82f6',
  CIVIL: '#64748b',
};

export const AcademicAnalyticsCharts: React.FC<AcademicAnalyticsChartsProps> = ({
  students,
  faculties,
  classes,
  academicYears,
  activeAcademicYear,
  isDark,
}) => {
  const [activeTab, setActiveTab] = useState<AnalyticsViewMode>('all');
  const [enrollmentSubMode, setEnrollmentSubMode] = useState<EnrollmentSubMode>('degree');
  const [benchmarkStandard, setBenchmarkStandard] = useState<BenchmarkStandard>('UGC');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [hoveredRatioDept, setHoveredRatioDept] = useState<string | null>(null);

  const currentBenchmark = BENCHMARK_CONFIGS[benchmarkStandard];

  // Shorten department names for charts
  const getShortDept = (dept: string) => {
    return dept
      .replace('Computer Science & Engineering', 'CSE')
      .replace('Information Technology', 'IT')
      .replace('Electronics & Communication', 'ECE')
      .replace('Mechanical Engineering', 'MECH')
      .replace('Civil Engineering', 'CIVIL')
      .replace('Artificial Intelligence & Data Science', 'AI & DS')
      .replace('Management Studies (MBA)', 'MBA')
      .replace('Computer Applications (BCA/MCA)', 'BCA');
  };

  // 1. Compute Longitudinal Enrollment Trends
  const enrollmentTrendData = useMemo(() => {
    const yearMap: {
      [year: number]: {
        year: number;
        total: number;
        BTech: number;
        MTech: number;
        BCA: number;
        MCA: number;
        MBA: number;
        CSE: number;
        IT: number;
        ECE: number;
        MECH: number;
        'AI & DS': number;
      };
    } = {};

    const baseYears = [2021, 2022, 2023, 2024, 2025];
    baseYears.forEach((y) => {
      yearMap[y] = {
        year: y,
        total: 0,
        BTech: 0,
        MTech: 0,
        BCA: 0,
        MCA: 0,
        MBA: 0,
        CSE: 0,
        IT: 0,
        ECE: 0,
        MECH: 0,
        'AI & DS': 0,
      };
    });

    students.forEach((s) => {
      const yr = s.admissionYear || 2024;
      if (!yearMap[yr]) {
        yearMap[yr] = {
          year: yr,
          total: 0,
          BTech: 0,
          MTech: 0,
          BCA: 0,
          MCA: 0,
          MBA: 0,
          CSE: 0,
          IT: 0,
          ECE: 0,
          MECH: 0,
          'AI & DS': 0,
        };
      }
      yearMap[yr].total += 1;

      // Degree breakdown
      const deg = s.degree as 'B.Tech' | 'M.Tech' | 'BCA' | 'MCA' | 'MBA';
      if (deg === 'B.Tech') yearMap[yr].BTech += 1;
      else if (deg === 'M.Tech') yearMap[yr].MTech += 1;
      else if (deg === 'BCA') yearMap[yr].BCA += 1;
      else if (deg === 'MCA') yearMap[yr].MCA += 1;
      else if (deg === 'MBA') yearMap[yr].MBA += 1;

      // Department breakdown
      const shortD = getShortDept(s.department);
      if (shortD === 'CSE') yearMap[yr].CSE += 1;
      else if (shortD === 'IT') yearMap[yr].IT += 1;
      else if (shortD === 'ECE') yearMap[yr].ECE += 1;
      else if (shortD === 'MECH') yearMap[yr].MECH += 1;
      else if (shortD === 'AI & DS') yearMap[yr]['AI & DS'] += 1;
    });

    const sorted = Object.values(yearMap).sort((a, b) => a.year - b.year);

    // Compute YoY Growth rate
    return sorted.map((item, idx, arr) => {
      let yoyGrowth = 0;
      if (idx > 0 && arr[idx - 1].total > 0) {
        yoyGrowth = Number((((item.total - arr[idx - 1].total) / arr[idx - 1].total) * 100).toFixed(1));
      }
      return {
        ...item,
        yoyGrowth,
        growthLabel: `${yoyGrowth > 0 ? '+' : ''}${yoyGrowth}%`,
      };
    });
  }, [students]);

  // 2. Compute Department Faculty-to-Student Ratio (FSR) with Dynamic Benchmark
  const departmentRatioData = useMemo(() => {
    const deptMap: {
      [shortDept: string]: {
        fullName: string;
        students: number;
        faculties: number;
        classes: number;
        avgCgpa: number;
        cgpaSum: number;
      };
    } = {};

    // Group students
    students.forEach((s) => {
      const short = getShortDept(s.department);
      if (!deptMap[short]) {
        deptMap[short] = {
          fullName: s.department,
          students: 0,
          faculties: 0,
          classes: 0,
          avgCgpa: 0,
          cgpaSum: 0,
        };
      }
      deptMap[short].students += 1;
      deptMap[short].cgpaSum += s.cgpa;
    });

    // Group faculties
    faculties.forEach((f) => {
      const short = getShortDept(f.department);
      if (!deptMap[short]) {
        deptMap[short] = {
          fullName: f.department,
          students: 0,
          faculties: 0,
          classes: 0,
          avgCgpa: 0,
          cgpaSum: 0,
        };
      }
      deptMap[short].faculties += 1;
    });

    // Group classes
    classes.forEach((c) => {
      const short = getShortDept(c.department);
      if (!deptMap[short]) {
        deptMap[short] = {
          fullName: c.department,
          students: 0,
          faculties: 0,
          classes: 0,
          avgCgpa: 0,
          cgpaSum: 0,
        };
      }
      deptMap[short].classes += 1;
    });

    const { targetRatio, moderateThreshold } = currentBenchmark;

    return Object.keys(deptMap).map((short) => {
      const item = deptMap[short];
      const studCount = item.students;
      const facCount = item.faculties || 1;
      const ratioValue = Number((studCount / facCount).toFixed(1));
      const avgCgpa = studCount > 0 ? Number((item.cgpaSum / studCount).toFixed(2)) : 0;

      // Status determination based on chosen standard
      let status: 'Ideal' | 'Moderate' | 'High Load' = 'Ideal';
      let statusColor = '#10b981'; // emerald
      if (ratioValue > moderateThreshold) {
        status = 'High Load';
        statusColor = '#ef4444'; // red
      } else if (ratioValue > targetRatio) {
        status = 'Moderate';
        statusColor = '#f59e0b'; // amber
      }

      // Calculate required faculty to meet target benchmark
      const requiredFaculties = Math.ceil(studCount / targetRatio);
      const facultyGap = Math.max(0, requiredFaculties - item.faculties);

      return {
        department: short,
        fullName: item.fullName,
        students: studCount,
        faculties: item.faculties,
        classes: item.classes,
        ratioValue,
        ratioLabel: `1 : ${ratioValue}`,
        targetRatio,
        avgCgpa,
        status,
        statusColor,
        requiredFaculties,
        facultyGap,
      };
    });
  }, [students, faculties, classes, currentBenchmark]);

  // Overall Global Ratio
  const globalStudentCount = students.length;
  const globalFacultyCount = faculties.length || 1;
  const overallRatio = (globalStudentCount / globalFacultyCount).toFixed(1);
  const ratioDelta = (Number(overallRatio) - currentBenchmark.targetRatio).toFixed(1);

  // Departments needing recruitment
  const departmentsWithGap = useMemo(() => {
    return departmentRatioData.filter((d) => d.facultyGap > 0);
  }, [departmentRatioData]);

  // Filtered department ratio list
  const filteredRatioData = useMemo(() => {
    if (selectedDeptFilter === 'ALL') return departmentRatioData;
    return departmentRatioData.filter((d) => d.department === selectedDeptFilter);
  }, [departmentRatioData, selectedDeptFilter]);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3.5 rounded-2xl bg-slate-900/95 text-white border border-slate-700 shadow-2xl backdrop-blur-md text-xs space-y-1.5 min-w-[190px] z-50">
          <div className="font-heading font-bold text-white border-b border-slate-700/80 pb-1 flex items-center justify-between">
            <span>{label}</span>
            <span className="text-[10px] text-indigo-300 font-mono">Academic Metrics</span>
          </div>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color || entry.fill }}
                />
                {entry.name}:
              </span>
              <span className="font-bold text-white font-mono">
                {entry.value}
                {entry.dataKey === 'ratioValue' ? ' st/fac' : ''}
                {entry.dataKey === 'yoyGrowth' ? '%' : ''}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6" id="academic-analytics-charts-container">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              Academic Analytics &amp; Enrollment Intelligence
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive longitudinal enrollment trends and faculty-to-student ratio (FSR) benchmarks
            </p>
          </div>
        </div>

        {/* View Mode Tabs & Download Report Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 shrink-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('enrollment')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'enrollment'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" /> Enrollment Trends
            </button>
            <button
              onClick={() => setActiveTab('ratio')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'ratio'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Scale className="w-3.5 h-3.5" /> Faculty-Student Ratios
            </button>
          </div>

          {/* Download Report Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              className="px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              title="Download Academic & Faculty Analytics Report"
            >
              <Download className="w-4 h-4" />
              <span>Download Report</span>
              <ChevronDown className="w-3.5 h-3.5 text-indigo-200" />
            </button>

            {isExportDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsExportDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl z-30 p-2 space-y-1">
                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-700/60 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Academic Analytics Report
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {students.length} Students • {faculties.length} Faculty
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      exportDashboardReportPDF(students, faculties, classes, {
                        activeAcademicYear,
                      });
                      setIsExportDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-700 dark:hover:text-indigo-400 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span>Executive PDF Report</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold">
                      .pdf
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      exportDashboardReportCSV(students, faculties, classes, {
                        activeAcademicYear,
                      });
                      setIsExportDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>Analytical CSV Summary</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold">
                      .csv
                    </span>
                  </button>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-700/60 mt-1">
                    <button
                      onClick={() => {
                        setIsExportDropdownOpen(false);
                        setIsReportModalOpen(true);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Settings2 className="w-4 h-4" />
                      <span>Custom Report Builder...</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards: Institutional Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Ratio Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Institutional FSR</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Scale className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
              1 : {overallRatio}
            </span>
            <span
              className={`text-[11px] font-bold px-1.5 py-0.2 rounded-md ${
                Number(overallRatio) <= currentBenchmark.targetRatio
                  ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950'
                  : 'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950'
              }`}
            >
              {Number(overallRatio) <= currentBenchmark.targetRatio ? 'Optimal' : 'Moderate'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Target benchmark: <strong>1 : {currentBenchmark.targetRatio}</strong> ({benchmarkStandard})
          </p>
        </div>

        {/* Total Active Enrollment */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Enrolled Cohort</span>
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <GraduationCap className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
              {globalStudentCount}
            </span>
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
              Across 5 Cohorts
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Batches 2021 through 2025
          </p>
        </div>

        {/* Faculty Strength */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Faculty Strength</span>
            <span className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
              {faculties.length}
            </span>
            <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
              Active Mentors
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {faculties.filter((f) => f.isCoordinatorEligible).length} coordinator eligible
          </p>
        </div>

        {/* Recruitment Needs based on chosen benchmark */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Accreditation Health</span>
            <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
              {departmentsWithGap.length === 0 ? '100% Compliant' : `${departmentsWithGap.length} Depts Gap`}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {departmentsWithGap.length === 0
              ? 'All departments meet benchmark'
              : `Review hiring recommendations`}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: Student Enrollment Trends Over Admission Batches */}
        {(activeTab === 'all' || activeTab === 'enrollment') && (
          <div
            className={`p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col ${
              activeTab === 'enrollment' ? 'lg:col-span-2' : ''
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Student Enrollment Trends (Cohort Batches)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Annual intake growth and program breakdown across admission cycles
                </p>
              </div>

              {/* Sub-mode selector */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  onClick={() => setEnrollmentSubMode('degree')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    enrollmentSubMode === 'degree'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="View breakdown by Degree Program"
                >
                  By Degree
                </button>
                <button
                  onClick={() => setEnrollmentSubMode('department')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    enrollmentSubMode === 'department'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="View breakdown by Department"
                >
                  By Dept
                </button>
                <button
                  onClick={() => setEnrollmentSubMode('growth')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    enrollmentSubMode === 'growth'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="View Year-over-Year Growth Rate"
                >
                  YoY Growth
                </button>
              </div>
            </div>

            <div className="h-72 sm:h-80 w-full min-h-[280px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                {enrollmentSubMode === 'degree' ? (
                  <ComposedChart
                    data={enrollmentTrendData}
                    margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="totalEnrollmentGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} opacity={0.6} />
                    <XAxis dataKey="year" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} />
                    <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      iconType="circle"
                      formatter={(value) => <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{value}</span>}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      name="Total Admissions"
                      stroke="#6366f1"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#totalEnrollmentGrad)"
                    />
                    <Bar dataKey="BTech" name="B.Tech" stackId="deg" fill="#3b82f6" radius={[0, 0, 0, 0]} barSize={18} />
                    <Bar dataKey="BCA" name="BCA" stackId="deg" fill="#10b981" radius={[0, 0, 0, 0]} barSize={18} />
                    <Bar dataKey="MCA" name="MCA" stackId="deg" fill="#f59e0b" radius={[0, 0, 0, 0]} barSize={18} />
                    <Bar dataKey="MBA" name="MBA" stackId="deg" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={18} />
                  </ComposedChart>
                ) : enrollmentSubMode === 'department' ? (
                  <ComposedChart
                    data={enrollmentTrendData}
                    margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} opacity={0.6} />
                    <XAxis dataKey="year" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} />
                    <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      iconType="circle"
                      formatter={(value) => <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{value}</span>}
                    />
                    <Line type="monotone" dataKey="CSE" name="CSE" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="IT" name="IT" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="ECE" name="ECE" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="MECH" name="MECH" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="AI & DS" name="AI & DS" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
                  </ComposedChart>
                ) : (
                  <ComposedChart
                    data={enrollmentTrendData}
                    margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} opacity={0.6} />
                    <XAxis dataKey="year" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} />
                    <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} unit="%" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      formatter={(value) => <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{value}</span>}
                    />
                    <ReferenceLine y={0} stroke="#94a3b8" />
                    <Bar dataKey="yoyGrowth" name="YoY Growth Rate (%)" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={26}>
                      {enrollmentTrendData.map((entry, index) => (
                        <Cell
                          key={`cell-growth-${index}`}
                          fill={entry.yoyGrowth >= 0 ? '#10b981' : '#ef4444'}
                        />
                      ))}
                    </Bar>
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                {enrollmentTrendData.length > 1 &&
                  `Average batch growth: +${(
                    enrollmentTrendData.slice(1).reduce((acc, curr) => acc + curr.yoyGrowth, 0) /
                    (enrollmentTrendData.length - 1)
                  ).toFixed(1)}% annually`}
              </span>
              <span>Updated from Live Student Registry</span>
            </div>
          </div>
        )}

        {/* CHART 2: Faculty-to-Student Ratio (FSR) by Academic Department */}
        {(activeTab === 'all' || activeTab === 'ratio') && (
          <div
            className={`p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col ${
              activeTab === 'ratio' ? 'lg:col-span-2' : ''
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Faculty-to-Student Ratios (FSR) &amp; Benchmark
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Calculated student load per faculty member compared against regulatory standards
                </p>
              </div>

              {/* Regulatory standard selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">Benchmark:</span>
                <select
                  value={benchmarkStandard}
                  onChange={(e) => setBenchmarkStandard(e.target.value as BenchmarkStandard)}
                  className="px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="UGC">UGC Standard (1:15)</option>
                  <option value="AICTE">AICTE Technical (1:20)</option>
                  <option value="NAAC">NAAC A++ (1:12)</option>
                </select>
              </div>
            </div>

            <div className="h-72 sm:h-80 w-full min-h-[280px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={departmentRatioData}
                  margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
                  onMouseMove={(state: any) => {
                    if (state && state.activePayload && state.activePayload.length) {
                      setHoveredRatioDept(state.activePayload[0].payload.department);
                    }
                  }}
                  onMouseLeave={() => setHoveredRatioDept(null)}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} opacity={0.6} />
                  <XAxis dataKey="department" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} />
                  <YAxis
                    stroke={isDark ? '#94a3b8' : '#64748b'}
                    fontSize={11}
                    tickLine={false}
                    label={{
                      value: 'Ratio (1:N)',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 25,
                      fontSize: 10,
                      fill: isDark ? '#94a3b8' : '#64748b',
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    formatter={(value) => <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{value}</span>}
                  />
                  <ReferenceLine
                    y={currentBenchmark.targetRatio}
                    label={{
                      value: `${benchmarkStandard} Target 1:${currentBenchmark.targetRatio}`,
                      position: 'top',
                      fill: '#f59e0b',
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                  />
                  <Bar
                    dataKey="ratioValue"
                    name="Current Student Load per Faculty"
                    radius={[6, 6, 0, 0]}
                    barSize={24}
                  >
                    {departmentRatioData.map((entry, index) => {
                      const isHovered = hoveredRatioDept === entry.department;
                      return (
                        <Cell
                          key={`cell-ratio-${index}`}
                          fill={entry.statusColor}
                          opacity={hoveredRatioDept ? (isHovered ? 1 : 0.5) : 0.9}
                          className="transition-opacity duration-200 cursor-pointer"
                        />
                      );
                    })}
                  </Bar>
                  <Line
                    type="monotone"
                    dataKey="faculties"
                    name="Faculty Count"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Ideal (≤{currentBenchmark.targetRatio})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Moderate ({currentBenchmark.targetRatio + 1}–{currentBenchmark.moderateThreshold})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> High Load (&gt;{currentBenchmark.moderateThreshold})
                </span>
              </div>
              <span>Institutional Ratio: <strong>1 : {overallRatio}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Actionable Hiring & Faculty Load Recommendation Box */}
      {departmentsWithGap.length > 0 && (
        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                Faculty Recruitment &amp; Workload Balancing Advisory
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                  {benchmarkStandard} Target 1:{currentBenchmark.targetRatio}
                </span>
              </h4>
              <p className="text-xs text-indigo-800/80 dark:text-indigo-300/80 mt-0.5">
                To achieve the 1:{currentBenchmark.targetRatio} accreditation target across all departments, recommend adding{' '}
                <strong>
                  {departmentsWithGap.reduce((acc, d) => acc + d.facultyGap, 0)} total faculty members
                </strong>{' '}
                across {departmentsWithGap.map((d) => `${d.department} (+${d.facultyGap})`).join(', ')}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Department Ratios & Resource Allocation Table */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Department Academic Resource Matrix
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Departmental breakdown of student enrollment, teaching faculty, active sections, and mentorship load
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Filter Dept:</span>
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              {departmentRatioData.map((d) => (
                <option key={d.department} value={d.department}>
                  {d.department} ({d.fullName})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                <th className="pb-3 pl-2">Department</th>
                <th className="pb-3 text-center">Enrolled Students</th>
                <th className="pb-3 text-center">Faculty Members</th>
                <th className="pb-3 text-center">Class Sections</th>
                <th className="pb-3 text-center">Faculty-Student Ratio</th>
                <th className="pb-3 text-center">Average CGPA</th>
                <th className="pb-3 text-center">Faculty Gap</th>
                <th className="pb-3 pr-2 text-right">Ratio Health Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {filteredRatioData.map((dept) => (
                <tr key={dept.department} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 pl-2">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-mono text-[11px]">
                        {dept.department}
                      </span>
                      <span>{dept.fullName}</span>
                    </div>
                  </td>
                  <td className="py-3 text-center font-semibold font-mono text-slate-900 dark:text-white">
                    {dept.students}
                  </td>
                  <td className="py-3 text-center font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                    {dept.faculties}
                  </td>
                  <td className="py-3 text-center font-semibold font-mono text-purple-600 dark:text-purple-400">
                    {dept.classes}
                  </td>
                  <td className="py-3 text-center">
                    <span className="px-2.5 py-1 rounded-full font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
                      1 : {dept.ratioValue}
                    </span>
                  </td>
                  <td className="py-3 text-center font-semibold text-slate-700 dark:text-slate-300">
                    {dept.avgCgpa > 0 ? dept.avgCgpa : 'N/A'}
                  </td>
                  <td className="py-3 text-center">
                    {dept.facultyGap > 0 ? (
                      <span className="text-rose-600 dark:text-rose-400 font-bold font-mono text-xs">
                        +{dept.facultyGap} needed
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium text-xs">
                        Compliant
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-2 text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        dept.status === 'Ideal'
                          ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                          : dept.status === 'Moderate'
                          ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
                          : 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
                      }`}
                    >
                      {dept.status === 'Ideal' && <CheckCircle2 className="w-3 h-3" />}
                      {dept.status === 'Moderate' && <Info className="w-3 h-3" />}
                      {dept.status === 'High Load' && <AlertCircle className="w-3 h-3" />}
                      {dept.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Download Report Advanced Custom Modal */}
      <DownloadReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        students={students}
        faculties={faculties}
        classes={classes}
        academicYears={academicYears}
        activeAcademicYear={activeAcademicYear}
      />
    </div>
  );
};
