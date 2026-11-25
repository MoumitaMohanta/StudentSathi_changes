import React from 'react';
import { FileText, ExternalLink } from 'lucide-react';

export const SourceCard = ({ source }) => {
  return (
    <a
      href={source.fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-950/40 dark:to-fuchsia-950/40 border border-violet-200/60 dark:border-violet-800/40 hover:border-violet-400 dark:hover:border-violet-600 hover:shadow-md transition-all duration-200"
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-sm">
        <FileText size={16} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
          {source.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-violet-200/60 dark:bg-violet-800/60 text-violet-800 dark:text-violet-200">
            {source.category}
          </span>
          {source.page && (
            <span className="text-[11px] text-gray-600 dark:text-gray-400">
              p. {source.page}
            </span>
          )}
        </div>
      </div>
      <ExternalLink
        size={14}
        className="flex-shrink-0 text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 mt-1 transition-colors"
      />
    </a>
  );
};