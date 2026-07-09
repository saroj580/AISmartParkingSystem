"use client";

import { cn } from "@/lib/cn";

const DURATIONS = [1, 2, 3, 4, 6, 8, 24];
const START_HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

function nextDays(n: number) {
  const days: Date[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

export function DateStep({
  selectedDate,
  onSelect,
}: {
  selectedDate: Date | null;
  onSelect: (d: Date) => void;
}) {
  const days = nextDays(14);
  return (
    <div>
      <h2 className="text-[15px] font-semibold">Choose a date</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Select when you’ll arrive.
      </p>
      <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
        {days.map((d) => {
          const isSelected =
            selectedDate?.toDateString() === d.toDateString();
          const isToday = d.toDateString() === new Date().toDateString();
          return (
            <button
              key={d.toISOString()}
              onClick={() => onSelect(d)}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-[var(--radius-md)] border py-3 transition-colors",
                isSelected
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-border bg-card hover:border-border-strong",
              )}
            >
              <span className="text-[10px] font-medium uppercase opacity-70">
                {d.toLocaleDateString("en-US", { weekday: "short" })}
              </span>
              <span className="text-base font-semibold">{d.getDate()}</span>
              {isToday && (
                <span className="text-[9px] font-medium opacity-70">Today</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TimeStep({
  openTime,
  closeTime,
  startHour,
  duration,
  onSelectStart,
  onSelectDuration,
}: {
  openTime: string;
  closeTime: string;
  startHour: number | null;
  duration: number | null;
  onSelectStart: (h: number) => void;
  onSelectDuration: (d: number) => void;
}) {
  const openHour = parseInt(openTime.split(":")[0] ?? "0", 10);
  const closeHour = closeTime === "23:59" ? 23 : parseInt(closeTime.split(":")[0] ?? "23", 10);
  const validHours = START_HOURS.filter((h) => h >= openHour && h <= closeHour);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[15px] font-semibold">Arrival time</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Lot hours: {openTime === "00:00" && closeTime === "23:59" ? "24 hours" : `${openTime} – ${closeTime}`}
        </p>
        <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {validHours.map((h) => {
            const label =
              h === 12 ? "12:00 PM" : h > 12 ? `${h - 12}:00 PM` : `${h}:00 AM`;
            return (
              <button
                key={h}
                onClick={() => onSelectStart(h)}
                className={cn(
                  "rounded-[var(--radius-sm)] border px-2 py-2.5 text-xs font-medium transition-colors",
                  startHour === h
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-border bg-card hover:border-border-strong",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-[15px] font-semibold">Duration</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          How long will you park?
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => onSelectDuration(d)}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-medium transition-colors",
                duration === d
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-border bg-card hover:border-border-strong",
              )}
            >
              {d === 24 ? "Full day" : `${d}h`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
