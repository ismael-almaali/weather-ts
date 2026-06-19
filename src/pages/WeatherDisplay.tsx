import { useLocation } from "react-router";
import { useState, useEffect } from "react";

import "../css/weather-display.css";

const WeatherDisplay = () => {
  const { state } = useLocation();
  const weatherData = state?.weatherData;

  const currentTemperature = weatherData?.current?.temperature_2m;

  interface HourlyData {
    temperature: number;
    time: Date;
  }

  const [hourlyTemperatures, setHourlyTemperatures] = useState<HourlyData[]>(
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
    console.log(hourlyTemperaturesToday);
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
    </>
  );
};

export default WeatherDisplay;
