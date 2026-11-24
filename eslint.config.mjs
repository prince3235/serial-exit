import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * Lint config. Starts from Next's Core Web Vitals + TypeScript presets and
 * only relaxes rules that are genuinely noisy. Hooks rules stay ON — they
 * catch real bugs (stale closures, effect cleanup).
 */
const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "react/no-unescaped-entities": "off",
      "no-console": ["warn", { allow: ["error"] }],
    },
  },
  {
    ignores: [".next/**", "node_modules/**", "out/**", "next-env.d.ts", "e2e/**", "playwright.config.ts", "test-results/**", "playwright-report/**", "public/sw.js"],
  },
];

export default eslintConfig;
