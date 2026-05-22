"use client";

import { CurrentWeather as CurrentWeatherType } from "@/types/weather";
import { getWeatherIconUrl, formatFullDay, getTemperatureColor } from "@/lib/utils";
import { motion } from "framer-motion";
import { MapPin, Thermometer, Droplets, Wind, Eye, Sun } from "lucide-react";

interface Props {
  data: CurrentWeatherType;
  location: { name: string; country: string };
  selectedDay?: { dt: number; description: string; icon: string; temp_min: number; temp_max: number } | null;
}

export default function CurrentWeather({ data, location, selectedDay }: Props) {
  const displayTemp = selectedDay ? `${selectedDay.temp_min}° / ${selectedDay.temp_max}°` : `${data.temp}°`;
  const displayDescription = selectedDay ? selectedDay.description : data.description;
  const displayIcon = selectedDay ? selectedDay.icon : data.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card h-full flex flex-col relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, 
          rgba(59, 130, 246, 0.15) 0%, 
          rgba(99, 102, 241, 0.12) 50%, 
          rgba(168, 85, 247, 0.1) 100%)`,
        boxShadow: '0 8px 32px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* Enhanced Glow with multiple layers */}
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none animate-pulse-slow"
        style={{ background: `radial-gradient(circle, ${getTemperatureColor(data.temp)} 0%, transparent 70%)` }}
      />
      <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: `radial-gradient(circle, rgba(168, 85, 247, 0.6) 0%, transparent 70%)` }}
      />

      <div className="relative z-10 p-4 flex flex-col flex-1">
        {/* Location */}
        <div className="flex items-center gap-1.5 mb-0.5">
          <MapPin className="w-3 h-3 text-blue-400" />
          <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
            {location.name}, {location.country}
          </span>
        </div>
        <p className="text-[10px] mb-3" style={{ color: "var(--text-tertiary)" }}>
          {formatFullDay(selectedDay?.dt || data.dt)}
        </p>

        {/* Temp + Icon */}
        <div className="flex items-center justify-between flex-1">
          <div>
            <motion.p
              className="text-6xl md:text-7xl font-extralight tracking-tighter leading-none"
              style={{ color: "var(--text-primary)" }}
              key={displayTemp}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
            >
              {displayTemp}
            </motion.p>
            <p className="text-sm capitalize mt-1 font-medium" style={{ color: "var(--text-secondary)" }}>
              {displayDescription}
            </p>
            {!selectedDay && (
              <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                Feels like {data.feels_like}°
              </p>
            )}
          </div>
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <img src={getWeatherIconUrl(displayIcon)} alt={displayDescription}
              className="w-24 h-24 md:w-28 md:h-28 drop-shadow-2xl"
            />
          </motion.div>
        </div>

        {/* Compact Stats Row */}
        <div className="grid grid-cols-3 gap-1.5 mt-3">
          <MiniStat icon={<Thermometer className="w-3 h-3" />} label="Feels" value={`${data.feels_like}°`} color="orange" />
          <MiniStat icon={<Droplets className="w-3 h-3" />} label="Humid" value={`${data.humidity}%`} color="blue" />
          <MiniStat icon={<Wind className="w-3 h-3" />} label="Wind" value={`${data.wind_speed}`} color="cyan" />
          <MiniStat icon={<Eye className="w-3 h-3" />} label="Vis" value={`${data.visibility}km`} color="emerald" />
          <MiniStat icon={<Sun className="w-3 h-3" />} label="UV" value={`${data.uvi}`} color="amber" />
          <MiniStat icon={<Droplets className="w-3 h-3" />} label="Dew" value={`${data.dew_point}°`} color="teal" />
        </div>
      </div>
    </motion.div>
  );
}

const colors: Record<string, { bg: string; border: string; icon: string }> = {
  orange: { bg: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(251,146,60,0.1))", border: "rgba(249,115,22,0.3)", icon: "text-orange-400" },
  blue: { bg: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(96,165,250,0.1))", border: "rgba(59,130,246,0.3)", icon: "text-blue-400" },
  cyan: { bg: "linear-gradient(135deg, rgba(6,182,212,0.15), rgba(34,211,238,0.1))", border: "rgba(6,182,212,0.3)", icon: "text-cyan-400" },
  emerald: { bg: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(52,211,153,0.1))", border: "rgba(16,185,129,0.3)", icon: "text-emerald-400" },
  amber: { bg: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(251,191,36,0.1))", border: "rgba(245,158,11,0.3)", icon: "text-amber-400" },
  teal: { bg: "linear-gradient(135deg, rgba(20,184,166,0.15), rgba(45,212,191,0.1))", border: "rgba(20,184,166,0.3)", icon: "text-teal-400" },
};

function MiniStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const c = colors[color] || colors.blue;
  return (
    <motion.div 
      className="rounded-lg p-1.5 transition-all hover:scale-105" 
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className={`flex items-center gap-1 ${c.icon} mb-0.5`}>
        {icon}
        <span className="text-[9px]" style={{ color: "var(--text-tertiary)" }}>{label}</span>
      </div>
      <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
    </motion.div>
  );
}
