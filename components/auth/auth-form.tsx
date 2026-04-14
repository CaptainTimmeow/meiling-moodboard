"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { Sparkles } from "lucide-react";

export function AuthForm() {
  const router = useRouter();
  const { t } = useI18n();
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
      setError(t("errorWrongWords"));
    }
    setLoading(false);
  }

  return (
    <div className="relative w-full max-w-md">
      <form
        onSubmit={handleSubmit}
        className="relative space-y-8 rounded-[2.5rem] bg-white p-10 card-warm"
      >
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f3ebe4] text-[#c45d3e]">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-medium tracking-tight text-[#3d3a36]">
            {t("title")}
          </h1>
          <p className="text-[#8a7f74]">{t("subtitle")}</p>
        </div>

        <div className="flex gap-3">
          {[0, 1, 2].map((i) => (
            <Input
              key={i}
              value={words[i]}
              onChange={(e) => {
                const next = [...words];
                next[i] = e.target.value;
                setWords(next);
              }}
              placeholder={t(`word${(i + 1) as 1 | 2 | 3}`)}
              required
              className="h-14 flex-1 rounded-2xl border-[rgba(61,58,54,0.08)] bg-[#faf8f5] text-center text-lg text-[#3d3a36] placeholder:text-[#8a7f74]/60 focus-visible:ring-[#c45d3e] focus-visible:ring-2"
            />
          ))}
        </div>

        <Button
          type="submit"
          disabled={loading || words.some((w) => !w.trim())}
          className="h-14 w-full rounded-full bg-[#c45d3e] text-lg text-white hover:bg-[#a84d32] disabled:opacity-50 btn-warm"
        >
          {loading ? t("opening") : t("enter")}
        </Button>

        {error && (
          <p className="text-center text-sm text-[#c45d3e]">{error}</p>
        )}
      </form>
    </div>
  );
}
