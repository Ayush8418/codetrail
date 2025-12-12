"use client";

import axios from "axios";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

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
import Link from "next/link";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!password || !confirmPassword) {
      return toast.warning("All fields are required.");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match.");
    }

    if (!token) {
      return toast.error("Invalid or missing reset token.");
    }

    try {
      setLoading(true);

      const res = await axios.post("/api/auth/reset", {
        password,
        token,
      });

      toast.success(res.data.message || "Password reset successful.");

      // ✅ optional redirect after success
      setTimeout(() => {
        router.push("/auth/signin");
      }, 1500);

    } catch (err: any) {
      console.error("Reset password error:", err);

      toast.error(
        err?.response?.data?.message ||
          "Server error while resetting password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>Enter your new password</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={submit} className="flex flex-col gap-5">

            {/* New Password */}
            <div className="grid gap-2">
              <Label>New Password</Label>
              <Input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Confirm Password */}
            <div className="grid gap-2">
              <Label>Confirm Password</Label>
              <Input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            className="w-full"
            disabled={loading}
            onClick={submit}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>

          <Link href="/auth/signin">
            <Button variant="link">Back to Login</Button>
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
