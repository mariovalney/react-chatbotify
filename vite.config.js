import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";
import eslint from "vite-plugin-eslint2";

import { defineConfig, loadEnv } from "vite";

export default ({mode}) => {
  
  process.env = {...process.env, ...loadEnv(mode, process.cwd())};
  
  return defineConfig({
    root: "src",
    build: {
      lib: {
        entry: path.resolve(__dirname, "src/index.tsx"),
        name: "react-chatbotify",
        fileName: "index",
      },
      rollupOptions: {
        external: [
          "react",
          "react-dom",
          "react-dom/server",
          "react/jsx-runtime",
          "react/jsx-dev-runtime"
        ],
        output: [
          {
            entryFileNames: "index.[format].js",
            globals: { react: "React" },
            format: "es",
            intro: 'import "./style.css";',
          },
          {
            entryFileNames: "index.[format].js",
            globals: { react: "React" },
            format: "cjs",
            intro: 'import "./style.css";',
          },
          {
            entryFileNames: "index.nocss.[format].js",
            globals: { react: "React" },
            format: "es",
          },
          {
            entryFileNames: "index.nocss.[format].js",
            globals: { react: "React" },
            format: "cjs",
          },
        ],
      },
      outDir: "../dist",
    },
    assetsInclude: ["**/*.svg", "**/*.png", "**/*.wav"],
    plugins: [
      svgr({
        svgrOptions: {
          ref: true,
        },
      }),
      react({
        include: "**/*.{jsx,tsx}",
      }),
      eslint()
    ],
    server: {
      port: 3000,
      host: true,
    },
  });
}
