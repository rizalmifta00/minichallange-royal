import react from '@vitejs/plugin-react'
import { join } from 'path'
import { defineConfig } from 'vite'
import tailwindcss from 'tailwindcss'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: './build',
    emptyOutDir: true,
    target: 'es2015',
    manifest: true,
  },
  base: '/',
  resolve: {
    alias: {
      src: join(process.cwd(), 'src'),
      types: join(process.cwd(), 'types'),
    },
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  plugins: [
    react({
      jsxRuntime: 'classic',
      fastRefresh: true,
      babel: {
        presets: [
          [
            '@babel/preset-react',
            {
              pragma: 'jsx',
              pragmaFrag: 'Fragment',
              throwIfNamespace: false,
              runtime: 'classic',
            },
          ],
        ],
      },
    }),
  ],
})
