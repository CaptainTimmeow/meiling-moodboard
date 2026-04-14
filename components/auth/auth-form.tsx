"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";

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
    <div className="w-full max-w-md">
      <form
        onSubmit={handleSubmit}
        className="space-y-10 rounded-[8px] border border-black/5 bg-white p-10 shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
      >
        <div className="space-y-3 text-center">
          <h1 className="text-[56px] font-[400] leading-[1] tracking-[-1.72px] text-black sm:text-[72px]">
            {t("title")}
          </h1>
          <p className="text-[18px] font-[320] leading-[1.45] tracking-[-0.26px] text-black/55">
            {t("subtitle")}
          </p>
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
              className="h-14 flex-1 rounded-[8px] border-black/8 bg-white text-center text-[18px] font-[330] tracking-[-0.14px] text-black placeholder:font-[330] placeholder:text-black/35"
            />
          ))}
        </div>

        <Button
          type="submit"
          disabled={loading || words.some((w) => !w.trim())}
          className="h-12 w-full rounded-[50px] bg-black px-[18px] py-[8px] text-base font-[330] tracking-[-0.14px] text-white hover:bg-black/85 disabled:opacity-40"
        >
          {loading ? t("opening") : t("enter")}
        </Button>

        {error && (
          <p className="text-center text-sm font-[330] tracking-[-0.14px] text-black/70">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
