import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  country: text("country").notNull(),
  lat: real("lat").notNull(),
  lon: real("lon").notNull(),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const weatherData = pgTable("weather_data", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").references(() => locations.id),
  temperature: real("temperature").notNull(),
  feelsLike: real("feels_like").notNull(),
  humidity: integer("humidity").notNull(),
  pressure: real("pressure").notNull(),
  windSpeed: real("wind_speed").notNull(),
  windDirection: integer("wind_direction"),
  visibility: real("visibility"),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  cloudiness: integer("cloudiness"),
  uvIndex: real("uv_index"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const forecast = pgTable("forecast", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").references(() => locations.id),
  date: timestamp("date").notNull(),
  tempHigh: real("temp_high").notNull(),
  tempLow: real("temp_low").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  humidity: integer("humidity").notNull(),
  windSpeed: real("wind_speed").notNull(),
  precipitation: real("precipitation").default(0),
  precipitationChance: integer("precipitation_chance").default(0),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
  createdAt: true,
});

export const insertWeatherDataSchema = createInsertSchema(weatherData).omit({
  id: true,
  timestamp: true,
});

export const insertForecastSchema = createInsertSchema(forecast).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;
export type InsertWeatherData = z.infer<typeof insertWeatherDataSchema>;
export type WeatherData = typeof weatherData.$inferSelect;
export type InsertForecast = z.infer<typeof insertForecastSchema>;
export type Forecast = typeof forecast.$inferSelect;

// Additional types for API responses
export type WeatherApiResponse = {
  coord: { lon: number; lat: number };
  weather: Array<{ id: number; main: string; description: string; icon: string }>;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: { speed: number; deg: number };
  clouds: { all: number };
  dt: number;
  sys: { country: string };
  name: string;
};

export type ForecastApiResponse = {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      humidity: number;
    };
    weather: Array<{ id: number; main: string; description: string; icon: string }>;
    wind: { speed: number; deg: number };
    pop: number;
    rain?: { "3h": number };
    snow?: { "3h": number };
  }>;
  city: {
    name: string;
    country: string;
    coord: { lat: number; lon: number };
  };
};
