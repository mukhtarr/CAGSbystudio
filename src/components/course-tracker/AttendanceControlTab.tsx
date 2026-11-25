import React, { useState } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  FileSpreadsheet,
  Link2,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Save,
  X,
  Info,
} from 'lucide-react';
import { AttendanceControlItem, CourseTrackerRecord } from '../../types';

interface AttendanceControlTabProps {
  tracker: CourseTrackerRecord;
  onUpdateItem: (srNo: number, updates: Partial<AttendanceControlItem>) => void;
}

export const AttendanceControlTab: React.FC<AttendanceControlTabProps> = ({
  tracker,
  onUpdateItem,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [editingSrNo, setEditingSrNo] = useState<number | null>(null);
  const [editLink, setEditLink] = useState('');
  const [editColRef, setEditColRef] = useState('');

  const handleCopyLink = (link: string, idx: number) => {
    navigator.clipboard.writeText(link);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleStartEdit = (item: AttendanceControlItem) => {
    setEditingSrNo(item.srNo);
    setEditLink(item.sheetLink);
    setEditColRef(item.columnRef || '');
  };

  const handleSaveEdit = (srNo: number) => {
    onUpdateItem(srNo, {
      sheetLink: editLink.trim(),
      columnRef: editColRef.trim(),
    });
    setEditingSrNo(null);
  };

  return (
    <div className="space-y-6">
      {/* Information Banner */}
      <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl flex items-start gap-3">
        <div className="p-1.5 bg-indigo-600 text-white rounded-lg shrink-0 mt-0.5">
          <FileSpreadsheet className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-indigo-950 dark:text-indigo-200">
            Institutional Attendance Spreadsheet Master Controls
          </h4>
          <p className="text-xs text-indigo-800 dark:text-indigo-300/80 mt-0.5 leading-relaxed">
            This module manages the live cloud spreadsheet links, batch workbooks, and column mappings
            corresponding to the official Excel template. Faculty and coordinators can reference and verify
            continuous attendance records directly.
          </p>
        </div>
      </div>

      {/* Control Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Control Spreadsheets
            </span>
            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600">
              <Link2 className="w-4 h-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {tracker.attendanceControlItems.length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Linked master workbooks
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Sync Integrity
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            Verified
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Audited for Term-End CIA
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              Assigned Faculty
            </span>
            <span className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600">
              <Info className="w-4 h-4" />
            </span>
          </div>
          <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white truncate">
            {tracker.courseOwner}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Department of {tracker.department}
          </p>
        </div>
      </div>

      {/* Control Info Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Attendance Parameter Mappings &amp; Master Sheets
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Corresponds directly to &apos;Attendance Control Info&apos; sheet tab in Excel
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 w-14 text-center">Sr. No</th>
                <th className="py-3 px-4 w-64">Parameter / Sheet Description</th>
                <th className="py-3 px-4 min-w-[280px]">Master Spreadsheet URL</th>
                <th className="py-3 px-4 w-36 text-center">Excel Column Ref</th>
                <th className="py-3 px-4 w-28 text-center">Status</th>
                <th className="py-3 px-4 w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {tracker.attendanceControlItems.map((item, idx) => {
                const isEditing = editingSrNo === item.srNo;
                return (
                  <tr
                    key={item.srNo}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-center font-bold text-slate-500 dark:text-slate-400">
                      {item.srNo}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {item.title}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editLink}
                          onChange={(e) => setEditLink(e.target.value)}
                          className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-500/10 px-2 py-1 rounded border border-indigo-100 dark:border-indigo-500/20 truncate max-w-sm">
                            {item.sheetLink}
                          </span>
                          <button
                            onClick={() => handleCopyLink(item.sheetLink, idx)}
                            title="Copy Spreadsheet URL"
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                          >
                            {copiedIndex === idx ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <a
                            href={item.sheetLink}
                            target="_blank"
                            rel="noreferrer"
                            title="Open in new tab"
                            className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editColRef}
                          onChange={(e) => setEditColRef(e.target.value)}
                          placeholder="e.g. Col C-H"
                          className="w-24 px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                          {item.columnRef || '-'}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleSaveEdit(item.srNo)}
                            className="p-1 text-emerald-600 hover:text-emerald-700 rounded hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                            title="Save changes"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingSrNo(null)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
