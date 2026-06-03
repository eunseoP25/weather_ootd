import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FavoriteLocation } from '../types/weather';
import { dfs_xy_conv } from '../utils/grid';
import { fetchKmaWeather } from '../services/kmaApi';

const FAVORITES_STORAGE_KEY = 'ootd_favorite_locations';
const ACTIVE_LOC_STORAGE_KEY = 'ootd_active_location';

// Default cities in Korea
const defaultFavorites: FavoriteLocation[] = [
  { id: 'seoul', name: '서울', lat: 37.5665, lng: 126.9780, nx: 60, ny: 127 },
  { id: 'busan', name: '부산', lat: 35.1796, lng: 129.0756, nx: 98, ny: 76 },
  { id: 'jeju', name: '제주', lat: 33.4996, lng: 126.5312, nx: 52, ny: 38 },
  { id: 'daegu', name: '대구', lat: 35.8714, lng: 128.6014, nx: 89, ny: 90 },
  { id: 'incheon', name: '인천', lat: 37.4563, lng: 126.7052, nx: 55, ny: 124 },
  { id: 'daejeon', name: '대전', lat: 36.3504, lng: 127.3845, nx: 67, ny: 100 },
  { id: 'gwangju', name: '광주', lat: 35.1595, lng: 126.8526, nx: 58, ny: 74 },
];

export function useWeather() {
  // Favorite locations
  const [favorites, setFavorites] = useState<FavoriteLocation[]>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return defaultFavorites;
  });

  // Active location (defaults to Seoul)
  const [activeLocation, setActiveLocation] = useState<FavoriteLocation>(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_LOC_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return defaultFavorites[0]; // Seoul
  });

  // Save changes to LocalStorage
  useEffect(() => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(ACTIVE_LOC_STORAGE_KEY, JSON.stringify(activeLocation));
  }, [activeLocation]);

  // Geolocation states
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // TanStack Query for fetching weather data
  const {
    data: weatherData,
    isLoading: weatherLoading,
    isError: weatherError,
    error: queryError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['weather', activeLocation.nx, activeLocation.ny, activeLocation.id],
    queryFn: () => fetchKmaWeather(activeLocation.nx, activeLocation.ny, activeLocation.name),
    staleTime: 10 * 60 * 1000, // 10 minutes cache freshness
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
    retry: 1,
  });

  // Try to locate user via browser Geolocation API
  const requestCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('이 브라우저는 위치 서비스를 지원하지 않습니다.');
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Convert to KMA Grid (nx, ny)
        const grid = dfs_xy_conv('toXY', latitude, longitude);
        
        const myLoc: FavoriteLocation = {
          id: 'current_location',
          name: '현재 위치',
          lat: Math.round(latitude * 10000) / 10000,
          lng: Math.round(longitude * 10000) / 10000,
          nx: grid.x,
          ny: grid.y,
          isCurrent: true,
        };

        setActiveLocation(myLoc);
        setGeoLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMsg = '위치 정보를 가져오지 못했습니다.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = '위치 정보 권한이 거부되었습니다. 기본 위치(서울)를 사용합니다.';
        }
        setGeoError(errorMsg);
        setGeoLoading(false);
        // Fallback to Seoul if no location has been fetched yet
        if (activeLocation.id === 'current_location') {
          setActiveLocation(defaultFavorites[0]);
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Add custom location to favorites
  const addFavorite = (name: string, lat: number, lng: number) => {
    const grid = dfs_xy_conv('toXY', lat, lng);
    const newLoc: FavoriteLocation = {
      id: `custom_${Date.now()}`,
      name,
      lat,
      lng,
      nx: grid.x,
      ny: grid.y,
    };
    
    setFavorites((prev) => {
      // Prevent duplicate names
      if (prev.some((f) => f.name.toLowerCase() === name.toLowerCase())) {
        return prev;
      }
      return [...prev, newLoc];
    });
    
    return newLoc;
  };

  // Delete from favorites
  const deleteFavorite = (id: string) => {
    setFavorites((prev) => {
      const nextFavorites = prev.filter((f) => f.id !== id);
      
      // If deleted location was active, switch to first available favorite or current location
      if (activeLocation.id === id) {
        if (nextFavorites.length > 0) {
          setActiveLocation(nextFavorites[0]);
        } else {
          setActiveLocation(defaultFavorites[0]);
        }
      }
      return nextFavorites;
    });
  };

  return {
    favorites,
    activeLocation,
    weatherData,
    isLoading: weatherLoading || geoLoading,
    isError: weatherError || geoError !== null,
    error: geoError || (queryError ? (queryError as Error).message : null),
    isFetching,
    setActiveLocation,
    requestCurrentLocation,
    addFavorite,
    deleteFavorite,
    refetch,
  };
}
export { defaultFavorites };
