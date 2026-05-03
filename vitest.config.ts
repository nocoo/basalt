import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync(path.resolve(__dirname, "package.json"), "utf-8"));

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      // AST-aware remapping is built into vitest v4+; no opt-in needed.
      reporter: ["text", "text-summary", "lcov"],
      include: ["src/models/**/*.ts", "src/viewmodels/**/*.ts", "src/lib/**/*.ts"],
      exclude: [
        // Test setup, fixtures, and helpers — exercised by the tests themselves,
        // not production code paths we want to gate on coverage.
        "src/test/**",
        // Type-only declaration files have no runtime behavior to cover.
        "src/**/*.d.ts",
        // Pure type definitions for model shapes; covered implicitly via the
        // model implementations that consume them.
        "src/models/types.ts",
      ],
      thresholds: {
        statements: 95,
        branches: 95,
        functions: 95,
        lines: 95,
      },
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
