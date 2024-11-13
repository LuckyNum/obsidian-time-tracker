import { fileURLToPath, URL } from "node:url";
import * as path from 'node:path';
import { defineConfig, UserConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import terser, { Options } from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  return {
    plugins: [vue()],
    build: {
      sourcemap: command !== "build" || mode === "development",
      minify: command === "build" && mode !== "development",
      // Use Vite lib mode https://vitejs.dev/guide/build.html#library-mode
      lib: {
        entry: path.resolve(__dirname, "./src/index.ts"),
        formats: ["cjs"],
      },
      rollupOptions: {
        onwarn(warning, defaultHandler) {
          if (warning.code === "SOURCEMAP_ERROR") {
            return;
          }

          defaultHandler(warning);
        },
        plugins: [
          command !== "build" || mode === "development"
            ? ""
            : terser({
                compress: {
                  defaults: false,
                  drop_console: ["log", "info"],
                },
                mangle: {
                  eval: true,
                  module: true,
                  toplevel: true,
                  safari10: true,
                  properties: false,
                },
                output: {
                  comments: false,
                  ecma: "2020",
                },
              } as unknown as Options),
          resolve({
            browser: false,
          }),
          replace({
            preventAssignment: true,
            "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
          }),
        ],
        output: {
          // Overwrite default Vite output fileName
          entryFileNames:
            command === "build" && mode !== "development"
              ? "main.js"
              : "main.js",
          assetFileNames:
            command === "build" && mode !== "development"
              ? "styles.css"
              : "styles.css",
        },
        external: [
          "obsidian",
          "electron",
          "@codemirror/autocomplete",
          "@codemirror/collab",
          "@codemirror/commands",
          "@codemirror/language",
          "@codemirror/lint",
          "@codemirror/search",
          "@codemirror/state",
          "@codemirror/view",
          "@lezer/common",
          "@lezer/highlight",
          "@lezer/lr",
        ],
      },
      // Use root as the output dir
      emptyOutDir: false,
      // outDir: outputDir,
      outDir: ".",
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  } as UserConfig;
});
