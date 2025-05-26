export interface WeatherLocation {
  lat: number;
  lon: number;
  name?: string;
  country?: string;
}

export interface CurrentWeatherResponse {
  location: {
    id: number;
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
  weather: {
    id: number;
    temperature: number;
    feelsLike: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection?: number;
    visibility?: number;
    description: string;
    icon: string;
    cloudiness?: number;
    timestamp: string;
  };
}

export interface ForecastResponse {
  location: {
    id: number;
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
  forecasts: Array<{
    id: number;
    date: string;
    tempHigh: number;
    tempLow: number;
    description: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    precipitationChance: number;
  }>;
}

export async function getCurrentWeather(lat: number, lon: number): Promise<CurrentWeatherResponse> {
  const response = await fetch(`/api/weather/current?lat=${lat}&lon=${lon}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch weather data');
  }
  
  return response.json();
}

export async function getForecast(lat: number, lon: number): Promise<ForecastResponse> {
  const response = await fetch(`/api/weather/forecast?lat=${lat}&lon=${lon}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch forecast data');
  }
  
  return response.json();
}

export async function searchLocations(query: string): Promise<WeatherLocation[]> {
  const response = await fetch(`/api/locations/search?q=${encodeURIComponent(query)}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to search locations');
  }
  
  return response.json();
}
