import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      // Node
      {
        test: {
          name: "node",
          environment: "node",
        },
      },
      // Chromium
      {
        test: {
          browser: {
            enabled: true,
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
