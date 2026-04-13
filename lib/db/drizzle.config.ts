import { defineConfig } from "orval";
import path from "path";
import { fileURLToPath } from "url";

// Manually define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  "saas-api": {
    input: "./openapi.yaml",
    output: {
      mode: "tags-split",
      target: path.resolve(__dirname, "./generated/api.ts"),
      schemas: path.resolve(__dirname, "./generated/model"),
      client: "react-query",
      // This helper removes null values from the generated types if needed
      override: {
        useTypeOverInterfaces: true,
      },
    },
  },
});