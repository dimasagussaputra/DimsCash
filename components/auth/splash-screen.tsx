"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const SPLASH_MS = 2500;
const FADE_MS = 500;
const RING_RADIUS = 36;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function SplashScreen() {
  const [phase, setPhase] = useState<"visible" | "leaving" | "gone">("visible");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = performance.now();

    const tickId = setInterval(() => {
      setProgress(
        Math.min(
          100,
          Math.round(((performance.now() - start) / SPLASH_MS) * 100)
        )
      );
    }, 50);

    const hideTimer = setTimeout(() => {
      setProgress(100);
      setPhase("leaving");
    }, SPLASH_MS);
    const removeTimer = setTimeout(
      () => setPhase("gone"),
      SPLASH_MS + FADE_MS
    );

    return () => {
      clearInterval(tickId);
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-teal-950 text-white transition-opacity duration-500 ease-out ${
        phase === "leaving"
          ? "pointer-events-none opacity-0"
          : "opacity-100"
      }`}
    >
      <div className="absolute left-1/2 top-1/2 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-400/10 blur-3xl" />

      <div className="animate-fade-up relative flex flex-col items-center">
        <span className="animate-splash-pulse shadow-teal-950/50 mx-auto flex size-20 items-center justify-center rounded-full bg-white/5 p-3 shadow-lg ring-1 ring-primary/60">
          <Image
            src="/DimsCash.jpg"
            alt=""
            width={56}
            height={56}
            className="size-full rounded-full object-cover"
            priority
          />
        </span>

        <p className="mt-6 text-3xl font-bold tracking-tight">DimsCash</p>

        <div className="relative mt-10 flex size-20 items-center justify-center">
          <svg viewBox="0 0 80 80" className="size-full -rotate-90">
            <circle
              cx="40"
              cy="40"
              r={RING_RADIUS}
              fill="none"
              strokeWidth="5"
              className="stroke-white/10"
            />
            <circle
              cx="40"
              cy="40"
              r={RING_RADIUS}
              fill="none"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress / 100)}
              className="stroke-teal-300 transition-[stroke-dashoffset] duration-100 ease-linear motion-reduce:transition-none"
            />
          </svg>
          <span className="absolute font-mono text-sm font-medium tracking-wider text-teal-100">
            {progress}
            <span className="text-teal-200/60">%</span>
          </span>
        </div>
      </div>

      <p className="absolute bottom-8 font-mono text-[11px] tracking-wide text-teal-100/50">
        &copy; {new Date().getFullYear()} DimsCash
      </p>
    </div>
  );
}
