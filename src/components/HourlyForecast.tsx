import React from 'react';
import { Clock } from 'lucide-react';
import { HourlyForecast as HourlyType } from '../types/weather';
import { getWeatherIcon, getWeatherText } from './WeatherCard';

interface HourlyForecastProps {
  hourly: HourlyType[];
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({ hourly }) => {
  // Limit to exactly 6 slots
  const displayedHourly = hourly.slice(0, 6);

  return (
    <div className="glass-card rounded-3xl p-6 relative overflow-hidden transition-all duration-300 w-full flex-1">
      <div className="flex items-center gap-2 mb-4">
        <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50">
          <Clock size={18} className="text-blue-500" />
        </span>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          시간대별 날씨
        </h2>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-1">
        {displayedHourly.map((item, index) => {
          // Format time from "09:00" to "09시"
          const hour = item.time.split(':')[0];
          const formattedTime = `${hour}시`;
          const humidityVal = item.humidity ?? 60;

          return (
            <div
              key={index}
              className="flex flex-col items-center justify-between p-3 bg-white/40 dark:bg-slate-800/20 border border-slate-100/50 dark:border-slate-800/10 rounded-2xl transition-all duration-200 hover:translate-y-[-2px] hover:bg-white/60 dark:hover:bg-slate-800/40 shadow-sm"
            >
              {/* Time */}
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wide mb-1">
                {formattedTime}
              </span>
              
              {/* Icon */}
              <div className="my-1.5 h-8 flex items-center justify-center">
                {getWeatherIcon(item.weatherState, 26)}
              </div>

              {/* Weather description text */}
              <span className="text-[10px] text-slate-500 dark:text-slate-400 text-center font-semibold truncate max-w-full mb-1.5">
                {getWeatherText(item.weatherState)}
              </span>
              
              {/* Temperature */}
              <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                {item.temp.toFixed(0)}°
              </span>

              {/* Humidity */}
              <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 mt-1 bg-sky-50 dark:bg-sky-950/40 border border-sky-100/30 dark:border-sky-900/20 px-1.5 py-0.5 rounded-lg whitespace-nowrap">
                💧 {humidityVal}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
