"use client";

import { DailyWeather } from "@/types/weather";
import { getWeatherIconUrl, formatDay } from "@/lib/utils";
import { motion } from "framer-motion";
import { Droplets } from "lucide-react";

interface Props {
  data: DailyWeather[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export default function WeeklyForecast({ data, selectedIndex, onSelect }: Props) {
  const tempRange = { min: Math.min(...data.map((d) => d.temp_min)), max: Math.max(...data.map((d) => d.temp_max)) };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass-card h-full flex flex-col p-3"
      style={{
        background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(99,102,241,0.06))",
        borderColor: "rgba(59,130,246,0.15)"
      }}
    >
      <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2 flex-shrink-0" style={{ color: "var(--text-tertiary)" }}>
        This Week
      </h3>
      <div className="flex-1 min-h-0 flex flex-col gap-0.5 overflow-y-auto scrollbar-hide">
        {data.map((day, i) => {
          const range = tempRange.max - tempRange.min;
          const leftPct = ((day.temp_min - tempRange.min) / range) * 100;
          const rightPct = ((day.temp_max - tempRange.min) / range) * 100;

          return (
            <motion.button
              key={day.dt}
              onClick={() => onSelect(i)}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all text-left hover:scale-[1.02]"
              style={{
                background: selectedIndex === i 
                  ? "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(168,85,247,0.12))" 
                  : "transparent",
                border: selectedIndex === i 
                  ? "1px solid rgba(96,165,250,0.3)" 
                  : "1px solid transparent",
                boxShadow: selectedIndex === i 
                  ? "0 4px 12px rgba(59,130,246,0.2)" 
                  : "none"
              }}
            >
              <span className="w-12 text-[11px] font-medium flex-shrink-0"
                style={{ color: i === 0 ? "#60a5fa" : "var(--text-tertiary)" }}
              >
                {formatDay(day.dt)}
              </span>

              <div className="flex items-center gap-0.5">
                {day.pop > 0 && (
                  <span className="text-blue-400/60 text-[8px] flex items-center">
                    <Droplets className="w-2 h-2 mr-0.5" />{day.pop}%
                  </span>
                )}
                <img src={getWeatherIconUrl(day.icon)} alt="" className="w-6 h-6" />
              </div>

              <div className="flex-1 flex items-center gap-1.5">
                <span className="text-[10px] w-5 text-right" style={{ color: "var(--text-tertiary)" }}>{day.temp_min}°</span>
                <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-400 via-yellow-400 to-orange-500 opacity-80 shadow-lg"
                    style={{ 
                      marginLeft: `${leftPct}%`, 
                      marginRight: `${100 - rightPct}%`,
                      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)'
                    }}
                  />
                </div>
                <span className="text-[10px] w-5 font-medium" style={{ color: "var(--text-primary)" }}>{day.temp_max}°</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
