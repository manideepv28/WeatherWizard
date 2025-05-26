import { useState } from "react";
import { X, Search, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationAdd: (location: { lat: number; lon: number; name: string }) => void;
  onGetCurrentLocation: () => void;
  isAuthenticated: boolean;
}

export default function AddLocationModal({
  isOpen,
  onClose,
  onLocationAdd,
  onGetCurrentLocation,
  isAuthenticated
}: AddLocationModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addFavoriteMutation = useMutation({
    mutationFn: async (location: any) => {
      return apiRequest('POST', '/api/locations/favorites', location);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/locations/favorites'] });
      toast({
        title: "Success",
        description: "Location added to favorites",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add location to favorites",
        variant: "destructive",
      });
    },
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`/api/locations/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
      } else {
        throw new Error("Search failed");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search Error",
        description: "Failed to search for locations",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationSelect = async (location: any) => {
    const locationData = {
      lat: location.lat,
      lon: location.lon,
      name: `${location.name}, ${location.country}`,
      country: location.country
    };

    // Add to favorites if authenticated
    if (isAuthenticated) {
      try {
        await addFavoriteMutation.mutateAsync(locationData);
      } catch (error) {
        // Error is handled by the mutation
      }
    } else {
      // Add to local storage
      const favorites = JSON.parse(localStorage.getItem('weatherFavorites') || '[]');
      favorites.push(locationData);
      localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
      
      toast({
        title: "Success",
        description: "Location added to favorites (stored locally)",
      });
    }

    onLocationAdd(locationData);
    handleClose();
  };

  const handleCurrentLocation = () => {
    onGetCurrentLocation();
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery("");
    setSearchResults([]);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md glass border-white/20">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white">Add Location</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-white/80 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-4 w-4" />
            <Input
              type="text"
              placeholder="e.g., New York, NY"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 bg-white/20 border-white/30 text-white placeholder-white/70 focus:ring-white/50"
            />
          </div>
          
          <div className="flex space-x-3">
            <Button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {isSearching ? "Searching..." : "Search"}
            </Button>
            <Button
              onClick={handleCurrentLocation}
              variant="outline"
              className="px-6 bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              <Navigation className="h-4 w-4" />
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="max-h-64 overflow-y-auto">
              <h4 className="text-white/80 text-sm font-medium mb-2">Search Results:</h4>
              <div className="space-y-2">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleLocationSelect(result)}
                    className="w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <div className="text-white font-medium">{result.name}</div>
                    <div className="text-white/60 text-sm">{result.country}</div>
                    <div className="text-white/50 text-xs">
                      {result.lat.toFixed(2)}, {result.lon.toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isAuthenticated && (
            <div className="text-center text-white/60 text-xs p-2 bg-white/10 rounded">
              💡 Sign in to sync favorites across devices
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
