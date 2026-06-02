import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["tests/**/*.test.ts"],
    // Loads the adapter named by ASHE_CONFORMANCE_ADAPTER (if any) before the suite runs.
    setupFiles: ["./src/setup.ts"],
  },
});
