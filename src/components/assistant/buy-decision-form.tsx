"use client";

import { useState, useTransition } from "react";

type BuyDecision = {
  verdict: "BUY_NOW" | "WAIT_FOR_SALE" | "WISHLIST_ONLY" | "SKIP_FOR_NOW";
  confidence: number;
  reasons: string[];
  risks: string[];
  suggestedTrigger?: string;
};

const verdictLabels: Record<BuyDecision["verdict"], string> = {
  BUY_NOW: "Buy now",
  WAIT_FOR_SALE: "Wait for sale",
  WISHLIST_ONLY: "Wishlist only",
  SKIP_FOR_NOW: "Skip for now",
};

export function BuyDecisionForm() {
  const [decision, setDecision] = useState<BuyDecision | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setError(null);
        setDecision(null);
        startTransition(async () => {
          const response = await fetch("/api/assistant/buy-decision", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: formData.get("title"),
              platformName: formData.get("platformName") || undefined,
              priceText: formData.get("priceText") || undefined,
              reasonUserWantsIt:
                formData.get("reasonUserWantsIt") || undefined,
              genres: String(formData.get("genres") ?? "")
                .split(",")
                .map((genre) => genre.trim())
                .filter(Boolean),
            }),
          });
          const payload = await response.json();
          if (!response.ok) {
            setError(payload.error ?? "Could not evaluate this purchase.");
            return;
          }
          setDecision(payload.decision);
        });
      }}
    >
      <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
        <label className="grid gap-1.5 text-sm font-bold">
          Title
          <input
            className="border-3 border-ink rounded-[14px] bg-paper px-3 py-2 font-normal"
            name="title"
            required
          />
        </label>
        <label className="grid gap-1.5 text-sm font-bold">
          Price
          <input
            className="border-3 border-ink rounded-[14px] bg-paper px-3 py-2 font-normal"
            name="priceText"
            placeholder="$19.99"
          />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
        <label className="grid gap-1.5 text-sm font-bold">
          Platform
          <input
            className="border-3 border-ink rounded-[14px] bg-paper px-3 py-2 font-normal"
            name="platformName"
            placeholder="Steam"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-bold">
          Genres
          <input
            className="border-3 border-ink rounded-[14px] bg-paper px-3 py-2 font-normal"
            name="genres"
            placeholder="RPG, Strategy"
          />
        </label>
      </div>
      <label className="grid gap-1.5 text-sm font-bold">
        Why do you want it?
        <textarea
          className="min-h-20 border-3 border-ink rounded-[14px] bg-paper px-3 py-2 font-normal"
          name="reasonUserWantsIt"
          placeholder="A friend recommended it, it is on sale, or it fits the mood."
        />
      </label>
      <button className="btn btn-primary justify-self-start" disabled={isPending}>
        {isPending ? "Checking..." : "Check buy decision"}
      </button>

      {error ? (
        <div className="rounded-[18px] border-3 border-ink bg-[#ffd5ca] p-4 text-sm font-bold">
          {error}
        </div>
      ) : null}

      {decision ? (
        <div className="rounded-[20px] border-3 border-ink bg-yellow/35 p-4 shadow-hard-xs">
          <div className="flex items-center justify-between gap-3">
            <strong className="font-display text-2xl uppercase">
              {verdictLabels[decision.verdict]}
            </strong>
            <span className="pill">{decision.confidence}% confidence</span>
          </div>
          <ul className="mt-3 grid gap-1.5 text-sm">
            {decision.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
          {decision.risks.length ? (
            <p className="mt-3 text-sm text-ink/70">
              Risk: {decision.risks.join(" ")}
            </p>
          ) : null}
          {decision.suggestedTrigger ? (
            <p className="mt-3 text-sm font-bold">
              Trigger: {decision.suggestedTrigger}
            </p>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
