import { CurrentWeather, HourlyForecast, DailyForecast, WeatherState } from '../types/weather';
import { getUltraSrtNcstDateTime, getVilageFcstDateTime, formatYYYYMMDD } from '../utils/date';
import { calculateApparentTemp } from '../utils/recommend';

const API_KEY = import.meta.env.VITE_KMA_API_KEY || '';

// In development, we use Vite dev server proxy to avoid CORS.
// In production, we try to call the API directly.
const getBaseUrl = (): string => {
  if (import.meta.env.DEV) {
    return '/api/kma';
  }
  return 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0';
};

/**
 * Maps KMA sky (하늘상태) and pty (강수형태) values to our internal WeatherState
 */
export function mapKmaToWeatherState(sky: number, pty: number): WeatherState {
  if (pty === 1 || pty === 4) return 'rainy';
  if (pty === 2) return 'rainyAndSnowy';
  if (pty === 3) return 'snowy';
  
  if (sky === 1) return 'sunny';
  if (sky === 3) return 'cloudy';
  if (sky === 4) return 'overcast';
  
  return 'sunny';
}

interface FetchWeatherResult {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  locationName: string;
  isMock: boolean;
}

/**
 * Fetches current weather and forecasts from KMA API for the given grid coordinates (nx, ny)
 */
export async function fetchKmaWeather(
  nx: number,
  ny: number,
  locationName: string
): Promise<FetchWeatherResult> {
  // If API Key is missing, run in Mock mode immediately
  if (!API_KEY || API_KEY.includes('YOUR_API_KEY') || API_KEY === '') {
    console.warn('KMA API Key is missing or invalid. Falling back to Mock Data.');
    return generateMockWeather(nx, ny, locationName);
  }

  try {
    const { baseDate: ncstDate, baseTime: ncstTime } = getUltraSrtNcstDateTime(new Date());
    const { baseDate: fcstDate, baseTime: fcstTime } = getVilageFcstDateTime(new Date());

    const baseUrl = getBaseUrl();
    
    // 1. Fetch getUltraSrtNcst (초단기실황)
    const ncstUrl = `${baseUrl}/getUltraSrtNcst?serviceKey=${encodeURIComponent(API_KEY)}&pageNo=1&numOfRows=100&dataType=JSON&base_date=${ncstDate}&base_time=${ncstTime}&nx=${nx}&ny=${ny}`;
    
    // 2. Fetch getVilageFcst (단기예보)
    const fcstUrl = `${baseUrl}/getVilageFcst?serviceKey=${encodeURIComponent(API_KEY)}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${fcstDate}&base_time=${fcstTime}&nx=${nx}&ny=${ny}`;

    const [ncstRes, fcstRes] = await Promise.all([
      fetch(ncstUrl).then((r) => {
        if (!r.ok) throw new Error(`UltraSrtNcst response failed: ${r.status}`);
        return r.json();
      }),
      fetch(fcstUrl).then((r) => {
        if (!r.ok) throw new Error(`VilageFcst response failed: ${r.status}`);
        return r.json();
      }),
    ]);

    // Check header codes
    const ncstHeader = ncstRes?.response?.header;
    const fcstHeader = fcstRes?.response?.header;

    if (ncstHeader?.resultCode !== '00' || fcstHeader?.resultCode !== '00') {
      throw new Error(
        `KMA API Error: Ncst[${ncstHeader?.resultCode}: ${ncstHeader?.resultMsg}], Fcst[${fcstHeader?.resultCode}: ${fcstHeader?.resultMsg}]`
      );
    }

    const ncstItems = ncstRes?.response?.body?.items?.item || [];
    const fcstItems = fcstRes?.response?.body?.items?.item || [];

    if (ncstItems.length === 0 || fcstItems.length === 0) {
      throw new Error('KMA API returned empty items.');
    }

    // --- Parse Current Weather (UltraSrtNcst) ---
    // Categories: T1H(temp), RN1(hourly rain), REH(humidity), PTY(rain type), WSD(wind speed)
    let temp = 20;
    let humidity = 60;
    let windSpeed = 2;
    let pty = 0;

    ncstItems.forEach((item: any) => {
      const val = parseFloat(item.obsrValue);
      if (item.category === 'T1H') temp = val;
      if (item.category === 'REH') humidity = val;
      if (item.category === 'WSD') windSpeed = val;
      if (item.category === 'PTY') pty = parseInt(item.obsrValue) || 0;
    });

    // --- Parse Forecast (VilageFcst) ---
    // Find min/max temperature for today, hourly forecasts, and daily outlooks
    const todayStr = formatYYYYMMDD(new Date());
    let tempMin = 999;
    let tempMax = -999;
    let sky = 1; // Default sunny
    let pop = 0;

    // Filter today's max/min temps or compute from TMP values
    const todayFcsts = fcstItems.filter((item: any) => item.fcstDate === todayStr);
    
    // If TMN or TMX are present in the full response, use them. Otherwise, compute from TMP.
    fcstItems.forEach((item: any) => {
      const val = parseFloat(item.fcstValue);
      if (item.fcstDate === todayStr) {
        if (item.category === 'TMN') tempMin = val;
        if (item.category === 'TMX') tempMax = val;
      }
    });

    // Fallback if TMN/TMX not found (sometimes they are only in specific forecast cycles)
    if (tempMin === 999 || tempMax === -999) {
      const todayTmps = todayFcsts
        .filter((item: any) => item.category === 'TMP')
        .map((item: any) => parseFloat(item.fcstValue));
      
      if (todayTmps.length > 0) {
        if (tempMin === 999) tempMin = Math.min(...todayTmps);
        if (tempMax === -999) tempMax = Math.max(...todayTmps);
      } else {
        // Ultimate fallback
        tempMin = temp - 5;
        tempMax = temp + 5;
      }
    }

    // Get current sky status from forecast for the closest upcoming hour
    const currentHourStr = String(new Date().getHours()).padStart(2, '0') + '00';
    const closestSkyItem = todayFcsts.find(
      (item: any) => item.category === 'SKY' && item.fcstTime >= currentHourStr
    ) || todayFcsts.find((item: any) => item.category === 'SKY');
    
    const closestPtyItem = todayFcsts.find(
      (item: any) => item.category === 'PTY' && item.fcstTime >= currentHourStr
    ) || todayFcsts.find((item: any) => item.category === 'PTY');

    const closestPopItem = todayFcsts.find(
      (item: any) => item.category === 'POP' && item.fcstTime >= currentHourStr
    ) || todayFcsts.find((item: any) => item.category === 'POP');

    if (closestSkyItem) sky = parseInt(closestSkyItem.fcstValue) || 1;
    if (closestPopItem) pop = parseFloat(closestPopItem.fcstValue) || 0;
    if (closestPtyItem && pty === 0) {
      // Use forecast pty if current observation pty is not available or 0
      pty = parseInt(closestPtyItem.fcstValue) || 0;
    }

    // Calculate Apparent Temperature
    const apparentTemp = calculateApparentTemp(temp, windSpeed, humidity);
    const weatherState = mapKmaToWeatherState(sky, pty);

    const current: CurrentWeather = {
      temp,
      apparentTemp,
      tempMax,
      tempMin,
      humidity,
      windSpeed,
      pop,
      weatherState,
      pty,
      sky,
    };

    // --- Parse Hourly Forecast (Next 24 hours) ---
    // Group forecast items by date + time
    const hourlyMap: { [key: string]: Partial<HourlyForecast> & { date: string } } = {};
    
    fcstItems.forEach((item: any) => {
      const key = `${item.fcstDate}_${item.fcstTime}`;
      if (!hourlyMap[key]) {
        hourlyMap[key] = {
          date: item.fcstDate,
          time: formatTimeHH(item.fcstTime),
          pop: 0,
          pty: 0,
          sky: 1,
        };
      }
      
      const val = parseFloat(item.fcstValue);
      if (item.category === 'TMP') hourlyMap[key].temp = val;
      if (item.category === 'POP') hourlyMap[key].pop = val;
      if (item.category === 'PTY') hourlyMap[key].pty = parseInt(item.fcstValue) || 0;
      if (item.category === 'SKY') hourlyMap[key].sky = parseInt(item.fcstValue) || 1;
      if (item.category === 'REH') hourlyMap[key].humidity = val;
      if (item.category === 'WSD') hourlyMap[key].windSpeed = val;
    });

    // Sort hourly items chronologically and map to HourlyForecast[]
    const nowHour = new Date();
    const sortedHourlyKeys = Object.keys(hourlyMap).sort();
    
    const hourly: HourlyForecast[] = sortedHourlyKeys
      .map((key) => {
        const item = hourlyMap[key];
        const state = mapKmaToWeatherState(item.sky || 1, item.pty || 0);
        return {
          time: item.time || '',
          temp: item.temp ?? temp,
          weatherState: state,
          pop: item.pop || 0,
          pty: item.pty || 0,
          sky: item.sky || 1,
          humidity: item.humidity ?? humidity,
          windSpeed: item.windSpeed ?? windSpeed,
          date: item.date, // internal helper
        } as HourlyForecast & { date: string };
      })
      // Keep forecasts starting from current hour up to 24 items
      .filter((h) => {
        const hDate = h.date;
        const hHour = parseInt(h.time.split(':')[0]);
        const compareDate = new Date(
          parseInt(hDate.substring(0, 4)),
          parseInt(hDate.substring(4, 6)) - 1,
          parseInt(hDate.substring(6, 8)),
          hHour
        );
        return compareDate >= new Date(nowHour.getTime() - 60 * 60 * 1000); // include last hour
      })
      .slice(0, 24)
      .map(({ date, ...rest }) => rest); // remove date helper

    // --- Parse Daily Forecast (5 Days) ---
    // Group forecast items by date to compute min/max
    const dailyMap: { [key: string]: { temps: number[]; skies: number[]; pties: number[]; pops: number[] } } = {};
    
    fcstItems.forEach((item: any) => {
      const date = item.fcstDate;
      if (!dailyMap[date]) {
        dailyMap[date] = { temps: [], skies: [], pties: [], pops: [] };
      }
      const val = parseFloat(item.fcstValue);
      if (item.category === 'TMP') dailyMap[date].temps.push(val);
      if (item.category === 'SKY') dailyMap[date].skies.push(parseInt(item.fcstValue) || 1);
      if (item.category === 'PTY') dailyMap[date].pties.push(parseInt(item.fcstValue) || 0);
      if (item.category === 'POP') dailyMap[date].pops.push(val);
    });

    const sortedDailyKeys = Object.keys(dailyMap).sort();
    const daily: DailyForecast[] = sortedDailyKeys.map((dateStr) => {
      const item = dailyMap[dateStr];
      const temps = item.temps;
      const skies = item.skies;
      const pties = item.pties;
      const pops = item.pops;
      
      const tempMinVal = temps.length > 0 ? Math.min(...temps) : temp - 5;
      const tempMaxVal = temps.length > 0 ? Math.max(...temps) : temp + 5;
      
      // Determine dominant sky/pty (simple mode/average)
      const avgSky = skies.length > 0 ? Math.round(skies.reduce((a, b) => a + b) / skies.length) : 1;
      const maxPty = pties.length > 0 ? Math.max(...pties) : 0;
      const maxPop = pops.length > 0 ? Math.max(...pops) : 0;
      
      const state = mapKmaToWeatherState(avgSky, maxPty);
      
      return {
        date: dateStr,
        tempMin: tempMinVal,
        tempMax: tempMaxVal,
        weatherState: state,
        pop: maxPop,
        pty: maxPty,
      };
    });

    return {
      current,
      hourly,
      daily,
      locationName,
      isMock: false,
    };
  } catch (error) {
    console.error('KMA API call failed, generating mock weather data instead:', error);
    return generateMockWeather(nx, ny, locationName);
  }
}

/**
 * Format forecast time string "0900" to "09:00"
 */
function formatTimeHH(hhmm: string): string {
  return `${hhmm.substring(0, 2)}:00`;
}

/**
 * Generates realistic weather mock data according to the current month/season
 */
export function generateMockWeather(
  nx: number,
  ny: number,
  locationName: string
): FetchWeatherResult {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-indexed month
  
  // 1. Determine baseline weather parameters depending on current month (June = Summer start)
  let baseTemp = 22; // Default
  let baseTempMin = 17;
  let baseTempMax = 27;
  let humidity = 65;
  let windSpeed = 2.4;
  let defaultSky = 1; // Sunny
  let defaultPty = 0; // None
  let defaultPop = 10;
  
  if (month >= 6 && month <= 8) {
    // Summer (June, July, August)
    baseTemp = 24.5 + (nx % 3) - (ny % 2);
    baseTempMin = 20;
    baseTempMax = 29;
    humidity = 75;
    // High probability of shower or cloudiness depending on coords
    if (nx % 5 === 0) {
      defaultSky = 4;
      defaultPty = 1; // Rainy
      defaultPop = 80;
      humidity = 90;
    } else if (nx % 3 === 0) {
      defaultSky = 3; // Cloudy
      defaultPop = 40;
    }
  } else if (month >= 9 && month <= 11) {
    // Autumn
    baseTemp = 15;
    baseTempMin = 10;
    baseTempMax = 20;
    humidity = 55;
    if (nx % 4 === 0) {
      defaultSky = 3;
      defaultPop = 20;
    }
  } else if (month === 12 || month <= 2) {
    // Winter
    baseTemp = -2;
    baseTempMin = -7;
    baseTempMax = 3;
    humidity = 40;
    windSpeed = 4.2; // Windiest
    if (nx % 3 === 0) {
      defaultSky = 4;
      defaultPty = 3; // Snowy
      defaultPop = 70;
      humidity = 70;
    }
  } else {
    // Spring (March, April, May)
    baseTemp = 13.5;
    baseTempMin = 8;
    baseTempMax = 18;
    humidity = 50;
    if (nx % 5 === 0) {
      defaultSky = 4;
      defaultPty = 1; // Spring rain
      defaultPop = 65;
    }
  }

  // Adjust temperature depending on current hour
  const hour = now.getHours();
  // Diurnal temperature cycle: peak around 15:00, trough around 06:00
  const hourFactor = Math.sin(((hour - 6) / 24) * 2 * Math.PI - Math.PI / 2); // Ranges from -1 to 1
  const tempRange = (baseTempMax - baseTempMin) / 2;
  const midTemp = (baseTempMax + baseTempMin) / 2;
  const currentTemp = Math.round((midTemp + hourFactor * tempRange) * 10) / 10;

  // apparent temp
  const apparentTemp = calculateApparentTemp(currentTemp, windSpeed, humidity);
  const weatherState = mapKmaToWeatherState(defaultSky, defaultPty);

  const current: CurrentWeather = {
    temp: currentTemp,
    apparentTemp,
    tempMax: baseTempMax,
    tempMin: baseTempMin,
    humidity,
    windSpeed,
    pop: defaultPty > 0 ? defaultPop : Math.max(0, Math.round(defaultPop + hourFactor * 10)),
    weatherState,
    pty: defaultPty,
    sky: defaultSky,
  };

  // 2. Generate hourly forecast (24h)
  const hourly: HourlyForecast[] = [];
  for (let i = 0; i < 24; i++) {
    const forecastTime = new Date(now.getTime() + i * 60 * 60 * 1000);
    const fHour = forecastTime.getHours();
    const fHourFactor = Math.sin(((fHour - 6) / 24) * 2 * Math.PI - Math.PI / 2);
    
    const hTemp = Math.round((midTemp + fHourFactor * tempRange) * 10) / 10;
    
    // Vary sky and precipitation slightly
    let hPty = defaultPty;
    let hSky = defaultSky;
    let hPop = defaultPop;
    
    // Midday showers chance if summer
    if (month >= 6 && month <= 8 && i > 4 && i < 12 && nx % 4 === 0) {
      hPty = 4; // Shower
      hSky = 4;
      hPop = 70;
    }

    const state = mapKmaToWeatherState(hSky, hPty);
    const hHumidity = Math.max(10, Math.min(100, humidity + Math.round(Math.sin(i / 2) * 10)));
    const hWindSpeed = Math.max(0.5, Math.round((windSpeed + Math.cos(i / 3) * 1.5) * 10) / 10);

    hourly.push({
      time: String(fHour).padStart(2, '0') + ':00',
      temp: hTemp,
      weatherState: state,
      pop: hPop,
      pty: hPty,
      sky: hSky,
      humidity: hHumidity,
      windSpeed: hWindSpeed,
    });
  }

  // 3. Generate daily forecast (5 days)
  const daily: DailyForecast[] = [];
  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
  
  for (let i = 0; i < 5; i++) {
    const forecastDay = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = formatYYYYMMDD(forecastDay);
    
    // Randomize daily temperature ranges slightly
    const offset = (Math.sin(i) * 2);
    const dayMin = Math.round((baseTempMin + offset) * 10) / 10;
    const dayMax = Math.round((baseTempMax + offset) * 10) / 10;
    
    // Vary daily weather
    let dSky = 1;
    let dPty = 0;
    
    if ((i + nx) % 3 === 0) {
      dSky = 3; // Cloudy
    } else if ((i + ny) % 4 === 0) {
      dSky = 4; // Overcast
      dPty = (month === 12 || month <= 2) ? 3 : 1; // Snow or Rain
    }

    const state = mapKmaToWeatherState(dSky, dPty);
    let dPop = 10;
    if (dPty > 0) {
      dPop = 80;
    } else if (dSky === 3) {
      dPop = 30;
    } else if (dSky === 4) {
      dPop = 40;
    }

    daily.push({
      date: dateStr,
      tempMin: dayMin,
      tempMax: dayMax,
      weatherState: state,
      pop: dPop,
      pty: dPty,
    });
  }

  return {
    current,
    hourly,
    daily,
    locationName: locationName + ' (Mock)',
    isMock: true,
  };
}
