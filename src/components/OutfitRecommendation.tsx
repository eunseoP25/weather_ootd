import React, { useState } from 'react';
import { Shirt, Thermometer, ShieldAlert, Sparkles, Clock, Sun, Moon } from 'lucide-react';
import { CurrentWeather, UserSettings, HourlyForecast } from '../types/weather';
import { getClothingRecommendation, calculateApparentTemp } from '../utils/recommend';

interface OutfitRecommendationProps {
  weather: CurrentWeather;
  hourly: HourlyForecast[];
  settings: UserSettings;
}

// Help map clothing to emojis for visual appeal
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

type TabType = 'now' | 'max' | 'night';

export const OutfitRecommendation: React.FC<OutfitRecommendationProps> = ({
  weather,
  hourly,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('now');

  // 1. Resolve Weather for "지금"
  const nowWeather = weather;

  // 2. Resolve Weather for "낮(최고)"
  // Find highest temperature hour in hourly forecast
  const maxTempHour = hourly.length > 0
    ? hourly.reduce((max, curr) => curr.temp > max.temp ? curr : max, hourly[0])
    : null;

  const maxWeather: CurrentWeather = {
    ...weather,
    temp: weather.tempMax,
    apparentTemp: calculateApparentTemp(
      weather.tempMax,
      maxTempHour?.windSpeed ?? weather.windSpeed,
      maxTempHour?.humidity ?? weather.humidity
    ),
    humidity: maxTempHour?.humidity ?? weather.humidity,
    windSpeed: maxTempHour?.windSpeed ?? weather.windSpeed,
    pop: maxTempHour?.pop ?? weather.pop,
    pty: maxTempHour?.pty ?? weather.pty,
    sky: maxTempHour?.sky ?? weather.sky,
    weatherState: maxTempHour?.weatherState ?? weather.weatherState,
  };

  // 3. Resolve Weather for "밤(21시)"
  const nightHour = hourly.find((h) => h.time.startsWith('21:')) ||
    hourly.find((h) => h.time.startsWith('20:')) ||
    hourly.find((h) => h.time.startsWith('22:')) ||
    (hourly.length > 8 ? hourly[8] : null);

  const nightTemp = nightHour ? nightHour.temp : 16;
  const nightWeather: CurrentWeather = {
    ...weather,
    temp: nightTemp,
    apparentTemp: calculateApparentTemp(
      nightTemp,
      nightHour?.windSpeed ?? weather.windSpeed,
      nightHour?.humidity ?? weather.humidity
    ),
    humidity: nightHour?.humidity ?? weather.humidity,
    windSpeed: nightHour?.windSpeed ?? weather.windSpeed,
    pop: nightHour?.pop ?? weather.pop,
    pty: nightHour?.pty ?? weather.pty,
    sky: nightHour?.sky ?? weather.sky,
    weatherState: nightHour?.weatherState ?? weather.weatherState,
  };

  // Select target weather based on active tab
  const getTargetWeather = (): CurrentWeather => {
    switch (activeTab) {
      case 'max':
        return maxWeather;
      case 'night':
        return nightWeather;
      case 'now':
      default:
        return nowWeather;
    }
  };

  const targetWeather = getTargetWeather();
  const recommendation = getClothingRecommendation(targetWeather, settings);
  const { clothingList, warnings } = recommendation;

  return (
    <div
      id="outfit-recommendation"
      className="glass-card rounded-3xl p-6 relative overflow-hidden transition-all duration-300 w-full flex-1 flex flex-col justify-between scroll-mt-6"
    >
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-bold tracking-wider uppercase text-indigo-600 dark:text-indigo-400 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 rounded-full border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-1.5 shadow-sm">
            <Sparkles size={13} />
            오늘의 추천 옷차림
          </span>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-5 bg-slate-100/60 dark:bg-slate-950/50 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40">
          <button
            onClick={() => setActiveTab('now')}
            className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === 'now'
                ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400 font-extrabold border border-slate-200/10'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold'
            }`}
          >
            <span className="text-[10px] md:text-xs flex items-center gap-1 mb-0.5">
              <Clock size={11} /> 지금
            </span>
            <span className="text-sm">{nowWeather.temp.toFixed(0)}°</span>
          </button>
          
          <button
            onClick={() => setActiveTab('max')}
            className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === 'max'
                ? 'bg-white dark:bg-slate-800 shadow-sm text-amber-600 dark:text-amber-400 font-extrabold border border-slate-200/10'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold'
            }`}
          >
            <span className="text-[10px] md:text-xs flex items-center gap-1 mb-0.5">
              <Sun size={11} /> 낮(최고)
            </span>
            <span className="text-sm">{maxWeather.temp.toFixed(0)}°</span>
          </button>

          <button
            onClick={() => setActiveTab('night')}
            className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === 'night'
                ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400 font-extrabold border border-slate-200/10'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold'
            }`}
          >
            <span className="text-[10px] md:text-xs flex items-center gap-1 mb-0.5">
              <Moon size={11} /> 밤(21시)
            </span>
            <span className="text-sm">{nightWeather.temp.toFixed(0)}°</span>
          </button>
        </div>

        {/* Apparent Temperature Card UI */}
        <div className="bg-gradient-to-r from-blue-50/60 to-indigo-50/30 dark:from-slate-800/40 dark:to-slate-800/10 border border-blue-100/40 dark:border-slate-800/40 rounded-2xl p-4 mb-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0 shadow-sm">
            <Thermometer size={24} className="animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              체감 온도
            </p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
              {targetWeather.apparentTemp.toFixed(1)}<span className="text-lg font-bold">°C</span>
            </p>
          </div>
        </div>

        {/* Special Weather Badges */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {targetWeather.pop >= 60 && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200/30 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-800/50 flex items-center gap-1 animate-pulse">
              ☔ 우산 필수
            </span>
          )}
          {targetWeather.pty > 0 && (targetWeather.pty === 1 || targetWeather.pty === 2 || targetWeather.pty === 4) && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200/30 dark:bg-indigo-900/40 dark:text-indigo-200 dark:border-indigo-800/50 flex items-center gap-1">
              👢 레인부츠 추천
            </span>
          )}
          {targetWeather.pty === 3 && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 border border-sky-200/30 dark:bg-sky-900/40 dark:text-sky-200 dark:border-sky-800/50 flex items-center gap-1">
              ❄️ 방수 슈즈 추천
            </span>
          )}
          {targetWeather.windSpeed >= 8 && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 border border-teal-200/30 dark:bg-teal-900/40 dark:text-teal-200 dark:border-teal-800/50 flex items-center gap-1">
              💨 바람막이 추천
            </span>
          )}
          {targetWeather.humidity >= 80 && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/30 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-800/50 flex items-center gap-1">
              💦 통풍 의류 권장
            </span>
          )}
        </div>

        {/* Warnings if any */}
        {warnings.length > 0 && (
          <div className="mb-5 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/30 text-rose-800 dark:text-rose-300 text-xs rounded-2xl p-3.5 flex items-start gap-2 shadow-sm">
            <ShieldAlert size={16} className="text-rose-500 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              {warnings.map((warn, i) => (
                <span key={i} className="font-semibold">{warn}</span>
              ))}
            </div>
          </div>
        )}

        {/* Clothing Items Grid */}
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Shirt size={14} className="text-slate-450" />
          추천 아이템
        </h3>
        
        <div className="grid grid-cols-2 gap-2.5">
          {clothingList.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/60 transition-all duration-200 hover:border-indigo-200 dark:hover:border-indigo-900 hover:shadow-md"
            >
              <div className="text-xl w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-slate-100/50 dark:border-slate-950 shrink-0">
                {clothingEmojis[item] || '👕'}
              </div>
              <span className="font-bold text-sm text-slate-850 dark:text-slate-200">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
