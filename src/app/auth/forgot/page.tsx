"use client";

import { useState } from "react";
import { sendResetEmail } from "@/utils/sendmail";
import { toast } from "sonner";
import Link from "next/link";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) {
      return toast.warning("Please enter your email address.");
    }

    try {
      setLoading(true);

      const result = await sendResetEmail(email);

      if (result === true) {
        toast.success("Reset email sent! Check your inbox or spam folder.");
      } else {
        toast.error("Failed to send email. Please try again.");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>
            Enter your email to receive a password reset link
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            <div className="grid gap-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="jack@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            className="w-full"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>

          <Link href="/auth/signin">
            <Button variant="link">Back to Login</Button>
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
