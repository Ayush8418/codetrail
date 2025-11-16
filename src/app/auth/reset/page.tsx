"use client";
import axios from "axios";
import { NextRequest } from "next/server";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage(req: NextRequest) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (password === confirmPassword) {
      try {
        setLoading(true);
        setMessage("");
        const res = await axios.post(`http://localhost:3000/api/auth/reset`, {password: password, token});

        // ✅ Handle known API responses
        if (res.data?.success) {
          setMessage(res.data.message);
        }
        else {
          setMessage("Password reset failed. Please try again.");
        }
      }
      catch (error: any) {
        console.error("Password reset error:", error);
        // ✅ Handle different types of axios errors
        if (error.response) {
          setMessage( error.response.data?.message ||"Server error occurred while resetting password." );
        } 
        else {
          setMessage("An unexpected error occurred. Please try again later.");
        }
      }
      finally {
        setLoading(false);
      }
    }
    else {
      setMessage("Passwords do not match. Please try again.");
    }
  }

  return (
    <div>
      <input
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        placeholder="new password"
      />
      <input
        type="password"
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="confirm password"
      />
      <button onClick={submit} disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </button>

      {/* ✅ Message feedback for user */}
      <p
        style={{
          color: message.toLowerCase().includes("success")
            ? "green"
            : "red",
        }}
      >
        {message}
      </p>
    </div>
  );
}
