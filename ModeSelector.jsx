import React from 'react';
import {
  Sparkles,
  GraduationCap,
  Dumbbell,
  FileText,
  HelpCircle,
  Globe,
} from 'lucide-react';

export const MODES = [
  { id: 'explain', label: 'Explain', icon: Sparkles },
  { id: 'exam', label: 'Exam Prep', icon: GraduationCap },
  { id: 'practice', label: 'Practice', icon: Dumbbell },
  { id: 'summarize', label: 'Summarize', icon: FileText },
  { id: 'doubt', label: 'Doubt', icon: HelpCircle },
  { id: 'general', label: 'General', icon: Globe },
];

export const ModeSelector = ({ mode, setMode, disabled }) => {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
      {MODES.map((m) => {
        const Icon = m.icon;
        const active = mode === m.id;
        return (
          <button
            key={m.id}
            type="button"
            disabled={disabled}
            onClick={() => setMode(m.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
              active
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-sm shadow-violet-500/30'
                : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-600'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Icon size={13} />
            {m.label}
          </button>
        );
      })}
    </div>
  );
};