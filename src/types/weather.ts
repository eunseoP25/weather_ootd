export interface UserSettings {
  coldSensitivity: 'cold' | 'normal' | 'hot'; // 🥶, 🙂, 🥵
  activityLevel: 'indoor' | 'normal' | 'outdoor'; // 실내, 보통, 야외
}

export type WeatherState = 'sunny' | 'cloudy' | 'overcast' | 'rainy' | 'snowy' | 'rainyAndSnowy' | 'shower';

export interface CurrentWeather {
  temp: number;          // 현재 기온 (T1H or TMP)
  apparentTemp: number;  // 체감 온도
  tempMax: number;       // 최고 기온
  tempMin: number;       // 최저 기온
  humidity: number;      // 습도 (%) (REH)
  windSpeed: number;     // 풍속 (m/s) (WSD)
  pop: number;           // 강수확률 (%) (POP)
  weatherState: WeatherState;
  pty: number;           // 강수형태 (0: 없음, 1: 비, 2: 비/눈, 3: 눈, 4: 소나기)
  sky: number;           // 하늘상태 (1: 맑음, 3: 구름많음, 4: 흐림)
}

export interface HourlyForecast {
  time: string;          // HH:MM
  temp: number;
  weatherState: WeatherState;
  pop: number;
  pty: number;
  sky: number;
  humidity?: number;
  windSpeed?: number;
}

export interface DailyForecast {
  date: string;          // YYYY-MM-DD or MM/DD (요일)
  tempMax: number;
  tempMin: number;
  weatherState: WeatherState;
  pop?: number;
  pty?: number;
}

export interface FavoriteLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  nx: number;
  ny: number;
  isCurrent?: boolean;
}

export interface ClothingRecommendation {
  recommendedTemp: number;
  clothingList: string[];
  tips: string[];
  warnings: string[];
}

export interface MyClothing {
  id: string;
  name: string;
  category: 'outer' | 'top' | 'bottom' | 'shoes' | 'etc';
  season: 'spring_autumn' | 'summer' | 'winter' | 'all';
}
