import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";
import { Button } from "@/components/ui/button";

export function Cta() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 lg:py-28">
      <Reveal>
        <div className="relative overflow-hidden rounded-[var(--radius-2xl)] bg-brand px-8 py-16 text-center sm:px-16">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, white, transparent 45%), radial-gradient(circle at 80% 80%, white, transparent 40%)",
            }}
          />
          <div className="relative">
            <h2 className="mx-auto max-w-xl text-balance font-display text-3xl font-semibold tracking-tight text-brand-foreground sm:text-4xl">
              Reserve your next space in under a minute
            </h2>
            <p className="mx-auto mt-4 max-w-md text-pretty text-brand-foreground/80">
              Join thousands of drivers and hundreds of operators already
              using HamroPark for seamless parking.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                size="xl"
                className="bg-background text-foreground hover:bg-background/90"
                asChild
              >
                <Link href="/driver">
                  Get started free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                size="xl"
                variant="ghost"
                className="text-brand-foreground hover:bg-white/10 hover:text-brand-foreground"
                asChild
              >
                <Link href="/operator">List your lot</Link>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
