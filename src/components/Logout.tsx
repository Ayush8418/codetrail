"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Logout() {
  const router = useRouter();

  function handleLogout() {
    signOut({ redirect: false });
    router.push("/auth/signin");
  }
  return (
    <button  onClick={handleLogout} className="px-3 py-1 rounded-md border bg-white hover:bg-black hover:text-white dark:bg-black dark:hover:bg-white dark:hover:text-black flex items-center gap-1.5">
        <LogOut size={16} />
        Logout
    </button>
  );
}
