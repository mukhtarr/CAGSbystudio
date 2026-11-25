import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, PlusCircle, RefreshCw, Trash2, UserCheck, CheckCircle2, Shield } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { ActivityLog } from '../../types';

interface ActivityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityDrawer: React.FC<ActivityDrawerProps> = ({ isOpen, onClose }) => {
  const { activityLogs } = useAcademic();

  const getActionBadge = (action: ActivityLog['action']) => {
    switch (action) {
      case 'CREATE':
        return {
          icon: <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />,
          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          label: 'Created',
        };
      case 'UPDATE':
        return {
          icon: <RefreshCw className="w-3.5 h-3.5 text-sky-400" />,
          color: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
          label: 'Updated',
        };
      case 'DELETE':
        return {
          icon: <Trash2 className="w-3.5 h-3.5 text-rose-400" />,
          color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          label: 'Deleted',
        };
      case 'ASSIGN':
        return {
          icon: <UserCheck className="w-3.5 h-3.5 text-purple-400" />,
          color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          label: 'Assigned',
        };
      case 'SET_ACTIVE':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />,
          color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          label: 'Active AY',
        };
      default:
        return {
          icon: <Shield className="w-3.5 h-3.5 text-indigo-400" />,
          color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
          label: 'System',
        };
    }
  };

  const formatTimestamp = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg text-white">Audit & Activity Log</h3>
                  <p className="text-xs text-slate-400">Real-time academic management events</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {activityLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Clock className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No activity recorded yet</p>
                </div>
              ) : (
                activityLogs.map((log) => {
                  const badge = getActionBadge(log.action);
                  return (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-indigo-500/30 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${badge.color}`}
                        >
                          {badge.icon}
                          {badge.label}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-200 font-medium leading-relaxed mb-1">
                        {log.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-700/40">
                        <span className="text-indigo-300/80 font-medium">{log.module}</span>
                        <span className="text-slate-500">{log.user}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-center">
              <span className="text-xs text-slate-500">
                Displaying last {activityLogs.length} audit entries
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
