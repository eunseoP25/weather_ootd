import React from 'react';
import { ArrowLeft, Calendar, ShieldAlert, Thermometer, Droplets, Sparkles } from 'lucide-react';
import { DailyForecast, UserSettings, CurrentWeather } from '../types/weather';
import { getWeatherIcon, getWeatherText } from './WeatherCard';
import { formatDateMMDDDay } from '../utils/date';
import { getClothingRecommendation } from '../utils/recommend';

interface ThreeDayForecastPageProps {
  daily: DailyForecast[];
  locationName: string;
  settings: UserSettings;
  onBack: () => void;
}

const clothingEmojis: { [key: string]: string } = {
  '민소매': '🎽',
  '반팔 티셔츠': '👕',
  '반바지': '🩳',
  '린넨 스커트': '👗',
  '얇은 셔츠': '👔',
  '면바지': '👖',
  '긴팔 티셔츠': '👕',
  '셔츠': '👔',
  '얇은 가디건': '🧥',
  '후드집업': '🧥',
  '슬랙스': '👖',
  '청바지': '👖',
  '니트': '🧶',
  '맨투맨': '👕',
  '가디건': '🧥',
  '자켓': '🧥',
  '야상': '🧥',
  '스타킹': '🧦',
  '재킷': '🧥',
  '트렌치코트': '🧥',
  '간절기 자켓': '🧥',
  '코트': '🧥',
  '히트텍': '🔥',
  '가죽 자켓': '🧥',
  '기모 바지': '👖',
  '두꺼운 코트': '🧥',
  '울 코트': '🧥',
  '목도리': '🧣',
  '기모 슬랙스': '👖',
  '패딩 점퍼': '🧥',
  '장갑': '🧤',
  '귀도리': '🎧',
  '두꺼운 양말': '🧦',
  '기모 안감 의류': '👕',
  '바람막이': '🧥',
  '레인부츠': '👢',
  '방수 부츠': '🥾',
};

export const ThreeDayForecastPage: React.FC<ThreeDayForecastPageProps> = ({
  daily,
  locationName,
  settings,
  onBack,
}) => {
  const displayDaily = daily.slice(0, 3);
  const labels = ['오늘', '내일', '모레'];

  return (
    <div className="w-full flex flex-col gap-6 animate-slide-up">
      {/* Title Header */}
      <div className="flex items-center gap-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/30 dark:border-slate-800/30 rounded-3xl p-5 shadow-lg relative z-20">
        <button
          onClick={onBack}
          className="p-2 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-200 transition-all border border-slate-200/50 dark:border-slate-700/50 cursor-pointer flex items-center justify-center shrink-0"
          title="이전 화면으로 돌아가기"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Calendar size={14} />
            </span>
            <h2 className="text-xl font-bold text-slate-850 dark:text-slate-100">3일간 날씨</h2>
          </div>
          <p className="text-xs font-semibold text-slate-550 dark:text-slate-400 mt-0.5">
            선택 지역: <span className="font-extrabold text-blue-600 dark:text-blue-400">{locationName.replace(' (Mock)', '')}</span>
          </p>
        </div>
      </div>

      {/* 3 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayDaily.map((day, index) => {
          const label = labels[index] || '기타';
          const weatherText = getWeatherText(day.weatherState);
          const dateStr = formatDateMMDDDay(day.date);

          // Calculate daily average temperature for clothing recommendation
          const avgTemp = (day.tempMin + day.tempMax) / 2;
          
          // Form a mock weather object for getClothingRecommendation
          const dayMockWeather: CurrentWeather = {
            temp: avgTemp,
            apparentTemp: avgTemp,
            tempMax: day.tempMax,
            tempMin: day.tempMin,
            humidity: 60,
            windSpeed: 2,
            pop: day.pop ?? 0,
            weatherState: day.weatherState,
            pty: day.pty ?? 0,
            sky: 1, // default
          };

          const recommendation = getClothingRecommendation(dayMockWeather, settings);
          const clothingList = recommendation.clothingList;

          return (
            <div
              key={day.date}
              className="glass-card rounded-3xl p-6 relative overflow-hidden transition-all duration-300 flex flex-col justify-between border border-white/20 shadow-lg hover:-translate-y-1 hover:shadow-2xl hover:border-blue-200 dark:hover:border-blue-900/50"
            >
              {/* Glow accent */}
              <div className="absolute top-[-40px] right-[-40px] w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

              <div>
                {/* Card Header row */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-800 dark:text-white">
                      {label}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">
                      {dateStr}
                    </span>
                  </div>
                  
                  <span className="text-xs font-bold px-2.5 py-1 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/40 dark:border-slate-700/40 rounded-full text-slate-600 dark:text-slate-350">
                    {weatherText}
                  </span>
                </div>

                {/* Weather Info & Icon row */}
                <div className="flex items-center gap-4 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-150/40 dark:border-slate-800/30 p-3.5 rounded-2xl mb-4">
                  <div className="shrink-0 bg-white/70 dark:bg-slate-800/80 border border-slate-100/50 dark:border-slate-700/40 p-2.5 rounded-xl flex items-center justify-center shadow-sm">
                    {getWeatherIcon(day.weatherState, 40)}
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-bold text-slate-400">최고</span>
                      <span className="text-lg font-black text-rose-500 dark:text-rose-400">
                        {day.tempMax.toFixed(0)}°
                      </span>
                      <span className="text-xs text-slate-300 dark:text-slate-600">/</span>
                      <span className="text-xs font-bold text-slate-400">최저</span>
                      <span className="text-sm font-extrabold text-blue-500 dark:text-blue-400">
                        {day.tempMin.toFixed(0)}°
                      </span>
                    </div>

                    <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 mt-1 flex items-center gap-1">
                      <Droplets size={12} /> 강수확률: {day.pop ?? 0}%
                    </span>
                  </div>
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800/60 my-4" />

                {/* Recommended Clothing list */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Sparkles size={12} className="text-indigo-400" />
                    추천 아이템
                  </h4>
                  
                  <div className="flex flex-wrap gap-2">
                    {clothingList.map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-1.5 py-1.5 px-3 bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800/60 rounded-xl shadow-xs text-xs font-bold text-slate-750 dark:text-slate-200 transition-colors hover:border-blue-200 dark:hover:border-blue-900"
                      >
                        <span>{clothingEmojis[item] || '👕'}</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
