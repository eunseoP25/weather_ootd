import React, { useEffect, useState, useRef } from 'react';
import { RefreshCw, Sun, Moon, AlertCircle, Settings, Menu, User, Activity } from 'lucide-react';
import { useWeather } from '../hooks/useWeather';
import { useSettings } from '../hooks/useSettings';
import { WeatherCard } from '../components/WeatherCard';
import { OutfitRecommendation } from '../components/OutfitRecommendation';
import { HourlyForecast } from '../components/HourlyForecast';
import { ThreeDayForecastPage } from '../components/ThreeDayForecastPage';
import { MyClosetPage } from '../components/MyClosetPage';
import { FavoriteLocations } from '../components/FavoriteLocations';
import { WeatherSkeleton } from '../components/WeatherSkeleton';
import { PwaInstallBanner } from '../components/PwaInstallBanner';
import { getClothingRecommendation } from '../utils/recommend';

export const MainPage: React.FC = () => {
  const {
    favorites,
    activeLocation,
    weatherData,
    isLoading,
    isError,
    error,
    isFetching,
    setActiveLocation,
    requestCurrentLocation,
    addFavorite,
    deleteFavorite,
    refetch,
  } = useWeather();

  const { settings, updateColdSensitivity, updateActivityLevel } = useSettings();

  // View states
  const [currentView, setCurrentView] = useState<'main' | 'forecast3days' | 'mycloset'>('main');

  // Dropdown states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const settingsRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Click outside listener to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const stored = localStorage.getItem('ootd_dark_mode');
      if (stored) return stored === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Apply dark mode class to document
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('ootd_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  // Request current location on first mount
  useEffect(() => {
    requestCurrentLocation();
  }, []);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  // Background styling depends on whether it is day/night or dark mode
  const bgClass = isDarkMode ? 'weather-bg-night' : 'weather-bg-day';

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-500 py-6 px-4 md:px-8`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/30 dark:border-slate-800/30 rounded-3xl p-4 md:p-5 shadow-lg relative z-40">
          <div
            onClick={() => setCurrentView('main')}
            className="flex items-center gap-3 cursor-pointer select-none"
            title="메인 화면으로 이동"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-blue-500/20">
              👕
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">
                오늘의 옷차림
              </h1>
              <p className="text-[10px] md:text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                날씨에 딱 맞는 옷차림 추천
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">

            {/* Refresh */}
            <button
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
              title="날씨 정보 새로고침"
              className="p-2.5 rounded-2xl bg-white/75 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-350 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 disabled:opacity-50 transition-all duration-200 cursor-pointer"
            >
              <RefreshCw size={18} className={`${isFetching ? 'animate-spin' : ''}`} />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              title={isDarkMode ? '라이트 모드로' : '다크 모드로'}
              className="p-2.5 rounded-2xl bg-white/75 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-350 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-all duration-200 cursor-pointer"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Personal Settings Dropdown */}
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => {
                  setIsSettingsOpen(!isSettingsOpen);
                  setIsMenuOpen(false);
                }}
                title="개인 맞춤 설정"
                className={`p-2.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isSettingsOpen
                    ? 'bg-blue-500 text-white border-blue-500 dark:bg-blue-600 shadow-md shadow-blue-500/20'
                    : 'bg-white/75 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-350 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600'
                }`}
              >
                <Settings size={18} />
              </button>
              {isSettingsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 shadow-xl z-50 animate-slide-up flex flex-col gap-4">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <Settings size={16} className="text-blue-500" />
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">개인 맞춤 설정</span>
                  </div>

                  {/* 나의 체질 설정 */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1">
                      <User size={12} />
                      나의 체질
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => updateColdSensitivity('cold')}
                        className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all duration-200 cursor-pointer ${
                          settings.coldSensitivity === 'cold'
                            ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 font-bold'
                            : 'border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <span className="text-lg">🥶</span>
                        <span className="text-[10px] whitespace-nowrap mt-0.5">추위 많이 탐</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateColdSensitivity('normal')}
                        className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all duration-200 cursor-pointer ${
                          settings.coldSensitivity === 'normal'
                            ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                            : 'border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <span className="text-lg">🙂</span>
                        <span className="text-[10px] whitespace-nowrap mt-0.5">보통 체질</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateColdSensitivity('hot')}
                        className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all duration-200 cursor-pointer ${
                          settings.coldSensitivity === 'hot'
                            ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                            : 'border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <span className="text-lg">🥵</span>
                        <span className="text-[10px] whitespace-nowrap mt-0.5">더위 많이 탐</span>
                      </button>
                    </div>
                  </div>

                  {/* 오늘의 활동량 설정 */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1">
                      <Activity size={12} />
                      오늘의 활동량
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => updateActivityLevel('indoor')}
                        className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all duration-200 cursor-pointer ${
                          settings.activityLevel === 'indoor'
                            ? 'bg-violet-500/10 border-violet-500 text-violet-600 dark:text-violet-400 font-bold'
                            : 'border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <span className="text-lg">🏠</span>
                        <span className="text-[10px] whitespace-nowrap mt-0.5">실내 위주</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateActivityLevel('normal')}
                        className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all duration-200 cursor-pointer ${
                          settings.activityLevel === 'normal'
                            ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                            : 'border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <span className="text-lg">🚶</span>
                        <span className="text-[10px] whitespace-nowrap mt-0.5">보통 활동</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateActivityLevel('outdoor')}
                        className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all duration-200 cursor-pointer ${
                          settings.activityLevel === 'outdoor'
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                            : 'border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <span className="text-lg">🚴</span>
                        <span className="text-[10px] whitespace-nowrap mt-0.5">야외 많음</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Menu Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => {
                  setIsMenuOpen(!isMenuOpen);
                  setIsSettingsOpen(false);
                }}
                title="메뉴"
                className={`p-2.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isMenuOpen
                    ? 'bg-blue-500 text-white border-blue-500 dark:bg-blue-600 shadow-md shadow-blue-500/20'
                    : 'bg-white/75 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-350 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600'
                }`}
              >
                <Menu size={18} />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-2 shadow-xl z-50 animate-slide-up flex flex-col gap-1">
                  <button
                    onClick={() => {
                      setCurrentView('main');
                      setIsMenuOpen(false);
                      setTimeout(() => {
                        document.getElementById('outfit-recommendation')?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span className="text-base">👕</span> 오늘의 추천
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('forecast3days');
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span className="text-base">📅</span> 3일간 날씨
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('mycloset');
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span className="text-base">👔</span> 내 옷장 추천
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Demo/Mock Mode Warning Banner */}
        {weatherData?.isMock && (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 text-amber-800 dark:text-amber-300 backdrop-blur-md">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-bold">안내: 데모 모드로 실행 중입니다.</span> KMA API 키가 없거나 비활성화되어 가상의 서울 날씨 데이터를 보여주고 있습니다. 기상청 실시간 데이터를 조회하려면 프로젝트 루트의 <code className="bg-amber-500/20 dark:bg-amber-950/40 px-1.5 py-0.5 rounded font-mono text-xs">.env</code> 파일에 <code className="bg-amber-500/20 dark:bg-amber-950/40 px-1.5 py-0.5 rounded font-mono text-xs">VITE_KMA_API_KEY</code>를 발급받아 입력해 주세요.
            </div>
          </div>
        )}

        {/* Location selector favorites */}
        <FavoriteLocations
          favorites={favorites}
          activeLocation={activeLocation}
          setActiveLocation={setActiveLocation}
          addFavorite={addFavorite}
          deleteFavorite={deleteFavorite}
          requestCurrentLocation={requestCurrentLocation}
        />

        {/* Main Grid */}
        {isLoading ? (
          <WeatherSkeleton />
        ) : isError ? (
          <div className="glass-card rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
            <AlertCircle size={48} className="text-rose-500 mb-4" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              날씨 정보를 불러올 수 없습니다.
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
              {error || '기상청 API 서버와의 통신에 문제가 발생했거나 네트워크 상태가 원활하지 않습니다.'}
            </p>
            <button
              onClick={() => refetch()}
              className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl shadow-md transition-all"
            >
              다시 시도
            </button>
          </div>
        ) : weatherData ? (
          currentView === 'forecast3days' ? (
            <ThreeDayForecastPage
              daily={weatherData.daily}
              locationName={weatherData.locationName}
              settings={settings}
              onBack={() => setCurrentView('main')}
            />
          ) : currentView === 'mycloset' ? (
            <MyClosetPage
              weather={weatherData.current}
              settings={settings}
              locationName={weatherData.locationName}
              onBack={() => setCurrentView('main')}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              
              {/* Left Column: Current Weather, Hourly Weather */}
              <div className="flex flex-col gap-6">
                {/* Current Weather */}
                <div className="flex flex-col animate-slide-up" style={{ animationDelay: '0ms' }}>
                  <WeatherCard weather={weatherData.current} locationName={weatherData.locationName} />
                </div>
                
                {/* Hourly Forecast */}
                <div className="flex flex-col animate-slide-up" style={{ animationDelay: '100ms' }}>
                  <HourlyForecast hourly={weatherData.hourly} />
                </div>
              </div>

              {/* Right Column: Outfit Recommendation */}
              <div className="flex flex-col gap-6">
                {/* Outfit Recommendation */}
                <div className="flex flex-col animate-slide-up" style={{ animationDelay: '150ms' }}>
                  <OutfitRecommendation
                    weather={weatherData.current}
                    hourly={weatherData.hourly}
                    settings={settings}
                  />
                </div>
              </div>

            </div>
          )
        ) : null}

      </div>
      
      {/* PWA Install Banner Prompt */}
      <PwaInstallBanner />
    </div>
  );
};
export default MainPage;
