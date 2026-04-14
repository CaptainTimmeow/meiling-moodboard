"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });
      if (error) setMessage(error.message);
      else setMessage("Check your email for the confirmation link!");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setMessage(error.message);
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
          {isSignUp ? "Create account" : "Welcome back"}
        </h1>
        <p className="text-sm text-black/60">
          {isSignUp
            ? "Sign up to start creating mood boards"
            : "Sign in to continue to your boards"}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-black">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 rounded-lg border-black/10 bg-white text-black placeholder:text-black/40 focus-visible:ring-black"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-black">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-11 rounded-lg border-black/10 bg-white text-black placeholder:text-black/40 focus-visible:ring-black"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="h-11 w-full rounded-full bg-black text-white hover:bg-black/90 disabled:opacity-50"
      >
        {loading ? "Loading..." : isSignUp ? "Sign up" : "Sign in"}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm text-black/60 underline underline-offset-4 hover:text-black"
        >
          {isSignUp
            ? "Already have an account? Sign in"
            : "Don't have an account? Sign up"}
        </button>
      </div>

      {message && (
        <p className="text-center text-sm text-black/80">{message}</p>
      )}
    </form>
  );
}
