import React, { useState, useRef, useEffect } from 'react';
import { Search, Trash2, Pencil, CheckCheck, MapPin, Plus, X } from 'lucide-react';
import { FavoriteLocation } from '../types/weather';

// ── Searchable city preset data (50+ Korean cities) ──────────────────────────
interface CityPreset {
  name: string;
  lat: number;
  lng: number;
}

const SEARCHABLE_CITIES: CityPreset[] = [
  { name: '서울', lat: 37.5665, lng: 126.9780 },
  { name: '부산', lat: 35.1796, lng: 129.0756 },
  { name: '대구', lat: 35.8714, lng: 128.6014 },
  { name: '인천', lat: 37.4563, lng: 126.7052 },
  { name: '광주', lat: 35.1595, lng: 126.8526 },
  { name: '대전', lat: 36.3504, lng: 127.3845 },
  { name: '울산', lat: 35.5384, lng: 129.3114 },
  { name: '세종', lat: 36.4800, lng: 127.2890 },
  { name: '제주', lat: 33.4996, lng: 126.5312 },
  { name: '수원', lat: 37.2636, lng: 127.0286 },
  { name: '성남', lat: 37.4449, lng: 127.1388 },
  { name: '고양', lat: 37.6584, lng: 126.8320 },
  { name: '용인', lat: 37.2410, lng: 127.1775 },
  { name: '창원', lat: 35.2280, lng: 128.6811 },
  { name: '청주', lat: 36.6424, lng: 127.4890 },
  { name: '전주', lat: 35.8242, lng: 127.1480 },
  { name: '천안', lat: 36.8151, lng: 127.1139 },
  { name: '안산', lat: 37.3219, lng: 126.8309 },
  { name: '남양주', lat: 37.6360, lng: 127.2165 },
  { name: '화성', lat: 37.1996, lng: 126.8312 },
  { name: '안양', lat: 37.3943, lng: 126.9568 },
  { name: '의정부', lat: 37.7382, lng: 127.0337 },
  { name: '부천', lat: 37.5035, lng: 126.7660 },
  { name: '시흥', lat: 37.3797, lng: 126.8030 },
  { name: '파주', lat: 37.7601, lng: 126.7800 },
  { name: '평택', lat: 36.9921, lng: 127.1128 },
  { name: '김포', lat: 37.6152, lng: 126.7155 },
  { name: '광명', lat: 37.4784, lng: 126.8643 },
  { name: '하남', lat: 37.5394, lng: 127.2147 },
  { name: '구리', lat: 37.5996, lng: 127.1296 },
  { name: '군포', lat: 37.3616, lng: 126.9353 },
  { name: '오산', lat: 37.1498, lng: 127.0774 },
  { name: '포항', lat: 36.0190, lng: 129.3435 },
  { name: '경주', lat: 35.8562, lng: 129.2247 },
  { name: '김해', lat: 35.2342, lng: 128.8811 },
  { name: '양산', lat: 35.3350, lng: 129.0370 },
  { name: '진주', lat: 35.1800, lng: 128.1076 },
  { name: '거제', lat: 34.8800, lng: 128.6211 },
  { name: '통영', lat: 34.8545, lng: 128.4330 },
  { name: '순천', lat: 34.9506, lng: 127.4877 },
  { name: '여수', lat: 34.7604, lng: 127.6622 },
  { name: '목포', lat: 34.8118, lng: 126.3922 },
  { name: '익산', lat: 35.9483, lng: 126.9545 },
  { name: '군산', lat: 35.9676, lng: 126.7368 },
  { name: '원주', lat: 37.3422, lng: 127.9202 },
  { name: '춘천', lat: 37.8813, lng: 127.7298 },
  { name: '강릉', lat: 37.7519, lng: 128.8761 },
  { name: '속초', lat: 38.2070, lng: 128.5918 },
  { name: '충주', lat: 36.9910, lng: 127.9259 },
  { name: '제천', lat: 37.1324, lng: 128.1908 },
  { name: '당진', lat: 36.8895, lng: 126.6458 },
  { name: '아산', lat: 36.7898, lng: 127.0018 },
  { name: '논산', lat: 36.1870, lng: 127.0990 },
  { name: '공주', lat: 36.4465, lng: 127.1189 },
];

// ── Props interface ───────────────────────────────────────────────────────────
interface FavoriteLocationsProps {
  favorites: FavoriteLocation[];
  activeLocation: FavoriteLocation;
  setActiveLocation: (loc: FavoriteLocation) => void;
  addFavorite: (name: string, lat: number, lng: number) => FavoriteLocation;
  deleteFavorite: (id: string) => void;
  requestCurrentLocation: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export const FavoriteLocations: React.FC<FavoriteLocationsProps> = ({
  favorites,
  activeLocation,
  setActiveLocation,
  addFavorite,
  deleteFavorite,
  requestCurrentLocation,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter city results based on search query
  const searchResults = searchQuery.trim().length > 0
    ? SEARCHABLE_CITIES.filter((city) =>
        city.name.includes(searchQuery.trim()) &&
        !favorites.some((f) => f.name === city.name)
      ).slice(0, 6)
    : [];

  // Close search dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (showSearch) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [showSearch]);

  const handleCitySelect = (city: CityPreset) => {
    const newLoc = addFavorite(city.name, city.lat, city.lng);
    setActiveLocation(newLoc);
    setSearchQuery('');
    setShowSearch(false);
  };

  const isCurrentLocation = activeLocation.id === 'current_location';

  return (
    <div className="glass-card rounded-3xl p-5 relative z-30 overflow-visible transition-all duration-300 w-full mb-6">
      {/* Header row */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50">
            <MapPin size={16} className="text-blue-500" />
          </span>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
            즐겨찾는 지역
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Edit / Done toggle */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer ${
              isEditMode
                ? 'bg-blue-500 text-white border-blue-500'
                : 'text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-800/60 hover:border-blue-300 dark:hover:border-blue-700'
            }`}
          >
            {isEditMode ? <CheckCheck size={12} /> : <Pencil size={12} />}
            {isEditMode ? '완료' : '편집'}
          </button>

          {/* Add city search button */}
          <div className="relative" ref={searchRef}>
            <button
              onClick={() => {
                setShowSearch(!showSearch);
                setIsEditMode(false);
              }}
              className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                showSearch
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'text-blue-600 dark:text-blue-400 border-blue-100/60 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60'
              }`}
            >
              {showSearch ? <X size={12} /> : <Plus size={12} />}
              {showSearch ? '닫기' : '지역 추가'}
            </button>

            {/* Search dropdown panel */}
            {showSearch && (
              <div className="absolute right-0 mt-2 w-64 bg-white/98 dark:bg-slate-900/98 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-2xl z-50 overflow-hidden animate-slide-up">
                {/* Search input */}
                <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    <Search size={14} className="text-slate-400 shrink-0" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="도시명 검색 (예: 부산)"
                      className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Search results */}
                <div className="max-h-52 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map((city) => (
                      <button
                        key={city.name}
                        onClick={() => handleCitySelect(city)}
                        className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <MapPin size={13} className="text-blue-400 shrink-0" />
                        {city.name}
                      </button>
                    ))
                  ) : searchQuery.trim().length > 0 ? (
                    <div className="px-4 py-5 text-center text-sm text-slate-400 dark:text-slate-600">
                      검색 결과가 없습니다
                    </div>
                  ) : (
                    <div className="px-4 py-4">
                      <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-wider mb-2">
                        주요 도시
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {['서울', '부산', '대구', '인천', '광주', '대전', '제주', '춘천', '강릉'].map((name) => {
                          const city = SEARCHABLE_CITIES.find((c) => c.name === name);
                          if (!city || favorites.some((f) => f.name === name)) return null;
                          return (
                            <button
                              key={name}
                              onClick={() => handleCitySelect(city)}
                              className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer border border-slate-200/50 dark:border-slate-700/50"
                            >
                              {name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Favorites list */}
      <div className="flex flex-wrap gap-2">

        {/* 📍 현재 위치 — always pinned at front */}
        <div
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border text-sm font-semibold transition-all duration-200 shadow-sm ${
            isCurrentLocation
              ? 'bg-blue-500 border-blue-500 text-white shadow-blue-500/15'
              : 'bg-white/50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-800'
          }`}
        >
          <button
            onClick={requestCurrentLocation}
            className="flex items-center gap-1.5 focus:outline-none cursor-pointer"
          >
            <MapPin size={13} className={isCurrentLocation ? 'text-white' : 'text-blue-500'} />
            현재 위치
          </button>
        </div>

        {/* User favorites */}
        {favorites.map((loc) => {
          const isActive = activeLocation.id === loc.id;

          return (
            <div
              key={loc.id}
              className={`inline-flex items-center gap-1 rounded-2xl border text-sm font-semibold transition-all duration-200 shadow-sm ${
                isActive
                  ? 'bg-blue-500 border-blue-500 text-white shadow-blue-500/10'
                  : 'bg-white/50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-800'
              } ${isEditMode ? 'pl-3.5 pr-2 py-2' : 'px-3.5 py-2'}`}
            >
              <button
                onClick={() => setActiveLocation(loc)}
                className="focus:outline-none flex-1 text-left cursor-pointer"
              >
                {loc.name}
              </button>

              {/* X delete button visible in edit mode */}
              {isEditMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFavorite(loc.id);
                  }}
                  className={`p-1 rounded-lg shrink-0 transition-colors cursor-pointer ${
                    isActive
                      ? 'text-white/70 hover:text-white hover:bg-white/15'
                      : 'text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                  }`}
                  title="삭제"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
