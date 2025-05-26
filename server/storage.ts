import { 
  users, 
  locations, 
  weatherData, 
  forecast,
  type User, 
  type Location, 
  type WeatherData, 
  type Forecast,
  type InsertUser, 
  type InsertLocation, 
  type InsertWeatherData, 
  type InsertForecast 
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Location operations
  getLocationsByUserId(userId: number): Promise<Location[]>;
  getLocationByCoords(lat: number, lon: number): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  deleteLocation(id: number, userId?: number): Promise<boolean>;
  updateLocationFavorite(id: number, isFavorite: boolean, userId?: number): Promise<Location | undefined>;
  
  // Weather data operations
  getWeatherDataByLocationId(locationId: number): Promise<WeatherData | undefined>;
  createWeatherData(data: InsertWeatherData): Promise<WeatherData>;
  getLatestWeatherData(locationId: number): Promise<WeatherData | undefined>;
  
  // Forecast operations
  getForecastByLocationId(locationId: number): Promise<Forecast[]>;
  createForecast(forecast: InsertForecast): Promise<Forecast>;
  deleteForecastByLocationId(locationId: number): Promise<boolean>;
  
  // Search operations
  searchLocationsByName(name: string): Promise<Location[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private locations: Map<number, Location>;
  private weatherDataMap: Map<number, WeatherData>;
  private forecastMap: Map<number, Forecast[]>;
  private currentUserId: number;
  private currentLocationId: number;
  private currentWeatherDataId: number;
  private currentForecastId: number;

  constructor() {
    this.users = new Map();
    this.locations = new Map();
    this.weatherDataMap = new Map();
    this.forecastMap = new Map();
    this.currentUserId = 1;
    this.currentLocationId = 1;
    this.currentWeatherDataId = 1;
    this.currentForecastId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getLocationsByUserId(userId: number): Promise<Location[]> {
    return Array.from(this.locations.values()).filter(
      location => location.userId === userId
    );
  }

  async getLocationByCoords(lat: number, lon: number): Promise<Location | undefined> {
    return Array.from(this.locations.values()).find(
      location => Math.abs(location.lat - lat) < 0.01 && Math.abs(location.lon - lon) < 0.01
    );
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const id = this.currentLocationId++;
    const location: Location = {
      ...insertLocation,
      id,
      userId: insertLocation.userId || null,
      isFavorite: insertLocation.isFavorite || false,
      createdAt: new Date()
    };
    this.locations.set(id, location);
    return location;
  }

  async deleteLocation(id: number, userId?: number): Promise<boolean> {
    const location = this.locations.get(id);
    if (!location || (userId && location.userId !== userId)) {
      return false;
    }
    
    this.locations.delete(id);
    this.weatherDataMap.delete(id);
    this.forecastMap.delete(id);
    return true;
  }

  async updateLocationFavorite(id: number, isFavorite: boolean, userId?: number): Promise<Location | undefined> {
    const location = this.locations.get(id);
    if (!location || (userId && location.userId !== userId)) {
      return undefined;
    }
    
    const updatedLocation = { ...location, isFavorite };
    this.locations.set(id, updatedLocation);
    return updatedLocation;
  }

  async getWeatherDataByLocationId(locationId: number): Promise<WeatherData | undefined> {
    return this.weatherDataMap.get(locationId);
  }

  async createWeatherData(insertWeatherData: InsertWeatherData): Promise<WeatherData> {
    const id = this.currentWeatherDataId++;
    const data: WeatherData = {
      ...insertWeatherData,
      id,
      timestamp: new Date()
    };
    
    if (insertWeatherData.locationId) {
      this.weatherDataMap.set(insertWeatherData.locationId, data);
    }
    
    return data;
  }

  async getLatestWeatherData(locationId: number): Promise<WeatherData | undefined> {
    return this.weatherDataMap.get(locationId);
  }

  async getForecastByLocationId(locationId: number): Promise<Forecast[]> {
    return this.forecastMap.get(locationId) || [];
  }

  async createForecast(insertForecast: InsertForecast): Promise<Forecast> {
    const id = this.currentForecastId++;
    const forecast: Forecast = {
      ...insertForecast,
      id
    };
    
    if (insertForecast.locationId) {
      const existingForecasts = this.forecastMap.get(insertForecast.locationId) || [];
      existingForecasts.push(forecast);
      this.forecastMap.set(insertForecast.locationId, existingForecasts);
    }
    
    return forecast;
  }

  async deleteForecastByLocationId(locationId: number): Promise<boolean> {
    return this.forecastMap.delete(locationId);
  }

  async searchLocationsByName(name: string): Promise<Location[]> {
    const searchTerm = name.toLowerCase();
    return Array.from(this.locations.values()).filter(
      location => location.name.toLowerCase().includes(searchTerm)
    );
  }
}

export const storage = new MemStorage();
