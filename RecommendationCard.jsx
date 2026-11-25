import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, User, ExternalLink, Sparkles } from 'lucide-react';

export const RecommendationCard = ({ item, type }) => {
  const score = Math.round((item.score || 0) * 100);

  if (type === 'material') {
    return (
      <a
        href={item.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group block bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 hover:border-violet-400 dark:hover:border-violet-600 hover:shadow-md transition-all"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-sm">
            <FileText size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
              {item.title}
            </p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
                {item.meta?.category}
              </span>
              {item.meta?.semester && (
                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                  Sem {item.meta.semester}
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-500 mt-2">
              Match: <span className="font-semibold text-violet-600 dark:text-violet-400">{score}%</span>
            </p>
          </div>
          <ExternalLink size={14} className="flex-shrink-0 text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 mt-1 transition-colors" />
        </div>
      </a>
    );
  }

  // type === 'alumni'
  return (
    <Link
      to={`/alumni`}
      className="group block bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 hover:border-violet-400 dark:hover:border-violet-600 hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
          <User size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
            {item.title}
          </p>
          <p className="text-[11px] text-gray-600 dark:text-gray-400 truncate mt-0.5">
            {item.subtitle}
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-500 mt-2">
            Match: <span className="font-semibold text-amber-600 dark:text-amber-400">{score}%</span>
          </p>
        </div>
      </div>
    </Link>
  );
};