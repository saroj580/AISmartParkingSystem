"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cancelDriverBooking } from "@/app/driver/bookings/[id]/actions";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  if (done) return null;

  return (
    <Button
      variant="destructive"
      className="w-fit"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await cancelDriverBooking(bookingId);
          if (!result.success) {
            toast.error(result.error);
            return;
          }
          toast.success("Booking cancelled");
          setDone(true);
          router.refresh();
        });
      }}
    >
      {pending ? "Cancelling…" : "Cancel booking"}
    </Button>
  );
}
