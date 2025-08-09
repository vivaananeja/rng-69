import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANT: change 'rng69' below to EXACTLY your repo name
export default defineConfig({
  plugins: [react()],
  base: "/rng69/"
});
