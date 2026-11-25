import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Users,
  Award,
  ArrowUpRight,
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  CheckCircle2,
  Briefcase,
  UserCheck,
} from 'lucide-react';
import { Faculty, ActiveTab } from '../../types';

interface FacultyDistributionCardProps {
  faculties: Faculty[];
  isDark: boolean;
  onNavigate?: (tab: ActiveTab) => void;
}

type FacultyViewMode = 'donut' | 'designation' | 'experience';

interface DepartmentFacultyStat {
  code: string;
  name: string;
  fullName: string;
  count: number;
  percentage: number;
  color: string;
  professors: number;
  associateProfessors: number;
  assistantProfessors: number;
  phdHolders: number;
  coordinatorEligible: number;
  avgExperience: number;
}

const DEPT_CONFIG: { [code: string]: { name: string; color: string } } = {
  CSE: { name: 'Computer Science & Engg', color: '#4f46e5' },
  'AI & DS': { name: 'Artificial Intelligence & DS', color: '#f59e0b' },
  IT: { name: 'Information Technology', color: '#06b6d4' },
  ECE: { name: 'Electronics & Comm.', color: '#8b5cf6' },
  MECH: { name: 'Mechanical Engineering', color: '#10b981' },
  CIVIL: { name: 'Civil Engineering', color: '#64748b' },
  MBA: { name: 'Management Studies', color: '#ec4899' },
  BCA: { name: 'Computer Applications', color: '#3b82f6' },
};

export const FacultyDistributionCard: React.FC<FacultyDistributionCardProps> = ({
  faculties,
  isDark,
  onNavigate,
}) => {
  const [viewMode, setViewMode] = useState<FacultyViewMode>('donut');
  const [hoveredDept, setHoveredDept] = useState<string | null>(null);

  // Shorten department name
  const getShortDept = (dept: string): string => {
    if (dept.includes('Computer Science')) return 'CSE';
    if (dept.includes('Artificial Intelligence')) return 'AI & DS';
    if (dept.includes('Information Technology')) return 'IT';
    if (dept.includes('Electronics')) return 'ECE';
    if (dept.includes('Mechanical')) return 'MECH';
    if (dept.includes('Civil')) return 'CIVIL';
    if (dept.includes('Management')) return 'MBA';
    if (dept.includes('Computer Applications')) return 'BCA';
    return 'CSE';
  };

  // Aggregate faculty distribution per department
  const departmentData: DepartmentFacultyStat[] = useMemo(() => {
    const map: {
      [code: string]: {
        fullName: string;
        count: number;
        professors: number;
        associateProfessors: number;
        assistantProfessors: number;
        phdHolders: number;
        coordinatorEligible: number;
        totalExp: number;
      };
    } = {};

    Object.keys(DEPT_CONFIG).forEach((code) => {
      map[code] = {
        fullName: DEPT_CONFIG[code].name,
        count: 0,
        professors: 0,
        associateProfessors: 0,
        assistantProfessors: 0,
        phdHolders: 0,
        coordinatorEligible: 0,
        totalExp: 0,
      };
    });

    faculties.forEach((faculty) => {
      const code = getShortDept(faculty.department);
      if (!map[code]) {
        map[code] = {
          fullName: faculty.department,
          count: 0,
          professors: 0,
          associateProfessors: 0,
          assistantProfessors: 0,
          phdHolders: 0,
          coordinatorEligible: 0,
          totalExp: 0,
        };
      }

      map[code].count += 1;
      map[code].totalExp += faculty.experienceYears || 5;

      const desig = faculty.designation || '';
      if (desig.includes('Professor') && !desig.includes('Assistant') && !desig.includes('Associate')) {
        map[code].professors += 1;
      } else if (desig.includes('Associate')) {
        map[code].associateProfessors += 1;
      } else {
        map[code].assistantProfessors += 1;
      }

      if (faculty.qualification?.toLowerCase().includes('ph.d') || faculty.qualification?.toLowerCase().includes('phd')) {
        map[code].phdHolders += 1;
      }

      if (faculty.isCoordinatorEligible) {
        map[code].coordinatorEligible += 1;
      }
    });

    const totalCount = faculties.length || 1;

    return Object.keys(map)
      .map((code) => {
        const item = map[code];
        const count = item.count;
        const percentage = Number(((count / totalCount) * 100).toFixed(1));
        const avgExperience = count > 0 ? Number((item.totalExp / count).toFixed(1)) : 0;
        const color = DEPT_CONFIG[code]?.color || '#6366f1';

        return {
          code,
          name: code,
          fullName: item.fullName,
          count,
          percentage,
          color,
          professors: item.professors,
          associateProfessors: item.associateProfessors,
          assistantProfessors: item.assistantProfessors,
          phdHolders: item.phdHolders,
          coordinatorEligible: item.coordinatorEligible,
          avgExperience,
        };
      })
      .filter((d) => d.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [faculties]);

  // Overall statistics
  const stats = useMemo(() => {
    const total = faculties.length;
    const largest = departmentData[0] || { code: 'CSE', count: 0, percentage: 0 };
    const phdTotal = faculties.filter(
      (f) => f.qualification?.toLowerCase().includes('ph.d') || f.qualification?.toLowerCase().includes('phd')
    ).length;
    const phdPercentage = total > 0 ? Math.round((phdTotal / total) * 100) : 0;
    const eligibleCount = faculties.filter((f) => f.isCoordinatorEligible).length;
    const eligiblePercentage = total > 0 ? Math.round((eligibleCount / total) * 100) : 0;

    return {
      total,
      largest,
      phdPercentage,
      eligibleCount,
      eligiblePercentage,
    };
  }, [faculties, departmentData]);

  // Custom high-contrast tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataItem: DepartmentFacultyStat = payload[0]?.payload;
      return (
        <div className="p-3.5 rounded-2xl bg-slate-900/95 text-white border border-slate-700 shadow-2xl backdrop-blur-md text-xs min-w-[210px] space-y-2">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: dataItem.color }}
              />
              <span className="font-heading font-bold text-sm text-white">{dataItem.code}</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 font-bold">
              {dataItem.percentage}% of Staff
            </span>
          </div>

          <p className="text-[11px] text-slate-300 truncate">{dataItem.fullName}</p>

          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total Faculty:</span>
              <span className="font-bold text-white font-mono text-xs">
                {dataItem.count} members
              </span>
            </div>

            <div className="pt-1.5 border-t border-slate-800 space-y-0.5 text-[10px] font-mono">
              <div className="flex items-center justify-between text-indigo-300">
                <span>Professors / HOD:</span>
                <span>{dataItem.professors}</span>
              </div>
              <div className="flex items-center justify-between text-blue-300">
                <span>Associate Professors:</span>
                <span>{dataItem.associateProfessors}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Assistant Professors:</span>
                <span>{dataItem.assistantProfessors}</span>
              </div>
            </div>

            <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span>Avg Experience:</span>
              <span className="text-emerald-300 font-bold">{dataItem.avgExperience} yrs</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="faculty-distribution-card"
      className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between"
    >
      <div>
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                  Faculty Distribution Across Departments
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                  <Sparkles className="w-2.5 h-2.5" /> Recharts
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Departmental teaching strength, designation hierarchy, and coordinator capacity
              </p>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
            <button
              onClick={() => setViewMode('donut')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'donut'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Donut distribution of faculty share"
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
            <button
              onClick={() => setViewMode('designation')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'designation'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Stacked designation hierarchy"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Ranks</span>
            </button>
            <button
              onClick={() => setViewMode('experience')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'experience'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Average experience years"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Exp</span>
            </button>
          </div>
        </div>

        {/* Analytical Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
              Total Faculty
            </span>
            <div className="text-lg font-heading font-extrabold text-slate-900 dark:text-white mt-0.5">
              {stats.total}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              across {departmentData.length} depts
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
              Top Department
            </span>
            <div className="text-lg font-heading font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {stats.largest.code}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {stats.largest.count} staff ({stats.largest.percentage}%)
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
              Ph.D. Ratio
            </span>
            <div className="text-lg font-heading font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
              {stats.phdPercentage}%
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">doctoral mentors</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
              Coord Ready
            </span>
            <div className="text-lg font-heading font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">
              {stats.eligibleCount}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {stats.eligiblePercentage}% eligible
            </span>
          </div>
        </div>

        {/* Main Recharts Visualization Canvas */}
        <div className="h-64 sm:h-72 w-full min-h-[250px] relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'donut' ? (
              <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={departmentData}
                  dataKey="count"
                  nameKey="code"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={92}
                  paddingAngle={3}
                  animationDuration={800}
                  onMouseEnter={(_, index) => {
                    setHoveredDept(departmentData[index]?.code || null);
                  }}
                  onMouseLeave={() => setHoveredDept(null)}
                >
                  {departmentData.map((entry, index) => {
                    const isHovered = hoveredDept === entry.code;
                    return (
                      <Cell
                        key={`cell-dept-${index}`}
                        fill={entry.color}
                        stroke={isDark ? '#0f172a' : '#ffffff'}
                        strokeWidth={2}
                        opacity={hoveredDept ? (isHovered ? 1 : 0.45) : 0.95}
                        className="transition-all duration-200 cursor-pointer"
                      />
                    );
                  })}
                </Pie>
              </PieChart>
            ) : viewMode === 'designation' ? (
              <BarChart
                data={departmentData}
                margin={{ top: 15, right: 10, left: -25, bottom: 0 }}
                barSize={20}
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
                  dy={4}
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
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={32}
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {value}
                    </span>
                  )}
                />
                <Bar
                  dataKey="professors"
                  name="Professors"
                  stackId="a"
                  fill="#4f46e5"
                />
                <Bar
                  dataKey="associateProfessors"
                  name="Associate Prof."
                  stackId="a"
                  fill="#06b6d4"
                />
                <Bar
                  dataKey="assistantProfessors"
                  name="Assistant Prof."
                  stackId="a"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            ) : (
              <BarChart
                data={departmentData}
                margin={{ top: 15, right: 10, left: -25, bottom: 0 }}
                barSize={22}
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
                  dy={4}
                />
                <YAxis
                  tick={{
                    fill: isDark ? '#94a3b8' : '#64748b',
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                  unit="y"
                  dx={-4}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={32}
                  formatter={(value) => (
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {value}
                    </span>
                  )}
                />
                <Bar
                  dataKey="avgExperience"
                  name="Avg Experience (Years)"
                  radius={[6, 6, 0, 0]}
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-exp-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>

          {/* Central Metric overlay for Donut mode */}
          {viewMode === 'donut' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
                {stats.total}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                Faculties
              </span>
            </div>
          )}
        </div>

        {/* Interactive Department Badge Filter Bar */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {departmentData.map((item) => (
            <button
              key={item.code}
              onMouseEnter={() => setHoveredDept(item.code)}
              onMouseLeave={() => setHoveredDept(null)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all border cursor-pointer ${
                hoveredDept === item.code
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs scale-105'
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.code}:</span>
              <span className="font-mono text-[10px] font-bold">{item.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>8 active academic departments</span>
        </span>
        {onNavigate && (
          <button
            onClick={() => onNavigate('faculties')}
            className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Faculty Directory</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
