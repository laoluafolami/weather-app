"use client";

import { HourlyWeather } from "@/types/weather";
import { getWeatherIconUrl, formatTime, getTemperatureColor } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props { data: HourlyWeather[] }

export default function HourlyForecast({ data }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -180 : 180, behavior: "smooth" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="glass-card p-3"
      style={{
        background: "linear-gradient(135deg, rgba(20,184,166,0.08), rgba(6,182,212,0.06))",
        borderColor: "rgba(20,184,166,0.15)"
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-tertiary)" }}>24 Hours</h3>
        <div className="flex gap-0.5">
          <button onClick={() => scroll("left")} className="p-0.5 rounded" style={{ color: "var(--text-tertiary)" }}><ChevronLeft className="w-3.5 h-3.5" /></button>
          <button onClick={() => scroll("right")} className="p-0.5 rounded" style={{ color: "var(--text-tertiary)" }}><ChevronRight className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-2 overflow-x-auto scrollbar-hide">
        {data.map((hour, i) => (
          <motion.div
            key={hour.dt}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.015 }}
            className="flex-shrink-0 flex flex-col items-center gap-0.5 p-2 rounded-xl min-w-[56px] transition-all hover:scale-105 hover:shadow-lg"
            style={{
              background: i === 0 
                ? "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(37,99,235,0.12))" 
                : "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
              border: i === 0 
                ? "1px solid rgba(96,165,250,0.3)" 
                : "1px solid rgba(255,255,255,0.1)",
              boxShadow: i === 0 
                ? "0 4px 12px rgba(59,130,246,0.2)" 
                : "none"
            }}
          >
            <span className="text-[9px] font-medium" style={{ color: "var(--text-tertiary)" }}>
              {i === 0 ? "Now" : formatTime(hour.dt)}
            </span>
            <img src={getWeatherIconUrl(hour.icon)} alt="" className="w-7 h-7" />
            <span className="text-xs font-semibold" style={{ color: getTemperatureColor(hour.temp) }}>{hour.temp}°</span>
            {hour.pop > 0 && <span className="text-blue-400/70 text-[8px]">{hour.pop}%</span>}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
