import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Calendar,
  Plus,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CalendarCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AcademicYear } from '../../types';
import { useAcademic } from '../../context/AcademicContext';
import { AcademicYearModal } from './AcademicYearModal';
import { ConfirmModal } from '../common/ConfirmModal';

export const AcademicYearsView: React.FC = () => {
  const { academicYears, setActiveAcademicYear, deleteAcademicYear, classes, students } =
    useAcademic();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [yearToEdit, setYearToEdit] = useState<AcademicYear | null>(null);
  const [yearToDelete, setYearToDelete] = useState<AcademicYear | null>(null);

  const handleSetActive = (year: AcademicYear) => {
    if (year.isActive) return;
    setActiveAcademicYear(year.id);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  const handleOpenAdd = () => {
    setYearToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (year: AcademicYear) => {
    setYearToEdit(year);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-600/30">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
              Academic Years & Terms
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure collegiate academic sessions, terms (ODD/EVEN), and active semester timelines
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Academic Year
        </button>
      </div>

      {/* Grid of Academic Years */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {academicYears.map((year) => {
          return (
            <div
              key={year.id}
              className={`p-6 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                year.isActive
                  ? 'bg-gradient-to-br from-amber-500/10 via-white to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 border-amber-500/50 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/30'
                  : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-lg hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Active Badge / Glow */}
              {year.isActive && (
                <div className="absolute top-0 right-0 px-4 py-1 rounded-bl-2xl bg-amber-500 text-slate-950 font-heading font-bold text-xs flex items-center gap-1.5 shadow-md">
                  <Sparkles className="w-3.5 h-3.5" /> CURRENT ACTIVE SESSION
                </div>
              )}

              <div>
                {/* Year Header */}
                <div className="flex items-start justify-between gap-3 mb-3 pr-8">
                  <div>
                    <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                      {year.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-xs text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                        {year.code}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {year.term} Term
                      </span>
                    </div>
                  </div>
                </div>

                {/* Date range box */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 my-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Start Date:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white font-mono">{year.startDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" /> End Date:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white font-mono">{year.endDate}</span>
                  </div>
                  {year.events && year.events.length > 0 && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
                        <CalendarCheck className="w-3.5 h-3.5" /> Scheduled Deadlines:
                      </span>
                      <span className="font-bold text-amber-700 dark:text-amber-300 font-mono">
                        {year.events.length} Key Dates
                      </span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {year.notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic mb-4">
                    &ldquo;{year.notes}&rdquo;
                  </p>
                )}
              </div>

              {/* Card Bottom Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                {year.isActive ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" /> Active System Session
                  </span>
                ) : (
                  <button
                    onClick={() => handleSetActive(year)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-600 hover:text-white text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CalendarCheck className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> Set as Active
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(year)}
                    className="p-2 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-sky-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Edit Academic Year"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {!year.isActive && (
                    <button
                      onClick={() => setYearToDelete(year)}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Delete Academic Year"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <AcademicYearModal
        isOpen={isModalOpen}
        yearToEdit={yearToEdit}
        onClose={() => {
          setIsModalOpen(false);
          setYearToEdit(null);
        }}
      />

      <ConfirmModal
        isOpen={Boolean(yearToDelete)}
        title="Delete Academic Year"
        message={`Are you sure you want to delete "${yearToDelete?.name}" (${yearToDelete?.code})? This action cannot be reversed.`}
        confirmLabel="Delete Session"
        confirmVariant="danger"
        onConfirm={() => {
          if (yearToDelete) {
            deleteAcademicYear(yearToDelete.id);
            setYearToDelete(null);
          }
        }}
        onClose={() => setYearToDelete(null)}
      />
    </div>
  );
};
