import React, { useState, useEffect } from 'react';
import { X, Award, CheckCircle2, User } from 'lucide-react';
import { StudentCoursePerformance } from '../../types';

interface StudentMarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentId: string, updates: Partial<StudentCoursePerformance>) => void;
  student: StudentCoursePerformance | null;
}

export const StudentMarksModal: React.FC<StudentMarksModalProps> = ({
  isOpen,
  onClose,
  onSave,
  student,
}) => {
  const [cia1Marks, setCia1Marks] = useState<number>(0);
  const [cia2Marks, setCia2Marks] = useState<number>(0);
  const [mseMarks, setMseMarks] = useState<number>(0);
  const [labCia1Marks, setLabCia1Marks] = useState<number>(0);
  const [labCia2Marks, setLabCia2Marks] = useState<number>(0);
  const [theoryAttended, setTheoryAttended] = useState<number>(0);
  const [theoryTotal, setTheoryTotal] = useState<number>(34);
  const [labAttended, setLabAttended] = useState<number>(0);
  const [labTotal, setLabTotal] = useState<number>(12);

  useEffect(() => {
    if (student) {
      setCia1Marks(student.theoryMarks.cia1Marks);
      setCia2Marks(student.theoryMarks.cia2Marks);
      setMseMarks(student.theoryMarks.mseMarks);
      setLabCia1Marks(student.labMarks.cia1Marks);
      setLabCia2Marks(student.labMarks.cia2Marks);
      setTheoryAttended(student.theoryAttendance.attended);
      setTheoryTotal(student.theoryAttendance.totalConducted);
      setLabAttended(student.labAttendance.attended);
      setLabTotal(student.labAttendance.totalConducted);
    }
  }, [student, isOpen]);

  if (!isOpen || !student) return null;

  const getAttendanceCategory = (pct: number): 'Good (>=75%)' | 'Warning (50-75%)' | 'Critical (<50%)' | 'Severe (<10%)' => {
    if (pct < 10) return 'Severe (<10%)';
    if (pct < 50) return 'Critical (<50%)';
    if (pct < 75) return 'Warning (50-75%)';
    return 'Good (>=75%)';
  };

  const getOverallGrade = (tScore: number): string => {
    if (tScore >= 85) return 'A+';
    if (tScore >= 75) return 'A';
    if (tScore >= 65) return 'B+';
    if (tScore >= 55) return 'B';
    if (tScore >= 45) return 'C';
    return 'F';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tPct = theoryTotal > 0 ? Math.round((theoryAttended / theoryTotal) * 1000) / 10 : 0;
    const lPct = labTotal > 0 ? Math.round((labAttended / labTotal) * 1000) / 10 : 0;
    const totalInternal = cia1Marks + cia2Marks + mseMarks + labCia1Marks + labCia2Marks;

    onSave(student.studentId, {
      theoryMarks: {
        cia1Marks,
        cia1Passed: cia1Marks >= 8,
        cia2Marks,
        cia2Passed: cia2Marks >= 8,
        mseMarks,
      },
      labMarks: {
        cia1Marks: labCia1Marks,
        cia1Passed: labCia1Marks >= 8,
        cia2Marks: labCia2Marks,
        cia2Passed: labCia2Marks >= 8,
      },
      theoryAttendance: {
        totalConducted: theoryTotal,
        attended: theoryAttended,
        percentage: tPct,
        category: getAttendanceCategory(tPct),
      },
      labAttendance: {
        totalConducted: labTotal,
        attended: labAttended,
        percentage: lPct,
        category: getAttendanceCategory(lPct),
      },
      overallGrade: getOverallGrade(totalInternal),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Edit Assessments &amp; Attendance
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {student.rollNo} • {student.studentName} ({student.batch})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Theory Marks */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700/60 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Theory Assessments (Max Marks)
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  CIA-1 (20)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={cia1Marks}
                  onChange={(e) => setCia1Marks(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  CIA-2 (20)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={cia2Marks}
                  onChange={(e) => setCia2Marks(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  MSE Exam (30)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="0.5"
                  value={mseMarks}
                  onChange={(e) => setMseMarks(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Lab Marks */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700/60 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Laboratory Assessments (Max Marks)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Lab CIA-1 (20)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={labCia1Marks}
                  onChange={(e) => setLabCia1Marks(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Lab CIA-2 (20)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={labCia2Marks}
                  onChange={(e) => setLabCia2Marks(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Attendance */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700/60 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Attendance Records
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Theory Attended (out of {theoryTotal})
                </label>
                <input
                  type="number"
                  min="0"
                  max={theoryTotal}
                  value={theoryAttended}
                  onChange={(e) => setTheoryAttended(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Lab Attended (out of {labTotal})
                </label>
                <input
                  type="number"
                  min="0"
                  max={labTotal}
                  value={labAttended}
                  onChange={(e) => setLabAttended(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save Performance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
