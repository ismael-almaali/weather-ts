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

    navigate(`/weather?lat=${latitude}&lon=${longitude}&name=${locationName}`);
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
