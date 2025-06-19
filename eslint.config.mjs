import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // Extend Next.js and TypeScript compatibility
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Prettier override to disable ESLint formatting conflicts
  {
    name: "Prettier",
    files: ["**/*.{js,jsx,ts,tsx}"],
    ignores: [],
    rules: {
      // Hand over formatting to Prettier
    },
    extends: ["prettier"],
  },
];
