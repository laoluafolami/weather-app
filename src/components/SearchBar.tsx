"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  name: string;
  country: string;
  lat: number;
  lon: number;
  state?: string;
}

interface Props {
  onLocationSelect: (lat: number, lon: number) => void;
}

export default function SearchBar({ onLocationSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const search = async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
    } catch {
      setResults([]);
    }
    setLoading(false);
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    setIsOpen(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => search(value), 300);
  };

  const handleSelect = (result: SearchResult) => {
    onLocationSelect(result.lat, result.lon);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search city..."
          className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all bg-slate-700/50 border border-slate-600/50 text-white placeholder-gray-400"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity text-gray-400 hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (results.length > 0 || loading) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute top-full mt-3 w-full rounded-xl overflow-hidden shadow-2xl z-[99999] max-h-96 overflow-y-auto"
            style={{ 
              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.98) 0%, rgba(37, 99, 235, 0.98) 100%)",
              border: "2px solid rgba(96, 165, 250, 0.6)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 10px 20px -5px rgba(0, 0, 0, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.3)"
            }}
          >
            {loading ? (
              <div className="p-5 text-center text-base font-medium text-white">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Searching...
                </div>
              </div>
            ) : (
              results.map((result, index) => (
                <button
                  key={`${result.lat}-${result.lon}`}
                  onClick={() => handleSelect(result)}
                  className="w-full px-5 py-4 text-left transition-all flex items-center gap-3 hover:bg-white/30 active:bg-white/40"
                  style={{ 
                    borderBottom: index < results.length - 1 ? "1px solid rgba(255, 255, 255, 0.25)" : "none",
                    background: "transparent"
                  }}
                >
                  <Search className="w-5 h-5 flex-shrink-0 text-white" />
                  <div className="flex-1">
                    <p className="text-base font-semibold text-white mb-0.5">{result.name}</p>
                    <p className="text-sm text-blue-100">
                      {result.state ? `${result.state}, ` : ""}
                      {result.country}
                    </p>
                  </div>
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
