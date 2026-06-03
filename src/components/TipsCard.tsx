import React from 'react';
import { Lightbulb, Info } from 'lucide-react';

interface TipsCardProps {
  tips: string[];
}

export const TipsCard: React.FC<TipsCardProps> = ({ tips }) => {
  return (
    <div className="glass-card rounded-3xl p-6 relative overflow-hidden transition-all duration-300 w-full">
      <div className="flex items-center gap-2 mb-4">
        <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900/50">
          <Lightbulb size={18} className="text-amber-500" />
        </span>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          외출 준비 팁
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {tips.map((tip, idx) => (
          <div 
            key={idx} 
            className="flex items-start gap-3 p-3 bg-white/40 dark:bg-slate-800/20 border border-slate-100/50 dark:border-slate-800/10 rounded-2xl transition-all duration-200 hover:bg-white/60 dark:hover:bg-slate-800/35"
          >
            <span className="mt-0.5 shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-amber-100/60 dark:bg-amber-950/50 text-amber-600 text-xs">
              <Info size={12} />
            </span>
            <p className="text-sm font-medium text-slate-650 dark:text-slate-300 leading-relaxed">
              {tip}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
