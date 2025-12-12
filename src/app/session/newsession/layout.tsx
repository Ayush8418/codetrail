export default function NewSessionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full p-6">
      {/* FOREGROUND CONTENT */}
      <div className="relative z-10">{children}</div>

    </div>
  );
}
