import React from 'react';
import { Sparkles } from 'lucide-react';
import { RecommendationCard } from './RecommendationCard';

export const ForYouSection = ({ title, subtitle, materials = [], alumni = [] }) => {
  const hasContent = materials.length > 0 || alumni.length > 0;
  if (!hasContent) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
          <Sparkles size={14} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.map((m) => (
          <RecommendationCard key={m._id} item={m} type="material" />
        ))}
        {alumni.map((a) => (
          <RecommendationCard key={a._id} item={a} type="alumni" />
        ))}
      </div>
    </section>
  );
};