"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return (
    <button className="border px-3 py-1 rounded-md opacity-50">...</button>
  );


  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="border px-3 py-1 rounded-md"
    >
      {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </button>
  );
}
