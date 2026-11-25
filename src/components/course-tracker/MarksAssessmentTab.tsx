import React, { useState, useMemo } from 'react';
import {
  Search,
  Award,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Filter,
  GraduationCap,
} from 'lucide-react';
import { CourseTrackerRecord, StudentCoursePerformance } from '../../types';
import { StudentMarksModal } from './StudentMarksModal';

interface MarksAssessmentTabProps {
  tracker: CourseTrackerRecord;
  students: StudentCoursePerformance[];
  onUpdatePerformance: (studentId: string, updates: Partial<StudentCoursePerformance>) => void;
}

export const MarksAssessmentTab: React.FC<MarksAssessmentTabProps> = ({
  tracker,
  students,
  onUpdatePerformance,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pass' | 'fail'>('all');
  const [editingStudent, setEditingStudent] = useState<StudentCoursePerformance | null>(null);

  const isLab = tracker.courseType === 'Lab';

  // Compute stats
  const stats = useMemo(() => {
    if (!students.length) {
      return { avg: 0, highest: 0, passCount: 0, passRate: 0, failCount: 0 };
    }

    let totalScore = 0;
    let highest = 0;
    let passCount = 0;

    students.forEach((s) => {
      const score = isLab
        ? s.labMarks.cia1Marks + s.labMarks.cia2Marks
        : s.theoryMarks.cia1Marks + s.theoryMarks.cia2Marks + s.theoryMarks.mseMarks;

      totalScore += score;
      if (score > highest) highest = score;

      const isPass = isLab
        ? s.labMarks.cia1Passed && s.labMarks.cia2Passed
        : s.theoryMarks.cia1Passed && s.theoryMarks.cia2Passed;

      if (isPass) passCount++;
    });

    const avg = Math.round((totalScore / students.length) * 10) / 10;
    const passRate = Math.round((passCount / students.length) * 100);

    return {
      avg,
      highest,
      passCount,
      passRate,
      failCount: students.length - passCount,
    };
  }, [students, isLab]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBatch = selectedBatch === 'all' || s.batch === selectedBatch;

      let matchesStatus = true;
      const isPass = isLab
        ? s.labMarks.cia1Passed && s.labMarks.cia2Passed
        : s.theoryMarks.cia1Passed && s.theoryMarks.cia2Passed;

      if (selectedFilter === 'pass') matchesStatus = isPass;
      if (selectedFilter === 'fail') matchesStatus = !isPass;

      return matchesSearch && matchesBatch && matchesStatus;
    });
  }, [students, searchTerm, selectedBatch, selectedFilter, isLab]);

  const batches = ['all', 'B1', 'B2', 'B3', 'B4'];

  return (
    <div className="space-y-6">
      {/* Assessment Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Class Average
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {stats.avg} <span className="text-sm font-normal text-slate-500">/ {isLab ? 40 : 70}</span>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Overall internal performance
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Passing Rate
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.passRate}%
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {stats.passCount} of {students.length} passed all tests
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              Highest Score
            </span>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400">
            {stats.highest} <span className="text-sm font-normal text-slate-500">/ {isLab ? 40 : 70}</span>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Top candidate score
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Remedial Needed
            </span>
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">
            {stats.failCount}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Students needing re-test / support
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Batch Selector */}
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Batches (B1-B4)</option>
            <option value="B1">Batch B1</option>
            <option value="B2">Batch B2</option>
            <option value="B3">Batch B3</option>
            <option value="B4">Batch B4</option>
          </select>

          {/* Pass/Fail Filter */}
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Performance Records</option>
            <option value="pass">Passing All Assessments</option>
            <option value="fail">Needs Re-test / Failed</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Showing {filteredStudents.length} of {students.length} students
        </span>
      </div>

      {/* Marks Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 w-24">Roll No</th>
                <th className="py-3 px-4 min-w-[180px]">Student Name</th>
                <th className="py-3 px-3 w-16 text-center">Batch</th>
                {isLab ? (
                  <>
                    <th className="py-3 px-3 w-28 text-center">Lab CIA-1 (20)</th>
                    <th className="py-3 px-3 w-28 text-center">Lab CIA-2 (20)</th>
                    <th className="py-3 px-3 w-24 text-center">Lab Att %</th>
                  </>
                ) : (
                  <>
                    <th className="py-3 px-3 w-28 text-center">Theory CIA-1 (20)</th>
                    <th className="py-3 px-3 w-28 text-center">Theory CIA-2 (20)</th>
                    <th className="py-3 px-3 w-24 text-center">MSE (30)</th>
                    <th className="py-3 px-3 w-24 text-center">Theory Att %</th>
                  </>
                )}
                <th className="py-3 px-3 w-24 text-center">Grade</th>
                <th className="py-3 px-4 w-20 text-right">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={isLab ? 8 : 9} className="py-8 text-center text-slate-500 dark:text-slate-400">
                    No student records match the search filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const isTheoryPass = s.theoryMarks.cia1Passed && s.theoryMarks.cia2Passed;
                  const isLabPass = s.labMarks.cia1Passed && s.labMarks.cia2Passed;
                  const isPass = isLab ? isLabPass : isTheoryPass;

                  return (
                    <tr
                      key={s.studentId}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white text-xs">
                        {s.rollNo}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 dark:text-white block">
                          {s.studentName}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {s.batch}
                        </span>
                      </td>

                      {isLab ? (
                        <>
                          <td className="py-3 px-3 text-center font-mono">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-bold ${
                                s.labMarks.cia1Passed
                                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                  : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400'
                              }`}
                            >
                              {s.labMarks.cia1Marks}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-mono">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-bold ${
                                s.labMarks.cia2Passed
                                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                  : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400'
                              }`}
                            >
                              {s.labMarks.cia2Marks}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-xs">
                            <span
                              className={`font-semibold ${
                                s.labAttendance.percentage >= 75
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : s.labAttendance.percentage >= 50
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {s.labAttendance.percentage}%
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 px-3 text-center font-mono">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-bold ${
                                s.theoryMarks.cia1Passed
                                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                  : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400'
                              }`}
                            >
                              {s.theoryMarks.cia1Marks}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-mono">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-bold ${
                                s.theoryMarks.cia2Passed
                                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                  : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400'
                              }`}
                            >
                              {s.theoryMarks.cia2Marks}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {s.theoryMarks.mseMarks}
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-xs">
                            <span
                              className={`font-semibold ${
                                s.theoryAttendance.percentage >= 75
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : s.theoryAttendance.percentage >= 50
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {s.theoryAttendance.percentage}%
                            </span>
                          </td>
                        </>
                      )}

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            s.overallGrade === 'F'
                              ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300'
                              : 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300'
                          }`}
                        >
                          {s.overallGrade}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setEditingStudent(s)}
                          title="Edit Marks & Attendance"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Student Marks Modal */}
      <StudentMarksModal
        isOpen={Boolean(editingStudent)}
        onClose={() => setEditingStudent(null)}
        onSave={onUpdatePerformance}
        student={editingStudent}
      />
    </div>
  );
};
