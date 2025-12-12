// layout.tsx
export default function SessionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="fixed top-0 left-0 w-full h-[360px] overflow-hidden z-0">
        <video
          src="/banner.mp4"
          autoPlay
          loop
          muted
          className="w-full h-full object-cover"
        />

        {/* --- TEXT ON TOP OF VIDEO --- */}
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-8xl font-extrabold text-white drop-shadow-lg">
            Study Planner
          </h1>
        </div>
      </div>


      {/* --- PAGE CONTENT (scrolls above video) --- */}
      <div className="relative z-10 mt-[360px]">
        {children}
      </div>
    </div>
  );
}
