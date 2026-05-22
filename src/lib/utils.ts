export function getWeatherIconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString("en-US", {
    hour: "numeric",
    hour12: true,
  });
}

export function formatDay(timestamp: number): string {
  const today = new Date();
  const date = new Date(timestamp * 1000);

  if (date.toDateString() === today.toDateString()) return "Today";

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";

  return date.toLocaleDateString("en-US", { weekday: "short" });
}

export function formatFullDay(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function getWindDirection(deg: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
}

export function getUVIndexLabel(uvi: number): string {
  if (uvi <= 2) return "Low";
  if (uvi <= 5) return "Moderate";
  if (uvi <= 7) return "High";
  if (uvi <= 10) return "Very High";
  return "Extreme";
}

export function getAQILabel(aqi: number): string {
  const labels = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
  return labels[aqi - 1] || "Unknown";
}

export function getTemperatureColor(temp: number): string {
  if (temp <= 0) return "#60a5fa"; // blue
  if (temp <= 10) return "#6ee7b7"; // green
  if (temp <= 20) return "#fcd34d"; // yellow
  if (temp <= 30) return "#fb923c"; // orange
  return "#ef4444"; // red
}

export function getWeatherGradient(main: string): string {
  switch (main?.toLowerCase()) {
    case "clear":
      return "from-amber-400/20 via-orange-500/10 to-transparent";
    case "clouds":
      return "from-slate-400/20 via-slate-500/10 to-transparent";
    case "rain":
    case "drizzle":
      return "from-blue-400/20 via-blue-600/10 to-transparent";
    case "thunderstorm":
      return "from-purple-400/20 via-purple-600/10 to-transparent";
    case "snow":
      return "from-blue-200/20 via-white/10 to-transparent";
    case "mist":
    case "fog":
    case "haze":
      return "from-gray-400/20 via-gray-500/10 to-transparent";
    default:
      return "from-sky-400/20 via-blue-500/10 to-transparent";
  }
}
