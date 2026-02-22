import path from "node:path";
import { fable } from "fable/plugin";

export default {
  root: path.resolve(import.meta.dirname, "src"),
  publicDir: path.resolve(import.meta.dirname, "public"),
  base: process.env.FABLE_BASE_PATH || "/",
  plugins: [fable()],
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port: Number(process.env.PORT) || 3000,
    host: true,
  },
};
