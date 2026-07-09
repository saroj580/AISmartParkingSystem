"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { CreditCard, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface PaymentFormValues {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}

export function PaymentStep({
  defaultValues,
  onValidChange,
  onSubmitRef,
}: {
  defaultValues: PaymentFormValues;
  onValidChange: (valid: boolean) => void;
  onSubmitRef: React.MutableRefObject<(() => void) | null>;
}) {
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isValid },
  } = useForm<PaymentFormValues>({ defaultValues, mode: "onChange" });

  onSubmitRef.current = () => handleSubmit(() => {})();

  useEffect(() => {
    trigger();
  }, [trigger]);

  useEffect(() => {
    onValidChange(isValid);
  }, [isValid, onValidChange]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[15px] font-semibold">Payment details</h2>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Lock className="size-3.5" />
          Payments are encrypted and securely processed.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cardName">Name on card</Label>
          <Input
            id="cardName"
            placeholder="Ava Chen"
            {...register("cardName", { required: true, minLength: 2 })}
          />
          {errors.cardName && (
            <p className="text-xs text-full">Enter the name on your card.</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cardNumber">Card number</Label>
          <Input
            id="cardNumber"
            leadingIcon={<CreditCard />}
            placeholder="4242 4242 4242 4242"
            inputMode="numeric"
            {...register("cardNumber", {
              required: true,
              pattern: /^[\d\s]{13,19}$/,
            })}
          />
          {errors.cardNumber && (
            <p className="text-xs text-full">Enter a valid card number.</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="expiry">Expiry</Label>
            <Input
              id="expiry"
              placeholder="MM/YY"
              {...register("expiry", {
                required: true,
                pattern: /^(0[1-9]|1[0-2])\/\d{2}$/,
              })}
            />
            {errors.expiry && (
              <p className="text-xs text-full">Use MM/YY format.</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cvc">CVC</Label>
            <Input
              id="cvc"
              placeholder="123"
              inputMode="numeric"
              {...register("cvc", { required: true, pattern: /^\d{3,4}$/ })}
            />
            {errors.cvc && <p className="text-xs text-full">Enter a valid CVC.</p>}
          </div>
        </div>
      </form>
    </div>
  );
}
