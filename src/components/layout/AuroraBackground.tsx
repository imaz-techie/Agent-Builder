import { useTheme } from "@/components/layout/ThemeProvider";

export default function AuroraBackground() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
      {/* Base gradient */}
      <div
        className={
          isDark
            ? "absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(129,140,248,0.15),transparent)]"
            : "absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(108,92,231,0.08),transparent)]"
        }
      />

      {/* Primary aurora blob */}
      <div
        className={`absolute -top-[20%] -left-[10%] w-[600px] h-[600px] rounded-full ${
          isDark ? "opacity-[0.15]" : "opacity-[0.07]"
        }`}
        style={{
          background: isDark
            ? "radial-gradient(circle, #818CF8 0%, transparent 70%)"
            : "radial-gradient(circle, #6C5CE7 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "aurora-drift 20s ease-in-out infinite",
        }}
      />

      {/* Secondary aurora blob */}
      <div
        className={`absolute top-[20%] -right-[5%] w-[500px] h-[500px] rounded-full ${
          isDark ? "opacity-[0.11]" : "opacity-[0.06]"
        }`}
        style={{
          background: isDark
            ? "radial-gradient(circle, #22D3EE 0%, transparent 70%)"
            : "radial-gradient(circle, #3B82F6 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "aurora-drift-2 25s ease-in-out infinite",
        }}
      />

      {/* Accent aurora blob */}
      <div
        className={`absolute -bottom-[10%] left-[30%] w-[400px] h-[400px] rounded-full ${
          isDark ? "opacity-[0.10]" : "opacity-[0.05]"
        }`}
        style={{
          background: isDark
            ? "radial-gradient(circle, #C084FC 0%, transparent 70%)"
            : "radial-gradient(circle, #EC4899 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "aurora-drift-3 30s ease-in-out infinite",
        }}
      />

      {/* Subtle dot grid */}
      <div
        className={`absolute inset-0 ${isDark ? "opacity-[0.05]" : "opacity-[0.03]"}`}
        style={{
          backgroundImage: isDark
            ? "radial-gradient(circle, #818CF8 1px, transparent 1px)"
            : "radial-gradient(circle, #6C5CE7 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
    </div>
  );
}

