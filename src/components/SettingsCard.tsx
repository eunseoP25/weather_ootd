import React from 'react';
import { Sliders, User, Activity } from 'lucide-react';
import { UserSettings } from '../types/weather';

interface SettingsCardProps {
  settings: UserSettings;
  onColdSensitivityChange: (val: UserSettings['coldSensitivity']) => void;
  onActivityLevelChange: (val: UserSettings['activityLevel']) => void;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({
  settings,
  onColdSensitivityChange,
  onActivityLevelChange,
}) => {
  return (
    <div className="glass-card rounded-3xl p-6 relative overflow-hidden transition-all duration-300 w-full">
      <div className="flex items-center gap-2 mb-6">
        <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50">
          <Sliders size={18} className="text-indigo-500" />
        </span>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          개인 맞춤 설정
        </h2>
      </div>

      {/* Sensitivity Settings */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
          <User size={16} />
          나의 체질 설정
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {/* Cold Sensitivity - Cold */}
          <button
            type="button"
            onClick={() => onColdSensitivityChange('cold')}
            className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all duration-300 ${
              settings.coldSensitivity === 'cold'
                ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20 font-bold'
                : 'border-slate-150 bg-white/40 dark:bg-slate-800/40 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/80'
            }`}
          >
            <span className="text-2xl mb-1.5">🥶</span>
            <span className="text-xs uppercase tracking-wider">추위를 많이 탐</span>
          </button>

          {/* Cold Sensitivity - Normal */}
          <button
            type="button"
            onClick={() => onColdSensitivityChange('normal')}
            className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all duration-300 ${
              settings.coldSensitivity === 'normal'
                ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20 font-bold'
                : 'border-slate-150 bg-white/40 dark:bg-slate-800/40 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/80'
            }`}
          >
            <span className="text-2xl mb-1.5">🙂</span>
            <span className="text-xs uppercase tracking-wider">보통 체질</span>
          </button>

          {/* Cold Sensitivity - Hot */}
          <button
            type="button"
            onClick={() => onColdSensitivityChange('hot')}
            className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all duration-300 ${
              settings.coldSensitivity === 'hot'
                ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/20 font-bold'
                : 'border-slate-150 bg-white/40 dark:bg-slate-800/40 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/80'
            }`}
          >
            <span className="text-2xl mb-1.5">🥵</span>
            <span className="text-xs uppercase tracking-wider">더위를 많이 탐</span>
          </button>
        </div>
      </div>

      {/* Activity Settings */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
          <Activity size={16} />
          오늘의 활동량 설정
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {/* Activity - Indoor */}
          <button
            type="button"
            onClick={() => onActivityLevelChange('indoor')}
            className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all duration-300 ${
              settings.activityLevel === 'indoor'
                ? 'bg-violet-500/10 border-violet-500 text-violet-600 dark:text-violet-400 ring-2 ring-violet-500/20 font-bold'
                : 'border-slate-150 bg-white/40 dark:bg-slate-800/40 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/80'
            }`}
          >
            <span className="text-2xl mb-1.5">🏠</span>
            <span className="text-xs uppercase tracking-wider">실내 위주</span>
          </button>

          {/* Activity - Normal */}
          <button
            type="button"
            onClick={() => onActivityLevelChange('normal')}
            className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all duration-300 ${
              settings.activityLevel === 'normal'
                ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20 font-bold'
                : 'border-slate-150 bg-white/40 dark:bg-slate-800/40 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/80'
            }`}
          >
            <span className="text-2xl mb-1.5">🚶</span>
            <span className="text-xs uppercase tracking-wider">보통 활동</span>
          </button>

          {/* Activity - Outdoor */}
          <button
            type="button"
            onClick={() => onActivityLevelChange('outdoor')}
            className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all duration-300 ${
              settings.activityLevel === 'outdoor'
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20 font-bold'
                : 'border-slate-150 bg-white/40 dark:bg-slate-800/40 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/80'
            }`}
          >
            <span className="text-2xl mb-1.5">🚴</span>
            <span className="text-xs uppercase tracking-wider">야외 많음</span>
          </button>
        </div>
      </div>
    </div>
  );
};
