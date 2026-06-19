import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import LocationInput from "./pages/LocationInput";
import WeatherDisplay from "./pages/WeatherDisplay";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LocationInput />} />
      <Route path="/weather" element={<WeatherDisplay />} />
    </Routes>
  </BrowserRouter>,
);
