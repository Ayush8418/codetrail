"use client";
import { useState } from "react";
import { sendResetEmail } from "@/utils/sendmail"; // server action (returns true/false)

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if(email.trim() === ""){
      setMessage("Please enter your email address.");
      return;
    }
    try {
      setLoading(true);
      setMessage("");

      // ✅ Server action returns true or false
      const result = await sendResetEmail(email);

      if (result === true) {
        setMessage("Email sent successfully! Check your inbox or spam folder.");
      } else {
        setMessage("Failed to send email. Please try again.");
      }
    }
    catch (error: any) {
      console.error("Forgot password error:", error);
      setMessage("An unexpected error occurred. Please try again later.");
    }
    finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Forgot Password</h2>
      <input
        type="email"
        placeholder="jack@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Sending..." : "Submit"}
      </button>

      {/* ✅ Feedback message */}
      <p
        style={{
          color: message.toLowerCase().includes("success") ? "green" : "red",
        }}
      >
        {message}
      </p>
    </div>
  );
}
