"use client";

import { CurrentWeather } from "@/types/weather";
import { motion } from "framer-motion";
import { Wind, Droplets, Gauge, Eye, Sun, Sunrise, Cloud, Droplet } from "lucide-react";
import { formatTime, getWindDirection, getUVIndexLabel } from "@/lib/utils";

interface Props { data: CurrentWeather }

export default function StatsGrid({ data }: Props) {
  const stats = [
    { icon: <Wind className="w-3.5 h-3.5" />, label: "Wind", value: `${data.wind_speed}`, sub: `${getWindDirection(data.wind_deg)} · km/h`, cls: "stat-card-cyan", accent: "rgba(6,182,212,0.5)", iconBg: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(34,211,238,0.15))", iconC: "text-cyan-400", cardBg: "linear-gradient(135deg, rgba(6,182,212,0.12), rgba(34,211,238,0.08))" },
    { icon: <Droplets className="w-3.5 h-3.5" />, label: "Humidity", value: `${data.humidity}%`, sub: data.humidity > 70 ? "High" : data.humidity > 40 ? "Moderate" : "Low", cls: "stat-card-blue", accent: "rgba(59,130,246,0.5)", iconBg: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(96,165,250,0.15))", iconC: "text-blue-400", cardBg: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(96,165,250,0.08))" },
    { icon: <Gauge className="w-3.5 h-3.5" />, label: "Pressure", value: `${data.pressure}`, sub: "hPa", cls: "stat-card-violet", accent: "rgba(139,92,246,0.5)", iconBg: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(167,139,250,0.15))", iconC: "text-violet-400", cardBg: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(167,139,250,0.08))" },
    { icon: <Eye className="w-3.5 h-3.5" />, label: "Visibility", value: `${data.visibility} km`, sub: data.visibility > 8 ? "Clear" : "Moderate", cls: "stat-card-emerald", accent: "rgba(16,185,129,0.5)", iconBg: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(52,211,153,0.15))", iconC: "text-emerald-400", cardBg: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(52,211,153,0.08))" },
    { icon: <Sun className="w-3.5 h-3.5" />, label: "UV", value: `${data.uvi}`, sub: getUVIndexLabel(data.uvi), cls: "stat-card-amber", accent: "rgba(245,158,11,0.5)", iconBg: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(251,191,36,0.15))", iconC: "text-amber-400", cardBg: "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,191,36,0.08))" },
    { icon: <Sunrise className="w-3.5 h-3.5" />, label: "Sunrise", value: formatTime(data.sunrise), sub: `↓ ${formatTime(data.sunset)}`, cls: "stat-card-orange", accent: "rgba(249,115,22,0.5)", iconBg: "linear-gradient(135deg, rgba(249,115,22,0.2), rgba(251,146,60,0.15))", iconC: "text-orange-400", cardBg: "linear-gradient(135deg, rgba(249,115,22,0.12), rgba(251,146,60,0.08))" },
    { icon: <Cloud className="w-3.5 h-3.5" />, label: "Clouds", value: `${data.clouds}%`, sub: data.clouds > 75 ? "Overcast" : data.clouds > 25 ? "Partly" : "Clear", cls: "stat-card-slate", accent: "rgba(100,116,139,0.5)", iconBg: "linear-gradient(135deg, rgba(100,116,139,0.2), rgba(148,163,184,0.15))", iconC: "text-slate-400", cardBg: "linear-gradient(135deg, rgba(100,116,139,0.12), rgba(148,163,184,0.08))" },
    { icon: <Droplet className="w-3.5 h-3.5" />, label: "Dew", value: `${data.dew_point}°`, sub: data.dew_point > 20 ? "Humid" : "OK", cls: "stat-card-teal", accent: "rgba(20,184,166,0.5)", iconBg: "linear-gradient(135deg, rgba(20,184,166,0.2), rgba(45,212,191,0.15))", iconC: "text-teal-400", cardBg: "linear-gradient(135deg, rgba(20,184,166,0.12), rgba(45,212,191,0.08))" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="glass-card h-full flex flex-col p-3"
      style={{
        background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.06))",
        borderColor: "rgba(99,102,241,0.15)"
      }}
    >
      <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2 flex-shrink-0" style={{ color: "var(--text-tertiary)" }}>
        Details
      </h3>
      <div className="grid grid-cols-2 gap-1.5 flex-1">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 + i * 0.03 }}
            className={`stat-card-glow ${stat.cls} rounded-lg p-2 relative overflow-hidden`}
            style={{ 
              background: stat.cardBg,
              border: `1px solid ${stat.accent}`,
              boxShadow: `0 4px 12px ${stat.accent.replace('0.5', '0.15')}`
            }}
          >
            <div className="absolute top-0 left-2 right-2 h-[1px] opacity-60" style={{ background: stat.accent }} />
            <div className="flex items-center gap-1 mb-1">
              <div className="p-0.5 rounded" style={{ background: stat.iconBg }}>
                <span className={stat.iconC}>{stat.icon}</span>
              </div>
              <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>{stat.label}</span>
            </div>
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{stat.value}</p>
            <p className="text-[9px]" style={{ color: "var(--text-tertiary)" }}>{stat.sub}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
