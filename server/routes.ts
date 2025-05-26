import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertLocationSchema, 
  insertWeatherDataSchema, 
  insertForecastSchema,
  type WeatherApiResponse,
  type ForecastApiResponse 
} from "@shared/schema";
import { z } from "zod";

const API_KEY = process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY || "demo_key";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// Session interface
interface SessionData {
  userId?: number;
}

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

// Helper functions for demo data
function getCityNameForLocation(lat: number, lon: number): string {
  const cities = [
    { name: "New York", lat: 40.7128, lon: -74.0060 },
    { name: "London", lat: 51.5074, lon: -0.1278 },
    { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
    { name: "Paris", lat: 48.8566, lon: 2.3522 },
    { name: "Sydney", lat: -33.8688, lon: 151.2093 },
    { name: "San Francisco", lat: 37.7749, lon: -122.4194 },
    { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
    { name: "Berlin", lat: 52.5200, lon: 13.4050 }
  ];
  
  let closest = cities[0];
  let minDistance = Math.abs(lat - closest.lat) + Math.abs(lon - closest.lon);
  
  for (const city of cities) {
    const distance = Math.abs(lat - city.lat) + Math.abs(lon - city.lon);
    if (distance < minDistance) {
      minDistance = distance;
      closest = city;
    }
  }
  
  return closest.name;
}

function getCountryForLocation(lat: number, lon: number): string {
  if (lat > 45 && lon < -60) return "CA"; // Canada
  if (lat > 25 && lat < 50 && lon > -125 && lon < -65) return "US"; // USA
  if (lat > 35 && lat < 70 && lon > -10 && lon < 40) return "GB"; // Europe/UK
  if (lat > 30 && lat < 45 && lon > 100 && lon < 145) return "JP"; // Japan
  if (lat > -45 && lat < -10 && lon > 110 && lon < 155) return "AU"; // Australia
  if (lat > 5 && lat < 35 && lon > 68 && lon < 98) return "IN"; // India
  return "XX"; // Unknown
}

async function fetchWeatherData(lat: number, lon: number): Promise<WeatherApiResponse> {
  // Demo weather data - in production, replace with real API call
  const weatherConditions = [
    { id: 800, main: "Clear", description: "clear sky", icon: "01d" },
    { id: 801, main: "Clouds", description: "few clouds", icon: "02d" },
    { id: 802, main: "Clouds", description: "scattered clouds", icon: "03d" },
    { id: 500, main: "Rain", description: "light rain", icon: "10d" },
    { id: 200, main: "Thunderstorm", description: "thunderstorm with light rain", icon: "11d" }
  ];
  
  const condition = weatherConditions[Math.floor(Math.abs(lat + lon) * 10) % weatherConditions.length];
  const baseTemp = 20 + Math.sin(lat * 0.1) * 15; // Temperature varies by latitude
  
  // Simulate realistic weather data
  return {
    coord: { lon, lat },
    weather: [condition],
    main: {
      temp: Number((baseTemp + Math.random() * 5 - 2.5).toFixed(1)),
      feels_like: Number((baseTemp + Math.random() * 3 - 1.5).toFixed(1)),
      temp_min: Number((baseTemp - 3).toFixed(1)),
      temp_max: Number((baseTemp + 4).toFixed(1)),
      pressure: Number((1013 + Math.random() * 20 - 10).toFixed(0)),
      humidity: Math.floor(50 + Math.random() * 30)
    },
    visibility: 10000,
    wind: { 
      speed: Number((Math.random() * 10 + 2).toFixed(1)), 
      deg: Math.floor(Math.random() * 360)
    },
    clouds: { all: Math.floor(Math.random() * 100) },
    dt: Math.floor(Date.now() / 1000),
    sys: { country: getCountryForLocation(lat, lon) },
    name: getCityNameForLocation(lat, lon)
  };
}

async function fetchForecastData(lat: number, lon: number): Promise<ForecastApiResponse> {
  // Demo forecast data - in production, replace with real API call
  const weatherConditions = [
    { id: 800, main: "Clear", description: "clear sky", icon: "01d" },
    { id: 801, main: "Clouds", description: "few clouds", icon: "02d" },
    { id: 802, main: "Clouds", description: "scattered clouds", icon: "03d" },
    { id: 500, main: "Rain", description: "light rain", icon: "10d" },
    { id: 200, main: "Thunderstorm", description: "thunderstorm with light rain", icon: "11d" }
  ];
  
  const baseTemp = 20 + Math.sin(lat * 0.1) * 15;
  const forecastList = [];
  
  // Generate 7 days of forecast data
  for (let i = 0; i < 40; i += 8) { // Every 8th entry for daily forecast
    const condition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    const dayTemp = baseTemp + Math.random() * 10 - 5;
    
    forecastList.push({
      dt: Math.floor(Date.now() / 1000) + (i * 3 * 3600), // 3-hour intervals
      main: {
        temp: Number(dayTemp.toFixed(1)),
        feels_like: Number((dayTemp + Math.random() * 2 - 1).toFixed(1)),
        temp_min: Number((dayTemp - 3).toFixed(1)),
        temp_max: Number((dayTemp + 4).toFixed(1)),
        pressure: Number((1013 + Math.random() * 20 - 10).toFixed(0)),
        humidity: Math.floor(50 + Math.random() * 30)
      },
      weather: [condition],
      wind: { 
        speed: Number((Math.random() * 10 + 2).toFixed(1)), 
        deg: Math.floor(Math.random() * 360)
      },
      pop: Math.random() * 0.8, // Probability of precipitation
      rain: Math.random() > 0.7 ? { "3h": Math.random() * 5 } : undefined,
      snow: undefined
    });
  }
  
  return {
    list: forecastList,
    city: {
      name: getCityNameForLocation(lat, lon),
      country: getCountryForLocation(lat, lon),
      coord: { lat, lon }
    }
  };
}

async function searchCities(query: string): Promise<Array<{ name: string; country: string; lat: number; lon: number }>> {
  // Demo city search - in production, replace with real geocoding API
  const demoData = [
    { name: "New York", country: "US", lat: 40.7128, lon: -74.0060 },
    { name: "London", country: "GB", lat: 51.5074, lon: -0.1278 },
    { name: "Tokyo", country: "JP", lat: 35.6762, lon: 139.6503 },
    { name: "Paris", country: "FR", lat: 48.8566, lon: 2.3522 },
    { name: "Sydney", country: "AU", lat: -33.8688, lon: 151.2093 },
    { name: "San Francisco", country: "US", lat: 37.7749, lon: -122.4194 },
    { name: "Los Angeles", country: "US", lat: 34.0522, lon: -118.2437 },
    { name: "Chicago", country: "US", lat: 41.8781, lon: -87.6298 },
    { name: "Mumbai", country: "IN", lat: 19.0760, lon: 72.8777 },
    { name: "Berlin", country: "DE", lat: 52.5200, lon: 13.4050 },
    { name: "Toronto", country: "CA", lat: 43.6532, lon: -79.3832 },
    { name: "Dubai", country: "AE", lat: 25.2048, lon: 55.2708 },
    { name: "Singapore", country: "SG", lat: 1.3521, lon: 103.8198 },
    { name: "Hong Kong", country: "HK", lat: 22.3193, lon: 114.1694 },
    { name: "Moscow", country: "RU", lat: 55.7558, lon: 37.6176 },
    { name: "Barcelona", country: "ES", lat: 41.3851, lon: 2.1734 },
    { name: "Rome", country: "IT", lat: 41.9028, lon: 12.4964 },
    { name: "Amsterdam", country: "NL", lat: 52.3676, lon: 4.9041 },
    { name: "Seoul", country: "KR", lat: 37.5665, lon: 126.9780 },
    { name: "Bangkok", country: "TH", lat: 13.7563, lon: 100.5018 }
  ];
  
  const searchTerm = query.toLowerCase();
  const filtered = demoData.filter(city => 
    city.name.toLowerCase().includes(searchTerm) || 
    city.country.toLowerCase().includes(searchTerm)
  );
  
  return filtered.slice(0, 5);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser(userData);
      req.session.userId = user.id;
      
      res.json({ user: { id: user.id, email: user.email, username: user.username } });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      req.session.userId = user.id;
      res.json({ user: { id: user.id, email: user.email, username: user.username } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ user: { id: user.id, email: user.email, username: user.username } });
  });

  // Location search
  app.get("/api/locations/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ message: "Query parameter required" });
      }
      
      const cities = await searchCities(q);
      res.json(cities);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Weather data
  app.get("/api/weather/current", async (req, res) => {
    try {
      const { lat, lon } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ message: "Latitude and longitude required" });
      }
      
      const weatherData = await fetchWeatherData(Number(lat), Number(lon));
      
      // Store in database
      let location = await storage.getLocationByCoords(Number(lat), Number(lon));
      if (!location) {
        location = await storage.createLocation({
          userId: req.session.userId || null,
          name: weatherData.name,
          country: weatherData.sys.country,
          lat: Number(lat),
          lon: Number(lon),
          isFavorite: false
        });
      }
      
      const storedWeatherData = await storage.createWeatherData({
        locationId: location.id,
        temperature: weatherData.main.temp,
        feelsLike: weatherData.main.feels_like,
        humidity: weatherData.main.humidity,
        pressure: weatherData.main.pressure,
        windSpeed: weatherData.wind.speed,
        windDirection: weatherData.wind.deg,
        visibility: weatherData.visibility / 1000, // Convert to km
        description: weatherData.weather[0].description,
        icon: weatherData.weather[0].icon,
        cloudiness: weatherData.clouds.all
      });
      
      res.json({
        location,
        weather: storedWeatherData,
        raw: weatherData
      });
    } catch (error) {
      console.error("Weather fetch error:", error);
      res.status(500).json({ message: "Failed to fetch weather data" });
    }
  });

  app.get("/api/weather/forecast", async (req, res) => {
    try {
      const { lat, lon } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ message: "Latitude and longitude required" });
      }
      
      const forecastData = await fetchForecastData(Number(lat), Number(lon));
      
      let location = await storage.getLocationByCoords(Number(lat), Number(lon));
      if (!location) {
        location = await storage.createLocation({
          userId: req.session.userId || null,
          name: forecastData.city.name,
          country: forecastData.city.country,
          lat: Number(lat),
          lon: Number(lon),
          isFavorite: false
        });
      }
      
      // Clear existing forecasts
      await storage.deleteForecastByLocationId(location.id);
      
      // Group forecast data by day and store
      const dailyForecasts: { [key: string]: any } = {};
      
      forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toDateString();
        
        if (!dailyForecasts[dateKey]) {
          dailyForecasts[dateKey] = {
            date,
            tempHigh: item.main.temp_max,
            tempLow: item.main.temp_min,
            description: item.weather[0].description,
            icon: item.weather[0].icon,
            humidity: item.main.humidity,
            windSpeed: item.wind.speed,
            precipitation: (item.rain?.["3h"] || 0) + (item.snow?.["3h"] || 0),
            precipitationChance: Math.round(item.pop * 100)
          };
        } else {
          dailyForecasts[dateKey].tempHigh = Math.max(dailyForecasts[dateKey].tempHigh, item.main.temp_max);
          dailyForecasts[dateKey].tempLow = Math.min(dailyForecasts[dateKey].tempLow, item.main.temp_min);
        }
      });
      
      const storedForecasts = [];
      for (const forecast of Object.values(dailyForecasts).slice(0, 7)) {
        const stored = await storage.createForecast({
          locationId: location.id,
          ...forecast as any
        });
        storedForecasts.push(stored);
      }
      
      res.json({
        location,
        forecasts: storedForecasts,
        raw: forecastData
      });
    } catch (error) {
      console.error("Forecast fetch error:", error);
      res.status(500).json({ message: "Failed to fetch forecast data" });
    }
  });

  // Favorite locations
  app.get("/api/locations/favorites", requireAuth, async (req, res) => {
    try {
      const locations = await storage.getLocationsByUserId(req.session.userId!);
      const favorites = locations.filter(loc => loc.isFavorite);
      
      // Get latest weather for each favorite
      const favoritesWithWeather = await Promise.all(
        favorites.map(async (location) => {
          const weather = await storage.getLatestWeatherData(location.id);
          return { location, weather };
        })
      );
      
      res.json(favoritesWithWeather);
    } catch (error) {
      console.error("Favorites fetch error:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/locations/favorites", requireAuth, async (req, res) => {
    try {
      const { lat, lon, name, country } = req.body;
      
      let location = await storage.getLocationByCoords(lat, lon);
      if (!location) {
        location = await storage.createLocation({
          userId: req.session.userId!,
          name,
          country,
          lat,
          lon,
          isFavorite: true
        });
      } else {
        location = await storage.updateLocationFavorite(location.id, true, req.session.userId);
      }
      
      res.json(location);
    } catch (error) {
      console.error("Add favorite error:", error);
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete("/api/locations/favorites/:id", requireAuth, async (req, res) => {
    try {
      const locationId = parseInt(req.params.id);
      const success = await storage.deleteLocation(locationId, req.session.userId);
      
      if (!success) {
        return res.status(404).json({ message: "Location not found" });
      }
      
      res.json({ message: "Favorite removed" });
    } catch (error) {
      console.error("Remove favorite error:", error);
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
