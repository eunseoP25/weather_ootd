import React from 'react';
import { Calendar } from 'lucide-react';
import { DailyForecast as DailyType } from '../types/weather';
import { getWeatherIcon, getWeatherText } from './WeatherCard';
import { formatDateMMDDDay } from '../utils/date';

interface DailyForecastProps {
  daily: DailyType[];
}

export const DailyForecast: React.FC<DailyForecastProps> = ({ daily }) => {
  const displayDaily = daily.slice(0, 3);

  return (
    <div
      id="daily-forecast"
      className="glass-card rounded-3xl p-6 relative overflow-hidden transition-all duration-300 w-full flex flex-col justify-between scroll-mt-6"
    >
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50">
            <Calendar size={18} className="text-indigo-500" />
          </span>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            3일간의 예보
          </h2>
        </div>

        <div className="flex flex-col">
          {displayDaily.map((item, index) => (
            <div
              key={index}
              className={`flex items-center justify-between py-3.5 ${
                index !== displayDaily.length - 1
                  ? 'border-b border-slate-100/80 dark:border-slate-800/40'
                  : ''
              }`}
            >
              {/* Date */}
              <span className="text-sm font-semibold text-slate-650 dark:text-slate-300 w-24">
                {index === 0 ? '오늘' : formatDateMMDDDay(item.date)}
              </span>

              {/* Weather Icon & State Text */}
              <div className="flex items-center gap-2.5 flex-1 justify-start ml-2">
                {getWeatherIcon(item.weatherState, 22)}
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                  {getWeatherText(item.weatherState)}
                </span>
              </div>

              {/* High/Low Temperature */}
              <div className="flex items-center gap-3 text-right">
                <span className="text-xs font-bold text-blue-500 dark:text-blue-400">
                  {item.tempMin.toFixed(0)}°
                </span>
                
                {/* Visual temperature range bar indicator */}
                <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative hidden xs:block">
                  <div className="absolute top-0 bottom-0 left-[20%] right-[20%] bg-gradient-to-r from-blue-400 to-rose-400 rounded-full" />
                </div>

                <span className="text-xs font-bold text-rose-500 dark:text-rose-400">
                  {item.tempMax.toFixed(0)}°
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
