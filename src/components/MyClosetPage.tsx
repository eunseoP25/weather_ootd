import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Edit2, Check, X, Sparkles, Folder, Tag, HelpCircle, Thermometer, Copy, ExternalLink } from 'lucide-react';
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
  '린넨 셔츠': '👔',
  '데님 반바지': '🩳',
  '가죽 샌들': '👡',
  '린넨 와이드 팬츠': '👖',
  '방한 부츠': '👢',
  '터틀넥 니트': '🧶',
  '오버핏 셔츠': '👔',
  '와이드 슬랙스': '👖',
  '가죽 로퍼': '👞',
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

interface RecommendCandidate {
  name: string;
  category: MyClothing['category'];
  keywords: string[];
  reason: string;
}

const RECOMMEND_CANDIDATES: Record<'summer' | 'winter' | 'spring_autumn', RecommendCandidate[]> = {
  summer: [
    {
      name: '린넨 셔츠',
      category: 'top',
      keywords: ['린넨', '셔츠', '남방'],
      reason: '더운 여름 날씨에 시원하고 쾌적하게 입기 좋으며 격식 있는 자리에도 제격입니다.'
    },
    {
      name: '데님 반바지',
      category: 'bottom',
      keywords: ['반바지', '쇼츠', '데님 쇼츠', '청반바지'],
      reason: '흰 반팔티나 셔츠 등 어떤 상의와 매치해도 잘 어울리는 기본 여름 하의입니다.'
    },
    {
      name: '얇은 가디건',
      category: 'outer',
      keywords: ['가디건', '아우터', '가벼운 가디건', '볼레로'],
      reason: '실내의 강한 에어컨 바람이나 아침저녁 선선한 바람을 막기에 좋습니다.'
    },
    {
      name: '가죽 샌들',
      category: 'shoes',
      keywords: ['샌들', '슬리퍼', '조리'],
      reason: '캐주얼하면서도 포멀한 룩에 모두 잘 어울려 여름 코디에 필수적입니다.'
    },
    {
      name: '린넨 와이드 팬츠',
      category: 'bottom',
      keywords: ['린넨 바지', '린넨 팬츠', '와이드 팬츠', '린넨'],
      reason: '달라붙지 않아 통기성이 좋고 쾌적한 착용감을 유지해 줍니다.'
    }
  ],
  winter: [
    {
      name: '울 코트',
      category: 'outer',
      keywords: ['코트', '울코트', '롱코트'],
      reason: '패딩보다 포멀하고 격식 있는 자리에 입기 좋은 겨울철 필수 아우터입니다.'
    },
    {
      name: '목도리',
      category: 'etc',
      keywords: ['목도리', '머플러'],
      reason: '목을 따뜻하게 보호해 주는 것만으로도 체온을 3도 이상 높일 수 있습니다.'
    },
    {
      name: '기모 슬랙스',
      category: 'bottom',
      keywords: ['기모', '슬랙스'],
      reason: '다리를 따뜻하게 유지하면서도 깔끔한 핏을 연출할 수 있는 하의입니다.'
    },
    {
      name: '방한 부츠',
      category: 'shoes',
      keywords: ['부츠', '어그', '방한화', '패딩 슈즈'],
      reason: '눈길 미끄럼을 방지하고 발끝까지 전해지는 한기를 효과적으로 차단합니다.'
    },
    {
      name: '터틀넥 니트',
      category: 'top',
      keywords: ['니트', '목폴라', '터틀넥'],
      reason: '단독으로 입거나 아우터 안에 이너로 활용하기 좋아 겨울철 활용도가 높습니다.'
    }
  ],
  spring_autumn: [
    {
      name: '트렌치코트',
      category: 'outer',
      keywords: ['트렌치', '코트'],
      reason: '봄과 가을의 클래식한 분위기를 연출하기에 가장 좋은 대표적인 아우터입니다.'
    },
    {
      name: '오버핏 셔츠',
      category: 'top',
      keywords: ['셔츠', '남방', '옥스포드'],
      reason: '단독으로 입거나 가벼운 티셔츠 위에 아우터처럼 걸치기 좋아 활용도가 높습니다.'
    },
    {
      name: '와이드 슬랙스',
      category: 'bottom',
      keywords: ['슬랙스', '슬랙'],
      reason: '셔츠나 맨투맨 등 어떤 상의와 매치해도 정돈된 느낌을 주는 기본 아이템입니다.'
    },
    {
      name: '가죽 로퍼',
      category: 'shoes',
      keywords: ['로퍼', '구두', '더비'],
      reason: '스니커즈보다 단정하고 세련된 느낌을 주어 포멀/캐주얼 코디에 유용합니다.'
    },
    {
      name: '바람막이',
      category: 'outer',
      keywords: ['바람막이', '윈드브레이커', '바람'],
      reason: '기온 차가 큰 환절기에 가볍게 걸쳐 비바람을 막고 체온을 유지하기 좋습니다.'
    }
  ]
};

const formatRecommendationText = (items: RecommendCandidate[]) => {
  return items.map(item => {
    const name = item.name;
    const reason = item.reason;
    return `[${name}]
- 추천 이유: ${reason}
- 에이블리 링크: https://m.a-bly.com/search?keyword=${name}
- 지그재그 링크: https://zigzag.kr/search?keyword=${name}`;
  }).join('\n\n');
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
    // Starts completely empty as requested by user
    return [];
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

  // Clipboard state
  const [copied, setCopied] = useState(false);
  const handleCopyRecommendations = (items: RecommendCandidate[]) => {
    const text = formatRecommendationText(items);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

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

    // 2. Map temp to season (adjusted for shortened Korean spring/autumn)
    let targetSeason: 'summer' | 'spring_autumn' | 'winter' = 'spring_autumn';
    if (apparentTemp >= 18) {
      targetSeason = 'summer';
    } else if (apparentTemp < 15) {
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

  // --- Closet missing items recommendation generator ---
  const getStylistRecommendations = () => {
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

    // 2. Map temp to season (adjusted for shortened Korean spring/autumn)
    let targetSeason: 'summer' | 'spring_autumn' | 'winter' = 'spring_autumn';
    if (apparentTemp >= 18) {
      targetSeason = 'summer';
    } else if (apparentTemp < 15) {
      targetSeason = 'winter';
    }

    const candidates = RECOMMEND_CANDIDATES[targetSeason];

    // Filter logic: Exclude candidates where user owns a similar item in that category (contains candidate's keywords)
    const filtered = candidates.filter(candidate => {
      return !clothes.some(userItem => {
        if (userItem.category !== candidate.category) return false;
        const lowerName = userItem.name.toLowerCase();
        return candidate.keywords.some(kw => lowerName.includes(kw.toLowerCase()));
      });
    });

    // Ensure 3-5 items are recommended. If fewer than 3, top up with other items from candidates list
    let finalRecommendations = [...filtered];
    if (finalRecommendations.length < 3) {
      const remainingCandidates = candidates.filter(c => !finalRecommendations.some(fr => fr.name === c.name));
      for (const rc of remainingCandidates) {
        if (finalRecommendations.length >= 3) break;
        finalRecommendations.push(rc);
      }
    }

    return finalRecommendations.slice(0, 5);
  };

  const { combo, reason } = getClosetRecommendation();
  const comboString = combo.length > 0 
    ? combo.map(c => c.name).join(' + ')
    : '추천 아이템 없음';

  const stylistItems = getStylistRecommendations();

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

          {/* Card 2: AI 스타일리스트의 부족한 아이템 추천 */}
          <div className="glass-card rounded-3xl p-6 relative overflow-hidden border border-white/20 shadow-lg flex flex-col gap-4 mt-6">
            <div className="absolute top-[-30px] right-[-30px] w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider uppercase text-indigo-650 dark:text-indigo-400 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 rounded-full border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-1.5 shadow-sm">
                <Sparkles size={12} className="animate-pulse" />
                AI 스타일리스트 추천
              </span>

              <button
                onClick={() => handleCopyRecommendations(stylistItems)}
                className="text-[10px] font-bold px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-750 text-slate-650 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/50 rounded-lg transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                title="추천 텍스트 복사"
              >
                <Copy size={11} />
                {copied ? '복사됨!' : '전체 복사'}
              </button>
            </div>

            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              현재 옷장을 분석하여 추가로 소장하면 좋을 부족한 아이템 {stylistItems.length}개를 추천해 드립니다.
            </p>

            <div className="h-px bg-slate-100 dark:bg-slate-800/60 my-1" />

            {/* Recommendations List */}
            <div className="flex flex-col gap-3">
              {stylistItems.map((item, idx) => (
                <div key={idx} className="p-3 bg-white/60 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-800/50 rounded-2xl flex flex-col gap-2 shadow-xs hover:border-indigo-100 dark:hover:border-indigo-950 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-slate-100/30">
                        {clothingEmojis[item.name] || '👕'}
                      </span>
                      <span className="font-extrabold text-sm text-slate-850 dark:text-slate-200">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100/80 text-slate-600 dark:bg-slate-900 dark:text-slate-400 border border-slate-200/10">
                      {CATEGORIES.find(c => c.id === item.category)?.name || '기타'}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-350 leading-relaxed">
                    {item.reason}
                  </p>

                  <div className="flex items-center gap-2 mt-1.5">
                    <a
                      href={`https://m.a-bly.com/search?keyword=${encodeURIComponent(item.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-extrabold text-pink-650 hover:text-pink-750 dark:text-pink-400 dark:hover:text-pink-300 flex items-center gap-0.5 transition-colors cursor-pointer"
                    >
                      에이블리 <ExternalLink size={10} />
                    </a>
                    <span className="text-slate-300 dark:text-slate-700 text-xs">|</span>
                    <a
                      href={`https://zigzag.kr/search?keyword=${encodeURIComponent(item.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-extrabold text-purple-650 hover:text-purple-750 dark:text-purple-400 dark:hover:text-purple-300 flex items-center gap-0.5 transition-colors cursor-pointer"
                    >
                      지그재그 <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Hidden raw format output text field */}
            <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-950/20 rounded-2xl border border-slate-150/40 dark:border-slate-800/40">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
                출력 포맷 (원문)
              </span>
              <pre className="text-[10px] font-mono text-slate-600 dark:text-slate-400 whitespace-pre-wrap select-all leading-normal max-h-40 overflow-y-auto pr-1">
                {formatRecommendationText(stylistItems)}
              </pre>
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
