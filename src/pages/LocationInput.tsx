import { fetchWeatherApi } from "openmeteo";
import "../css/location-input.css";
import { useState } from "react";
import { useNavigate } from "react-router";

const LocationInput = () => {
  interface Location {
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

  const [locationSearches, setLocationSearches] = useState<Location[]>([]);

  const navigate = useNavigate();

  const updateLocationName = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const locationName = event.target.value;

    const resultsCount = 5;

    if (event.target.value.length >= 2) {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${locationName}&count=${resultsCount}&language=en&format=json`,
      );

      const data = await response.json();

      const newLocationSearches: Location[] = [];

      for (const location of data?.results) {
        newLocationSearches.push(location);
      }

      setLocationSearches(newLocationSearches);
    }
  };

  const selectLocation = async (event: React.MouseEvent<HTMLDivElement>) => {
    const locationID = Number(event.currentTarget.getAttribute("data-key"));
    const selectedLocation = locationSearches.find(
      (location) => location.id === locationID,
    );
    const locationName = selectedLocation?.name;
    const latitude = selectedLocation?.latitude;
    const longitude = selectedLocation?.longitude;
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

    const responses = await fetchWeatherApi(url, params);
    const response = responses[0];
    const utcOffsetSeconds = response.utcOffsetSeconds();
    const hourly = response.hourly()!;
    const daily = response.daily()!;
    const current = response.current()!;

    const weatherData = {
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
              (Number(daily.time()) + i * daily.interval() + utcOffsetSeconds) *
                1000,
            ),
        ),
        temperature_2m_max: daily.variables(0)!.valuesArray(),
        temperature_2m_min: daily.variables(1)!.valuesArray(),
        weather_code: daily.variables(2)!.valuesArray(),
      },
    };

    navigate("/weather", { state: { weatherData, locationName } });
  };

  return (
    <>
      <input
        onChange={updateLocationName}
        placeholder="Enter location name"
        type="text"
      />

      <div>
        {locationSearches.map((location: Location) => (
          <div
            onClick={selectLocation}
            key={location.id}
            data-key={location.id}
          >
            <p className="location-search-result">
              {location.name}, {location.admin1}, {location.country_code}
            </p>
          </div>
        ))}
      </div>
    </>
  );
};

export default LocationInput;
