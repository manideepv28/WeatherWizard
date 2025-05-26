import { useState, useEffect } from "react";
import { Heart, Plus, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FavoritesProps {
  onLocationSelect: (location: { lat: number; lon: number; name: string }) => void;
  onAddLocation: () => void;
  isAuthenticated: boolean;
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

export default function Favorites({ onLocationSelect, onAddLocation, isAuthenticated }: FavoritesProps) {
  const [localFavorites, setLocalFavorites] = useState<any[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load local favorites from localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      const stored = localStorage.getItem('weatherFavorites');
      if (stored) {
        setLocalFavorites(JSON.parse(stored));
      }
    }
  }, [isAuthenticated]);

  // Fetch favorites from server if authenticated
  const { data: serverFavorites, isLoading } = useQuery({
    queryKey: ['/api/locations/favorites'],
    enabled: isAuthenticated,
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (locationId: number) => {
      return apiRequest('DELETE', `/api/locations/favorites/${locationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/locations/favorites'] });
      toast({
        title: "Success",
        description: "Location removed from favorites",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove location from favorites",
        variant: "destructive",
      });
    },
  });

  const removeLocalFavorite = (index: number) => {
    const updated = localFavorites.filter((_, i) => i !== index);
    setLocalFavorites(updated);
    localStorage.setItem('weatherFavorites', JSON.stringify(updated));
    toast({
      title: "Success",
      description: "Location removed from favorites",
    });
  };

  const favorites = isAuthenticated ? serverFavorites : localFavorites;

  const handleLocationClick = (favorite: any) => {
    if (isAuthenticated) {
      onLocationSelect({
        lat: favorite.location.lat,
        lon: favorite.location.lon,
        name: favorite.location.name
      });
    } else {
      onLocationSelect(favorite);
    }
  };

  const handleRemoveClick = (e: React.MouseEvent, favorite: any, index: number) => {
    e.stopPropagation();
    if (isAuthenticated) {
      removeFavoriteMutation.mutate(favorite.location.id);
    } else {
      removeLocalFavorite(index);
    }
  };

  return (
    <>
      {/* Favorite Locations */}
      <div className="glass rounded-2xl p-6 weather-card fade-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Heart className="mr-2 h-5 w-5" />
            Favorites
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onAddLocation}
            className="text-white/80 hover:text-white transition-colors"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse p-3 bg-white/10 rounded-lg">
                <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-white/20 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : favorites && favorites.length > 0 ? (
          <div className="space-y-3">
            {favorites.map((favorite: any, index: number) => {
              const isServer = isAuthenticated;
              const location = isServer ? favorite.location : favorite;
              const weather = isServer ? favorite.weather : null;
              
              return (
                <div
                  key={isServer ? location.id : index}
                  className="location-item p-3 rounded-lg cursor-pointer transition-colors"
                  onClick={() => handleLocationClick(favorite)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">{location.name}</div>
                      <div className="text-white/60 text-sm">
                        {weather ? 
                          `${Math.round(weather.temperature)}° • ${weather.description}` :
                          `${location.lat?.toFixed(2)}, ${location.lon?.toFixed(2)}`
                        }
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {weather && (
                        <div className="text-lg">
                          {getWeatherIcon(weather.icon)}
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleRemoveClick(e, favorite, index)}
                        className="text-white/60 hover:text-red-400 transition-colors h-6 w-6"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-white/60 text-sm py-8">
            No favorite locations yet
          </div>
        )}
        
        <Button
          variant="outline"
          onClick={onAddLocation}
          className="w-full mt-4 p-3 border-2 border-dashed border-white/30 rounded-lg text-white/80 hover:border-white/50 hover:text-white transition-colors bg-transparent"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Location
        </Button>
      </div>

      {/* Weather Alerts */}
      <div className="glass rounded-2xl p-6 weather-card fade-in">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5" />
          Weather Alerts
        </h3>
        
        <div className="space-y-3">
          <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-yellow-300 font-medium text-sm">Heat Advisory</div>
                <div className="text-white/80 text-xs">Until 8 PM today</div>
              </div>
              <div className="text-yellow-300 text-lg">🌡️</div>
            </div>
          </div>
          
          <div className="text-center text-white/60 text-sm py-4">
            No other active alerts
          </div>
        </div>
      </div>
    </>
  );
}
