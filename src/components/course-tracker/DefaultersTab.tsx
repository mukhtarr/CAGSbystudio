import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Send,
  CheckCircle2,
  PhoneCall,
  Search,
  Filter,
  UserX,
  FileWarning,
  Bell,
  Check,
} from 'lucide-react';
import { CourseTrackerRecord, StudentCoursePerformance } from '../../types';

interface DefaultersTabProps {
  tracker: CourseTrackerRecord;
  students: StudentCoursePerformance[];
}

export const DefaultersTab: React.FC<DefaultersTabProps> = ({ tracker, students }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'critical' | 'severe' | 'warning'>('all');
  const [notifiedStudents, setNotifiedStudents] = useState<Record<string, boolean>>({});

  const isLab = tracker.courseType === 'Lab';

  // Metrics
  const metrics = useMemo(() => {
    let severeCount = 0; // <10%
    let criticalCount = 0; // <50%
    let warningCount = 0; // 50-75%
    let goodCount = 0; // >=75%

    students.forEach((s) => {
      const att = isLab ? s.labAttendance.percentage : s.theoryAttendance.percentage;
      if (att < 10) severeCount++;
      else if (att < 50) criticalCount++;
      else if (att < 75) warningCount++;
      else goodCount++;
    });

    return {
      severeCount,
      criticalCount,
      warningCount,
      goodCount,
      totalDefaulters: severeCount + criticalCount + warningCount,
    };
  }, [students, isLab]);

  // Filter list
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const att = isLab ? s.labAttendance.percentage : s.theoryAttendance.percentage;
      const cat = isLab ? s.labAttendance.category : s.theoryAttendance.category;

      const matchesSearch =
        s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesCategory = true;
      if (categoryFilter === 'severe') matchesCategory = att < 10;
      if (categoryFilter === 'critical') matchesCategory = att >= 10 && att < 50;
      if (categoryFilter === 'warning') matchesCategory = att >= 50 && att < 75;

      return matchesSearch && matchesCategory;
    });
  }, [students, searchTerm, categoryFilter, isLab]);

  const handleSendNotice = (studentId: string) => {
    setNotifiedStudents((prev) => ({ ...prev, [studentId]: true }));
  };

  const handleNotifyAll = () => {
    const updated: Record<string, boolean> = {};
    filteredStudents.forEach((s) => {
      const att = isLab ? s.labAttendance.percentage : s.theoryAttendance.percentage;
      if (att < 75) {
        updated[s.studentId] = true;
      }
    });
    setNotifiedStudents((prev) => ({ ...prev, ...updated }));
  };

  return (
    <div className="space-y-6">
      {/* Category Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-900/40 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
              Severe Defaulters (&lt;10%)
            </span>
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-rose-700 dark:text-rose-400">
            {metrics.severeCount}
          </p>
          <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-1">
            Exam detention notice mandatory
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900/40 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Critical Defaulters (&lt;50%)
            </span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <FileWarning className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-700 dark:text-amber-400">
            {metrics.criticalCount}
          </p>
          <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-1">
            Parent call &amp; remedial sessions
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-yellow-200 dark:border-yellow-900/40 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 uppercase tracking-wider">
              Warning Zone (50-74.9%)
            </span>
            <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-yellow-700 dark:text-yellow-400">
            {metrics.warningCount}
          </p>
          <p className="text-xs text-yellow-600/80 dark:text-yellow-400/80 mt-1">
            Counseling recommended
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-900/40 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Compliant (&ge;75%)
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            {metrics.goodCount}
          </p>
          <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-1">
            Eligible for semester exams
          </p>
        </div>
      </div>

      {/* Control Strip */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search student or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Attendance Categories</option>
            <option value="severe">Severe (&lt;10%)</option>
            <option value="critical">Critical (&lt;50%)</option>
            <option value="warning">Warning (50-74.9%)</option>
          </select>
        </div>

        <button
          onClick={handleNotifyAll}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Bell className="w-4 h-4" />
          Dispatch Defaulter Notices
        </button>
      </div>

      {/* Defaulters Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 w-24">Roll No</th>
                <th className="py-3 px-4 min-w-[180px]">Student Name</th>
                <th className="py-3 px-3 w-16 text-center">Batch</th>
                <th className="py-3 px-4 w-36 text-center">Theory Attended</th>
                <th className="py-3 px-4 w-32 text-center">Theory Status</th>
                <th className="py-3 px-4 w-36 text-center">Lab Attended</th>
                <th className="py-3 px-4 w-32 text-center">Lab Status</th>
                <th className="py-3 px-4 w-36 text-right">Action / Notice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 dark:text-slate-400">
                    No students match the selected defaulter criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const isNotified = notifiedStudents[s.studentId];
                  const tAtt = s.theoryAttendance;
                  const lAtt = s.labAttendance;

                  const isDefaulter = tAtt.percentage < 75 || lAtt.percentage < 75;

                  return (
                    <tr
                      key={s.studentId}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white text-xs">
                        {s.rollNo}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 dark:text-white block">
                          {s.studentName}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {s.batch}
                        </span>
                      </td>

                      {/* Theory Attendance */}
                      <td className="py-3.5 px-4 text-center font-mono text-xs">
                        {tAtt.attended} / {tAtt.totalConducted}{' '}
                        <span className="font-bold">({tAtt.percentage}%)</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            tAtt.category === 'Severe (<10%)'
                              ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300'
                              : tAtt.category === 'Critical (<50%)'
                              ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
                              : tAtt.category === 'Warning (50-75%)'
                              ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300'
                              : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {tAtt.category}
                        </span>
                      </td>

                      {/* Lab Attendance */}
                      <td className="py-3.5 px-4 text-center font-mono text-xs">
                        {lAtt.attended} / {lAtt.totalConducted}{' '}
                        <span className="font-bold">({lAtt.percentage}%)</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            lAtt.category === 'Severe (<10%)'
                              ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300'
                              : lAtt.category === 'Critical (<50%)'
                              ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
                              : lAtt.category === 'Warning (50-75%)'
                              ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300'
                              : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {lAtt.category}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        {isDefaulter ? (
                          <button
                            onClick={() => handleSendNotice(s.studentId)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                              isNotified
                                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                : 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 hover:bg-rose-200'
                            }`}
                          >
                            {isNotified ? (
                              <>
                                <Check className="w-3 h-3" />
                                Notice Sent
                              </>
                            ) : (
                              <>
                                <Send className="w-3 h-3" />
                                Send Alert
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            Clear
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
