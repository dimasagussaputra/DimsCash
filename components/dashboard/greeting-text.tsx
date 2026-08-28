"use client";

function greetingForHour(hour: number): string {
  if (hour >= 4 && hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 19) return "Selamat sore";
  return "Selamat malam";
}

export function GreetingText({ name }: { name?: string }) {
  const greeting = greetingForHour(new Date().getHours());
  return (
    <h1 className="text-2xl font-bold tracking-tight">
      {greeting}
      {name ? <>, {name}</> : null}
    </h1>
  );
}
