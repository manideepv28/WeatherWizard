import { useState, useEffect } from "react";
import WeatherHeader from "@/components/weather/header";
import CurrentWeather from "@/components/weather/current-weather";
import Forecast from "@/components/weather/forecast";
import Charts from "@/components/weather/charts";
import Favorites from "@/components/weather/favorites";
import AuthModal from "@/components/auth/auth-modal";
import AddLocationModal from "@/components/weather/add-location-modal";
import { useAuth } from "@/hooks/use-auth";
import { useWeather } from "@/hooks/use-weather";
import { getCurrentLocation } from "@/lib/geolocation";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lon: number; name?: string } | null>(null);
  
  const { user, login, register, logout } = useAuth();
  const { toast } = useToast();
  
  const { 
    currentWeather, 
    forecast, 
    isLoading, 
    fetchCurrentWeather, 
    fetchForecast 
  } = useWeather();

  useEffect(() => {
    handleGetCurrentLocation();
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      fetchCurrentWeather(selectedLocation.lat, selectedLocation.lon);
      fetchForecast(selectedLocation.lat, selectedLocation.lon);
    }
  }, [selectedLocation, fetchCurrentWeather, fetchForecast]);

  const handleGetCurrentLocation = async () => {
    try {
      const position = await getCurrentLocation();
      setSelectedLocation({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        name: "Current Location"
      });
    } catch (error) {
      console.error("Failed to get current location:", error);
      // Default to San Francisco
      setSelectedLocation({
        lat: 37.7749,
        lon: -122.4194,
        name: "San Francisco, CA"
      });
      toast({
        title: "Location Access",
        description: "Unable to access your location. Showing default location.",
        variant: "default"
      });
    }
  };

  const handleLocationSearch = (location: { lat: number; lon: number; name: string }) => {
    setSelectedLocation(location);
  };

  const handleLocationSelect = (location: { lat: number; lon: number; name: string }) => {
    setSelectedLocation(location);
  };

  return (
    <div className="bg-gradient-to-br from-blue-400 via-purple-500 to-purple-600 min-h-screen">
      <WeatherHeader
        onLocationSearch={handleLocationSearch}
        onGetCurrentLocation={handleGetCurrentLocation}
        onToggleAuth={() => setIsAuthModalOpen(true)}
        onToggleFavorites={() => setIsAddLocationModalOpen(true)}
        user={user}
        onLogout={logout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedLocation && currentWeather && (
          <CurrentWeather
            location={selectedLocation}
            weather={currentWeather}
            isLoading={isLoading}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            {selectedLocation && forecast && (
              <Forecast
                forecasts={forecast}
                isLoading={isLoading}
              />
            )}
          </div>

          <aside className="space-y-6">
            <Favorites
              onLocationSelect={handleLocationSelect}
              onAddLocation={() => setIsAddLocationModalOpen(true)}
              isAuthenticated={!!user}
            />
          </aside>
        </div>

        {selectedLocation && (
          <Charts
            location={selectedLocation}
            currentWeather={currentWeather}
            forecasts={forecast}
          />
        )}
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={login}
        onRegister={register}
      />

      <AddLocationModal
        isOpen={isAddLocationModalOpen}
        onClose={() => setIsAddLocationModalOpen(false)}
        onLocationAdd={handleLocationSearch}
        onGetCurrentLocation={handleGetCurrentLocation}
        isAuthenticated={!!user}
      />

      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="glass rounded-2xl p-8 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
            <div className="text-white font-medium">Loading weather data...</div>
          </div>
        </div>
      )}
    </div>
  );
}
