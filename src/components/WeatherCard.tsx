import React from 'react';
import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudRain, 
  Snowflake, 
  CloudDrizzle, 
  Droplets, 
  Wind, 
  Compass, 
  TrendingUp, 
  TrendingDown 
} from 'lucide-react';
import { CurrentWeather, WeatherState } from '../types/weather';

interface WeatherCardProps {
  weather: CurrentWeather;
  locationName: string;
}

export function getWeatherIcon(state: WeatherState, size = 48, className = "") {
  switch (state) {
    case 'sunny':
      return <Sun size={size} className={`text-amber-500 animate-pulse ${className}`} />;
    case 'cloudy':
      return <CloudSun size={size} className={`text-slate-400 dark:text-slate-300 ${className}`} />;
    case 'overcast':
      return <Cloud size={size} className={`text-slate-500 dark:text-slate-400 ${className}`} />;
    case 'rainy':
      return <CloudRain size={size} className={`text-blue-500 animate-bounce ${className}`} />;
    case 'snowy':
      return <Snowflake size={size} className={`text-sky-300 animate-spin ${className}`} style={{ animationDuration: '8s' }} />;
    case 'rainyAndSnowy':
      return <CloudDrizzle size={size} className={`text-indigo-400 ${className}`} />;
    case 'shower':
      return <CloudRain size={size} className={`text-blue-600 animate-bounce ${className}`} />;
    default:
      return <Sun size={size} className={`text-amber-500 ${className}`} />;
  }
}

export function getWeatherText(state: WeatherState): string {
  switch (state) {
    case 'sunny': return '맑음';
    case 'cloudy': return '구름 많음';
    case 'overcast': return '흐림';
    case 'rainy': return '비';
    case 'snowy': return '눈';
    case 'rainyAndSnowy': return '진눈깨비';
    case 'shower': return '소나기';
    default: return '맑음';
  }
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather, locationName }) => {
  const { temp, apparentTemp, tempMax, tempMin, humidity, windSpeed, pop, weatherState } = weather;

  return (
    <div className="glass-card rounded-3xl p-6 relative overflow-hidden transition-all duration-300 w-full">
      {/* Decorative background glow */}
      <div className="absolute top-[-30px] right-[-30px] w-48 h-48 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Location Name & Weather State */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-blue-600 dark:text-blue-400 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 rounded-full border border-blue-100 dark:border-blue-900/50">
            현재 날씨
          </span>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2 flex items-center gap-1.5">
            {locationName}
          </h2>
        </div>
        <div className="flex flex-col items-end">
          {getWeatherIcon(weatherState, 44)}
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            {getWeatherText(weatherState)}
          </span>
        </div>
      </div>

      {/* Main Temperature Displays */}
      <div className="flex items-baseline gap-4 mb-6">
        <div className="text-6xl font-extrabold tracking-tighter text-slate-900 dark:text-white flex">
          {temp.toFixed(1)}
          <span className="text-4xl font-light text-blue-500 dark:text-blue-400">°</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
            체감 온도
          </span>
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {apparentTemp.toFixed(1)}°C
          </span>
        </div>
      </div>

      {/* Temp Min/Max */}
      <div className="flex gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5 mb-5">
        <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
          <TrendingDown size={16} className="text-blue-500" />
          <span>최저</span>
          <span className="font-semibold">{tempMin.toFixed(1)}°</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
          <TrendingUp size={16} className="text-rose-500" />
          <span>최고</span>
          <span className="font-semibold">{tempMax.toFixed(1)}°</span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Humidity */}
        <div className="flex flex-col p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-slate-100/50 dark:border-slate-800/20">
          <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs mb-1">
            <Droplets size={14} className="text-blue-400" />
            <span>습도</span>
          </div>
          <span className="text-base font-bold text-slate-800 dark:text-slate-200">
            {humidity}%
          </span>
        </div>

        {/* Wind Speed */}
        <div className="flex flex-col p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-slate-100/50 dark:border-slate-800/20">
          <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs mb-1">
            <Wind size={14} className="text-teal-400" />
            <span>풍속</span>
          </div>
          <span className="text-base font-bold text-slate-800 dark:text-slate-200">
            {windSpeed.toFixed(1)} m/s
          </span>
        </div>

        {/* Precipitation Probability */}
        <div className="flex flex-col p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-slate-100/50 dark:border-slate-800/20">
          <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs mb-1">
            <Compass size={14} className="text-indigo-400" />
            <span>강수확률</span>
          </div>
          <span className="text-base font-bold text-slate-800 dark:text-slate-200">
            {pop}%
          </span>
        </div>
      </div>
    </div>
  );
};
