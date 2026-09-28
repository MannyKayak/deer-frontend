import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Formatting is Prettier's job: turn off ESLint rules that would conflict.
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // BMad planning output (design imports/mockups), not app code.
    "_bmad-output/**",
  ]),
  // ADR-003: only lib/data/** may call the Supabase client directly.
  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: ["lib/data/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.object.name='supabase'][callee.property.name='from']",
          message:
            "supabase.from(...) is only allowed inside lib/data/** (ADR-003). Add or reuse a domain function there.",
        },
        {
          selector: "MemberExpression[object.name='supabase'][property.name='auth']",
          message:
            "supabase.auth.* is only allowed inside lib/data/** (ADR-003). Add or reuse a domain function there.",
        },
        {
          selector: "CallExpression[callee.object.name='supabase'][callee.property.name='rpc']",
          message:
            "supabase.rpc(...) is only allowed inside lib/data/** (ADR-003). Add or reuse a domain function there.",
        },
        {
          selector: "MemberExpression[object.name='supabase'][property.name='storage']",
          message:
            "supabase.storage.* is only allowed inside lib/data/** (ADR-003). Add or reuse a domain function there.",
        },
      ],
    },
  },
]);

export default eslintConfig;
