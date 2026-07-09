"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepIndicator, type WizardStep } from "@/components/driver/booking/step-indicator";
import { VehicleStep } from "@/components/driver/booking/vehicle-step";
import { LotStep } from "@/components/driver/booking/lot-step";
import { DateStep, TimeStep } from "@/components/driver/booking/date-time-step";
import { PaymentStep } from "@/components/driver/booking/payment-step";
import { BookingSummary, computeTotal } from "@/components/driver/booking/booking-summary";
import { ConfirmationStep } from "@/components/driver/booking/confirmation-step";
import { createDriverBooking } from "@/app/driver/book/[id]/actions";
import { formatCurrency } from "@/lib/format";
import type { ParkingLot, Vehicle, VehicleType } from "@/types/domain";
import { toast } from "sonner";

const STEPS: WizardStep[] = [
  { key: "vehicle", label: "Vehicle" },
  { key: "lot", label: "Lot" },
  { key: "date", label: "Date" },
  { key: "time", label: "Time" },
  { key: "payment", label: "Payment" },
];

export function BookingWizard({
  lot,
  vehicles: initialVehicles,
}: {
  lot: ParkingLot;
  vehicles: Vehicle[];
}) {
  const router = useRouter();
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [stepIndex, setStepIndex] = useState(0);
  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [startHour, setStartHour] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [paymentValid, setPaymentValid] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState<{ bookingNumber: string; totalAmount: number } | null>(null);

  const vehicle = vehicles.find((v) => v.id === vehicleId) ?? null;
  const estimatedTotal = useMemo(
    () => computeTotal(lot, vehicleType, duration),
    [lot, vehicleType, duration],
  );
  const total = booked?.totalAmount ?? estimatedTotal;

  const canContinue = [
    !!vehicleType && !!vehicleId,
    true,
    !!date,
    startHour !== null && !!duration,
    paymentValid,
  ][stepIndex];

  async function handleContinue() {
    if (stepIndex === STEPS.length - 1) {
      if (!vehicleType || !vehicleId || !date || startHour === null || !duration) return;

      setSubmitting(true);
      const startTime = new Date(date);
      startTime.setHours(startHour, 0, 0, 0);
      const endTime = new Date(startTime.getTime() + duration * 3_600_000);

      const result = await createDriverBooking({
        lotId: lot.id,
        vehicleType,
        vehicleId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });
      setSubmitting(false);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Booking confirmed — marked as paid");
      setBooked({ bookingNumber: result.booking.bookingNumber, totalAmount: result.booking.totalAmount });
      setConfirmed(true);
      return;
    }
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }

  function handleBack() {
    if (stepIndex === 0) {
      router.push(`/driver/parking/${lot.id}`);
      return;
    }
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  if (confirmed && booked && vehicleType && vehicle && date && startHour !== null && duration) {
    return (
      <ConfirmationStep
        lot={lot}
        vehicleType={vehicleType}
        vehicle={vehicle}
        date={date}
        startHour={startHour}
        duration={duration}
        total={total}
        bookingNumber={booked.bookingNumber}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <StepIndicator steps={STEPS} activeIndex={stepIndex} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-[var(--radius-xl)] border border-border bg-card p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {stepIndex === 0 && (
                <VehicleStep
                  lot={lot}
                  vehicles={vehicles}
                  vehicleType={vehicleType}
                  vehicleId={vehicleId}
                  onSelectType={(t) => {
                    setVehicleType(t);
                    setVehicleId(null);
                  }}
                  onSelectVehicle={setVehicleId}
                  onVehicleAdded={(v) => setVehicles((prev) => [...prev, v])}
                />
              )}
              {stepIndex === 1 && <LotStep lot={lot} />}
              {stepIndex === 2 && (
                <DateStep selectedDate={date} onSelect={setDate} />
              )}
              {stepIndex === 3 && (
                <TimeStep
                  openTime={lot.openTime}
                  closeTime={lot.closeTime}
                  startHour={startHour}
                  duration={duration}
                  onSelectStart={setStartHour}
                  onSelectDuration={setDuration}
                />
              )}
              {stepIndex === 4 && (
                <PaymentStep
                  totalLabel={formatCurrency(total)}
                  onValidChange={setPaymentValid}
                />
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <Button onClick={handleContinue} disabled={!canContinue || submitting}>
              {stepIndex === STEPS.length - 1
                ? submitting
                  ? "Confirming…"
                  : "Confirm booking"
                : "Continue"}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <BookingSummary
            lot={lot}
            vehicleType={vehicleType}
            vehicle={vehicle}
            date={date}
            startHour={startHour}
            duration={duration}
          />
        </div>
      </div>
    </div>
  );
}