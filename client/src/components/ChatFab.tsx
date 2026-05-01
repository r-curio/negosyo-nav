import { useLocation } from "wouter";
import { Sparkles } from "lucide-react";

const BRAND_GRADIENT = "linear-gradient(140deg, var(--color-brand-teal) 0%, var(--color-forest) 60%, oklch(0.22 0.08 255) 100%)";

export default function ChatFab() {
  const [, navigate] = useLocation();
  return (
    <button
      type="button"
      aria-label="Open chat assistant"
      onClick={() => navigate("/")}
      className="fixed right-4 bottom-20 z-40 h-14 w-14 rounded-full shadow-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-all lg:bottom-6"
      style={{ background: BRAND_GRADIENT, marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <Sparkles className="w-6 h-6 text-amber-300" style={{ fill: "currentColor" }} />
    </button>
  );
}
