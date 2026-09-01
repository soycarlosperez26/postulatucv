import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // La extensión de Chrome es JS plano para el navegador, con sus
    // propios globales (chrome.*). No la construye Next.
    "extension/**",
  ]),
]);

export default eslintConfig;
