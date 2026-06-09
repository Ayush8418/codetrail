"use client";

import { useState } from "react";


export default function ContactForm() {
  const [name, setName] = useState("");
  const [service, setService] = useState("");
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ name?: boolean; email?: boolean }>({});

  const handleSubmit = () => {
    const e = { name: !name.trim(), email: !email.trim() };
    setErrors(e);
    if (e.name || e.email) return;

    // 🔒 replace with your API call
    setSubmitted(true);
  };

  const inputBase =
    "border-0 border-b bg-transparent font-light text-base text-zinc-600 dark:text-zinc-400 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none pb-0.5 transition-colors";

  return (
    <div className="px-8 py-12 max-w-3xl">

      {/* Headline */}
      <h1
        className="text-5xl md:text-6xl mb-10 leading-tight font-normal"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        Hey! We are{" "}
        <em className="text-zinc-400 not-italic">ready</em>
        <br />
        to{" "}
        <span className="text-indigo-300 dark:text-indigo-400">consult you_</span>
      </h1>

      {/* Row 1 — name + service */}
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xl font-light text-zinc-800 dark:text-zinc-200 mb-5">
        My name is
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="first and last name"
          className={`${inputBase} w-44 ${errors.name ? "border-red-400" : "border-zinc-400 dark:border-zinc-600 focus:border-zinc-800 dark:focus:border-zinc-200"}`}
        />
        and Im interested in
        <input
          value={service}
          onChange={(e) => setService(e.target.value)}
          className={`${inputBase} w-52 border-zinc-400 dark:border-zinc-600 focus:border-zinc-800 dark:focus:border-zinc-200`}
        />
        <span className="text-zinc-400">.</span>
      </div>

      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xl font-light text-zinc-800 dark:text-zinc-200 mb-5">
        Please, contact me at
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          className={`${inputBase} w-56 ${errors.email ? "border-red-400" : "border-zinc-400 dark:border-zinc-600 focus:border-zinc-800 dark:focus:border-zinc-200"}`}
        />
        <span className="text-zinc-400">.</span>
      </div>

      {/* Row 4 — details */}
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xl font-light text-zinc-800 dark:text-zinc-200 mb-8">
        Optionally, Im sharing more:
        <input
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="your project details"
          className={`${inputBase} w-56 border-zinc-400 dark:border-zinc-600 focus:border-zinc-800 dark:focus:border-zinc-200`}
        />
        <span className="text-zinc-400">.</span>
      </div>

      {/* Submit */}
      {!submitted ? (
        <button
          onClick={handleSubmit}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-sm font-medium hover:opacity-80 transition"
        >
          Send request <span>→</span>
        </button>
      ) : (
        <p className="text-sm text-green-600 dark:text-green-400">
          ✓ Message sent! We will be in touch soon.
        </p>
      )}
    </div>
  );
}