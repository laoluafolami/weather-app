"use client";

import { CurrentWeather, DailyWeather, HourlyWeather } from "@/types/weather";
import { motion } from "framer-motion";
import { Sparkles, Clock, CalendarDays, Umbrella } from "lucide-react";
import { formatTime, formatDay } from "@/lib/utils";

interface Props {
  current: CurrentWeather;
  daily: DailyWeather[];
  hourly: HourlyWeather[];
  location: { name: string; country: string };
}

function analyzeRainPeriods(hourly: HourlyWeather[]) {
  const periods: { start: number; end: number; maxPop: number; duration: number }[] = [];
  let cur: typeof periods[0] | null = null;
  for (const h of hourly) {
    if (h.pop >= 30) {
      if (!cur) cur = { start: h.dt, end: h.dt, maxPop: h.pop, duration: 1 };
      else { cur.end = h.dt; cur.maxPop = Math.max(cur.maxPop, h.pop); cur.duration++; }
    } else if (cur) { periods.push(cur); cur = null; }
  }
  if (cur) periods.push(cur);
  return periods;
}

function generateSummary(current: CurrentWeather, daily: DailyWeather[], hourly: HourlyWeather[], location: { name: string; country: string }) {
  const { temp, humidity, wind_speed, description } = current;
  const today = daily[0];
  const tomorrow = daily[1];

  let feeling = temp <= 10 ? "chilly" : temp <= 18 ? "cool" : temp <= 24 ? "mild" : temp <= 30 ? "warm" : temp <= 35 ? "hot" : "extremely hot";
  let wind = wind_speed > 30 ? "Strong winds" : wind_speed > 15 ? "Breezy" : "Calm";
  let humid = humidity > 80 ? "Very humid" : humidity < 40 ? "Dry air" : "";

  const todayText = `${feeling.charAt(0).toUpperCase() + feeling.slice(1)} in ${location.name} — ${description}. ${temp}°C${current.feels_like !== temp ? ` (feels ${current.feels_like}°)` : ""}. ${wind}. ${humid}`.trim();

  const rainPeriods = analyzeRainPeriods(hourly);
  let rainInfo: { text: string; start: string; end: string; prob: number; hours: number } | null = null;
  if (rainPeriods.length > 0) {
    const main = rainPeriods.reduce((a, b) => a.duration > b.duration ? a : b);
    rainInfo = { text: `Rain from ${formatTime(main.start)} for ~${main.duration}h`, start: formatTime(main.start), end: formatTime(main.end + 10800), prob: main.maxPop, hours: main.duration };
  }

  let tomorrowText = "";
  if (tomorrow) {
    const diff = tomorrow.temp_max - today.temp_max;
    const trend = diff > 3 ? "warmer" : diff < -3 ? "cooler" : "similar";
    const rain = tomorrow.pop >= 70 ? `Rain likely (${tomorrow.pop}%)` : tomorrow.pop >= 40 ? `Rain possible (${tomorrow.pop}%)` : tomorrow.pop >= 20 ? `Low rain (${tomorrow.pop}%)` : "Dry";
    tomorrowText = `${formatDay(tomorrow.dt)}: ${trend}, ${tomorrow.temp_max}°/${tomorrow.temp_min}°. ${rain}.`;
  }

  return { todayText, rainInfo, tomorrowText };
}

export default function WeatherSummary({ current, daily, hourly, location }: Props) {
  const { todayText, rainInfo, tomorrowText } = generateSummary(current, daily, hourly, location);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="glass-card briefing-card p-3"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2.5">
        <motion.div className="p-1 rounded-lg" style={{ background: "rgba(99,102,241,0.12)" }}
          animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        </motion.div>
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-primary)" }}>Briefing</span>
        <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full font-bold"
          style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.15)" }}>
          <span className="w-1 h-1 rounded-full bg-green-500 live-dot" />
          <span className="shimmer-text">Live</span>
        </span>
      </div>

      {/* Now */}
      <div className="briefing-section briefing-section-blue rounded-r-lg px-2.5 py-1.5 mb-1.5">
        <div className="flex items-center gap-1 mb-0.5">
          <Clock className="w-2.5 h-2.5 text-blue-400" />
          <span className="text-[8px] font-bold uppercase tracking-widest text-blue-400">Now</span>
        </div>
        <p className="text-[11px] leading-snug" style={{ color: "var(--text-secondary)" }}>{todayText}</p>
      </div>

      {/* Rain */}
      {rainInfo && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="briefing-section briefing-section-rain rounded-r-lg px-2.5 py-1.5 mb-1.5">
          <div className="flex items-center gap-1 mb-0.5">
            <Umbrella className="w-2.5 h-2.5 text-cyan-400" />
            <span className="text-[8px] font-bold uppercase tracking-widest text-cyan-400">Rain</span>
            <span className="text-[8px] px-1 py-0.5 rounded-full font-bold text-cyan-300" style={{ background: "rgba(6,182,212,0.12)" }}>{rainInfo.prob}%</span>
          </div>
          <p className="text-[11px] leading-snug" style={{ color: "var(--text-secondary)" }}>{rainInfo.text}</p>
          <div className="flex gap-2 mt-1">
            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold text-cyan-300" style={{ background: "rgba(6,182,212,0.08)" }}>{rainInfo.start} → {rainInfo.end}</span>
          </div>
        </motion.div>
      )}

      {/* Tomorrow */}
      {tomorrowText && (
        <div className="briefing-section briefing-section-purple rounded-r-lg px-2.5 py-1.5">
          <div className="flex items-center gap-1 mb-0.5">
            <CalendarDays className="w-2.5 h-2.5 text-purple-400" />
            <span className="text-[8px] font-bold uppercase tracking-widest text-purple-400">Tomorrow</span>
          </div>
          <p className="text-[11px] leading-snug" style={{ color: "var(--text-secondary)" }}>{tomorrowText}</p>
        </div>
      )}
    </motion.div>
  );
}
