"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (res?.error) {
        setError(res.error || "Invalid credentials. Please try again.");
      } else if (res?.ok && res.url) {
        window.location.href = res.url;
      } else {
        setError("Unexpected response from server. Please try again.");
      }
    } catch (err: any) {
      console.error("Sign-in error:", err);
      setError(
        err?.message ||
          "Something went wrong during sign-in. Please check your network and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Sign In</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <hr />

      <div>
        <button onClick={() => signIn("google", { callbackUrl })}>
          Continue with Google
        </button>
      </div>

      <div>
        <button onClick={() => signIn("github", { callbackUrl })}>
          Continue with GitHub
        </button>
      </div>
    </main>
  );
}
