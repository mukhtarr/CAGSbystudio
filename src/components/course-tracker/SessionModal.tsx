import React, { useState, useEffect } from 'react';
import { X, Calendar, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { SyllabusSessionItem } from '../../types';

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: Omit<SyllabusSessionItem, 'id'>) => void;
  initialData?: SyllabusSessionItem | null;
  nextSessionNo: number;
  isLab: boolean;
}

export const SessionModal: React.FC<SessionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  nextSessionNo,
  isLab,
}) => {
  const [sessionNo, setSessionNo] = useState<number>(nextSessionNo);
  const [unitName, setUnitName] = useState('');
  const [topic, setTopic] = useState('');
  const [plannedDate, setPlannedDate] = useState('');
  const [conductedDate, setConductedDate] = useState('');
  const [status, setStatus] = useState<'Scheduled' | 'Conducted' | 'Rescheduled'>('Scheduled');
  const [pedagogy, setPedagogy] = useState('ICT Presentation & Live Demo');
  const [batch, setBatch] = useState('All');

  useEffect(() => {
    if (initialData) {
      setSessionNo(initialData.sessionNo);
      setUnitName(initialData.unitName);
      setTopic(initialData.topic);
      setPlannedDate(initialData.plannedDate);
      setConductedDate(initialData.conductedDate || '');
      setStatus(initialData.status);
      setPedagogy(initialData.pedagogy || '');
      setBatch(initialData.batch || 'All');
    } else {
      setSessionNo(nextSessionNo);
      setUnitName(isLab ? 'Lab Experiment Plan' : 'Unit 1: Fundamentals');
      setTopic('');
      const today = new Date().toISOString().slice(0, 10);
      setPlannedDate(today);
      setConductedDate('');
      setStatus('Scheduled');
      setPedagogy(isLab ? 'Cisco Packet Tracer / Wireshark' : 'ICT Presentation & Live Demo');
      setBatch(isLab ? 'B1' : 'All');
    }
  }, [initialData, nextSessionNo, isLab, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitName.trim() || !topic.trim()) return;

    onSave({
      sessionNo,
      unitName: unitName.trim(),
      topic: topic.trim(),
      plannedDate,
      conductedDate: status === 'Conducted' ? conductedDate || plannedDate : undefined,
      status,
      pedagogy: pedagogy.trim(),
      batch: isLab ? batch : 'All',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {initialData ? 'Edit Syllabus Session' : `Add ${isLab ? 'Practical Session' : 'Lecture Session'}`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Record planned delivery &amp; teaching methodology
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Session #
              </label>
              <input
                type="number"
                min="1"
                value={sessionNo}
                onChange={(e) => setSessionNo(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div className={isLab ? 'col-span-2' : 'col-span-2'}>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isLab ? 'Lab Experiment / Module' : 'Unit / Module'}
              </label>
              <input
                type="text"
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                placeholder="e.g. Unit 2: Data Link Layer"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Topic &amp; Detailed Curriculum Outline
            </label>
            <textarea
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Framing methods, Bit & Byte Stuffing, Cyclic Redundancy Check (CRC)"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Planned Date
              </label>
              <input
                type="date"
                value={plannedDate}
                onChange={(e) => setPlannedDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Conducted Date
              </label>
              <input
                type="date"
                value={conductedDate}
                onChange={(e) => setConductedDate(e.target.value)}
                disabled={status !== 'Conducted'}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  const val = e.target.value as 'Scheduled' | 'Conducted' | 'Rescheduled';
                  setStatus(val);
                  if (val === 'Conducted' && !conductedDate) {
                    setConductedDate(plannedDate || new Date().toISOString().slice(0, 10));
                  }
                }}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Scheduled">Scheduled (Planned)</option>
                <option value="Conducted">Conducted (Completed)</option>
                <option value="Rescheduled">Rescheduled</option>
              </select>
            </div>

            {isLab ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lab Batch
                </label>
                <select
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">All Batches</option>
                  <option value="B1">Batch B1</option>
                  <option value="B2">Batch B2</option>
                  <option value="B3">Batch B3</option>
                  <option value="B4">Batch B4</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Batch / Audience
                </label>
                <input
                  type="text"
                  value={batch}
                  disabled
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-500"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Pedagogy / Teaching Aid / Tools
            </label>
            <input
              type="text"
              value={pedagogy}
              onChange={(e) => setPedagogy(e.target.value)}
              placeholder="e.g. Cisco Packet Tracer, Wireshark, ICT Chalk & Board"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
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
              {initialData ? 'Update Session' : 'Save Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
