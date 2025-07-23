import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import { compression } from "vite-plugin-compression2";

export default defineConfig({
  plugins: [solidPlugin(), compression()],
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
  },
});
