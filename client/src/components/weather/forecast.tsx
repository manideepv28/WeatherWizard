import { Calendar } from "lucide-react";
import type { Forecast } from "@shared/schema";

interface ForecastProps {
  forecasts: Forecast[];
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

const formatDay = (date: Date) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow";
  } else {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }
};

export default function Forecast({ forecasts, isLoading }: ForecastProps) {
  if (isLoading) {
    return (
      <div className="glass rounded-2xl p-6 weather-card fade-in">
        <div className="animate-pulse">
          <div className="h-6 bg-white/20 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-16 bg-white/10 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 weather-card fade-in">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <Calendar className="mr-2 h-5 w-5" />
        7-Day Forecast
      </h3>
      
      <div className="space-y-4">
        {forecasts.map((forecast, index) => (
          <div
            key={forecast.id}
            className="flex items-center justify-between p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <div className="text-white font-medium w-20">
                {formatDay(new Date(forecast.date))}
              </div>
              <div className="text-xl">
                {getWeatherIcon(forecast.icon)}
              </div>
              <div className="text-white/80 capitalize">{forecast.description}</div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-white/60">
                {forecast.precipitationChance}% rain
              </div>
              <div className="text-white font-semibold">
                {Math.round(forecast.tempHigh)}° / {Math.round(forecast.tempLow)}°
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
