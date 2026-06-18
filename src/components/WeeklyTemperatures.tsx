import { fetchWeatherApi } from "openmeteo"
import { useState } from "react"

const WeeklyTemperatures = () => {
    const [latitude, setLatitude] = useState<string>()
    const [longitude, setLongitude] = useState<string>()

    type Coordinate = "longitude" | "latitude"

    const updateCoordinate = (event: React.ChangeEvent<HTMLInputElement>, coordinateType: Coordinate) => {
        if(coordinateType == "latitude") {
            setLatitude(event.target.value)
        } else if(coordinateType == "longitude") {
            setLongitude(event.target.value)
        }
    }

    const confirmCoordinates = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault()

        const url = "https://api.open-meteo.com/v1/forecast"
        const params = {longitude: Number(longitude), latitude: Number(latitude), hourly: "temperature_2m"}

        const responses = await fetchWeatherApi(url, params)
        const response = responses[0]
        const utcOffsetSeconds = response.utcOffsetSeconds();
        const hourly = response.hourly()!

        const weatherData = {
            hourly: {
                time: Array.from(
                    { length: (Number(hourly.timeEnd()) - Number(hourly.time())) / hourly.interval() }, 
                    (_ , i) => new Date((Number(hourly.time()) + i * hourly.interval() + utcOffsetSeconds) * 1000)
                ),
                temperature_2m: hourly.variables(0)!.valuesArray(),
            },
        };

        // console.log("\nHourly data:\n", weatherData.hourly)
        console.log(`Time: ${weatherData.hourly.time[0]} Temperature: ${weatherData.hourly.temperature_2m![0]}`)
    }

    

    return (
        <form onSubmit={confirmCoordinates}>
            <input onChange={(e) => updateCoordinate(e, "longitude")} placeholder="Enter longitude" type="number" step="any" required/>
            <input onChange={(e) => updateCoordinate(e, "latitude")} placeholder="Enter latitude" type="number" step="any" required/>

            <button type="submit">Update Coordinates</button>
        </form>
    )
}

export default WeeklyTemperatures