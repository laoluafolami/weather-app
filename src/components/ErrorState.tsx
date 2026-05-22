"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg-primary)" }}>
      <div className="text-center max-w-md">
        <div className="inline-flex p-4 rounded-2xl bg-red-500/10 mb-4">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
          Unable to load weather data
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-tertiary)" }}>{message}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl transition-colors border border-blue-400/20"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
        <p className="text-xs mt-6" style={{ color: "var(--text-muted)" }}>
          Make sure you have set OPENWEATHERMAP_API_KEY in .env.local
        </p>
      </div>
    </div>
  );
}
