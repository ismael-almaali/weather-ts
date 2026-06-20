import { useState } from "react";
import { fetchWeatherApi } from "openmeteo";
import { useNavigate } from "react-router";

const LocationInput = () => {
  const [latitude, setLatitude] = useState<string>();
  const [longitude, setLongitude] = useState<string>();
  const navigate = useNavigate();

  type Coordinate = "longitude" | "latitude";

  const updateCoordinate = (
    event: React.ChangeEvent<HTMLInputElement>,
    coordinateType: Coordinate,
  ) => {
    if (coordinateType == "latitude") {
      setLatitude(event.target.value);
    } else if (coordinateType == "longitude") {
      setLongitude(event.target.value);
    }
  };

  const confirmCoordinates = async (
    event: React.SubmitEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const url = "https://api.open-meteo.com/v1/forecast";
    const params = {
      longitude: Number(longitude),
      latitude: Number(latitude),
      daily: ["temperature_2m_max", "temperature_2m_min", "weather_code"],
      hourly: ["temperature_2m", "weather_code"],
      current: ["temperature_2m", "weather_code"],
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

    console.log(weatherData);

    navigate("/weather", { state: { weatherData } });
  };

  return (
    <form onSubmit={confirmCoordinates}>
      <input
        onChange={(e) => updateCoordinate(e, "latitude")}
        placeholder="Enter latitude"
        type="number"
        step="any"
        required
      />
      <input
        onChange={(e) => updateCoordinate(e, "longitude")}
        placeholder="Enter longitude"
        type="number"
        step="any"
        required
      />

      <button type="submit">Update Coordinates</button>
    </form>
  );
};

export default LocationInput;
