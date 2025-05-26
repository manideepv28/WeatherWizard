import { useState } from "react";
import { Search, Heart, Navigation, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  onLocationSearch: (location: { lat: number; lon: number; name: string }) => void;
  onGetCurrentLocation: () => void;
  onToggleAuth: () => void;
  onToggleFavorites: () => void;
  user: any;
  onLogout: () => void;
}

export default function WeatherHeader({
  onLocationSearch,
  onGetCurrentLocation,
  onToggleAuth,
  onToggleFavorites,
  user,
  onLogout
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      const response = await fetch(`/api/locations/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search Error",
        description: "Failed to search for locations",
        variant: "destructive"
      });
    }
  };

  const handleLocationSelect = (location: any) => {
    onLocationSearch({
      lat: location.lat,
      lon: location.lon,
      name: `${location.name}, ${location.country}`
    });
    setSearchQuery("");
    setShowResults(false);
    setSearchResults([]);
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="text-2xl text-white">☀️</div>
              <h1 className="text-xl font-bold text-white">WeatherDash</h1>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8 relative">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for a city..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-4 w-4" />
            </div>
            
            {/* Search Results */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white/90 backdrop-blur-md rounded-lg border border-white/30 shadow-lg z-50">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleLocationSelect(result)}
                    className="w-full text-left px-4 py-3 hover:bg-white/20 first:rounded-t-lg last:rounded-b-lg text-gray-800 border-b border-white/20 last:border-b-0"
                  >
                    <div className="font-medium">{result.name}</div>
                    <div className="text-sm text-gray-600">{result.country}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFavorites}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <Heart className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onGetCurrentLocation}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <Navigation className="h-4 w-4" />
            </Button>
            
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 text-white">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{user.username}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleAuth}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
