import { MapPin, Eye, Droplets, Wind, Thermometer } from "lucide-react";
import type { WeatherData } from "@shared/schema";

interface CurrentWeatherProps {
  location: { lat: number; lon: number; name?: string };
  weather: WeatherData;
  isLoading: boolean;
}

const getWeatherIcon = (icon: string) => {
  const iconMap: { [key: string]: string } = {
    "01d": "☀️", "01n": "🌙",
    "02d": "⛅", "02n": "⛅",
    "03d": "☁️", "03n": "☁️",
    "04d": "☁️", "04n": "☁️",
    "09d": "🌧️", "09n": "🌧️",
    "10d": "🌦️", "10n": "🌦️",
    "11d": "⛈️", "11n": "⛈️",
    "13d": "❄️", "13n": "❄️",
    "50d": "🌫️", "50n": "🌫️"
  };
  return iconMap[icon] || "☀️";
};

const formatTime = (date: Date) => {
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
    Math.floor((date.getTime() - Date.now()) / (1000 * 60)),
    'minute'
  );
};

export default function CurrentWeather({ location, weather, isLoading }: CurrentWeatherProps) {
  if (isLoading) {
    return (
      <section className="mb-8 fade-in">
        <div className="glass rounded-2xl p-8 weather-card">
          <div className="animate-pulse">
            <div className="h-8 bg-white/20 rounded w-64 mb-4"></div>
            <div className="h-20 bg-white/20 rounded w-32"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8 fade-in">
      <div className="glass rounded-2xl p-8 weather-card">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="text-center lg:text-left mb-6 lg:mb-0">
            <div className="flex items-center justify-center lg:justify-start mb-2">
              <MapPin className="text-white/80 mr-2 h-5 w-5" />
              <h2 className="text-2xl font-semibold text-white">
                {location.name || `${location.lat.toFixed(2)}, ${location.lon.toFixed(2)}`}
              </h2>
            </div>
            <p className="text-white/80 text-lg capitalize">{weather.description}</p>
            <p className="text-white/60">
              Updated {formatTime(new Date(weather.timestamp))}
            </p>
          </div>
          
          <div className="flex items-center space-x-8">
            {/* Weather Icon */}
            <div className="text-center">
              <div className="text-6xl">{getWeatherIcon(weather.icon)}</div>
            </div>
            
            {/* Temperature */}
            <div className="text-center">
              <div className="text-6xl font-light text-white">
                {Math.round(weather.temperature)}°
              </div>
              <div className="text-white/80">
                Feels like {Math.round(weather.feelsLike)}°
              </div>
            </div>
          </div>
        </div>
        
        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-white/20">
          <div className="text-center">
            <Eye className="text-white/60 text-xl mb-2 mx-auto h-6 w-6" />
            <div className="text-white/80 text-sm">Visibility</div>
            <div className="text-white font-semibold">
              {weather.visibility ? `${weather.visibility.toFixed(1)} km` : 'N/A'}
            </div>
          </div>
          <div className="text-center">
            <Droplets className="text-white/60 text-xl mb-2 mx-auto h-6 w-6" />
            <div className="text-white/80 text-sm">Humidity</div>
            <div className="text-white font-semibold">{weather.humidity}%</div>
          </div>
          <div className="text-center">
            <Wind className="text-white/60 text-xl mb-2 mx-auto h-6 w-6" />
            <div className="text-white/80 text-sm">Wind Speed</div>
            <div className="text-white font-semibold">
              {(weather.windSpeed * 2.237).toFixed(1)} mph
            </div>
          </div>
          <div className="text-center">
            <Thermometer className="text-white/60 text-xl mb-2 mx-auto h-6 w-6" />
            <div className="text-white/80 text-sm">Pressure</div>
            <div className="text-white font-semibold">
              {(weather.pressure * 0.02953).toFixed(2)} in
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
