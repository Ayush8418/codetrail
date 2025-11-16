"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <div className="flex justify-between items-center px-10 py-2">
      {/* Logo */}
      <div className="">
        <Link href="/" className="font-extrabold text-3xl">LOGO</Link>
      </div>

      {/* Right Links */}
      <ul className="flex items-center gap-10 ">

        {/* Study Session Dropdown */}
        <li className="relative group">
          <div className="cursor-pointer">Study Session</div>

          <ul className="absolute left-0 w-max hidden group-hover:block shadow border bg-white">
            <li className="p-2 hover:bg-gray-100"><Link href="/session/newsession">Create Session</Link></li>
            <li className="p-2 hover:bg-gray-100"><Link href="/session/oldsession">View Session</Link></li>
          </ul>
        </li>

        {/* Questions Dropdown */}
        <li className="relative group">
          <div className="cursor-pointer">Questions</div>

          <ul className="absolute left-0 w-max hidden group-hover:block shadow border bg-white">
            <li className="p-2 hover:bg-gray-100"><Link href="/questions/new">Create New</Link></li>
            <li className="p-2 hover:bg-gray-100"><Link href="/questions/view">Solved</Link></li>
          </ul>
        </li>

        {/* Notes Dropdown */}
        <li className="relative group">
          <div className="cursor-pointer">Notes</div>

          <ul className="absolute left-0 w-max hidden group-hover:block shadow border bg-white">
            <li className="p-2 hover:bg-gray-100"><Link href="/notes/new">Create New</Link></li>
            <li className="p-2 hover:bg-gray-100"><Link href="/notes/view">view Notes</Link></li>
          </ul>
        </li>

        <li><Link href="/planner">Planner</Link></li>

        <li className="flex items-center">
          <button className="border-1 px-4 py-1 rounded mr-1 bg-black text-white">Login</button>
          <span className="text-2xl">/</span>
          <button className="border-1 px-4 py-1 rounded ml-1 hover:bg-black hover:text-white ">Signup</button>
        </li>
        
      </ul>
    </div>
  );
}
