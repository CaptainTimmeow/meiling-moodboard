"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AuthForm() {
  const router = useRouter();
  const [words, setWords] = useState(["", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ w1: words[0], w2: words[1], w3: words[2] }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("Those words don't match. Try again.");
    }
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm space-y-6 rounded-2xl bg-white p-8 shadow-sm border border-black/5"
    >
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-medium tracking-tight text-black">
          Meiling&apos;s Mood Board
        </h1>
        <p className="text-sm text-black/60">
          Enter your favorite 3 words to get in
        </p>
      </div>

      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <Input
            key={i}
            value={words[i]}
            onChange={(e) => {
              const next = [...words];
              next[i] = e.target.value;
              setWords(next);
            }}
            placeholder={`Word ${i + 1}`}
            required
            className="h-12 flex-1 rounded-lg border-black/10 bg-white text-center text-black placeholder:text-black/40 focus-visible:ring-black"
          />
        ))}
      </div>

      <Button
        type="submit"
        disabled={loading || words.some((w) => !w.trim())}
        className="h-12 w-full rounded-full bg-black text-white hover:bg-black/90 disabled:opacity-50"
      >
        {loading ? "Opening..." : "Enter"}
      </Button>

      {error && <p className="text-center text-sm text-red-600">{error}</p>}
    </form>
  );
}
