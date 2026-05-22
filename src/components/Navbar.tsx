"use client";

import SearchBar from "./SearchBar";
import { CloudSun, Locate, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "./ThemeProvider";

interface Props {
  onLocationSelect: (lat: number, lon: number) => void;
  onGetCurrentLocation: () => void;
}

export default function Navbar({ onLocationSelect, onGetCurrentLocation }: Props) {
  const { theme, toggle } = useTheme();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/10 border border-blue-400/20">
          <CloudSun className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h1 className="font-semibold text-lg tracking-tight" style={{ color: "var(--text-primary)" }}>
            WeatherView
          </h1>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Real-time weather dashboard</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <SearchBar onLocationSelect={onLocationSelect} />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onGetCurrentLocation}
          className="p-2.5 rounded-xl border transition-all"
          style={{
            background: "var(--bg-input)",
            borderColor: "var(--border-input)",
            color: "var(--text-secondary)",
          }}
          title="Use current location"
        >
          <Locate className="w-4 h-4" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggle}
          className="p-2.5 rounded-xl border transition-all"
          style={{
            background: "var(--bg-input)",
            borderColor: "var(--border-input)",
            color: "var(--text-secondary)",
          }}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          <motion.div
            key={theme}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </motion.div>
        </motion.button>
      </div>
    </motion.nav>
  );
}
