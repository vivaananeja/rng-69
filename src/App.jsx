import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Tiny confetti generator (no extra packages)
function ConfettiOverlay({ duration = 3000, pieces = 140 }) {
  const colors = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#a855f7", "#ec4899", "#f43f5e"];
  // Build random piece styles once per mount
  const items = Array.from({ length: pieces }).map((_, i) => {
    const left = Math.random() * 100; // vw
    const size = 6 + Math.random() * 6; // px
    const rotate = Math.random() * 360;
    const fall = 1800 + Math.random() * 1800; // ms
    const delay = Math.random() * 200; // ms
    const drift = (Math.random() - 0.5) * 200; // px horizontal drift
    const color = colors[i % colors.length];
    return { left, size, rotate, fall, delay, drift, color, id: i };
  });

  return (
    <>
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translate3d(0,-100vh,0) rotate(var(--r)); opacity: 1; }
          100% { transform: translate3d(var(--d), 100vh,0) rotate(calc(var(--r) + 540deg)); opacity: 1; }
        }
      `}</style>
      <div
        className="pointer-events-none fixed inset-0 z-50"
        aria-hidden="true"
        style={{ animation: `fadeOut ${duration}ms linear forwards` }}
      >
        {items.map((p) => (
          <span
            key={p.id}
            className="absolute block"
            style={{
              left: `${p.left}vw`,
              top: `-10vh`,
              width: `${p.size}px`,
              height: `${p.size * 2}px`,
              background: p.color,
              transform: `rotate(${p.rotate}deg)`,
              animation: `confetti-fall ${p.fall}ms linear ${p.delay}ms forwards`,
              // custom props for the keyframes
              ["--r"]: `${p.rotate}deg`,
              ["--d"]: `${p.drift}px`,
              borderRadius: "2px",
              boxShadow: "0 0 0.5px rgba(0,0,0,.2)",
            }}
          />
        ))}
      </div>
    </>
  );
}

export default function App() {
  const [isRolling, setIsRolling] = useState(false);
  const [current, setCurrent] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // 90% chance 69, 10% chance 67
  const drawOnce = useCallback(() => (Math.random() < 0.9 ? 69 : 67), []);

  const generate = async () => {
    setIsRolling(true);
    await new Promise((r) => setTimeout(r, 650));
    const result = drawOnce();
    setCurrent(result);
    setIsRolling(false);

    if (result === 67) {
      setShowConfetti(true);
      // hide confetti after 3s
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const bigNumber = useMemo(() => (current !== null ? current : 69), [current]);

  return (
    <div className="min-h-screen w-full bg-black text-zinc-50 flex items-center justify-center p-6">
      {showConfetti && <ConfettiOverlay />}
      <div className="max-w-md w-full">
        <header className="mb-6 text-center">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-red-500">
            Random Number Generator
          </h1>
        </header>

        <div className="bg-zinc-900 border border-red-900/60 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="relative h-40 md:h-48 flex items-center justify-center overflow-hidden rounded-xl bg-zinc-950 border border-zinc-800">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={isRolling ? "rolling" : bigNumber}
                initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.6, opacity: 0, rotate: 6 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
                className="text-7xl md:text-8xl font-extrabold tabular-nums text-red-400"
              >
                {isRolling ? "…" : bigNumber}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-4 flex justify-center">
            <button
              onClick={generate}
              disabled={isRolling}
              className="px-6 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-black font-semibold shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {isRolling ? "Rolling…" : "Generate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
