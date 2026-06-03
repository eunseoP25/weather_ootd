import { UserSettings, CurrentWeather, ClothingRecommendation } from '../types/weather';

/**
 * Calculates apparent temperature using Steadman's Formula.
 * AT = T + 0.33 * e - 0.70 * ws - 4.00
 * where e = (RH / 100) * 6.105 * exp((17.27 * T) / (237.7 + T))
 */
export function calculateApparentTemp(temp: number, windSpeed: number, humidity: number): number {
  const t = temp;
  const ws = windSpeed;
  const rh = humidity;

  // Water vapor pressure (hPa)
  const e = (rh / 100) * 6.105 * Math.exp((17.27 * t) / (237.7 + t));
  
  // Apparent temperature
  const at = t + 0.33 * e - 0.70 * ws - 4.00;
  
  return Math.round(at * 10) / 10;
}

/**
 * Get clothing list by recommendation temperature
 */
export function getClothingListByTemp(temp: number): string[] {
  if (temp >= 30) {
    return ['민소매', '반팔 티셔츠', '반바지', '린넨 스커트'];
  } else if (temp >= 25) {
    return ['반팔 티셔츠', '얇은 셔츠', '면바지', '반바지'];
  } else if (temp >= 20) {
    return ['긴팔 티셔츠', '셔츠', '얇은 가디건', '후드집업', '슬랙스', '청바지'];
  } else if (temp >= 17) {
    return ['니트', '맨투맨', '가디건', '후드집업', '청바지', '면바지'];
  } else if (temp >= 12) {
    return ['자켓', '가디건', '야상', '스타킹', '청바지', '재킷'];
  } else if (temp >= 9) {
    return ['트렌치코트', '간절기 자켓', '니트', '청바지', '스타킹'];
  } else if (temp >= 5) {
    return ['코트', '히트텍', '가죽 자켓', '니트', '기모 바지'];
  } else if (temp >= 0) {
    return ['두꺼운 코트', '울 코트', '목도리', '기모 슬랙스', '히트텍'];
  } else {
    return ['패딩 점퍼', '장갑', '목도리', '귀도리', '두꺼운 양말', '기모 안감 의류'];
  }
}

/**
 * Main clothing recommendation engine
 */
export function getClothingRecommendation(
  weather: CurrentWeather,
  settings: UserSettings
): ClothingRecommendation {
  const { coldSensitivity, activityLevel } = settings;
  const apparentTemp = weather.apparentTemp;

  // 1. Calculate offsets
  // Cold sensitivity offset: Cold = -3, Normal = 0, Hot = +3
  let sensitivityOffset = 0;
  if (coldSensitivity === 'cold') sensitivityOffset = -3;
  if (coldSensitivity === 'hot') sensitivityOffset = 3;

  // Activity level offset: Indoor = -1, Normal = 0, Outdoor = +2
  let activityOffset = 0;
  if (activityLevel === 'indoor') activityOffset = -1;
  if (activityLevel === 'outdoor') activityOffset = 2;

  // 2. Recommendation Temperature
  // 추천온도 = 체감온도 + 체질보정값 + 활동량보정값
  const recommendedTemp = Math.round((apparentTemp + sensitivityOffset + activityOffset) * 10) / 10;

  // 3. Get basic clothing recommendation
  const clothingList = [...getClothingListByTemp(recommendedTemp)];

  // 4. Generate tips and warnings based on additional weather conditions
  const tips: string[] = [];
  const warnings: string[] = [];

  // Wind speed condition
  if (weather.windSpeed >= 8) {
    clothingList.push('바람막이');
    warnings.push('💨 강한 바람 주의: 외부 활동 시 바람막이를 착용하는 것을 추천합니다.');
    tips.push('바람이 강해 체감 온도가 더 낮아질 수 있습니다.');
  } else if (weather.windSpeed >= 4) {
    tips.push('바람이 선선하게 불어 바람막이나 가벼운 아우터가 유용할 수 있습니다.');
  }

  // Precipitation probability condition (POP)
  if (weather.pop >= 60) {
    tips.push('☔ 강수 확률이 높으니 외출 시 우산을 꼭 챙기세요.');
  }

  // Rain or snow condition (PTY)
  // PTY: 0 (없음), 1 (비), 2 (비/눈), 3 (눈), 4 (소나기)
  if (weather.pty > 0) {
    if (weather.pty === 1 || weather.pty === 2 || weather.pty === 4) {
      clothingList.push('레인부츠');
      tips.push('👢 비가 오고 있어 레인부츠 착용을 추천합니다.');
    } else if (weather.pty === 3) {
      clothingList.push('방수 부츠');
      tips.push('❄️ 눈이 내리고 있으니 미끄러지지 않는 신발을 신으세요.');
    }
  }

  // Humidity condition
  if (weather.humidity >= 80) {
    tips.push('💦 습도가 높아 땀 배출이 어려울 수 있으니 통풍이 잘되는 시원한 소재의 옷을 선택하세요.');
  }

  // Large temperature difference condition (Max/Min)
  const tempDiff = weather.tempMax - weather.tempMin;
  if (tempDiff >= 10) {
    tips.push(`🌡️ 오늘 기온차(${tempDiff.toFixed(1)}°C)가 큽니다. 아침/저녁 추위에 대비해 탈착이 쉬운 겉옷을 챙기세요.`);
  }

  // Sun exposure condition (UV)
  // If sunny (sky = 1) and temperature is warm/hot
  if (weather.sky === 1 && weather.temp >= 22) {
    tips.push('☀️ 햇빛이 쨍쨍합니다. 자외선 차단제와 모자 또는 선글라스를 챙기시는 것을 권장합니다.');
  }

  // Fallbacks if lists are empty
  if (tips.length === 0) {
    tips.push('쾌적한 날씨입니다! 즐거운 외출 되세요.');
  }

  return {
    recommendedTemp,
    clothingList: Array.from(new Set(clothingList)), // Remove duplicates
    tips,
    warnings
  };
}
