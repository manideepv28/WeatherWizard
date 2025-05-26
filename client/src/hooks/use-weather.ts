import { useState, useCallback } from "react";
import { getCurrentWeather, getForecast, type CurrentWeatherResponse, type ForecastResponse } from "@/lib/weather";
import { useToast } from "@/hooks/use-toast";

export function useWeather() {
  const [currentWeather, setCurrentWeather] = useState<CurrentWeatherResponse['weather'] | null>(null);
  const [forecast, setForecast] = useState<ForecastResponse['forecasts'] | null>(null);
  const [currentLocation, setCurrentLocation] = useState<CurrentWeatherResponse['location'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCurrentWeather = useCallback(async (lat: number, lon: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getCurrentWeather(lat, lon);
      setCurrentWeather(data.weather);
      setCurrentLocation(data.location);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch current weather';
      setError(errorMessage);
      toast({
        title: "Weather Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchForecast = useCallback(async (lat: number, lon: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getForecast(lat, lon);
      setForecast(data.forecasts);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch forecast';
      setError(errorMessage);
      toast({
        title: "Forecast Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const refreshWeatherData = useCallback(async (lat: number, lon: number) => {
    await Promise.all([
      fetchCurrentWeather(lat, lon),
      fetchForecast(lat, lon)
    ]);
  }, [fetchCurrentWeather, fetchForecast]);

  return {
    currentWeather,
    forecast,
    currentLocation,
    isLoading,
    error,
    fetchCurrentWeather,
    fetchForecast,
    refreshWeatherData,
  };
}
