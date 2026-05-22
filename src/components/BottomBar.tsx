"use client";

import { motion } from "framer-motion";
import { Calendar, TrendingUp, AlertTriangle } from "lucide-react";
import { WeatherAlert, DailyWeather } from "@/types/weather";

interface Props {
  alerts?: WeatherAlert[];
  daily: DailyWeather[];
}

export default function BottomBar({ alerts, daily }: Props) {
  const avgTemp = Math.round(daily.slice(0, 7).reduce((s, d) => s + (d.temp_min + d.temp_max) / 2, 0) / 7);
  const rainyDays = daily.filter((d) => d.pop > 30).length;
  const trend = daily[1] ? (daily[1].temp_max > daily[0].temp_max ? "warming" : daily[1].temp_max < daily[0].temp_max ? "cooling" : "stable") : "stable";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="glass-card px-4 py-2.5"
      style={{
        background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(59,130,246,0.06))",
        borderColor: "rgba(99,102,241,0.15)"
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
            Avg <strong style={{ color: "var(--text-primary)" }}>{avgTemp}°</strong> this week
            {rainyDays > 0 ? ` · ${rainyDays} rainy day${rainyDays > 1 ? "s" : ""}` : " · Clear skies"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
            Tomorrow: <strong style={{ color: "var(--text-primary)" }}>{trend}</strong>
          </span>
        </div>
        {alerts && alerts.length > 0 && (
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/15">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] text-amber-300 font-medium truncate max-w-48">{alerts[0].event}</span>
          </div>
        )}
        <span className="text-[9px] ml-auto" style={{ color: "var(--text-muted)" }}>Powered by OpenWeatherMap</span>
      </div>
    </motion.div>
  );
}
