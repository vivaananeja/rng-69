import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ---------------- Confetti (runs to completion) ---------------- */
function ConfettiOverlay({ pieces = 240, onDone }) {
  const itemsRef = useRef([]);

  if (itemsRef.current.length === 0) {
    const colors = ["#60a5fa", "#34d399", "#f472b6", "#f59e0b", "#a78bfa", "#ef4444", "#22d3ee"];
    itemsRef.current = Array.from({ length: pieces }).map((_, i) => {
      const left = Math.random() * 100;
      const size = 5 + Math.random() * 7;
      const rotate = Math.random() * 360;
      const fall = 2600 + Math.random() * 2200;   // 2.6s–4.8s
      const delay = Math.random() * 220;
      const drift = (Math.random() - 0.5) * 240;
      const color = colors[i % colors.length];
      return { left, size, rotate, fall, delay, drift, color, id: i };
    });
  }

  useEffect(() => {
    const maxLife =
      itemsRef.current.reduce((m, p) => Math.max(m, p.fall + p.delay), 0) + 150;
    const t = setTimeout(() => onDone?.(), maxLife);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <>
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translate3d(0,-110vh,0) rotate(var(--r)); }
          100% { transform: translate3d(var(--d), 112vh,0) rotate(calc(var(--r) + 540deg)); }
        }
      `}</style>
      <div className="pointer-events-none fixed inset-0 z-[60]" aria-hidden="true">
        {itemsRef.current.map((p) => (
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
              boxShadow: "0 0 0.5px rgba(0,0,0,.28)",
            }}
          />
        ))}
      </div>
    </>
  );
}

/* --------------- Clean icy slab overlay (no weird artifacts) --------------- */
function IceOverlay({ melting }) {
  return (
    <>
      <style>{`
        @keyframes iceMelt {
          0%   { opacity:.96; filter: blur(0.6px); }
          100% { opacity:0;   filter: blur(0px); }
        }
      `}</style>
      <div className="absolute inset-0 pointer-events-none overflow-visible">
        {/* Frosted glass slab */}
        <div
          className="absolute inset-0 rounded-xl"
          style={{
            background:
              "linear-gradient(180deg, rgba(190,236,255,.88), rgba(120,205,255,.84) 55%, rgba(70,175,240,.78))",
            border: "1px solid rgba(255,255,255,.5)",
            boxShadow:
              "inset 0 0 18px rgba(255,255,255,.5), inset 0 -6px 12px rgba(0,0,0,.18), 0 6px 14px rgba(0,0,0,.25)",
            backdropFilter: "blur(1.2px)",
            WebkitBackdropFilter: "blur(1.2px)",
            animation: melting ? "iceMelt 2.2s ease-out forwards" : "none",
          }}
        />
        {/* Soft snow cap */}
        <div
          className="absolute -top-2 left-2 right-2 h-3 rounded-full"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,1), rgba(255,255,255,.9))",
            filter: "drop-shadow(0 2px 3px rgba(0,0,0,.22))",
            opacity: 0.95,
            borderRadius: "12px/8px",
            animation: melting ? "iceMelt 2.2s ease-out forwards" : "none",
          }}
        />
        {/* Small triangle icicles (subtle, not bars) */}
        {Array.from({ length: 7 }).map((_, i) => {
          const left = 10 + i * 11 + Math.random() * 4;
          const h = 8 + Math.random() * 10;
          return (
            <div
              key={i}
              className="absolute bottom-0"
              style={{
                left: `${left}%`,
                width: 0,
                height: 0,
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: `${h}px solid rgba(200,230,255,.9)`,
                filter: "drop-shadow(0 2px 2px rgba(0,0,0,.25))",
                animation: melting ? "iceMelt 2.2s ease-out forwards" : "none",
              }}
            />
          );
        })}
        {/* Very light frost texture (no animation) */}
        <div
          className="absolute inset-0 rounded-xl"
          style={{
            background:
              "radial-gradient(circle at 20% 30%, rgba(255,255,255,.18), transparent 40%), radial-gradient(circle at 80% 20%, rgba(255,255,255,.12), transparent 45%), radial-gradient(circle at 60% 70%, rgba(255,255,255,.12), transparent 42%)",
            mixBlendMode: "overlay",
            borderRadius: "inherit",
            animation: melting ? "iceMelt 2.2s ease-out forwards" : "none",
          }}
        />
      </div>
    </>
  );
}

/* ----------------------------- App ----------------------------- */
export default function App() {
  const [isRolling, setIsRolling] = useState(false);
  const [current, setCurrent] = useState(null);

  const [frozen, setFrozen] = useState(false);
  const [melting, setMelting] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);

  const drawOnce = useCallback(() => (Math.random() < 0.9 ? 69 : 67), []);

  const handleConfettiDone = useCallback(() => {
    setMelting(true);
    setTimeout(() => {
      setMelting(false);
      setFrozen(false);
    }, 2200); // melt duration
  }, []);

  const generate = async () => {
    if (frozen || melting) return;
    setIsRolling(true);
    await new Promise((r) => setTimeout(r, 650));
    const result = drawOnce();
    setCurrent(result);
    setIsRolling(false);

    if (result === 67) {
      setFrozen(true);
      setConfettiKey((k) => k + 1);
    }
  };

  const bigNumber = useMemo(() => (current !== null ? current : 69), [current]);
  const buttonDisabled = isRolling || frozen || melting;
  const buttonText =
    frozen || melting ? "67 vro" : isRolling ? "Rolling…" : "Generate";

  return (
    <div className="min-h-screen w-full bg-black text-zinc-50 flex items-center justify-center p-6">
      {frozen && !melting && (
        <ConfettiOverlay key={confettiKey} pieces={260} onDone={handleConfettiDone} />
      )}

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
              className={`relative px-6 py-2 rounded-xl text-black font-semibold shadow-lg transition
                ${buttonDisabled ? "cursor-not-allowed" : "hover:bg-red-400"}
                ${frozen || melting ? "bg-red-600" : "bg-red-500"}
              `}
            >
              {/* Darker, crisper frozen label */}
              <span className={`${frozen || melting ? "text-neutral-900 drop-shadow-[0_1px_0_rgba(255,255,255,.55)]" : ""} relative z-10`}>
                {buttonText}
              </span>

              {(frozen || melting) && (
                <div className="absolute inset-0 z-0">
                  <IceOverlay melting={melting} />
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
