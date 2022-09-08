import react from "@vitejs/plugin-react";
import path, { join } from "path";
import { defineConfig } from "vite";
import tailwindcss from "tailwindcss";
const KNOWN_ASSET_TYPES = [
  // images
  "png",
  "jpe?g",
  "jfif",
  "pjpeg",
  "pjp",
  "gif",
  "svg",
  "ico",
  "webp",
  "avif",

  // media
  "mp4",
  "webm",
  "ogg",
  "mp3",
  "wav",
  "flac",
  "aac",

  // fonts
  "woff2?",
  "eot",
  "ttf",
  "otf",

  // other
  "webmanifest",
  "pdf",
  "txt",
];

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: "./build",
    emptyOutDir: true,
    target: "es2015",
    manifest: true,
  },
  server: {
    host: true,
  },
  base: "/",
  resolve: {
    alias: {
      src: join(process.cwd(), "src"),
      types: join(process.cwd(), "types"),
    },
  },
  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" },
  },
  plugins: [
    react({
      jsxRuntime: "classic",
      fastRefresh: true,
      babel: {
        presets: [
          [
            "@babel/preset-react",
            {
              pragma: "jsx",
              pragmaFrag: "Fragment",
              throwIfNamespace: false,
              runtime: "classic",
            },
          ],
        ],
      },
    }),
  ],
  experimental: {
    renderBuiltUrl(filename, type) {
      // https://github.com/vitejs/vite/blob/main/packages/vite/src/node/constants.ts#L84-L124
      if (
        KNOWN_ASSET_TYPES.includes(path.extname(filename).slice(1)) &&
        type.hostType === "js"
      ) {
        // Avoid Vite relative-path assets handling
        // https://github.com/vitejs/vite/blob/89dd31cfe228caee358f4032b31fdf943599c842/packages/vite/src/node/build.ts#L838-L875
        return { runtime: JSON.stringify(filename) };
      }
    },
  },
});
