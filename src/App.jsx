import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ---------------- Confetti (runs to completion) ---------------- */
function ConfettiOverlay({ pieces = 240, onDone }) {
  const itemsRef = useRef([]);

  if (itemsRef.current.length === 0) {
    const colors = ["#60a5fa", "#34d399", "#f472b6", "#f59e0b", "#a78bfa", "#ef4444", "#22d3ee"];
    itemsRef.current = Array.from({ length: pieces }).map((_, i) => {
      const left = Math.random() * 100;        // vw
      const size = 5 + Math.random() * 7;      // px
      const rotate = Math.random() * 360;
      const fall = 2600 + Math.random() * 2200; // 2.6s–4.8s fall
      const delay = Math.random() * 220;       // ms
      const drift = (Math.random() - 0.5) * 260; // px
      const color = colors[i % colors.length];
      return { left, size, rotate, fall, delay, drift, color, id: i };
    });
  }

  useEffect(() => {
    // Wait for the *longest* piece to finish, then call onDone
    const maxLife =
      itemsRef.current.reduce((m, p) => Math.max(m, p.fall + p.delay), 0) + 150; // small buffer
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

/* --------------- Icy button overlay (with melt) --------------- */
function IceOverlay({ melting }) {
  return (
    <>
      <style>{`
        @keyframes iceShimmer { 
          0% { transform: translateX(-25%); opacity:.9; } 
          100% { transform: translateX(125%); opacity:.9; }
        }
        @keyframes iceMelt {
          0% { opacity:.95; transform: scaleY(1); }
          100% { opacity:0; transform: scaleY(.94); }
        }
        @keyframes dripShrink {
          0% { transform: scaleY(1); opacity:1; }
          100% { transform: scaleY(.1); opacity:0; }
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none overflow-visible">
        {/* Frosty slab background */}
        <div
          className="absolute inset-0 rounded-xl"
          style={{
            background:
              "linear-gradient(180deg, rgba(190,236,255,.85), rgba(100,195,255,.8) 55%, rgba(60,170,240,.72))",
            border: "1px solid rgba(255,255,255,.45)",
            boxShadow:
              "inset 0 0 20px rgba(255,255,255,.55), inset 0 -8px 16px rgba(0,0,0,.18), 0 6px 14px rgba(0,0,0,.25)",
            backdropFilter: "blur(1.4px)",
            WebkitBackdropFilter: "blur(1.4px)",
            animation: melting ? "iceMelt 2.3s ease-out forwards" : "none",
          }}
        />
        {/* Snow cap */}
        <div
          className="absolute -top-2 left-2 right-2 h-3 rounded-full"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,1), rgba(255,255,255,.85))",
            filter: "drop-shadow(0 2px 3px rgba(0,0,0,.25))",
            opacity: 0.95,
            borderRadius: "12px/8px",
            animation: melting ? "iceMelt 2.3s ease-out forwards" : "none",
          }}
        />
        {/* Icicles */}
        {Array.from({ length: 8 }).map((_, i) => {
          const left = 6 + i * 10 + Math.random() * 6;
          const h = 8 + Math.random() * 12;
          return (
            <div
              key={i}
              className="absolute bottom-0 w-2 rounded-b-sm"
              style={{
                left: `${left}%`,
                height: `${h}px`,
                background:
                  "linear-gradient(180deg, rgba(210,240,255,.9), rgba(150,210,255,.85))",
                filter: "drop-shadow(0 2px 2px rgba(0,0,0,.25))",
                transformOrigin: "top center",
                animation: melting ? "dripShrink 2.0s ease-out forwards" : "none",
              }}
            />
          );
        })}
        {/* Shimmer pass while frozen */}
        {!melting && (
          <div
            className="absolute top-0 bottom-0 -left-1/3 w-1/3"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,.4), transparent)",
              filter: "blur(2.2px)",
              animation: "iceShimmer 2.1s linear infinite",
            }}
          />
        )}
        {/* Crack lines (subtle) */}
        <svg
          className="absolute inset-0"
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
          style={{ opacity: 0.35, mixBlendMode: "overlay" }}
        >
          <path d="M10,25 L25,20 L40,26 L55,19 L70,23 L85,18" stroke="white" strokeWidth="1" fill="none" />
          <path d="M20,30 L28,22" stroke="white" strokeWidth="0.8" />
          <path d="M48,28 L52,20" stroke="white" strokeWidth="0.8" />
          <path d="M72,27 L76,21" stroke="white" strokeWidth="0.8" />
        </svg>
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
  const [confettiKey, setConfettiKey] = useState(0); // remount confetti each time

  const drawOnce = useCallback(() => (Math.random() < 0.9 ? 69 : 67), []);

  const handleConfettiDone = useCallback(() => {
    // start melt, then unfreeze
    setMelting(true);
    setTimeout(() => {
      setMelting(false);
      setFrozen(false);
    }, 2300); // melt duration
  }, []);

  const generate = async () => {
    if (frozen || melting) return;
    setIsRolling(true);
    await new Promise((r) => setTimeout(r, 650));
    const result = drawOnce();
    setCurrent(result);
    setIsRolling(false);

    if (result === 67) {
      // Freeze and fire confetti. We *do not* unmount confetti until it finishes.
      setFrozen(true);
      setConfettiKey((k) => k + 1); // ensure fresh timings each time
    }
  };

  const bigNumber = useMemo(() => (current !== null ? current : 69), [current]);
  const buttonDisabled = isRolling || frozen || melting;
  const buttonText =
    frozen || melting ? "67 vro" : isRolling ? "Rolling…" : "Generate";

  return (
    <div className="min-h-screen w-full bg-black text-zinc-50 flex items-center justify-center p-6">
      {/* Confetti mounts only when frozen starts; it calls onDone when ALL pieces finish */}
      {frozen && !melting && (
        <ConfettiOverlay key={confettiKey} pieces={240} onDone={handleConfettiDone} />
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
              {/* Make frozen label darker and crisper */}
              <span className={`${frozen || melting ? "text-neutral-900 drop-shadow-[0_1px_0_rgba(255,255,255,.45)]" : ""} relative z-10`}>
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
