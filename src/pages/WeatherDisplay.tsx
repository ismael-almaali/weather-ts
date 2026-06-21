import { useLocation } from "react-router";
import { useState, useEffect } from "react";

import "../css/weather-display.css";

const WeatherDisplay = () => {
  const { state } = useLocation();
  const weatherData = state?.weatherData;
  const locationName = state?.locationName;

  const currentTemperature = weatherData?.current?.temperature_2m;

  const currentWeatherCode = weatherData?.current?.weather_code;

  interface HourlyData {
    temperature: number;
    time: Date;
    weatherCode: number;
  }

  interface WeeklyData {
    day: string;
    maxTemperature: number;
    minTemperature: number;
    weatherCode: number;
  }

  const [hourlyTemperatures, setHourlyTemperatures] = useState<HourlyData[]>(
    [],
  );

  const [weeklyTemperatures, setWeeklyTemperatures] = useState<WeeklyData[]>(
    [],
  );

  useEffect(() => {
    const currentDate = new Date();
    const hourlyTemperaturesToday: HourlyData[] = [];

    // Loop through the hourly data and filter for today's temperatures only
    for (const date in weatherData?.hourly?.time || []) {
      // Check if the current date we are looking at is today
      if (weatherData?.hourly?.time[date].getDate() === currentDate.getDate()) {
        // If it is, push the temperature and time to the hourlyTemperaturesToday array
        const time = weatherData?.hourly?.time[date];
        const temperature = weatherData?.hourly?.temperature_2m[date];
        const weatherCode = weatherData?.hourly?.weather_code[date];
        hourlyTemperaturesToday.push({ temperature, time, weatherCode });
      }
    }
    setHourlyTemperatures(hourlyTemperaturesToday);

    const daysOfTheWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyTemperaturesData: WeeklyData[] = [];
    for (const date in weatherData?.daily?.time || []) {
      const time = weatherData?.daily?.time[date];
      const maxTemperature = weatherData?.daily?.temperature_2m_max[date];
      const minTemperature = weatherData?.daily?.temperature_2m_min[date];
      const weatherCode = weatherData?.daily?.weather_code[date];

      weeklyTemperaturesData.push({
        day: daysOfTheWeek[time.getDay()],
        maxTemperature,
        minTemperature,
        weatherCode,
      });
    }
    setWeeklyTemperatures(weeklyTemperaturesData);
  }, [weatherData]);

  const getWeatherState = (code: number) => {
    if (code === 0) return { state: "clear", icon: "☀️" };
    if (code <= 3) return { state: "partly-cloudy", icon: "⛅" };
    if (code <= 48) return { state: "foggy", icon: "🌁" };
    if (code <= 57) return { state: "drizzle", icon: "🌦️" };
    if (code <= 67 || (code >= 80 && code <= 82))
      return { state: "raining", icon: "🌧️" };
    if (code <= 77 || (code >= 85 && code <= 86))
      return { state: "snowing", icon: "❄️" };
    if (code >= 95) return { state: "thunder", icon: "⛈️" };
    return { state: "clear", icon: "☀️" }; // fallback
  };

  return (
    <>
      <h2>{locationName}</h2>
      <h1>{Math.round(currentTemperature)}°C</h1>
      <h1>{getWeatherState(currentWeatherCode)?.icon}</h1>
      <p>{getWeatherState(currentWeatherCode)?.state}</p>

      <div className="hourly-temperatures">
        {hourlyTemperatures.map((hour, index) => (
          <div key={index}>
            <p>{Math.round(hour.temperature)}°C</p>
            {hour.time.toLocaleTimeString([], {
              hour: "numeric",
              hour12: true,
            })}
            <p>{getWeatherState(hour.weatherCode)?.icon}</p>
          </div>
        ))}
      </div>

      <div className="weekly-temperatures">
        {weeklyTemperatures.map((day, index) => (
          <div key={index}>
            <p>{day.day}</p>
            <p>
              {Math.round(day.maxTemperature)}°C /{" "}
              {Math.round(day.minTemperature)}°C
            </p>
            <h1>{getWeatherState(day.weatherCode)?.icon}</h1>
          </div>
        ))}
      </div>
    </>
  );
};

export default WeatherDisplay;
