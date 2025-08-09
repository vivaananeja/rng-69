import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function App() {
  const [isRolling, setIsRolling] = useState(false);
  const [current, setCurrent] = useState(null);

  const drawOnce = () => 69;

  const generate = async () => {
    setIsRolling(true);
    await new Promise((r) => setTimeout(r, 650));
    setCurrent(drawOnce());
    setIsRolling(false);
  };

  const bigNumber = useMemo(() => (current !== null ? current : 69), [current]);

  return (
    <div className="min-h-screen w-full bg-black text-zinc-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <header className="mb-6 text-center">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-red-500">
            Random Number Generator
          </h1>
        </header>

        <div className="bg-zinc-900 border border-red-900/60 rounded-2xl p-6 shadow-2xl">
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
