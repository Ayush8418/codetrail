// layout.tsx
export default function SessionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      
      {/* --- FIXED BACKGROUND IMAGE --- */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/mountainBG.png')" }}
      />

      {/* --- OPTIONAL OVERLAY (darkens image for readability) --- */}
      {/* <div className="fixed inset-0 z-0 bg-black/40 dark:bg-black/60" /> */}

      {/* --- HEADER BANNER --- */}
      <div className="fixed top-0 left-0 w-full h-[200px] z-10">
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-8xl font-extrabold text-black dark:text-white drop-shadow-lg">
            Planner
          </h1>
        </div>
      </div>

      {/* --- PAGE CONTENT --- */}
      <div className="relative z-10 mt-[160px]">
        {children}
      </div>
    </div>
  );
}