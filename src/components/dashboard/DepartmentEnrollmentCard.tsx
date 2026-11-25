import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  LabelList,
} from 'recharts';
import {
  Building2,
  Users,
  GraduationCap,
  TrendingUp,
  ArrowUpRight,
  Filter,
  Calendar,
  Layers,
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  Award,
} from 'lucide-react';
import { Student, ClassEntity, AcademicYear, ActiveTab } from '../../types';

interface DepartmentEnrollmentCardProps {
  students: Student[];
  classes: ClassEntity[];
  academicYears: AcademicYear[];
  activeAcademicYear?: AcademicYear;
  isDark: boolean;
  onNavigate?: (tab: ActiveTab) => void;
}

interface DepartmentChartItem {
  code: string;
  name: string;
  fullName: string;
  students: number;
  capacity: number;
  classesCount: number;
  avgCgpa: number;
  percentage: number;
  fillRate: number;
  color: string;
}

const DEPT_COLORS: { [code: string]: string } = {
  CSE: '#4f46e5', // Indigo
  IT: '#06b6d4', // Cyan
  ECE: '#8b5cf6', // Violet
  MECH: '#10b981', // Emerald
  'AI & DS': '#f59e0b', // Amber
  MBA: '#ec4899', // Pink
  BCA: '#3b82f6', // Blue
  CIVIL: '#64748b', // Slate
  OTHER: '#6366f1',
};

export const DepartmentEnrollmentCard: React.FC<DepartmentEnrollmentCardProps> = ({
  students,
  classes,
  academicYears,
  activeAcademicYear,
  isDark,
  onNavigate,
}) => {
  // Selected academic year filter (defaults to active academic year or first one)
  const [selectedYearId, setSelectedYearId] = useState<string>(
    activeAcademicYear?.id || (academicYears.length > 0 ? academicYears[0].id : 'ALL')
  );
  const [sortBy, setSortBy] = useState<'count' | 'alphabetical'>('count');
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  // Department name shortener
  const getShortDept = (dept: string): string => {
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

  // Find currently selected academic year object
  const currentAcademicYear = useMemo(() => {
    return academicYears.find((ay) => ay.id === selectedYearId) || activeAcademicYear;
  }, [academicYears, selectedYearId, activeAcademicYear]);

  // Filter students and classes for the chosen academic year
  const filteredStudents = useMemo(() => {
    if (!selectedYearId || selectedYearId === 'ALL') return students;
    const yearMatched = students.filter((s) => s.academicYearId === selectedYearId);
    // If no students match specific ID, fall back to all students to avoid blank charts
    return yearMatched.length > 0 ? yearMatched : students;
  }, [students, selectedYearId]);

  const filteredClasses = useMemo(() => {
    if (!selectedYearId || selectedYearId === 'ALL') return classes;
    const yearMatched = classes.filter((c) => c.academicYearId === selectedYearId);
    return yearMatched.length > 0 ? yearMatched : classes;
  }, [classes, selectedYearId]);

  // Aggregate enrollment counts and metadata per department
  const chartData: DepartmentChartItem[] = useMemo(() => {
    const deptMap: {
      [code: string]: {
        fullName: string;
        students: number;
        capacity: number;
        classesCount: number;
        cgpaSum: number;
      };
    } = {};

    // Get all unique departments across students and classes
    const allDepts = Array.from(
      new Set([
        ...students.map((s) => s.department),
        ...classes.map((c) => c.department),
      ])
    );

    allDepts.forEach((dept) => {
      const code = getShortDept(dept);
      deptMap[code] = {
        fullName: dept,
        students: 0,
        capacity: 0,
        classesCount: 0,
        cgpaSum: 0,
      };
    });

    filteredStudents.forEach((s) => {
      const code = getShortDept(s.department);
      if (!deptMap[code]) {
        deptMap[code] = {
          fullName: s.department,
          students: 0,
          capacity: 0,
          classesCount: 0,
          cgpaSum: 0,
        };
      }
      deptMap[code].students += 1;
      deptMap[code].cgpaSum += s.cgpa || 0;
    });

    filteredClasses.forEach((c) => {
      const code = getShortDept(c.department);
      if (deptMap[code]) {
        deptMap[code].capacity += c.capacity || 60;
        deptMap[code].classesCount += 1;
      }
    });

    const totalStudents = filteredStudents.length || 1;

    let list: DepartmentChartItem[] = Object.keys(deptMap).map((code) => {
      const item = deptMap[code];
      const count = item.students;
      const pct = Number(((count / totalStudents) * 100).toFixed(1));
      const cap = item.capacity > 0 ? item.capacity : count * 1.2;
      const fillRate = cap > 0 ? Math.round((count / cap) * 100) : 100;
      const avgCgpa = count > 0 ? Number((item.cgpaSum / count).toFixed(2)) : 0;
      const color = DEPT_COLORS[code] || DEPT_COLORS.OTHER;

      return {
        code,
        name: code,
        fullName: item.fullName,
        students: count,
        capacity: item.capacity,
        classesCount: item.classesCount,
        avgCgpa,
        percentage: pct,
        fillRate,
        color,
      };
    });

    // Sort chart items
    if (sortBy === 'count') {
      list.sort((a, b) => b.students - a.students);
    } else {
      list.sort((a, b) => a.code.localeCompare(b.code));
    }

    return list;
  }, [filteredStudents, filteredClasses, students, classes, sortBy]);

  // Overall calculations for summary badges
  const totalEnrolled = filteredStudents.length;
  const topDepartment = useMemo(() => {
    if (chartData.length === 0) return null;
    return [...chartData].sort((a, b) => b.students - a.students)[0];
  }, [chartData]);

  const avgPerDept = useMemo(() => {
    if (chartData.length === 0) return 0;
    return Math.round(totalEnrolled / chartData.length);
  }, [totalEnrolled, chartData]);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item: DepartmentChartItem = payload[0].payload;
      return (
        <div className="p-3.5 rounded-2xl bg-slate-900/95 text-white border border-slate-700 shadow-2xl backdrop-blur-md text-xs min-w-[200px]">
          <div className="flex items-center justify-between gap-2 border-b border-slate-700/80 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-bold text-sm text-white">{item.code}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {item.percentage}% Share
            </span>
          </div>

          <p className="text-[11px] text-slate-300 font-medium mb-2 line-clamp-1">
            {item.fullName}
          </p>

          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Enrolled Students:</span>
              <span className="font-bold text-indigo-400 font-mono text-xs">
                {item.students}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Class Sections:</span>
              <span className="font-semibold text-slate-200 font-mono">
                {item.classesCount}
              </span>
            </div>
            {item.capacity > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Seat Capacity:</span>
                <span className="font-semibold text-slate-300 font-mono">
                  {item.capacity}
                </span>
              </div>
            )}
            {item.avgCgpa > 0 && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                <span className="text-slate-400">Average CGPA:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {item.avgCgpa} / 10.0
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="department-enrollment-summary-card"
      className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden transition-all"
    >
      {/* Top Header & Interactive Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                Department Enrollment Summary
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {currentAcademicYear?.code || 'AY 2024-25'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Student enrollment counts and distribution breakdown for the current academic session
              </p>
            </div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Academic Year Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <select
              value={selectedYearId}
              onChange={(e) => setSelectedYearId(e.target.value)}
              className="bg-transparent font-semibold focus:outline-none cursor-pointer pr-2 text-xs"
            >
              {academicYears.map((ay) => (
                <option
                  key={ay.id}
                  value={ay.id}
                  className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {ay.name} {ay.isActive ? '(Active)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
            <button
              onClick={() => setSortBy('count')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                sortBy === 'count'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Sort by highest student count"
            >
              Highest
            </button>
            <button
              onClick={() => setSortBy('alphabetical')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                sortBy === 'alphabetical'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Sort alphabetically by department code"
            >
              A–Z
            </button>
          </div>

          {/* Jump to Students Roster */}
          {onNavigate && (
            <button
              onClick={() => onNavigate('students')}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-semibold text-xs flex items-center gap-1 border border-indigo-200/60 dark:border-indigo-500/20 transition-colors cursor-pointer"
            >
              <span>View Roster</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Recharts Bar Chart & Key Quick Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
        {/* Recharts Bar Chart (3 Cols) */}
        <div className="lg:col-span-3">
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 10, left: -20, bottom: 20 }}
                barSize={32}
                onMouseMove={(state: any) => {
                  if (state && state.activePayload && state.activePayload.length) {
                    setHoveredBar(state.activePayload[0].payload.code);
                  }
                }}
                onMouseLeave={() => setHoveredBar(null)}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? '#334155' : '#f1f5f9'}
                  vertical={false}
                />
                <XAxis
                  dataKey="code"
                  tick={{
                    fill: isDark ? '#94a3b8' : '#64748b',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                  axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
                  tickLine={false}
                  dy={6}
                />
                <YAxis
                  tick={{
                    fill: isDark ? '#94a3b8' : '#64748b',
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                  dx={-4}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? '#1e293b55' : '#f8fafc88' }} />
                <Bar
                  dataKey="students"
                  name="Enrolled Students"
                  radius={[8, 8, 0, 0]}
                  animationDuration={800}
                >
                  <LabelList
                    dataKey="students"
                    position="top"
                    fill={isDark ? '#cbd5e1' : '#475569'}
                    fontSize={11}
                    fontWeight={700}
                    offset={6}
                  />
                  {chartData.map((entry, index) => {
                    const isHovered = hoveredBar === entry.code;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        opacity={hoveredBar ? (isHovered ? 1 : 0.45) : 0.9}
                        className="transition-opacity duration-200 cursor-pointer"
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insight Mini-Cards (1 Col) */}
        <div className="space-y-3">
          {/* Total Session Enrolled */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Session Intake
              </span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400">100%</span>
            </div>
            <div className="text-xl font-heading font-extrabold text-slate-900 dark:text-white">
              {totalEnrolled} <span className="text-xs font-normal text-slate-400">students</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Across {chartData.length} academic departments
            </p>
          </div>

          {/* Top Enrolled Department */}
          {topDepartment && (
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-500/10 border border-indigo-200/80 dark:border-indigo-500/20">
              <div className="flex items-center justify-between text-[11px] font-bold text-indigo-700 dark:text-indigo-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Leading Department
                </span>
                <span className="font-mono text-[10px] bg-indigo-200 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 px-1.5 py-0.2 rounded font-bold">
                  {topDepartment.percentage}%
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>{topDepartment.code}</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-extrabold text-base">
                  {topDepartment.students}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {topDepartment.fullName}
              </p>
            </div>
          )}

          {/* Average per Department */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Average / Department
              </span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                ~{avgPerDept}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round((avgPerDept / (topDepartment?.students || 1)) * 100))}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Color-Coded Department Legend Chips */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-2 justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {chartData.map((item) => (
            <button
              key={item.code}
              onMouseEnter={() => setHoveredBar(item.code)}
              onMouseLeave={() => setHoveredBar(null)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
                hoveredBar === item.code
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs scale-105'
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/70 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-bold">{item.code}:</span>
              <span className="font-mono text-[11px] opacity-80">{item.students}</span>
            </button>
          ))}
        </div>

        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          Hover over bars for section &amp; CGPA insights
        </span>
      </div>
    </div>
  );
};
