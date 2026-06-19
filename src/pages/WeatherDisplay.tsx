import { useLocation } from "react-router";
import { useState, useEffect } from "react";

import "../css/weather-display.css";

const WeatherDisplay = () => {
  const { state } = useLocation();
  const weatherData = state?.weatherData;
  console.log(weatherData);

  const currentTemperature = weatherData?.current?.temperature_2m;

  interface HourlyData {
    temperature: number;
    time: Date;
  }

  interface WeeklyData {
    day: string;
    maxTemperature: number;
    minTemperature: number;
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
        hourlyTemperaturesToday.push({ temperature, time });
      }
    }
    setHourlyTemperatures(hourlyTemperaturesToday);

    const daysOfTheWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyTemperaturesData: WeeklyData[] = [];
    for (const date in weatherData?.daily?.time || []) {
      const time = weatherData?.daily?.time[date];
      const maxTemperature = weatherData?.daily?.temperature_2m_max[date];
      const minTemperature = weatherData?.daily?.temperature_2m_min[date];

      weeklyTemperaturesData.push({
        day: daysOfTheWeek[time.getDay()],
        maxTemperature,
        minTemperature,
      });
    }
    setWeeklyTemperatures(weeklyTemperaturesData);
    console.log(weeklyTemperaturesData);
  }, [weatherData]);

  return (
    <>
      <h2>Location Name</h2>
      <h1>{Math.round(currentTemperature)}°C</h1>

      <div className="hourly-temperatures">
        {hourlyTemperatures.map((hour, index) => (
          <div key={index}>
            <p>
              <p>{Math.round(hour.temperature)}°C</p>
              {hour.time.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
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
          </div>
        ))}
      </div>
    </>
  );
};

export default WeatherDisplay;
