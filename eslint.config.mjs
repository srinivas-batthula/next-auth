// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import { off } from "process";
import { warn } from "console";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
    plugins: ["@typescript-eslint", "react-hooks"],
    rules: {
        "react/react-in-jsx-scope": off,
        "@typescript-eslint/no-unused-vars": warn,
        "@typescript-eslint/explicit-module-boundary-types": off,
        "@typescript-eslint/no-explicit-any": off,
        "@next/next/no-img-element": off,
    },
  },
];

export default eslintConfig;
