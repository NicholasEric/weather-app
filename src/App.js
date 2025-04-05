import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

// Weather conditions mapping
const weatherConditions = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Drizzle, Light",
  53: "Drizzle, Moderate",
  55: "Drizzle, Dense",
  61: "Rain, Slight",
  63: "Rain, Moderate",
  65: "Rain, Heavy",
  71: "Snow, Slight",
  73: "Snow, Moderate",
  75: "Snow, Heavy",
  80: "Rain showers, Slight",
  81: "Rain showers, Moderate",
  82: "Rain showers, Violent",
  95: "Thunderstorm, Slight",
  96: "Thunderstorm, Moderate",
  99: "Thunderstorm, Heavy hail",
};

// Function to get background color based on weather condition
const getBackgroundColor = (weatherCode) => {
  if ([0, 1].includes(weatherCode)) return "#87CEEB"; // Clear sky - Light Blue
  if ([2, 3].includes(weatherCode)) return "#B0C4DE"; // Cloudy - Light Gray
  if ([45, 48].includes(weatherCode)) return "#A9A9A9"; // Fog - Dark Gray
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode)) return "#4682B4"; // Rain - Steel Blue
  if ([71, 73, 75].includes(weatherCode)) return "#D3D3D3"; // Snow - White
  if ([95, 96, 99].includes(weatherCode)) return "#800000"; // Thunderstorm - Dark Red
  return "#FFFFFF"; // Default White
};

const WeatherApp = () => {
  const [city, setCity] = useState("");
  const [cityOptions, setCityOptions] = useState([]); // List of city matches
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCityOptions = async () => {
    setError(null);
    setCityOptions([]);
    setWeather(null);

    if (!city) {
      setError("Please enter a city name.");
      return;
    }

    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${city}&key=${process.env.REACT_APP_GEO_API_KEY}`
      );
      const data = await response.json();
      console.log(data)

      if (!data.results || data.results.length === 0) {
        setError("No matching cities found.");
        return;
      }

      setCityOptions(data.results); 
    } catch (err) {
      setError("Error fetching city data.");
    }
  };

  const fetchWeather = async (lat, lng, formattedCity) => {
    setLoading(true);
    setCityOptions([]);
    setError(null);

    try {
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
      );
      const weatherData = await weatherResponse.json();

      const weatherCode = weatherData.current_weather.weathercode;

      setWeather({
        city: formattedCity,
        temperature: weatherData.current_weather.temperature,
        windSpeed: weatherData.current_weather.windspeed,
        condition: weatherConditions[weatherCode] || "Unknown",
        backgroundColor: getBackgroundColor(weatherCode),
      });
    } catch (err) {
      setError("Error fetching weather data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container text-center mt-5 p-4"
      style={{
        backgroundColor: weather?.backgroundColor || "transparent", // Set background color if available
        backgroundImage: weather?.backgroundColor
          ? "none" // Remove gradient when weather is fetched
          : `linear-gradient(45deg, transparent 0%, transparent 57%, #423246 100%),
             linear-gradient(-45deg, #8f5046 0%,  #A14436 0.3%, #4C2556 112%,  transparent 11%),
             linear-gradient(-90deg, #A14436 100%, #A14436 65%, transparent 20%)`,
        minHeight: "100vh",
        transition: "background-color 0.5s ease",
      }}
    >
      <h2>Weather App</h2>
      <input
        type="text"
        placeholder="Enter city"
        className="form-control mt-3"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <button className="btn btn-primary mt-2" onClick={fetchCityOptions}>
        Search City
      </button>

      {error && <p className="text-danger mt-3">{error}</p>}

      {cityOptions.length > 0 && (
        <div className="mt-3">
          <h5>Select a city:</h5>
          <ul className="list-group">
            {cityOptions.map((option, index) => (
              <li
                key={index}
                className="list-group-item list-group-item-action"
                onClick={() =>
                  fetchWeather(option.geometry.lat, option.geometry.lng, option.formatted)
                }
                style={{ cursor: "pointer" }}
              >
                {option.formatted}
              </li>
            ))}
          </ul>
        </div>
      )}

      {loading && (
        <div className="mt-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {weather && (
        <div className="mt-4 p-3 rounded border">
          <h3>{weather.city}</h3>
          <p>Temperature: {weather.temperature}°C</p>
          <p>Wind Speed: {weather.windSpeed} km/h</p>
          <p>Condition: {weather.condition}</p>
        </div>
      )}
    </div>
  );
};

export default WeatherApp;

