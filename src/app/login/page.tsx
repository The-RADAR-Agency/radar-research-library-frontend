"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "ok">(
    "idle"
  );
  const [message, setMessage] = useState("");

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("ok");
    setMessage(
      "We’ve sent you a secure sign-in link. Open the email and click the link to finish signing in."
    );
  }

  return (
    <main className="min-h-screen px-8 py-12">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-semibold">Sign in</h1>

        <p className="mt-2 text-sm text-neutral-600">
          Enter your email and we’ll send you a secure sign-in link.
          <br />
          <span className="text-neutral-500">
            No password required.
          </span>
        </p>

        <form onSubmit={sendMagicLink} className="mt-6 space-y-4">
          <input
            className="w-full rounded-lg border px-3 py-2"
            type="email"
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={status === "loading" || status === "ok"}
          />

          <button
            className="w-full rounded-lg border px-3 py-2 font-medium"
            type="submit"
            disabled={status === "loading" || status === "ok"}
          >
            {status === "loading"
              ? "Sending sign-in link…"
              : "Send sign-in link"}
          </button>
        </form>

        {message && (
          <div className="mt-4 rounded-lg border p-3 text-sm">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}
