import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Edit2,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { CourseTrackerRecord, SyllabusSessionItem } from '../../types';
import { SessionModal } from './SessionModal';

interface SyllabusDeliveryTabProps {
  tracker: CourseTrackerRecord;
  onAddSession: (session: Omit<SyllabusSessionItem, 'id'>) => void;
  onUpdateSession: (sessionId: string, updates: Partial<SyllabusSessionItem>) => void;
  onDeleteSession: (sessionId: string) => void;
}

export const SyllabusDeliveryTab: React.FC<SyllabusDeliveryTabProps> = ({
  tracker,
  onAddSession,
  onUpdateSession,
  onDeleteSession,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<SyllabusSessionItem | null>(null);

  const isLab = tracker.courseType === 'Lab';

  const units = useMemo(() => {
    const set = new Set<string>();
    tracker.syllabusSessions.forEach((s) => set.add(s.unitName));
    return Array.from(set);
  }, [tracker.syllabusSessions]);

  const filteredSessions = useMemo(() => {
    return tracker.syllabusSessions.filter((s) => {
      const matchesSearch =
        s.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.unitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.pedagogy && s.pedagogy.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesUnit = selectedUnit === 'all' || s.unitName === selectedUnit;
      const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
      const matchesBatch = selectedBatch === 'all' || s.batch === selectedBatch;

      return matchesSearch && matchesUnit && matchesStatus && matchesBatch;
    });
  }, [tracker.syllabusSessions, searchTerm, selectedUnit, selectedStatus, selectedBatch]);

  const handleToggleConducted = (session: SyllabusSessionItem) => {
    if (session.status === 'Conducted') {
      onUpdateSession(session.id, {
        status: 'Scheduled',
        conductedDate: undefined,
      });
    } else {
      onUpdateSession(session.id, {
        status: 'Conducted',
        conductedDate: new Date().toISOString().slice(0, 10),
      });
    }
  };

  const handleOpenAdd = () => {
    setEditingSession(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (session: SyllabusSessionItem) => {
    setEditingSession(session);
    setIsModalOpen(true);
  };

  const handleSaveModal = (data: Omit<SyllabusSessionItem, 'id'>) => {
    if (editingSession) {
      onUpdateSession(editingSession.id, data);
    } else {
      onAddSession(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress & Delivery Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total {isLab ? 'Practicals' : 'Lectures'}
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {tracker.totalSessions}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Planned institutional sessions
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Conducted
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {tracker.conductedSessions}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Logged with student attendance
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Pending / Scheduled
            </span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {tracker.pendingSessions}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Remaining curriculum units
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Completion Rate
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
              {tracker.completionPercentage}%
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, tracker.completionPercentage)}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Target benchmark: &gt;80% by Mid-Sem
          </p>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Add Session */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search topics, modules, tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Unit Filter */}
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Modules &amp; Units</option>
            {units.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Delivery Statuses</option>
            <option value="Conducted">Conducted</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Rescheduled">Rescheduled</option>
          </select>

          {/* Lab Batch Filter */}
          {isLab && (
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Batches</option>
              <option value="B1">Batch B1</option>
              <option value="B2">Batch B2</option>
              <option value="B3">Batch B3</option>
              <option value="B4">Batch B4</option>
            </select>
          )}
        </div>

        {/* Add Session Button */}
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add {isLab ? 'Practical' : 'Lecture'}
        </button>
      </div>

      {/* Syllabus Sessions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 w-48">Unit / Module</th>
                <th className="py-3 px-4 min-w-[240px]">Topics Covered &amp; Curriculum</th>
                <th className="py-3 px-4 w-32">Planned Date</th>
                <th className="py-3 px-4 w-32">Conducted Date</th>
                <th className="py-3 px-4 w-28">Status</th>
                {isLab && <th className="py-3 px-4 w-20 text-center">Batch</th>}
                <th className="py-3 px-4 min-w-[160px]">Pedagogy / Aid</th>
                <th className="py-3 px-4 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td
                    colSpan={isLab ? 9 : 8}
                    className="py-8 text-center text-slate-500 dark:text-slate-400"
                  >
                    No sessions match the current search or filters.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => {
                  const isConducted = session.status === 'Conducted';
                  return (
                    <tr
                      key={session.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 text-center font-bold text-slate-500 dark:text-slate-400">
                        {session.sessionNo}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 dark:text-white block text-xs">
                          {session.unitName}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-800 dark:text-slate-200 font-medium">
                          {session.topic}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                        {session.plannedDate}
                      </td>
                      <td className="py-3 px-4 text-xs font-medium">
                        {session.conductedDate ? (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            {session.conductedDate}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Pending</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleConducted(session)}
                          title="Click to toggle status"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                            isConducted
                              ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200'
                              : session.status === 'Rescheduled'
                              ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 hover:bg-rose-200'
                              : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-200'
                          }`}
                        >
                          {isConducted ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {session.status}
                        </button>
                      </td>
                      {isLab && (
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {session.batch || 'All'}
                          </span>
                        </td>
                      )}
                      <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400">
                        {session.pedagogy || 'ICT, Demonstration'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(session)}
                            title="Edit session"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteSession(session.id)}
                            title="Delete session"
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Session Modal */}
      <SessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        initialData={editingSession}
        nextSessionNo={tracker.syllabusSessions.length + 1}
        isLab={isLab}
      />
    </div>
  );
};
