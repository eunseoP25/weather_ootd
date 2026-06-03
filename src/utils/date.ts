/**
 * Formats a Date object to YYYYMMDD
 */
export function formatYYYYMMDD(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

/**
 * Calculates the base_date and base_time for getUltraSrtNcst (초단기실황)
 * Released every hour at 40 minutes (we fetch for the current hour if min >= 45, else previous hour)
 */
export function getUltraSrtNcstDateTime(date: Date = new Date()): { baseDate: string; baseTime: string } {
  const targetDate = new Date(date.getTime());
  const minutes = targetDate.getMinutes();
  
  if (minutes < 45) {
    // If current time is e.g. 10:23, the 10:00 data is not fully compiled yet. Use 09:00.
    targetDate.setHours(targetDate.getHours() - 1);
  }
  
  const baseDate = formatYYYYMMDD(targetDate);
  const baseTime = String(targetDate.getHours()).padStart(2, '0') + '00';
  
  return { baseDate, baseTime };
}

/**
 * Calculates the base_date and base_time for getVilageFcst (단기예보)
 * Base times: 0200, 0500, 0800, 1100, 1400, 1700, 2000, 2300 (released 10 mins after)
 */
export function getVilageFcstDateTime(date: Date = new Date()): { baseDate: string; baseTime: string } {
  const targetDate = new Date(date.getTime());
  const hour = targetDate.getHours();
  const minutes = targetDate.getMinutes();
  
  // Convert current time to a numeric value in minutes for easy comparison
  const curTimeVal = hour * 60 + minutes;
  
  // Available base times in minutes from start of day:
  // 02:10 (130 mins), 05:10 (310 mins), 08:10 (490 mins), 11:10 (670 mins), 
  // 14:10 (850 mins), 17:10 (1030 mins), 20:10 (1210 mins), 23:10 (1390 mins)
  const baseTimes = [2, 5, 8, 11, 14, 17, 20, 23];
  
  let baseHour = 23;
  let dayOffset = 0;
  
  // Check which base time is the latest available
  // If current time is before 02:10, we must use 23:00 of the previous day.
  if (curTimeVal < 2 * 60 + 15) {
    baseHour = 23;
    dayOffset = -1;
  } else {
    for (let i = baseTimes.length - 1; i >= 0; i--) {
      const bt = baseTimes[i];
      if (curTimeVal >= bt * 60 + 15) {
        baseHour = bt;
        break;
      }
    }
  }
  
  if (dayOffset !== 0) {
    targetDate.setDate(targetDate.getDate() + dayOffset);
  }
  
  const baseDate = formatYYYYMMDD(targetDate);
  const baseTime = String(baseHour).padStart(2, '0') + '00';
  
  return { baseDate, baseTime };
}

/**
 * Convert time string HHMM to display HH:MM
 */
export function formatTimeHHMM(hhmm: string): string {
  if (hhmm.length !== 4) return hhmm;
  return `${hhmm.substring(0, 2)}:${hhmm.substring(2, 4)}`;
}

/**
 * Format string YYYYMMDD to display MM/DD (DayOfWeek)
 */
export function formatDateMMDDDay(yyyymmdd: string): string {
  if (yyyymmdd.length !== 8) return yyyymmdd;
  const year = parseInt(yyyymmdd.substring(0, 4));
  const month = parseInt(yyyymmdd.substring(4, 6)) - 1;
  const day = parseInt(yyyymmdd.substring(6, 8));
  
  const date = new Date(year, month, day);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  
  return `${month + 1}/${day} (${days[date.getDay()]})`;
}
