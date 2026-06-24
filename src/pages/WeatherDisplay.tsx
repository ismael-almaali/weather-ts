import { useSearchParams } from "react-router";
import { useState, useEffect } from "react";
import type { CSSProperties } from "react";

import { fetchWeatherApi } from "openmeteo";

import { BeatLoader } from "react-spinners";

import type { HourlyData, WeeklyData } from "../types/weather";

import "../css/weather-display.css";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "black",
};

const WeatherDisplay = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [spinnerColor, setSpinnerColor] = useState("#6f6f6f");

  // TODO: Change from any type to a custom type of the data I am retrieving
  const [weatherData, setWeatherData] = useState<any>();

  const [searchParams] = useSearchParams();
  const latitude = searchParams.get("lat");
  const longitude = searchParams.get("lon");
  const locationName = searchParams.get("name");

  // in this useEffect function, fetch the weather data from the Open Meteo API based on the url parameters
  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const url = "https://api.open-meteo.com/v1/forecast";
    const params = {
      longitude: longitude,
      latitude: latitude,
      daily: ["temperature_2m_max", "temperature_2m_min", "weather_code"],
      hourly: ["temperature_2m", "weather_code"],
      current: ["temperature_2m", "weather_code"],
      timezone: timezone,
    };

    const fetchData = async () => {
      try {
        const responses = await fetchWeatherApi(url, params);
        const response = responses[0];
        const utcOffsetSeconds = response.utcOffsetSeconds();
        const hourly = response.hourly()!;
        const daily = response.daily()!;
        const current = response.current()!;

        const formattedWeatherData = {
          current: {
            time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
            temperature_2m: current.variables(0)!.value(),
            weather_code: current.variables(1)!.value(),
          },
          hourly: {
            time: Array.from(
              {
                length:
                  (Number(hourly.timeEnd()) - Number(hourly.time())) /
                  hourly.interval(),
              },
              (_, i) =>
                new Date(
                  (Number(hourly.time()) +
                    i * hourly.interval() +
                    utcOffsetSeconds) *
                    1000,
                ),
            ),
            temperature_2m: hourly.variables(0)!.valuesArray(),
            weather_code: hourly.variables(1)!.valuesArray(),
          },
          daily: {
            time: Array.from(
              {
                length:
                  (Number(daily.timeEnd()) - Number(daily.time())) /
                  daily.interval(),
              },
              (_, i) =>
                new Date(
                  (Number(daily.time()) +
                    i * daily.interval() +
                    utcOffsetSeconds) *
                    1000,
                ),
            ),
            temperature_2m_max: daily.variables(0)!.valuesArray(),
            temperature_2m_min: daily.variables(1)!.valuesArray(),
            weather_code: daily.variables(2)!.valuesArray(),
          },
        };

        setWeatherData(formattedWeatherData);
        setIsLoading(false);
      } catch (error) {
        setIsError(true);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  const [hourlyTemperatures, setHourlyTemperatures] = useState<HourlyData[]>(
    [],
  );

  const [weeklyTemperatures, setWeeklyTemperatures] = useState<WeeklyData[]>(
    [],
  );

  const [currentTemperature, setCurrentTemperature] = useState<number>();
  const [currentWeatherCode, setCurrentWeatherCode] = useState<number>();

  // In this useEffect function, map the weather data to the hourlyTemperatures, weeklyTemperatures, currentTemperature, and currentWeatherCode variables
  useEffect(() => {
    const currentDate = new Date();
    const hourlyTemperaturesToday: HourlyData[] = [];

    function getAndSetHourlyTemperatures() {
      // Loop through the hourly data and filter for today's temperatures only
      for (const dateIndex in weatherData?.hourly?.time || []) {
        const date = weatherData?.hourly?.time[dateIndex];
        // Check if the current date we are looking at is today
        if (date.getDate() === currentDate.getDate()) {
          // If it is, push the temperature and time to the hourlyTemperaturesToday array
          const temperature = weatherData?.hourly?.temperature_2m[dateIndex];
          const weatherCode = weatherData?.hourly?.weather_code[dateIndex];
          hourlyTemperaturesToday.push({
            temperature,
            time: date,
            weatherCode,
          });
        }
      }
      setHourlyTemperatures(hourlyTemperaturesToday);
    }

    getAndSetHourlyTemperatures();

    function getAndSetWeeklyTemperatures() {
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
    }

    getAndSetWeeklyTemperatures();

    setCurrentWeatherCode(weatherData?.current?.weather_code);
    setCurrentTemperature(weatherData?.current?.temperature_2m);
  }, [weatherData]);

  const getWeatherState = (code: number) => {
    if (code === 0) return { state: "clear", icon: "☀️" };
    if (code <= 2) return { state: "partly-cloudy", icon: "⛅" };
    if (code === 3) return { state: "overcast", icon: "☁️" };
    if (code <= 49) return { state: "foggy", icon: "🌫️" };
    if (code <= 57) return { state: "drizzle", icon: "🌦️" };
    if (code <= 67) return { state: "raining", icon: "🌧️" };
    if (code <= 77) return { state: "snowing", icon: "❄️" };
    if (code <= 82) return { state: "showers", icon: "🌧️" };
    if (code <= 86) return { state: "snow-showers", icon: "🌨️" };
    if (code <= 99) return { state: "thunder", icon: "⛈️" };
    return { state: "unknown", icon: "❓" };
  };

  if (isError) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "300px",
        }}
      >
        <h1>There was an error fetching the weather data.</h1>
      </div>
    );
  } else {
    return (
      <>
        {isLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "300px",
            }}
          >
            <BeatLoader
              loading={isLoading}
              color={spinnerColor}
              cssOverride={override}
              size={20}
              aria-label={"Loading Spinner"}
            />
          </div>
        ) : (
          <>
            {" "}
            <h2>{locationName}</h2>
            {/* TODO: find a safer alternative to the non-null assertion operator */}
            <h1>{Math.round(currentTemperature!)}°C</h1>
            <h1>{getWeatherState(currentWeatherCode!)?.icon}</h1>
            <p>{getWeatherState(currentWeatherCode!)?.state}</p>
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
        )}
      </>
    );
  }
};

export default WeatherDisplay;
