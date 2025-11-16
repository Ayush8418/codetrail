"use client";
import axios from "axios";
import { useState } from "react";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessaage] = useState("");

  function handleConfirmPasswordChange(e: any) {
    const value = e.target.value;
    setConfirmPassword(value);
    setMessaage(password !== value ? "Passwords do not match" : "");
  }

  async function handleSubmit() {
    if (username !== "" && email !== "" && password !== "" && confirmPassword !== "" && password === confirmPassword) {
      try {
        const res = await axios.post("http://localhost:3000/api/auth/signup", {username, email, password});
        if (res.data?.message) {
          setMessaage(res.data.message);
        }
      }
      catch (error: any) {
        console.error("Signup error:", error);
        setMessaage("An unexpected error occurred. Please try again.");  
      }
    }
    else {
      setMessaage("Fill all fields correctly.");
    }
  }

  return (
    <div>
      <input
        type="text"
        placeholder="username"
        onChange={(e) => {
          setUsername(e.target.value);
        }}
      />
      <br />
      <input
        type="email"
        placeholder="email"
        onChange={(e) => {
          setEmail(e.target.value);
        }}
      />
      <br />
      <input
        type="password"
        placeholder="password"
        onChange={(e) => {
          setPassword(e.target.value);
        }}
      />
      <br />
      <input
        type="password"
        placeholder="confirm password"
        onChange={(e) => handleConfirmPasswordChange(e)}
      />
      <br />
      <br />

      <button onClick={handleSubmit}>submit</button>

      <p>{message}</p>
    </div>
  );
}
