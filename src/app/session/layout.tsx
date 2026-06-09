import { FlickeringGrid } from "@/components/ui/flickering-grid"
export default function SessionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full ">
      
      {/* BACKGROUND GRID */}
      

      {/* FOREGROUND CONTENT */}
      <div className="relative z-10">{children}</div>

    </div>
  );
}
