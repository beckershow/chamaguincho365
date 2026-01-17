import { cn } from "@/lib/utils";

interface BackgroundGlowProps {
  className?: string;
  children?: React.ReactNode;
}

export function BackgroundGlow({ className, children }: BackgroundGlowProps) {
  return (
    <div className={cn("relative min-h-screen w-full bg-foreground", className)}>
      {/* Soft Yellow/Amber Glow - Top Left */}
      <div 
        className="absolute top-0 left-0 w-[700px] h-[700px] rounded-full blur-[150px] opacity-50 pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.8) 0%, transparent 70%)"
        }}
      />
      
      {/* Secondary Glow - Bottom Right */}
      <div 
        className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] opacity-40 pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.7) 0%, transparent 70%)"
        }}
      />
      
      {/* Subtle Center Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full blur-[180px] opacity-25 pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.6) 0%, transparent 60%)"
        }}
      />

      {/* Content */}
      {children}
    </div>
  );
}
