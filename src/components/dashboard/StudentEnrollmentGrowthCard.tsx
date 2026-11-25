import React, { useState, useMemo } from 'react';
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
  GraduationCap,
  ArrowUpRight,
  Sparkles,
  Calendar,
  Layers,
  Percent,
  CheckCircle2,
} from 'lucide-react';
import { Student, ActiveTab } from '../../types';

interface StudentEnrollmentGrowthCardProps {
  students: Student[];
  isDark: boolean;
  onNavigate?: (tab: ActiveTab) => void;
}

type GrowthViewMode = 'trend' | 'degree' | 'yoy';
type TimeHorizon = '5yr' | '3yr';

export const StudentEnrollmentGrowthCard: React.FC<StudentEnrollmentGrowthCardProps> = ({
  students,
  isDark,
  onNavigate,
}) => {
  const [viewMode, setViewMode] = useState<GrowthViewMode>('trend');
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('5yr');
  const [hoveredDataKey, setHoveredDataKey] = useState<string | null>(null);

  // Compute longitudinal enrollment cohorts from student records
  const rawCohortData = useMemo(() => {
    const yearMap: {
      [year: number]: {
        year: number;
        label: string;
        total: number;
        cumulative: number;
        BTech: number;
        BCA: number;
        MCA: number;
        MBA: number;
        MTech: number;
      };
    } = {};

    // Standard 5-year cohort base
    const baseYears = [2021, 2022, 2023, 2024, 2025];
    baseYears.forEach((yr) => {
      yearMap[yr] = {
        year: yr,
        label: `Batch '${String(yr).slice(-2)}`,
        total: 0,
        cumulative: 0,
        BTech: 0,
        BCA: 0,
        MCA: 0,
        MBA: 0,
        MTech: 0,
      };
    });

    students.forEach((student) => {
      const yr = student.admissionYear || 2024;
      if (!yearMap[yr]) {
        yearMap[yr] = {
          year: yr,
          label: `Batch '${String(yr).slice(-2)}`,
          total: 0,
          cumulative: 0,
          BTech: 0,
          BCA: 0,
          MCA: 0,
          MBA: 0,
          MTech: 0,
        };
      }
      yearMap[yr].total += 1;

      const deg = student.degree;
      if (deg === 'B.Tech') yearMap[yr].BTech += 1;
      else if (deg === 'BCA') yearMap[yr].BCA += 1;
      else if (deg === 'MCA') yearMap[yr].MCA += 1;
      else if (deg === 'MBA') yearMap[yr].MBA += 1;
      else if (deg === 'M.Tech') yearMap[yr].MTech += 1;
    });

    const sorted = Object.values(yearMap).sort((a, b) => a.year - b.year);

    // Calculate Cumulative & YoY Growth Rates
    let runningCumulative = 0;
    return sorted.map((item, idx, arr) => {
      runningCumulative += item.total;
      let yoyGrowth = 0;
      if (idx > 0 && arr[idx - 1].total > 0) {
        yoyGrowth = Number((((item.total - arr[idx - 1].total) / arr[idx - 1].total) * 100).toFixed(1));
      }
      return {
        ...item,
        cumulative: runningCumulative,
        yoyGrowth,
        growthLabel: `${yoyGrowth >= 0 ? '+' : ''}${yoyGrowth}%`,
      };
    });
  }, [students]);

  // Filter based on time horizon
  const displayData = useMemo(() => {
    if (timeHorizon === '3yr') {
      return rawCohortData.slice(-3);
    }
    return rawCohortData;
  }, [rawCohortData, timeHorizon]);

  // Growth Analytics KPI calculations
  const stats = useMemo(() => {
    const totalAdmitted = displayData.reduce((acc, curr) => acc + curr.total, 0);
    const avgIntake = displayData.length > 0 ? Math.round(totalAdmitted / displayData.length) : 0;
    const peakCohort = [...displayData].sort((a, b) => b.total - a.total)[0] || { year: 2024, total: 0 };

    let netGrowthRate = 0;
    if (displayData.length >= 2) {
      const first = displayData[0].total;
      const last = displayData[displayData.length - 1].total;
      if (first > 0) {
        netGrowthRate = Number((((last - first) / first) * 100).toFixed(1));
      }
    }

    return {
      totalAdmitted,
      avgIntake,
      peakCohort,
      netGrowthRate,
    };
  }, [displayData]);

  // Custom high-contrast tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0]?.payload;
      return (
        <div className="p-3.5 rounded-2xl bg-slate-900/95 text-white border border-slate-700 shadow-2xl backdrop-blur-md text-xs min-w-[210px] space-y-2">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
            <span className="font-heading font-bold text-sm text-white">
              {label || `Admission ${dataItem?.year}`}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                (dataItem?.yoyGrowth ?? 0) >= 0
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              YoY: {dataItem?.growthLabel ?? '0%'}
            </span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between text-slate-300">
              <span>Annual Intake:</span>
              <span className="font-bold text-indigo-300 font-mono text-xs">
                {dataItem?.total} students
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Cumulative Strength:</span>
              <span className="font-medium text-slate-200 font-mono">
                {dataItem?.cumulative}
              </span>
            </div>

            {viewMode === 'degree' && (
              <div className="pt-1.5 border-t border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Program Intake
                </span>
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] font-mono">
                  <span className="text-blue-300">B.Tech: {dataItem?.BTech}</span>
                  <span className="text-emerald-300">BCA: {dataItem?.BCA}</span>
                  <span className="text-purple-300">MBA: {dataItem?.MBA}</span>
                  <span className="text-amber-300">MCA: {dataItem?.MCA}</span>
                </div>
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
      id="student-enrollment-growth-card"
      className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between"
    >
      <div>
        {/* Card Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                  Student Enrollment Growth
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                  <Sparkles className="w-2.5 h-2.5" /> Recharts
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Longitudinal intake trends and year-over-year admission expansion
              </p>
            </div>
          </div>

          {/* Interactive Mode & Horizon Switchers */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Buttons */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
              <button
                onClick={() => setViewMode('trend')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  viewMode === 'trend'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="View overall growth trajectory"
              >
                Trajectory
              </button>
              <button
                onClick={() => setViewMode('degree')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  viewMode === 'degree'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="View breakdown by degree programs"
              >
                By Degree
              </button>
              <button
                onClick={() => setViewMode('yoy')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  viewMode === 'yoy'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="View annual YoY growth percentage"
              >
                YoY %
              </button>
            </div>

            {/* Horizon Filter */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
              <button
                onClick={() => setTimeHorizon('5yr')}
                className={`px-2 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  timeHorizon === '5yr'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                5Y
              </button>
              <button
                onClick={() => setTimeHorizon('3yr')}
                className={`px-2 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  timeHorizon === '3yr'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                3Y
              </button>
            </div>
          </div>
        </div>

        {/* Quick Analytical Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
              Total Intake
            </span>
            <div className="text-lg font-heading font-extrabold text-slate-900 dark:text-white mt-0.5">
              {stats.totalAdmitted}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">across cohorts</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
              Net Growth
            </span>
            <div
              className={`text-lg font-heading font-extrabold mt-0.5 ${
                stats.netGrowthRate >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
              }`}
            >
              {stats.netGrowthRate >= 0 ? `+${stats.netGrowthRate}%` : `${stats.netGrowthRate}%`}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">period expansion</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
              Avg Batch
            </span>
            <div className="text-lg font-heading font-extrabold text-slate-900 dark:text-white mt-0.5">
              ~{stats.avgIntake}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">students/cohort</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
              Peak Cohort
            </span>
            <div className="text-lg font-heading font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
              {stats.peakCohort.year}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {stats.peakCohort.total} admitted
            </span>
          </div>
        </div>

        {/* Main Recharts Visualization Canvas */}
        <div className="h-64 sm:h-72 w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'trend' ? (
              <ComposedChart
                data={displayData}
                margin={{ top: 15, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="enrollmentAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? '#334155' : '#f1f5f9'}
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
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
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Admitted Students"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#enrollmentAreaGrad)"
                  dot={{ fill: '#4f46e5', r: 4, strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#4f46e5', stroke: '#ffffff', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="cumulative"
                  name="Cumulative Cohort"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </ComposedChart>
            ) : viewMode === 'degree' ? (
              <BarChart
                data={displayData}
                margin={{ top: 15, right: 10, left: -25, bottom: 0 }}
                barSize={24}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? '#334155' : '#f1f5f9'}
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
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
                <Bar dataKey="BTech" name="B.Tech" stackId="a" fill="#3b82f6" />
                <Bar dataKey="BCA" name="BCA" stackId="a" fill="#10b981" />
                <Bar dataKey="MBA" name="MBA" stackId="a" fill="#8b5cf6" />
                <Bar dataKey="MCA" name="MCA" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <BarChart
                data={displayData}
                margin={{ top: 15, right: 10, left: -25, bottom: 0 }}
                barSize={26}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? '#334155' : '#f1f5f9'}
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
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
                  unit="%"
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
                <ReferenceLine y={0} stroke={isDark ? '#64748b' : '#94a3b8'} strokeDasharray="3 3" />
                <Bar dataKey="yoyGrowth" name="YoY Growth Rate (%)" radius={[6, 6, 0, 0]}>
                  {displayData.map((entry, index) => (
                    <Cell
                      key={`cell-growth-${index}`}
                      fill={entry.yoyGrowth >= 0 ? '#10b981' : '#ef4444'}
                    />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>Active admissions pipeline synchronized</span>
        </span>
        {onNavigate && (
          <button
            onClick={() => onNavigate('students')}
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Student Registry</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
