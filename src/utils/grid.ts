// LCC Grid Conversion (Latitude/Longitude <-> nx/ny)
//
// Map Projection Parameters
//
const RE = 6371.00877; // 지구 반경(km)
const GRID = 5.0; // 격자 간격(km)
const SLAT1 = 30.0; // 투영 위도1(degree)
const SLAT2 = 60.0; // 투영 위도2(degree)
const OLON = 126.0; // 기준점 경도(degree)
const OLAT = 38.0; // 기준점 위도(degree)
const XO = 43; // 기준점 X좌표(GRID)
const YO = 136; // 기준점 Y좌표(GRID)

export interface GridCoords {
  x: number;
  y: number;
}

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Converts Latitude/Longitude to KMA Grid (nx, ny) or vice versa.
 * @param code 'toXY' to convert lat/lng to nx/ny, 'toLL' to convert nx/ny to lat/lng.
 * @param v1 For 'toXY', it is latitude. For 'toLL', it is nx.
 * @param v2 For 'toXY', it is longitude. For 'toLL', it is ny.
 */
export function dfs_xy_conv(code: 'toXY' | 'toLL', v1: number, v2: number): any {
  const DEGRAD = Math.PI / 180.0;
  const RADDEG = 180.0 / Math.PI;

  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);

  if (code === 'toXY') {
    const raVal = Math.tan(Math.PI * 0.25 + v1 * DEGRAD * 0.5);
    const ra = (re * sf) / Math.pow(raVal, sn);
    let theta = v2 * DEGRAD - olon;
    if (theta > Math.PI) theta -= 2.0 * Math.PI;
    if (theta < -Math.PI) theta += 2.0 * Math.PI;
    theta *= sn;
    
    const x = Math.floor(ra * Math.sin(theta) + XO + 0.5);
    const y = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
    return { x, y } as GridCoords;
  } else {
    const xn = v1 - XO;
    const yn = ro - v2 + YO;
    let r = Math.sqrt(xn * xn + yn * yn);
    if (sn < 0.0) r = -r;
    let alat = Math.pow((re * sf) / r, 1.0 / sn);
    alat = 2.0 * Math.atan(alat) - Math.PI * 0.5;

    let theta = 0.0;
    if (Math.abs(xn) <= 0.0) {
      theta = 0.0;
    } else {
      if (Math.abs(yn) <= 0.0) {
        theta = Math.PI * 0.5;
        if (xn < 0.0) theta = -theta;
      } else {
        theta = Math.atan2(xn, yn);
      }
    }
    const alon = theta / sn + olon;
    const lat = alat * RADDEG;
    const lng = alon * RADDEG;
    return { lat, lng } as LatLng;
  }
}
