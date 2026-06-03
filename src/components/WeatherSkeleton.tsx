import React from 'react';

export const WeatherSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {/* Current Weather Card Skeleton */}
      <div className="glass-card rounded-3xl p-6 h-[320px] flex flex-col justify-between">
        <div>
          <div className="w-20 h-5 bg-slate-200 dark:bg-slate-800 rounded-full mb-3" />
          <div className="w-36 h-8 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
        <div className="flex items-baseline gap-4">
          <div className="w-24 h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="w-16 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        </div>
        <div className="w-full h-8 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>

      {/* Outfit Recommendation Skeleton */}
      <div className="glass-card rounded-3xl p-6 h-[320px] flex flex-col justify-between">
        <div>
          <div className="w-32 h-5 bg-slate-200 dark:bg-slate-800 rounded-full mb-4" />
          <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl mb-4" />
          <div className="w-28 h-4 bg-slate-200 dark:bg-slate-800 rounded mb-3" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          </div>
        </div>
      </div>

      {/* Settings Card Skeleton */}
      <div className="glass-card rounded-3xl p-6 h-[320px] flex flex-col justify-between">
        <div>
          <div className="w-28 h-6 bg-slate-200 dark:bg-slate-800 rounded mb-6" />
          <div className="w-20 h-4 bg-slate-200 dark:bg-slate-800 rounded mb-3" />
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          </div>
          <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded mb-3" />
          <div className="grid grid-cols-3 gap-3">
            <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
