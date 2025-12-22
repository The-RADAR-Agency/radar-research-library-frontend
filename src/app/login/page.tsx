"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [message, setMessage] = useState<string>("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("sent");
    setMessage("Check your email for a magic link.");
  }

  return (
    <main className="min-h-screen px-8 py-12">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Enter your email and we’ll send you a magic link.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <input
            className="w-full rounded-lg border px-3 py-2"
            type="email"
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            className="w-full rounded-lg border px-3 py-2 font-medium"
            type="submit"
            disabled={status === "sending"}
          >
            {status === "sending" ? "Sending…" : "Send magic link"}
          </button>
        </form>

        {message && (
          <div className="mt-4 rounded-lg border p-3 text-sm">{message}</div>
        )}
      </div>
    </main>
  );
}
