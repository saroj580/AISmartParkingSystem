"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useSpring, AnimatePresence, motion } from "framer-motion";
import { Bike, Car, Truck, CheckCircle2, QrCode, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ─────────────────────────────── Layout geometry ───────────────────────────────
// Everything is laid out in a fixed 600x420 coordinate space. The SVG grid and the
// HTML car overlay both convert from this space to percentages, so they stay in
// perfect alignment regardless of the rendered size of the card.

const VB_W = 600;
const VB_H = 420;
const COLS = 6;
const ROWS = 4;
const SLOT_W = 84;
const SLOT_H = 68;
const GAP_X = 10;
const GAP_Y = 12;
const GRID_W = COLS * SLOT_W + (COLS - 1) * GAP_X;
const START_X = (VB_W - GRID_W) / 2;
const START_Y = 24;
const AISLE_X = VB_W / 2;
const ENTRANCE_Y = 402;

function colCenterX(c: number) {
  return START_X + c * (SLOT_W + GAP_X) + SLOT_W / 2;
}
function rowTopY(r: number) {
  return START_Y + r * (SLOT_H + GAP_Y);
}
function rowCenterY(r: number) {
  return rowTopY(r) + SLOT_H / 2;
}
function rowBottomY(r: number) {
  return rowTopY(r) + SLOT_H;
}

interface Point {
  x: number;
  y: number;
}

function angleDeg(a: Point, b: Point) {
  return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
}

/** Keeps each successive turn within ±180° of the last, so the car always pivots the short way. */
function unwrap(prev: number, next: number) {
  let n = next;
  while (n - prev > 180) n -= 360;
  while (n - prev < -180) n += 360;
  return n;
}

function toPct(p: Point) {
  return { left: (p.x / VB_W) * 100, top: (p.y / VB_H) * 100 };
}

/** Builds the entrance -> aisle -> lane-change -> slot route for a given grid cell. */
function buildRoute(row: number, col: number) {
  const p0: Point = { x: AISLE_X, y: ENTRANCE_Y };
  const p1: Point = { x: AISLE_X, y: rowBottomY(row) + 6 };
  const p2: Point = { x: colCenterX(col), y: rowBottomY(row) + 6 };
  const p3: Point = { x: colCenterX(col), y: rowCenterY(row) };

  const a1 = angleDeg(p0, p1);
  const a2 = unwrap(a1, angleDeg(p1, p2));
  const a3 = unwrap(a2, angleDeg(p2, p3));

  return {
    corners: [p0, p1, p2, p3] as const,
    keyframes: {
      left: [p0, p1, p1, p2, p2, p3].map((p) => `${toPct(p).left}%`),
      top: [p0, p1, p1, p2, p2, p3].map((p) => `${toPct(p).top}%`),
      rotate: [a1, a1, a2, a2, a3, a3],
    },
  };
}

function pathD(corners: readonly Point[]) {
  return corners.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
}

function slotLabel(index: number) {
  const row = Math.floor(index / COLS);
  const col = index % COLS;
  return `${String.fromCharCode(65 + row)}${col + 1}`;
}

// ───────────────────────────────── Slot state ─────────────────────────────────

type SlotState = "available" | "reserved" | "occupied";

const TOTAL_SLOTS = COLS * ROWS;

/** A fixed, non-random starting layout — kept deterministic so server/client markup matches. */
const INITIAL_STATE: SlotState[] = Array.from({ length: TOTAL_SLOTS }, (_, i) => {
  const occupied = new Set([1, 4, 6, 9, 10, 14, 17, 19, 20, 22]);
  const reserved = new Set([2, 12]);
  if (occupied.has(i)) return "occupied";
  if (reserved.has(i)) return "reserved";
  return "available";
});

/** Solid accent color per state — used for the paint-line, status dot, and legend swatches. */
const SLOT_ACCENT: Record<SlotState, string> = {
  available: "var(--available)",
  reserved: "var(--limited)",
  occupied: "var(--full)",
};

/** Low-opacity wash per state — mirrors the Badge component's *-subtle tokens for visual consistency. */
const SLOT_WASH: Record<SlotState, string> = {
  available: "var(--available-subtle)",
  reserved: "var(--limited-subtle)",
  occupied: "var(--full-subtle)",
};

type VehicleKind = "TWO_WHEELER" | "THREE_WHEELER" | "FOUR_WHEELER";

const VEHICLE_META: Record<VehicleKind, { label: string; icon: typeof Bike; scale: number }> = {
  TWO_WHEELER: { label: "Two-wheeler", icon: Bike, scale: 0.72 },
  THREE_WHEELER: { label: "Three-wheeler", icon: Truck, scale: 0.86 },
  FOUR_WHEELER: { label: "Four-wheeler", icon: Car, scale: 1 },
};

type CardState =
  | { phase: "hidden" }
  | { phase: "reserving"; slot: string; vehicle: VehicleKind; eta: number }
  | { phase: "confirmed"; slot: string; vehicle: VehicleKind };

// ───────────────────────────────── Timing (ms) ─────────────────────────────────

const T_SELECT = 650;
const T_PATH_DRAW = 550;
const T_DRIVE = 1900;
const T_SETTLE = 400;
const T_HOLD = 1600;
const T_RELEASE = 550;

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

// ────────────────────────────────── Component ──────────────────────────────────

export function ParkingLotVisualization() {
  const [slots, setSlots] = useState<SlotState[]>(INITIAL_STATE);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [route, setRoute] = useState<ReturnType<typeof buildRoute> | null>(null);
  const [card, setCard] = useState<CardState>({ phase: "hidden" });
  const [carVisible, setCarVisible] = useState(false);

  const carRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Single source of truth for the loop's own bookkeeping — React state (`slots`) is a
    // one-way mirror of this for rendering, never read back, so there's no stale-closure risk.
    const localSlots = [...INITIAL_STATE];

    async function cycle() {
      while (!cancelled) {
        const available = localSlots
          .map((s, i) => (s === "available" ? i : -1))
          .filter((i) => i >= 0);

        if (available.length === 0) {
          await wait(T_SELECT);
          continue;
        }

        const index = available[Math.floor(Math.random() * available.length)]!;
        const row = Math.floor(index / COLS);
        const col = index % COLS;
        const vehicle: VehicleKind =
          Math.random() < 0.15 ? "TWO_WHEELER" : Math.random() < 0.5 ? "THREE_WHEELER" : "FOUR_WHEELER";
        const label = slotLabel(index);
        const eta = 8 + Math.floor(Math.random() * 9);

        // 1. select — highlight the target slot before anything moves.
        setTargetIndex(index);
        await wait(T_SELECT);
        if (cancelled) return;

        // 2. draw the navigation path and reserve the slot.
        const nextRoute = buildRoute(row, col);
        setRoute(nextRoute);
        localSlots[index] = "reserved";
        setSlots([...localSlots]);
        setCard({ phase: "reserving", slot: label, vehicle, eta });
        await wait(T_PATH_DRAW);
        if (cancelled) return;

        // 3. drive the car along the route.
        setCarVisible(true);
        if (carRef.current) {
          const start = nextRoute.corners[0];
          const startPct = toPct(start);
          carRef.current.style.left = `${startPct.left}%`;
          carRef.current.style.top = `${startPct.top}%`;
          carRef.current.style.opacity = "0";
          carRef.current.style.transform = `translate(-50%, -50%) rotate(${nextRoute.keyframes.rotate[0]}deg)`;

          await animate(carRef.current, { opacity: 1 }, { duration: 0.25 });
          if (cancelled) return;

          await animate(
            carRef.current,
            {
              left: nextRoute.keyframes.left,
              top: nextRoute.keyframes.top,
              rotate: nextRoute.keyframes.rotate,
            },
            { duration: T_DRIVE / 1000, times: [0, 0.42, 0.47, 0.62, 0.67, 1], ease: "easeInOut" }
          );
        } else {
          await wait(T_DRIVE);
        }
        if (cancelled) return;

        // 4. park — the slot goes from reserved (yellow) to occupied (red).
        localSlots[index] = "occupied";
        setSlots([...localSlots]);
        if (carRef.current) {
          await animate(carRef.current, { scale: [1, 0.88, 1.04, 1] }, { duration: T_SETTLE / 1000, ease: "easeOut" });
        } else {
          await wait(T_SETTLE);
        }
        if (cancelled) return;

        // 5. confirm.
        setCard({ phase: "confirmed", slot: label, vehicle });
        setRoute(null);
        await wait(T_HOLD);
        if (cancelled) return;

        // 6. release — fade the car out and free the slot for the next cycle.
        setCard({ phase: "hidden" });
        if (carRef.current) {
          await animate(carRef.current, { opacity: 0 }, { duration: T_RELEASE / 1000 });
        } else {
          await wait(T_RELEASE);
        }
        if (cancelled) return;

        setCarVisible(false);
        setTargetIndex(null);
        localSlots[index] = "available";
        setSlots([...localSlots]);
        await wait(280);
      }
    }

    cycle();
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = slots.reduce(
    (acc, s) => {
      acc[s] += 1;
      return acc;
    },
    { available: 0, reserved: 0, occupied: 0 } as Record<SlotState, number>
  );
  const occupancyPct = Math.round(((counts.reserved + counts.occupied) / TOTAL_SLOTS) * 100);

  return (
    <div className="rounded-[var(--radius-2xl)] border border-border bg-card p-5 shadow-lg sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Marina Bay SmartDeck</p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-available opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-available" />
            </span>
            Updated just now
          </p>
        </div>
        <Badge variant="available" dot>
          Open
        </Badge>
      </div>

      <div className="relative mt-5 w-full select-none rounded-[var(--radius-lg)] ring-1 ring-inset ring-border/50" style={{ aspectRatio: `${VB_W} / ${VB_H}` }}>
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 h-full w-full overflow-visible">
          <defs>
            <linearGradient id="lotVignette" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--foreground)" stopOpacity={0.04} />
              <stop offset="55%" stopColor="var(--foreground)" stopOpacity={0} />
              <stop offset="100%" stopColor="var(--foreground)" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          {/* asphalt floor */}
          <rect
            x={START_X - 14}
            y={START_Y - 14}
            width={GRID_W + 28}
            height={ENTRANCE_Y + 32 - (START_Y - 14)}
            rx={18}
            fill="var(--surface-muted)"
          />
          <rect
            x={START_X - 14}
            y={START_Y - 14}
            width={GRID_W + 28}
            height={ENTRANCE_Y + 32 - (START_Y - 14)}
            rx={18}
            fill="url(#lotVignette)"
          />

          {/* aisle / drive lane */}
          <rect
            x={AISLE_X - 17}
            y={START_Y - 8}
            width={34}
            height={ENTRANCE_Y + 18 - (START_Y - 8)}
            rx={17}
            fill="var(--foreground)"
            fillOpacity={0.045}
          />
          <line
            x1={AISLE_X}
            y1={START_Y - 2}
            x2={AISLE_X}
            y2={ENTRANCE_Y + 6}
            stroke="var(--border)"
            strokeWidth={2.5}
            strokeDasharray="9 9"
            strokeLinecap="round"
          />

          {/* slots — painted bays with a status accent, not solid color blocks */}
          {slots.map((state, i) => {
            const row = Math.floor(i / COLS);
            const col = i % COLS;
            const x = START_X + col * (SLOT_W + GAP_X);
            const y = rowTopY(row);
            const isTarget = i === targetIndex;
            const cx = x + SLOT_W / 2;
            const cy = y + SLOT_H / 2;

            return (
              <motion.g
                key={i}
                className="cursor-pointer"
                whileHover={{ scale: 1.035 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                style={{ transformOrigin: `${cx}px ${cy}px` }}
              >
                {isTarget && state !== "occupied" && (
                  <motion.rect
                    x={x - 4}
                    y={y - 4}
                    width={SLOT_W + 8}
                    height={SLOT_H + 8}
                    rx={13}
                    fill="none"
                    stroke={SLOT_ACCENT[state]}
                    strokeWidth={2}
                    animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.06, 1] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                    style={{ transformOrigin: `${cx}px ${cy}px` }}
                  />
                )}
                <rect
                  x={x}
                  y={y}
                  width={SLOT_W}
                  height={SLOT_H}
                  rx={10}
                  fill={SLOT_WASH[state]}
                  stroke={SLOT_ACCENT[state]}
                  strokeOpacity={state === "available" ? 0.3 : 0.55}
                  strokeWidth={1.25}
                  className="transition-[fill,stroke-opacity] duration-500"
                />
                <rect
                  x={x + 5}
                  y={y + 7}
                  width={3}
                  height={SLOT_H - 14}
                  rx={1.5}
                  fill={SLOT_ACCENT[state]}
                  className="transition-colors duration-500"
                />
                <circle cx={x + SLOT_W - 11} cy={y + 11} r={4.5} fill="var(--card)" />
                <circle
                  cx={x + SLOT_W - 11}
                  cy={y + 11}
                  r={2.8}
                  fill={SLOT_ACCENT[state]}
                  className="transition-colors duration-500"
                />
                <text
                  x={x + 14}
                  y={y + SLOT_H - 9}
                  fontSize="10.5"
                  fontWeight={600}
                  letterSpacing={0.2}
                  fill="var(--muted-foreground)"
                  className="font-mono"
                >
                  {slotLabel(i)}
                </text>
              </motion.g>
            );
          })}

          {/* entrance marker */}
          <g>
            <text
              x={AISLE_X}
              y={ENTRANCE_Y - 14}
              textAnchor="middle"
              fontSize="9.5"
              fontWeight={700}
              letterSpacing={1.6}
              fill="var(--muted-foreground)"
              className="font-mono"
            >
              ENTRANCE
            </text>
            <rect x={AISLE_X - 15} y={ENTRANCE_Y - 5} width={30} height={22} rx={11} fill="var(--brand-subtle)" />
            <path
              d={`M ${AISLE_X - 5} ${ENTRANCE_Y + 11} L ${AISLE_X} ${ENTRANCE_Y + 2} L ${AISLE_X + 5} ${ENTRANCE_Y + 11}`}
              stroke="var(--brand)"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>

          {/* dotted navigation path */}
          <AnimatePresence>
            {route && (
              <motion.path
                key={pathD(route.corners)}
                d={pathD(route.corners)}
                fill="none"
                stroke="var(--brand)"
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray="2 9"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: T_PATH_DRAW / 1000, ease: "easeInOut" }}
              />
            )}
          </AnimatePresence>
        </svg>

        {/* car overlay — driven imperatively so it stays pixel-aligned with the SVG above */}
        {carVisible && (
          <div
            ref={carRef}
            className="pointer-events-none absolute drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
            style={{ left: "50%", top: "50%", opacity: 0 }}
          >
            <VehicleGlyph />
          </div>
        )}

        {/* floating status card */}
        <AnimatePresence>
          {card.phase !== "hidden" && (
            <motion.div
              key={card.phase === "confirmed" ? "confirmed" : "reserving"}
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute -right-2 -top-3 w-44 rounded-[var(--radius-md)] border border-border/60 bg-card/80 p-3 shadow-md backdrop-blur-md sm:-right-4"
            >
              {card.phase === "reserving" ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-muted-foreground">Slot</span>
                    <span className="font-mono text-sm font-semibold">{card.slot}</span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <Badge variant="limited" size="sm">
                      Reserved
                    </Badge>
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Navigation className="size-3" />
                      ETA {card.eta}s
                    </span>
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                    {(() => {
                      const meta = VEHICLE_META[card.vehicle];
                      const Icon = meta.icon;
                      return (
                        <>
                          <Icon className="size-3" />
                          {meta.label}
                        </>
                      );
                    })()}
                  </p>
                </>
              ) : (
                <>
                  <p className="flex items-center gap-1.5 text-[13px] font-semibold text-available">
                    <CheckCircle2 className="size-4" />
                    Booking Confirmed
                  </p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <QrCode className="size-3.5" />
                    QR access ready · {card.slot}
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 flex items-center gap-4 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ background: SLOT_ACCENT.available }} />
          Available
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ background: SLOT_ACCENT.reserved }} />
          Reserved
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ background: SLOT_ACCENT.occupied }} />
          Occupied
        </span>
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Occupancy</span>
          <span className="font-mono font-semibold text-foreground">
            <AnimatedCounter value={occupancyPct} />%
          </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-muted">
          <motion.div
            className="h-full rounded-full bg-linear-to-r from-brand to-brand-hover"
            animate={{ width: `${occupancyPct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {(
            [
              { label: "Available", value: counts.available, variant: "available" as const },
              { label: "Reserved", value: counts.reserved, variant: "limited" as const },
              { label: "Occupied", value: counts.occupied, variant: "full" as const },
            ]
          ).map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-0.5 rounded-[var(--radius-sm)] bg-surface-muted py-2.5"
            >
              <span className="text-[13px] font-semibold tabular-nums">
                <AnimatedCounter value={value} />
              </span>
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VehicleGlyph() {
  return (
    <svg width="34" height="20" viewBox="0 0 34 20" fill="none" style={{ transform: "translate(-50%, -50%)" }}>
      <defs>
        <linearGradient id="vehicleBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--brand-hover)" />
          <stop offset="100%" stopColor="var(--brand)" />
        </linearGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="17" cy="17.6" rx="12.5" ry="2.2" fill="black" fillOpacity={0.16} />

      {/* wheels, peeking out from under the body */}
      <rect x="7.5" y="2" width="3.2" height="4.6" rx="1.4" fill="var(--foreground)" fillOpacity={0.5} />
      <rect x="7.5" y="13.4" width="3.2" height="4.6" rx="1.4" fill="var(--foreground)" fillOpacity={0.5} />
      <rect x="23.3" y="2" width="3.2" height="4.6" rx="1.4" fill="var(--foreground)" fillOpacity={0.5} />
      <rect x="23.3" y="13.4" width="3.2" height="4.6" rx="1.4" fill="var(--foreground)" fillOpacity={0.5} />

      {/* body */}
      <rect x="2" y="4.3" width="30" height="11.4" rx="5.7" fill="url(#vehicleBody)" />
      <rect x="2" y="4.3" width="30" height="11.4" rx="5.7" fill="none" stroke="black" strokeOpacity={0.08} />

      {/* cabin / windshield glass with a light reflection streak */}
      <rect x="16.5" y="6.1" width="11.5" height="7.8" rx="2.8" fill="white" fillOpacity={0.3} />
      <path d="M 18 6.9 L 25.5 6.9" stroke="white" strokeOpacity={0.55} strokeWidth={1.1} strokeLinecap="round" />

      {/* headlights, at the nose */}
      <circle cx="31" cy="7.4" r="1.15" fill="#fff3c4" />
      <circle cx="31" cy="12.6" r="1.15" fill="#fff3c4" />
    </svg>
  );
}

function AnimatedCounter({ value }: { value: number }) {
  const spring = useSpring(value, { stiffness: 140, damping: 22, mass: 0.6 });
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (v) => setDisplay(Math.round(v)));
    return unsubscribe;
  }, [spring]);

  return <>{display}</>;
}
