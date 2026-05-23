"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { WeatherData } from "@/types/weather";
import { motion } from "framer-motion";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import SearchBar from "@/components/SearchBar";
import { useTheme } from "@/components/ThemeProvider";
import { formatTime, getWeatherIconUrl, formatDay } from "@/lib/utils";
import { Sun, Moon, Locate, Wind, Droplets, MapPin, Calendar, Eye, Gauge, CloudRain, Thermometer } from "lucide-react";

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const initialized = useRef(false);
  const { theme, toggle } = useTheme();

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch weather data");
      }
      const data: WeatherData = await res.json();
      setWeather(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(6.5244, 3.3792)
      );
    } else {
      fetchWeather(6.5244, 3.3792);
    }
  }, [fetchWeather]);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      getCurrentLocation();
    }
  }, [getCurrentLocation]);

  if (loading && !weather) return <LoadingState />;
  if (error && !weather)
    return <ErrorState message={error} onRetry={getCurrentLocation} />;
  if (!weather) return null;

  // Generate detailed weather summary with rain timing for 3 days
  const generateWeatherSummary = () => {
    const days = weather.daily.slice(0, 3); // Get first 3 days
    
    // Analyze hourly data for rain timing (next 24 hours for today)
    const getRainTiming = () => {
      const now = new Date();
      const rainPeriods: { start: number; end: number; intensity: number }[] = [];
      let currentRainStart: number | null = null;
      
      for (let i = 0; i < Math.min(24, weather.hourly.length); i++) {
        const hour = weather.hourly[i];
        const hourTime = new Date(hour.dt * 1000);
        
        if (hour.pop > 30) { // 30% or more chance of rain
          if (currentRainStart === null) {
            currentRainStart = i;
          }
        } else {
          if (currentRainStart !== null) {
            rainPeriods.push({
              start: currentRainStart,
              end: i - 1,
              intensity: weather.hourly[currentRainStart].pop
            });
            currentRainStart = null;
          }
        }
      }
      
      // Close any open rain period
      if (currentRainStart !== null) {
        rainPeriods.push({
          start: currentRainStart,
          end: Math.min(23, weather.hourly.length - 1),
          intensity: weather.hourly[currentRainStart].pop
        });
      }
      
      return rainPeriods;
    };
    
    const rainPeriods = getRainTiming();
    
    const formatHour = (h: number) => {
      if (h === 0) return '12 AM';
      if (h < 12) return `${h} AM`;
      if (h === 12) return '12 PM';
      return `${h - 12} PM`;
    };
    
    const generateDaySummary = (day: any, dayIndex: number, dayName: string) => {
      const temp = `High of ${Math.round(day.temp_max)}°C, low of ${Math.round(day.temp_min)}°C`;
      const condition = day.description.charAt(0).toUpperCase() + day.description.slice(1);
      
      let rainInfo = '';
      
      // For today, use detailed hourly rain timing
      if (dayIndex === 0 && rainPeriods.length > 0) {
        const firstRain = rainPeriods[0];
        const startHour = new Date(weather.hourly[firstRain.start].dt * 1000).getHours();
        const duration = firstRain.end - firstRain.start + 1;
        
        if (firstRain.start === 0) {
          rainInfo = `Rain expected now, lasting ${duration} hour${duration > 1 ? 's' : ''} (${Math.round(firstRain.intensity)}% chance). `;
        } else {
          rainInfo = `Rain expected around ${formatHour(startHour)}, lasting ${duration} hour${duration > 1 ? 's' : ''} (${Math.round(firstRain.intensity)}% chance). `;
        }
        
        if (rainPeriods.length > 1) {
          rainInfo += `Additional showers possible later.`;
        } else {
          rainInfo += `Clear skies after.`;
        }
      } else {
        // For other days, use daily rain probability
        if (day.pop > 70) {
          rainInfo = `Heavy rain expected (${day.pop}% chance). Plan indoor activities.`;
        } else if (day.pop > 40) {
          rainInfo = `Rain likely (${day.pop}% chance). Keep an umbrella handy.`;
        } else if (day.pop > 20) {
          rainInfo = `Slight chance of rain (${day.pop}%).`;
        } else {
          rainInfo = `Clear skies expected. Great day ahead!`;
        }
      }
      
      // Add wind and humidity for today
      if (dayIndex === 0) {
        const wind = `Wind speeds around ${Math.round(weather.current.wind_speed)} km/h`;
        const humidity = `Humidity at ${weather.current.humidity}%`;
        return `${condition}. ${temp}. ${wind}. ${humidity}. ${rainInfo}`;
      }
      
      return `${condition} with temperatures from ${temp}. ${rainInfo}`;
    };
    
    const summaries = days.map((day, index) => {
      const dayNames = ['Today', 'Tomorrow', 'Day After Tomorrow'];
      return {
        day: dayNames[index],
        summary: generateDaySummary(day, index, dayNames[index])
      };
    });
    
    return summaries;
  };

  const weatherSummaries = generateWeatherSummary();

  return (
    <div className="h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 rounded-full opacity-20 animate-float"
          style={{ background: "var(--bg-glow-1)", top: "10%", right: "15%", filter: "blur(80px)" }}
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full opacity-15 animate-float-slow"
          style={{ background: "var(--bg-glow-2)", bottom: "15%", left: "10%", filter: "blur(100px)" }}
        />
        <motion.div
          className="absolute w-72 h-72 rounded-full opacity-10 animate-float-slower"
          style={{ background: "var(--bg-glow-1)", top: "50%", left: "50%", filter: "blur(90px)" }}
        />
      </div>

      {/* Header */}
      <div className="relative z-50 px-4 sm:px-6 md:px-8 py-3 glass-card" style={{ borderRadius: 0, borderLeft: 0, borderRight: 0, borderTop: 0, overflow: "visible" }}>
        <div className="w-full mx-auto flex items-center justify-between gap-4">
          <div className="flex-shrink min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-light truncate" style={{ color: "var(--text-primary)" }}>{formatTime(Math.floor(currentTime.getTime() / 1000))}</h1>
            <p className="text-[10px] sm:text-xs truncate" style={{ color: "var(--text-tertiary)" }}>
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0" style={{ position: "relative", zIndex: 9999 }}>
            <SearchBar onLocationSelect={fetchWeather} />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={getCurrentLocation}
              className="p-2 sm:p-3 rounded-full transition-all shadow-sm"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-card)" }}
            >
              <Locate className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "var(--text-primary)" }} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggle()}
              className="p-2 sm:p-3 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 transition-all shadow-sm"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-[calc(100vh-80px)] overflow-hidden">
        <div className="w-full mx-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 h-full">
            {/* Left Column - Hero Card + Summary */}
            <div className="lg:col-span-4 flex flex-col gap-3 sm:gap-4 h-full overflow-y-auto scrollbar-hide">
              {/* Hero Weather Card */}
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="glass-card p-4 sm:p-6 md:p-8 relative overflow-hidden flex-shrink-0"
                style={{ minHeight: '300px' }}
              >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-cyan-400/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-400/15 to-pink-400/10 rounded-full blur-3xl" />
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                {/* Location and Date */}
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3" style={{ color: "var(--text-secondary)" }}>
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="text-sm sm:text-base md:text-lg font-medium truncate">{weather.location.name}, {weather.location.country}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 sm:gap-3" style={{ color: "var(--text-tertiary)" }}>
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm truncate">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Temperature and Weather Icon */}
                <div className="mb-4 sm:mb-6 md:mb-8">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <motion.p 
                        whileHover={{ scale: 1.05 }}
                        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extralight mb-2 sm:mb-3 leading-none" 
                        style={{ color: "var(--text-primary)" }}
                      >
                        {Math.round(weather.current.temp)}°
                      </motion.p>
                      <p className="text-lg sm:text-xl md:text-2xl capitalize font-light mb-1 sm:mb-2 truncate" style={{ color: "var(--text-secondary)" }}>
                        {weather.current.description}
                      </p>
                      <p className="text-xs sm:text-sm" style={{ color: "var(--text-tertiary)" }}>
                        Feels like {Math.round(weather.current.feels_like)}°
                      </p>
                    </div>
                    <motion.img 
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.8 }}
                      src={getWeatherIconUrl(weather.current.icon)} 
                      alt={weather.current.description}
                      className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 flex-shrink-0"
                    />
                  </div>
                </div>

                {/* Weather Details Grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="p-3 sm:p-4 rounded-xl sm:rounded-2xl backdrop-blur-sm bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                      <Wind className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium truncate" style={{ color: "var(--text-tertiary)" }}>Wind Speed</span>
                    </div>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                      {Math.round(weather.current.wind_speed)} <span className="text-xs sm:text-sm font-normal" style={{ color: "var(--text-tertiary)" }}>km/h</span>
                    </p>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="p-3 sm:p-4 rounded-xl sm:rounded-2xl backdrop-blur-sm bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                      <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium truncate" style={{ color: "var(--text-tertiary)" }}>Humidity</span>
                    </div>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                      {weather.current.humidity}<span className="text-xs sm:text-sm font-normal" style={{ color: "var(--text-tertiary)" }}>%</span>
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Weather Summary/Briefing */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="glass-card p-3 sm:p-4 flex-1 overflow-y-auto scrollbar-hide"
            >
              <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <CloudRain className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-400" />
                Weather Briefing
              </h3>
              
              <div className="space-y-2">
                {weatherSummaries.map((item, index) => {
                  const colors = [
                    { bg: 'briefing-section-blue', icon: 'text-blue-400' },
                    { bg: 'briefing-section-purple', icon: 'text-purple-400' },
                    { bg: 'briefing-section-rain', icon: 'text-cyan-400' }
                  ];
                  
                  return (
                    <div key={index} className={`briefing-section ${colors[index].bg} p-2 rounded-xl`}>
                      <div className="flex items-center gap-2 mb-1">
                        <CloudRain className={`w-3 h-3 ${colors[index].icon}`} />
                        <p className="text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>{item.day}</p>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{item.summary}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
            </div>

            {/* Middle Column - Hourly + Stats */}
            <div className="lg:col-span-4 flex flex-col gap-3 sm:gap-4 h-full overflow-y-auto scrollbar-hide">
            {/* 24-Hour Forecast */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="glass-card p-4 sm:p-5 md:p-6 flex-1 flex flex-col"
            >
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: "var(--text-primary)" }}>24-Hour Forecast</h3>
              <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide">
                <div className="flex gap-3 sm:gap-4 h-full pb-2">
                  {weather.hourly.slice(0, 24).map((hour, i) => {
                    const hourTime = new Date(hour.dt * 1000).getHours();
                    const isNow = i === 0;
                    
                    return (
                      <motion.div
                        key={hour.dt}
                        whileHover={{ scale: 1.08, y: -8 }}
                        className={`flex-shrink-0 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-center transition-all flex flex-col justify-between ${
                          isNow 
                            ? 'bg-gradient-to-br from-blue-500/30 via-blue-400/20 to-purple-500/20 border-2 border-blue-400/50 shadow-lg shadow-blue-500/20' 
                            : 'bg-white/5 hover:bg-white/10 border border-white/10'
                        }`}
                        style={{ minWidth: '70px', height: '100%' }}
                      >
                        <div>
                          <p className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${isNow ? 'text-blue-300' : ''}`} style={{ color: isNow ? undefined : "var(--text-tertiary)" }}>
                            {isNow ? 'Now' : `${hourTime}:00`}
                          </p>
                          <motion.img 
                            whileHover={{ rotate: 360, scale: 1.2 }}
                            transition={{ duration: 0.6 }}
                            src={getWeatherIconUrl(hour.icon)} 
                            alt="" 
                            className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-2 sm:mb-3" 
                          />
                        </div>
                        
                        <div>
                          <p className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2" style={{ color: "var(--text-primary)" }}>
                            {Math.round(hour.temp)}°
                          </p>
                          {hour.pop > 0 && (
                            <div className="flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-blue-500/30 border border-blue-400/30">
                              <Droplets className="w-2 h-2 sm:w-3 sm:h-3 text-blue-400" />
                              <span className="text-[10px] sm:text-xs font-semibold text-blue-300">{Math.round(hour.pop)}%</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 flex-shrink-0">
              <motion.div whileHover={{ scale: 1.05 }} className="glass-card p-2 sm:p-3 stat-card-glow stat-card-cyan">
                <div className="flex items-center gap-1 sm:gap-2 mb-1">
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
                  <span className="text-[9px] sm:text-[10px]" style={{ color: "var(--text-tertiary)" }}>Visibility</span>
                </div>
                <p className="text-base sm:text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                  {(weather.current.visibility / 1000).toFixed(1)} km
                </p>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} className="glass-card p-2 sm:p-3 stat-card-glow stat-card-amber">
                <div className="flex items-center gap-1 sm:gap-2 mb-1">
                  <Gauge className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
                  <span className="text-[9px] sm:text-[10px]" style={{ color: "var(--text-tertiary)" }}>Pressure</span>
                </div>
                <p className="text-base sm:text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                  {weather.current.pressure} hPa
                </p>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} className="glass-card p-2 sm:p-3 stat-card-glow stat-card-violet">
                <div className="flex items-center gap-1 sm:gap-2 mb-1">
                  <Thermometer className="w-3 h-3 sm:w-4 sm:h-4 text-violet-400" />
                  <span className="text-[9px] sm:text-[10px]" style={{ color: "var(--text-tertiary)" }}>Feels Like</span>
                </div>
                <p className="text-base sm:text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                  {Math.round(weather.current.feels_like)}°
                </p>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} className="glass-card p-2 sm:p-3 stat-card-glow stat-card-emerald">
                <div className="flex items-center gap-1 sm:gap-2 mb-1">
                  <CloudRain className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
                  <span className="text-[9px] sm:text-[10px]" style={{ color: "var(--text-tertiary)" }}>UV Index</span>
                </div>
                <p className="text-base sm:text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                  {weather.current.uvi}
                </p>
              </motion.div>
            </div>
          </div>

          {/* Right Column - 7-Day Forecast */}
          <div className="lg:col-span-4 h-full flex flex-col overflow-y-auto scrollbar-hide">
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="glass-card p-3 sm:p-4 flex-1 flex flex-col overflow-hidden"
            >
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex-shrink-0" style={{ color: "var(--text-primary)" }}>7-Day Forecast</h3>
              <div className="space-y-2 sm:space-y-3 flex-1 overflow-y-auto scrollbar-hide">
                {weather.daily.slice(0, 7).map((day, i) => (
                  <motion.div
                    key={day.dt}
                    whileHover={{ scale: 1.03, x: 8 }}
                    className={`p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl transition-all backdrop-blur-sm ${
                      i === 0 
                        ? 'bg-gradient-to-r from-blue-500/30 via-blue-400/20 to-purple-500/20 border-2 border-blue-400/50 shadow-lg shadow-blue-500/20' 
                        : 'bg-white/5 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
                        <p className={`text-xs sm:text-sm md:text-base font-semibold w-16 sm:w-20 flex-shrink-0 ${i === 0 ? 'text-blue-300' : ''}`} style={{ color: i === 0 ? undefined : "var(--text-primary)" }}>
                          {i === 0 ? 'Today' : formatDay(day.dt)}
                        </p>
                        <motion.img 
                          whileHover={{ rotate: 360, scale: 1.15 }}
                          transition={{ duration: 0.6 }}
                          src={getWeatherIconUrl(day.icon)} 
                          alt="" 
                          className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex-shrink-0" 
                        />
                        <p className="text-xs sm:text-sm capitalize flex-1 truncate" style={{ color: "var(--text-secondary)" }}>
                          {day.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
                        {day.pop > 0 && (
                          <div className="hidden sm:flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-blue-500/30 border border-blue-400/30">
                            <Droplets className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                            <span className="text-xs sm:text-sm font-semibold text-blue-300">{Math.round(day.pop)}%</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-base sm:text-lg md:text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                            {Math.round(day.temp_max)}°
                          </span>
                          <span className="text-sm sm:text-base md:text-lg font-medium" style={{ color: "var(--text-tertiary)" }}>
                            {Math.round(day.temp_min)}°
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Temperature bar */}
                    <div className="h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((day.temp_max - day.temp_min) / 30) * 100}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className={`h-full rounded-full shadow-lg ${
                          i === 0 
                            ? 'bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400' 
                            : 'bg-gradient-to-r from-blue-400 to-orange-400'
                        }`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
