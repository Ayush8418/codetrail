"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();

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
      setError(err?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email and password below to login to your account
          </CardDescription>
          <CardAction>
            <Link href="/auth/signup">
              <Button variant="link">Sign Up</Button>
            </Link>
          </CardAction>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/auth/forgot"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-2">
          <Button type="submit" onClick={handleSubmit} className="w-full">
            {loading ? "Signing in..." : "Login"}
          </Button>

          {/* Google */}
          <Button
            variant="outline"
            className="w-full flex items-center gap-2"
            onClick={() => signIn("google", { callbackUrl })}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" viewBox="0 0 488 512">
              <path
                fill="#4285F4"
                d="M488 261.8c0-17.4-1.5-34-4.3-50H249v95h136c-5.9 31.6-23.4 58.4-50 76l81 63c47-43.2 72-106.8 72-184z"
              />
              <path
                fill="#34A853"
                d="M249 492c67 0 123-22 164-59l-81-63c-23 15-53 24-83 24-64 0-118-43.2-137-102l-84 65c35 84 117 135 221 135z"
              />
              <path
                fill="#FBBC05"
                d="M112 292c-10-30-10-62 0-92L28 135C-8 197-8 277 28 339l84-65z"
              />
              <path
                fill="#EA4335"
                d="M249 100c36 0 69 12 95 36l71-71C372 19 316 0 249 0 145 0 63 51 28 135l84 65c19-59 73-102 137-102z"
              />
            </svg>
            Login with Google
          </Button>

          {/* GitHub */}
          {/* <Button
            variant="outline"
            className="w-full flex items-center gap-2"
            onClick={() => signIn("github", { callbackUrl })}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 
                3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 
                0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61 
                -.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.084-.729.084-.729 
                1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.807 1.304 
                3.492.997.108-.776.417-1.305.76-1.605-2.665-.305-5.466-1.334-5.466-5.93 
                0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 
                0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 
                1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23 
                .645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 
                0 4.61-2.805 5.62-5.475 5.92.42.36.81 1.096.81 2.22 
                0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57 
                C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            Login with GitHub
          </Button> */}
        </CardFooter>
      </Card>
    </main>
  );
}
