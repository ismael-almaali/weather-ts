export interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation: number;
  feature_code: string;
  country: string;
  country_code: string;
  country_id: number;
  admin1: string;
  admin1_id: number;
  admin2: string;
  admin2_id: number;
  timezone: string;
}

export interface HourlyData {
  temperature: number;
  time: Date;
  weatherCode: number;
}

export interface WeeklyData {
  day: string;
  maxTemperature: number;
  minTemperature: number;
  weatherCode: number;
}
