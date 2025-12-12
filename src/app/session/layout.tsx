import { FlickeringGrid } from "@/components/ui/flickering-grid"
export default function SessionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full p-6">
      
      {/* BACKGROUND GRID */}
      <FlickeringGrid
        className="absolute inset-0 pointer-events-none z-0"
        squareSize={10}
        gridGap={6}
        color="#6B7280"
        maxOpacity={0.5}
        flickerChance={0.01}
      />

      {/* FOREGROUND CONTENT */}
      <div className="relative z-10">{children}</div>

    </div>
  );
}
