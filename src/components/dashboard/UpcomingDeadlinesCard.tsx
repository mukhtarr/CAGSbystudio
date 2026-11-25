import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
  Tag,
  ArrowUpRight,
  Filter,
  Search,
  Bell,
  Sparkles,
  ChevronRight,
  Plus,
  FileSpreadsheet,
  Download,
  Check,
  Flame,
  Bookmark,
  Share2,
  CalendarCheck2,
  GraduationCap,
  Users,
  ShieldCheck,
  School,
} from 'lucide-react';
import { AcademicYear, AcademicEvent, DeadlineCategory, ActiveTab } from '../../types';
import { useAcademic } from '../../context/AcademicContext';

interface UpcomingDeadlinesCardProps {
  academicYears: AcademicYear[];
  activeAcademicYear?: AcademicYear;
  onNavigate?: (tab: ActiveTab) => void;
  isDark?: boolean;
}

const CATEGORY_CONFIG: Record<
  DeadlineCategory,
  { label: string; bg: string; text: string; border: string; iconBg: string }
> = {
  EXAMS: {
    label: 'Exam Period',
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-800/80',
    iconBg: 'bg-rose-500 text-white',
  },
  REPORTING: {
    label: 'Reporting Cycle',
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
    text: 'text-indigo-700 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-800/80',
    iconBg: 'bg-indigo-600 text-white',
  },
  GRADING: {
    label: 'Grading & Marks',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800/80',
    iconBg: 'bg-emerald-600 text-white',
  },
  ENROLLMENT: {
    label: 'Enrollment & Electives',
    bg: 'bg-blue-500/10 dark:bg-blue-500/15',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800/80',
    iconBg: 'bg-blue-600 text-white',
  },
  AUDIT: {
    label: 'Audit & Governance',
    bg: 'bg-purple-500/10 dark:bg-purple-500/15',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800/80',
    iconBg: 'bg-purple-600 text-white',
  },
  GENERAL: {
    label: 'Academic Milestone',
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800/80',
    iconBg: 'bg-amber-600 text-white',
  },
};

export const UpcomingDeadlinesCard: React.FC<UpcomingDeadlinesCardProps> = ({
  academicYears,
  activeAcademicYear,
  onNavigate,
  isDark = false,
}) => {
  const { updateAcademicYear, addToast } = useAcademic();

  // Academic Year selection filter
  const [selectedYearId, setSelectedYearId] = useState<string>(
    activeAcademicYear?.id || (academicYears.length > 0 ? academicYears[0].id : 'ALL')
  );

  // Category & search filter
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Quick Add Event Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<{
    title: string;
    category: DeadlineCategory;
    startDate: string;
    endDate: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    targetAudience: 'Faculty' | 'Students' | 'Coordinators' | 'All';
    actionUrlTab: ActiveTab;
  }>({
    title: '',
    category: 'EXAMS',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    description: '',
    priority: 'high',
    targetAudience: 'All',
    actionUrlTab: 'students',
  });

  // Current academic year in view
  const currentAcademicYear = useMemo(() => {
    return academicYears.find((ay) => ay.id === selectedYearId) || activeAcademicYear;
  }, [academicYears, selectedYearId, activeAcademicYear]);

  // Derive all events for the current year or synthesize milestone events if empty
  const rawEventsList: (AcademicEvent & { yearCode: string; yearName: string; academicYearId: string })[] =
    useMemo(() => {
      const results: (AcademicEvent & {
        yearCode: string;
        yearName: string;
        academicYearId: string;
      })[] = [];

      const targetYears =
        selectedYearId === 'ALL'
          ? academicYears
          : academicYears.filter((ay) => ay.id === selectedYearId);

      targetYears.forEach((year) => {
        if (year.events && year.events.length > 0) {
          year.events.forEach((ev) => {
            results.push({
              ...ev,
              yearCode: year.code,
              yearName: year.name,
              academicYearId: year.id,
            });
          });
        } else {
          // Auto-derive primary milestones from term start and end dates
          results.push(
            {
              id: `${year.id}-commence`,
              title: `${year.name} Commencement & Induction`,
              category: 'ENROLLMENT',
              startDate: year.startDate,
              description: 'Official commencement of lectures and department induction assemblies.',
              priority: 'high',
              targetAudience: 'All',
              actionUrlTab: 'academic-years',
              yearCode: year.code,
              yearName: year.name,
              academicYearId: year.id,
            },
            {
              id: `${year.id}-finals`,
              title: `${year.term} Semester End University Examinations`,
              category: 'EXAMS',
              startDate: year.endDate,
              description: 'Centralized semester terminal examinations and semester closure.',
              priority: 'high',
              targetAudience: 'All',
              actionUrlTab: 'students',
              yearCode: year.code,
              yearName: year.name,
              academicYearId: year.id,
            }
          );
        }
      });

      // Sort chronologically by start date
      return results.sort(
        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
    }, [academicYears, selectedYearId]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return rawEventsList.filter((event) => {
      // Category filter
      if (selectedCategory !== 'ALL' && event.category !== selectedCategory) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = event.title.toLowerCase().includes(query);
        const matchesDesc = event.description.toLowerCase().includes(query);
        const matchesCategory = event.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCategory) return false;
      }
      return true;
    });
  }, [rawEventsList, selectedCategory, searchQuery]);

  // Date utilities
  const formatDateDisplay = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getDaysStatus = (startDateStr: string, endDateStr?: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(startDateStr + 'T00:00:00');
    start.setHours(0, 0, 0, 0);

    const end = endDateStr ? new Date(endDateStr + 'T00:00:00') : start;
    end.setHours(23, 59, 59, 999);

    const diffTime = start.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (today >= start && today <= end) {
      return {
        label: 'Ongoing / Active',
        type: 'active' as const,
        badgeClass:
          'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
      };
    } else if (diffDays > 0) {
      if (diffDays <= 7) {
        return {
          label: `In ${diffDays} day${diffDays === 1 ? '' : 's'} (Due Soon)`,
          type: 'urgent' as const,
          badgeClass:
            'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300 dark:border-rose-700 font-bold animate-pulse',
        };
      } else if (diffDays <= 30) {
        return {
          label: `In ${diffDays} days`,
          type: 'upcoming' as const,
          badgeClass:
            'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700',
        };
      } else {
        const weeks = Math.round(diffDays / 7);
        return {
          label: `In ~${weeks} weeks`,
          type: 'future' as const,
          badgeClass:
            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
        };
      }
    } else {
      return {
        label: 'Completed / Past',
        type: 'passed' as const,
        badgeClass:
          'bg-slate-100 text-slate-500 dark:bg-slate-800/60 dark:text-slate-500 border-slate-200 dark:border-slate-800',
      };
    }
  };

  // Export / Download .ics iCalendar file for a deadline
  const handleExportICS = (event: AcademicEvent) => {
    const formatICSDate = (dateStr: string) => {
      return dateStr.replace(/-/g, '') + 'T090000Z';
    };

    const startICS = formatICSDate(event.startDate);
    const endICS = event.endDate ? formatICSDate(event.endDate) : startICS;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CAGS Academic ERP//Academic Deadlines//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}-${Date.now()}@cags.edu`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${startICS}`,
      `DTEND:${endICS}`,
      `SUMMARY:${event.title} [CAGS Academic]`,
      `DESCRIPTION:${event.description.replace(/\n/g, ' ')}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('success', 'Calendar Event Exported', `Downloaded .ics file for "${event.title}"`);
  };

  // Copy deadline summary to clipboard
  const handleCopy = (event: AcademicEvent) => {
    const text = `Academic Deadline: ${event.title}\nCategory: ${event.category}\nDate: ${event.startDate}${
      event.endDate ? ` to ${event.endDate}` : ''
    }\nDetails: ${event.description}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(event.id);
      addToast('info', 'Copied to Clipboard', `Details copied for "${event.title}"`);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Handle adding new deadline to current academic year
  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim()) {
      addToast('error', 'Missing Title', 'Please provide a deadline or exam period title.');
      return;
    }

    const targetYear = currentAcademicYear || academicYears[0];
    if (!targetYear) return;

    const createdEvent: AcademicEvent = {
      id: `ev-${Date.now()}`,
      title: newEvent.title.trim(),
      category: newEvent.category,
      startDate: newEvent.startDate,
      endDate: newEvent.endDate ? newEvent.endDate : undefined,
      description: newEvent.description.trim() || 'Scheduled academic session milestone.',
      priority: newEvent.priority,
      targetAudience: newEvent.targetAudience,
      actionUrlTab: newEvent.actionUrlTab,
    };

    const existingEvents = targetYear.events || [];
    const updatedEvents = [...existingEvents, createdEvent];

    updateAcademicYear(targetYear.id, { events: updatedEvents });

    addToast(
      'success',
      'Deadline Added',
      `"${createdEvent.title}" scheduled for ${targetYear.name}`
    );

    setIsAddModalOpen(false);
    setNewEvent({
      title: '',
      category: 'EXAMS',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      description: '',
      priority: 'high',
      targetAudience: 'All',
      actionUrlTab: 'students',
    });
  };

  return (
    <div
      id="upcoming-deadlines-section"
      className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden transition-all"
    >
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
            <CalendarCheck2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                Upcoming Academic Deadlines &amp; Exam Periods
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                {currentAcademicYear?.code || 'AY 2024-25'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live tracking of examination windows, reporting cycles, audit milestones, and grading deadlines
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Academic Year Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <select
              value={selectedYearId}
              onChange={(e) => setSelectedYearId(e.target.value)}
              className="bg-transparent font-semibold focus:outline-none cursor-pointer pr-2 text-xs"
            >
              <option value="ALL" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                All Academic Years
              </option>
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

          {/* Add Milestone Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-600/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Date</span>
          </button>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Cards Matrix View"
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Timeline Sequence View"
            >
              Timeline
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            All Dates ({rawEventsList.length})
          </button>

          <button
            onClick={() => setSelectedCategory('EXAMS')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
              selectedCategory === 'EXAMS'
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            Exam Periods
          </button>

          <button
            onClick={() => setSelectedCategory('REPORTING')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
              selectedCategory === 'REPORTING'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            Reporting Cycles
          </button>

          <button
            onClick={() => setSelectedCategory('GRADING')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
              selectedCategory === 'GRADING'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            Grading &amp; Marks
          </button>

          <button
            onClick={() => setSelectedCategory('AUDIT')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
              selectedCategory === 'AUDIT'
                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            Audits &amp; Reviews
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px] max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search dates, exams, audit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="py-12 text-center">
          <CalendarDays className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No Academic Deadlines Found
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or category filter, or click "Add Date" to schedule an upcoming milestone.
          </p>
        </div>
      )}

      {/* Grid Mode */}
      {viewMode === 'grid' && filteredEvents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((event) => {
            const catStyle = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.GENERAL;
            const status = getDaysStatus(event.startDate, event.endDate);

            return (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between group ${
                  status.type === 'urgent'
                    ? 'bg-gradient-to-br from-rose-50/50 via-white to-white dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-900 border-rose-300/70 dark:border-rose-800/60 shadow-md ring-1 ring-rose-400/20'
                    : status.type === 'active'
                    ? 'bg-gradient-to-br from-emerald-50/50 via-white to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 border-emerald-300/70 dark:border-emerald-800/60 shadow-md'
                    : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                }`}
              >
                <div>
                  {/* Top Status & Category Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {catStyle.label}
                    </span>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${status.badgeClass}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  {/* Title & Dates */}
                  <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                    {event.title}
                  </h4>

                  {/* Date Range Badge */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1.5 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>{formatDateDisplay(event.startDate)}</span>
                    {event.endDate && (
                      <>
                        <span className="text-slate-400">→</span>
                        <span>{formatDateDisplay(event.endDate)}</span>
                      </>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                {/* Bottom Footer Actions & Audience */}
                <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <Users className="w-3 h-3 text-slate-400" />
                    <span>Audience: </span>
                    <strong className="text-slate-700 dark:text-slate-300 font-semibold">
                      {event.targetAudience || 'All'}
                    </strong>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* ICS Export */}
                    <button
                      onClick={() => handleExportICS(event)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors cursor-pointer"
                      title="Add to iCal (.ics)"
                    >
                      <CalendarDays className="w-3.5 h-3.5" />
                    </button>

                    {/* Copy details */}
                    <button
                      onClick={() => handleCopy(event)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors cursor-pointer"
                      title="Copy details"
                    >
                      {copiedId === event.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Jump to module tab if available */}
                    {event.actionUrlTab && onNavigate && (
                      <button
                        onClick={() => onNavigate(event.actionUrlTab!)}
                        className="px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold text-[11px] flex items-center gap-1 border border-amber-200/60 dark:border-amber-500/20 transition-colors cursor-pointer"
                      >
                        <span>Manage</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Timeline Mode */}
      {viewMode === 'timeline' && filteredEvents.length > 0 && (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {filteredEvents.map((event) => {
            const catStyle = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.GENERAL;
            const status = getDaysStatus(event.startDate, event.endDate);

            return (
              <div key={event.id} className="relative group">
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                    status.type === 'active'
                      ? 'bg-emerald-500 ring-4 ring-emerald-500/20'
                      : status.type === 'urgent'
                      ? 'bg-rose-500 ring-4 ring-rose-500/20'
                      : 'bg-amber-500'
                  }`}
                />

                <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 hover:border-amber-400 dark:hover:border-amber-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                      >
                        {catStyle.label}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${status.badgeClass}`}
                      >
                        {status.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({event.yearCode})
                      </span>
                    </div>

                    <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                      {event.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-slate-700">
                    <div className="text-xs font-mono font-bold text-amber-700 dark:text-amber-300">
                      {formatDateDisplay(event.startDate)}
                      {event.endDate && (
                        <span className="block text-[11px] text-slate-500 font-normal">
                          to {formatDateDisplay(event.endDate)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleExportICS(event)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors cursor-pointer"
                        title="Download .ics"
                      >
                        <CalendarDays className="w-3.5 h-3.5" />
                      </button>

                      {event.actionUrlTab && onNavigate && (
                        <button
                          onClick={() => onNavigate(event.actionUrlTab!)}
                          className="px-2.5 py-1 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <span>Open</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Add Deadline Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                    Schedule Academic Milestone / Deadline
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Session: {currentAcademicYear?.name || 'Current Session'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEventSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Milestone / Examination Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Term CIE-I Exams or NAAC Annual Audit"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={newEvent.category}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, category: e.target.value as DeadlineCategory })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs cursor-pointer"
                  >
                    <option value="EXAMS">Exam Period (EXAMS)</option>
                    <option value="REPORTING">Reporting Cycle (REPORTING)</option>
                    <option value="GRADING">Grading &amp; Marks (GRADING)</option>
                    <option value="ENROLLMENT">Enrollment &amp; Electives (ENROLLMENT)</option>
                    <option value="AUDIT">Audit &amp; Compliance (AUDIT)</option>
                    <option value="GENERAL">General Milestone (GENERAL)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Audience
                  </label>
                  <select
                    value={newEvent.targetAudience}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        targetAudience: e.target.value as 'Faculty' | 'Students' | 'Coordinators' | 'All',
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs cursor-pointer"
                  >
                    <option value="All">All Campus Stakeholders</option>
                    <option value="Students">Enrolled Students</option>
                    <option value="Faculty">Faculty &amp; Instructors</option>
                    <option value="Coordinators">Class Coordinators</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Start / Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newEvent.startDate}
                    onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={newEvent.endDate}
                    onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description &amp; Action Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Key instructions or reporting requirements for this deadline..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-md shadow-amber-600/30 transition-all hover:scale-105 active:scale-95"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
