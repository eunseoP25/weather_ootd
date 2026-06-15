import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Edit2, Check, X, Sparkles, Folder, Tag, HelpCircle, Thermometer } from 'lucide-react';
import { CurrentWeather, UserSettings, MyClothing } from '../types/weather';

interface MyClosetPageProps {
  weather: CurrentWeather;
  settings: UserSettings;
  locationName: string;
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
  '청자켓': '🧥',
  '검정 후드티': '👕',
  '흰 반팔': '👕',
};

const CATEGORIES = [
  { id: 'outer', name: '아우터', emoji: '🧥' },
  { id: 'top', name: '상의', emoji: '👕' },
  { id: 'bottom', name: '하의', emoji: '👖' },
  { id: 'shoes', name: '신발', emoji: '👟' },
  { id: 'etc', name: '기타', emoji: '🧣' },
] as const;

const SEASONS = [
  { id: 'all', name: '사계절', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  { id: 'spring_autumn', name: '봄/가을', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' },
  { id: 'summer', name: '여름', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' },
  { id: 'winter', name: '겨울', color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' },
] as const;

const autoGuessSeason = (name: string): MyClothing['season'] => {
  const winterKeywords = ['패딩', '코트', '목도리', '기모', '히트텍', '장갑', '패딩점퍼', '털옷', '귀도리', '방한'];
  const summerKeywords = ['반팔', '반바지', '민소매', '린넨', '샌들', '슬리퍼', '나시', '숏팬츠'];
  const springAutumnKeywords = ['가디건', '자켓', '재킷', '야상', '트렌치', '바람막이', '맨투맨', '후드티', '후드집업', '니트', '긴팔', '셔츠', '슬랙스', '청자켓'];
  
  const lower = name.toLowerCase();
  if (winterKeywords.some(k => lower.includes(k))) return 'winter';
  if (summerKeywords.some(k => lower.includes(k))) return 'summer';
  if (springAutumnKeywords.some(k => lower.includes(k))) return 'spring_autumn';
  return 'all';
};

export const MyClosetPage: React.FC<MyClosetPageProps> = ({
  weather,
  settings,
  locationName,
  onBack,
}) => {
  // Load clothes from localStorage
  const [clothes, setClothes] = useState<MyClothing[]>(() => {
    try {
      const stored = localStorage.getItem('ootd_my_closet');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    // Default initial mock items if empty to help demo
    return [
      { id: '1', name: '청자켓', category: 'outer', season: 'spring_autumn' },
      { id: '2', name: '가디건', category: 'outer', season: 'spring_autumn' },
      { id: '3', name: '흰 반팔', category: 'top', season: 'summer' },
      { id: '4', name: '검정 후드티', category: 'top', season: 'spring_autumn' },
      { id: '5', name: '청바지', category: 'bottom', season: 'all' },
      { id: '6', name: '슬랙스', category: 'bottom', season: 'all' },
    ];
  });

  // Save to localStorage when updated
  useEffect(() => {
    localStorage.setItem('ootd_my_closet', JSON.stringify(clothes));
  }, [clothes]);

  // Form states
  const [clothingName, setClothingName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MyClothing['category']>('outer');
  const [selectedSeason, setSelectedSeason] = useState<MyClothing['season']>('all');

  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingSeason, setEditingSeason] = useState<MyClothing['season']>('all');

  // Active Category filter tab (manager section)
  const [activeTab, setActiveTab] = useState<'all' | MyClothing['category']>('all');

  // Auto guess season on input change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setClothingName(val);
    if (val.trim()) {
      setSelectedSeason(autoGuessSeason(val));
    }
  };

  // Create/Add item
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clothingName.trim()) return;

    const newItem: MyClothing = {
      id: `cloth_${Date.now()}`,
      name: clothingName.trim(),
      category: selectedCategory,
      season: selectedSeason,
    };

    setClothes((prev) => [...prev, newItem]);
    setClothingName('');
    // Switch active filter tab to the category just added to see it
    setActiveTab(selectedCategory);
  };

  // Start inline editing
  const startEdit = (item: MyClothing) => {
    setEditingId(item.id);
    setEditingName(item.name);
    setEditingSeason(item.season);
  };

  // Save inline editing
  const saveEdit = (id: string) => {
    if (!editingName.trim()) return;
    setClothes((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, name: editingName.trim(), season: editingSeason }
          : item
      )
    );
    setEditingId(null);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    setClothes((prev) => prev.filter((item) => item.id !== id));
  };

  // --- Closet OOTD recommendation generator ---
  const getClosetRecommendation = () => {
    // 1. Calculate recommended temp
    const { coldSensitivity, activityLevel } = settings;
    const apparentTemp = weather.apparentTemp;

    let sensitivityOffset = 0;
    if (coldSensitivity === 'cold') sensitivityOffset = -3;
    if (coldSensitivity === 'hot') sensitivityOffset = 3;

    let activityOffset = 0;
    if (activityLevel === 'indoor') activityOffset = -1;
    if (activityLevel === 'outdoor') activityOffset = 2;

    const currentHour = new Date().getHours();
    const isNight = currentHour >= 19 || currentHour < 6;
    const dayNightOffset = isNight ? -1.5 : 1.5;
    const recommendedTemp = apparentTemp + sensitivityOffset + activityOffset + dayNightOffset;

    // 2. Map temp to season
    let targetSeason: 'summer' | 'spring_autumn' | 'winter' = 'spring_autumn';
    if (recommendedTemp >= 23) {
      targetSeason = 'summer';
    } else if (recommendedTemp < 12) {
      targetSeason = 'winter';
    }

    // Filter helper
    const getBestItem = (cat: MyClothing['category']) => {
      const catItems = clothes.filter((c) => c.category === cat);
      if (catItems.length === 0) return null;

      // Try matching target season or 'all'
      const matched = catItems.filter((c) => c.season === targetSeason || c.season === 'all');
      if (matched.length > 0) return matched[0];

      // Fallback: any item in that category
      return catItems[0];
    };

    const outer = getBestItem('outer');
    const top = getBestItem('top');
    const bottom = getBestItem('bottom');
    const shoes = getBestItem('shoes');
    const etc = getBestItem('etc');

    // Build combo array
    const combo: MyClothing[] = [];
    
    // Only recommend outer if it's not hot summer, OR if they only registered an outer
    if (outer && targetSeason !== 'summer') {
      combo.push(outer);
    }
    if (top) combo.push(top);
    if (bottom) combo.push(bottom);
    if (shoes) combo.push(shoes);
    if (etc) combo.push(etc);

    // Make clean text reason
    let reason = '';
    const tempText = weather.apparentTemp.toFixed(1);
    const placeStr = locationName.replace(' (Mock)', '');

    if (clothes.length === 0) {
      reason = '옷장에 옷이 등록되어 있지 않습니다. 아래 [내 옷장 관리]에서 소장 중인 옷을 등록해 보세요!';
    } else if (combo.length === 0) {
      reason = '매칭할 수 있는 옷이 없습니다. 카테고리별로 옷을 골고루 등록해 보세요.';
    } else {
      const topName = top ? top.name : '상의';
      const bottomName = bottom ? bottom.name : '하의';
      const outerName = outer ? outer.name : '아우터';

      if (targetSeason === 'summer') {
        reason = `오늘 ${placeStr}의 체감 온도는 ${tempText}°C로 덥습니다. 소장하신 시원한 '${topName}'(와)과 '${bottomName}'(으)로 가볍고 통풍이 잘되는 코디를 추천합니다.`;
      } else if (targetSeason === 'winter') {
        reason = `오늘 ${placeStr}의 체감 온도는 ${tempText}°C로 많이 춥습니다. 옷장에서 든든한 '${outerName}'(와)과 따뜻한 이너웨어, 하의를 골라 체온을 보존하세요.`;
      } else {
        reason = `오늘 ${placeStr}의 체감 온도는 ${tempText}°C로 선선한 봄/가을 날씨입니다. 일교차에 대비해 덧입기 좋은 '${outerName}'(와)과 편안한 '${topName}' + '${bottomName}' 코디가 제격입니다.`;
      }

      // Add rain reminder
      if (weather.pop >= 60 || weather.pty > 0) {
        reason += ' 강수 예보가 있으니 비나 눈에 강한 신발을 신고 우산을 챙기시기 바랍니다.';
      }
    }

    return { combo, reason };
  };

  const { combo, reason } = getClosetRecommendation();
  const comboString = combo.length > 0 
    ? combo.map(c => c.name).join(' + ')
    : '추천 아이템 없음';

  // Filter manager list by active tab
  const filteredClothes = activeTab === 'all'
    ? clothes
    : clothes.filter((c) => c.category === activeTab);

  return (
    <div className="w-full flex flex-col gap-6 animate-slide-up">
      {/* Title Header */}
      <div className="flex justify-between items-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/30 dark:border-slate-800/30 rounded-3xl p-5 shadow-lg relative z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-200 transition-all border border-slate-200/50 dark:border-slate-700/50 cursor-pointer flex items-center justify-center shrink-0"
            title="메인 화면으로 이동"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                👕
              </span>
              <h2 className="text-xl font-bold text-slate-850 dark:text-slate-100">내 옷장 추천</h2>
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              소유한 옷 목록을 기반으로 하는 똑똑한 코디
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Closet Recommendation (Top) & Closet CRUD Management (Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left column (span 1): Realtime closet recommendation */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass-card rounded-3xl p-6 relative overflow-hidden border border-white/20 shadow-lg flex flex-col gap-4">
            <div className="absolute top-[-30px] right-[-30px] w-32 h-32 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider uppercase text-blue-600 dark:text-blue-400 px-3 py-1 bg-blue-50 dark:bg-blue-950/60 rounded-full border border-blue-100 dark:border-blue-900/50 flex items-center gap-1 shadow-sm">
                <Sparkles size={12} />
                오늘 추천
              </span>
              
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-500 dark:text-slate-400 bg-slate-150/40 dark:bg-slate-800/40 px-2.5 py-1 rounded-xl">
                <Thermometer size={12} className="text-blue-500" />
                체감 {weather.apparentTemp.toFixed(1)}°
              </div>
            </div>

            {/* Recommended Combination */}
            {combo.length > 0 ? (
              <div className="flex flex-col gap-3.5 my-2">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-slate-800/50 dark:to-slate-800/20 rounded-2xl border border-blue-100/40 dark:border-slate-700/30 shadow-inner">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                    추천 조합
                  </p>
                  <p className="text-base font-black text-blue-600 dark:text-blue-400 leading-snug">
                    {comboString}
                  </p>
                </div>

                {/* Emojis matching combination */}
                <div className="flex gap-2">
                  {combo.map((c) => (
                    <div
                      key={c.id}
                      className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center text-xl"
                      title={`${c.name} (${CATEGORIES.find(cat => cat.id === c.category)?.name})`}
                    >
                      {clothingEmojis[c.name] || CATEGORIES.find(cat => cat.id === c.category)?.emoji || '👚'}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl my-2">
                <p className="text-sm font-bold text-slate-400 dark:text-slate-600">
                  매칭된 추천 코디가 없습니다
                </p>
              </div>
            )}

            <div className="h-px bg-slate-100 dark:bg-slate-800/60 my-1" />

            {/* Recommendation reason */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <HelpCircle size={13} className="text-slate-450" />
                추천 이유
              </h4>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-350 leading-relaxed bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-100/50 dark:border-slate-800/40">
                {reason}
              </p>
            </div>
          </div>
        </div>

        {/* Right columns (span 2): Closet manager list and CRUD */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-card rounded-3xl p-6 border border-white/20 shadow-lg flex flex-col gap-5">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800/60 pb-3">
              <Folder size={18} className="text-blue-500" />
              내 옷장 관리
            </h3>

            {/* Form to add clothing */}
            <form onSubmit={handleAddItem} className="bg-slate-50/40 dark:bg-slate-900/30 border border-slate-150/40 dark:border-slate-800/40 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                
                {/* Name Input */}
                <div className="flex-1 flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-xs focus-within:border-blue-400 dark:focus-within:border-blue-500">
                  <input
                    type="text"
                    value={clothingName}
                    onChange={handleNameChange}
                    placeholder="옷 이름 입력 (예: 청자켓, 슬랙스)"
                    className="flex-1 bg-transparent text-sm text-slate-850 dark:text-slate-100 focus:outline-none placeholder-slate-400"
                    maxLength={20}
                  />
                </div>

                {/* Category select */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as MyClothing['category'])}
                  className="px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-xl font-bold text-slate-700 dark:text-slate-350 focus:outline-none shadow-xs cursor-pointer hover:border-blue-300 dark:hover:border-blue-800"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Season select */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Tag size={12} /> 권장 계절:
                </span>
                
                <div className="flex flex-wrap gap-1.5">
                  {SEASONS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedSeason(s.id)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-all border cursor-pointer ${
                        selectedSeason === s.id
                          ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-750'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
                
                {/* Submit button */}
                <button
                  type="submit"
                  disabled={!clothingName.trim()}
                  className="ml-auto flex items-center gap-1 text-xs font-bold px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Plus size={14} /> 등록
                </button>
              </div>
            </form>

            {/* List filter Tabs */}
            <div className="flex flex-wrap gap-1 border-b border-slate-100 dark:border-slate-800 pb-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`text-xs font-extrabold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                    : 'text-slate-550 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                전체 ({clothes.length})
              </button>
              {CATEGORIES.map((c) => {
                const count = clothes.filter((item) => item.category === c.id).length;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveTab(c.id)}
                    className={`text-xs font-extrabold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeTab === c.id
                        ? 'bg-slate-850 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                        : 'text-slate-550 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <span>{c.emoji}</span>
                    <span>{c.name}</span>
                    <span className="text-[10px] opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Closet Clothes List grid */}
            <div className="max-h-96 overflow-y-auto pr-1 flex flex-col gap-2">
              {filteredClothes.length > 0 ? (
                filteredClothes.map((item) => {
                  const isEditing = editingId === item.id;
                  const itemSeasonObj = SEASONS.find((s) => s.id === item.season) || SEASONS[0];

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-850 border border-slate-150/40 dark:border-slate-800/50 rounded-2xl transition-all shadow-xs"
                    >
                      {isEditing ? (
                        /* Editing Form */
                        <div className="flex-1 flex flex-col sm:flex-row gap-2.5 items-start sm:items-center">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="px-2 py-1 text-sm bg-white dark:bg-slate-800 border border-blue-400 dark:border-blue-500 rounded-lg text-slate-850 dark:text-slate-100 focus:outline-none w-full sm:w-auto"
                            maxLength={20}
                            autoFocus
                          />
                          
                          <div className="flex items-center gap-1">
                            {SEASONS.map((s) => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => setEditingSeason(s.id)}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-all ${
                                  editingSeason === s.id
                                    ? 'bg-blue-500 text-white border-blue-500'
                                    : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-50'
                                }`}
                              >
                                {s.name}
                              </button>
                            ))}
                          </div>
                          
                          <div className="flex items-center gap-1 ml-auto">
                            <button
                              onClick={() => saveEdit(item.id)}
                              className="p-1 text-emerald-600 dark:text-emerald-450 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg cursor-pointer"
                              title="저장"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1 text-rose-500 dark:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg cursor-pointer"
                              title="취소"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* View Mode */
                        <>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-lg">
                              {clothingEmojis[item.name] || CATEGORIES.find(cat => cat.id === item.category)?.emoji || '👕'}
                            </div>
                            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                              {item.name}
                            </span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${itemSeasonObj.color} border border-slate-200/10`}>
                              {itemSeasonObj.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => startEdit(item)}
                              className="p-1.5 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 rounded-lg transition-colors hover:bg-slate-150/40 dark:hover:bg-slate-800 cursor-pointer"
                              title="수정"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
                              title="삭제"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <p className="text-sm font-semibold text-slate-400 dark:text-slate-600">
                    이 카테고리에 등록된 옷이 없습니다
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
