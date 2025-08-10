import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/** Confetti that falls straight through (no piling). */
function ConfettiOverlay({ duration = 3500, pieces = 200 }) {
  const colors = ["#60a5fa", "#34d399", "#f472b6", "#f59e0b", "#a78bfa", "#ef4444", "#22d3ee"];
  const items = Array.from({ length: pieces }).map((_, i) => {
    const left = Math.random() * 100; // vw
    const size = 5 + Math.random() * 7; // px
    const rotate = Math.random() * 360;
    const fall = duration * (0.7 + Math.random() * 0.6); // ms
    const delay = Math.random() * 180; // ms
    const drift = (Math.random() - 0.5) * 220; // px
    const color = colors[i % colors.length];
    return { left, size, rotate, fall, delay, drift, color, id: i };
  });

  return (
    <>
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translate3d(0,-110vh,0) rotate(var(--r)); }
          100% { transform: translate3d(var(--d), 110vh,0) rotate(calc(var(--r) + 540deg)); }
        }
      `}</style>
      <div className="pointer-events-none fixed inset-0 z-50" aria-hidden="true">
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
              ["--r"]: `${p.rotate}deg`,
              ["--d"]: `${p.drift}px`,
              borderRadius: "2px",
              boxShadow: "0 0 0.5px rgba(0,0,0,.25)",
            }}
          />
        ))}
      </div>
    </>
  );
}

/** Frosted overlay for the button (freezes & then melts). */
function IceOverlay({ melting }) {
  return (
    <>
      <style>{`
        @keyframes ice-shimmer {
          0% { transform: translateX(-20%); opacity:.9; }
          100% { transform: translateX(120%); opacity:.9; }
        }
        @keyframes ice-melt {
          0% { opacity: .9; filter: blur(1px); }
          100% { opacity: 0; filter: blur(0px); }
        }
      `}</style>
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
        {/* frosty base */}
        <div
          className={`absolute inset-0 ${
            melting ? "" : "opacity-90"
          }`}
          style={{
            background:
              "linear-gradient(180deg, rgba(173,216,230,.55), rgba(135,206,235,.45) 60%, rgba(173,216,230,.35))",
            border: "1px solid rgba(255,255,255,.25)",
            backdropFilter: "blur(1.5px)",
            WebkitBackdropFilter: "blur(1.5px)",
            animation: melting ? "ice-melt 2.2s ease-out forwards" : "none",
          }}
        />
        {/* shimmer streak */}
        {!melting && (
          <div
            className="absolute top-0 bottom-0 -left-1/3 w-1/3"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent)",
              filter: "blur(2px)",
              animation: "ice-shimmer 1.8s linear infinite",
            }}
          />
        )}
      </div>
    </>
  );
}

export default function App() {
  const [isRolling, setIsRolling] = useState(false);
  const [current, setCurrent] = useState(null);

  // freeze/melt states for the button
  const [frozen, setFrozen] = useState(false);
  const [melting, setMelting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // timings
  const CONFETTI_DURATION = 3500; // confetti fly-through
  const MELT_DURATION = 2200;     // ice melt at the end

  // 90% → 69, 10% → 67
  const drawOnce = useCallback(() => (Math.random() < 0.9 ? 69 : 67), []);

  const generate = async () => {
    if (frozen || melting) return; // still frozen
    setIsRolling(true);
    await new Promise((r) => setTimeout(r, 650));
    const result = drawOnce();
    setCurrent(result);
    setIsRolling(false);

    if (result === 67) {
      // start celebration & freeze button
      setShowConfetti(true);
      setFrozen(true);

      // stop confetti after duration
      setTimeout(() => setShowConfetti(false), CONFETTI_DURATION);

      // start melting once confetti is done
      setTimeout(() => {
        setMelting(true);
        // unfreeze after melt
        setTimeout(() => {
          setMelting(false);
          setFrozen(false);
        }, MELT_DURATION);
      }, CONFETTI_DURATION);
    }
  };

  const bigNumber = useMemo(() => (current !== null ? current : 69), [current]);
  const buttonDisabled = isRolling || frozen || melting;
  const buttonText = frozen || melting ? "67 vro" : isRolling ? "Rolling…" : "Generate";

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

          <div className="mt-4 flex justify-center relative">
            <button
              onClick={generate}
              disabled={buttonDisabled}
              className={`relative px-6 py-2 rounded-xl bg-red-500 text-black font-semibold shadow-lg transition
                ${buttonDisabled ? "opacity-80 cursor-not-allowed" : "hover:bg-red-400"}
              `}
            >
              {buttonText}
              {(frozen || melting) && <IceOverlay melting={melting} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
