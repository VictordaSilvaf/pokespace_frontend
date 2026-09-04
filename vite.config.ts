import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { paraglideVitePlugin } from '@inlang/paraglide-js'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'

import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

const apiOrigin = process.env.API_URL ?? 'http://localhost:3000'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  server: {
    port: 3001,
    proxy: {
      '/api/v1': {
        target: apiOrigin,
        changeOrigin: true,
      },
    },
  },
  plugins: [
    devtools(),
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
      strategy: ['cookie', 'preferredLanguage', 'baseLocale'],
    }),
    tailwindcss(),
    tanstackStart(),
    nitro(),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
})

export default config
