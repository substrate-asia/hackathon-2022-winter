import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import type { ConfigEnv } from 'vite'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

export default ({ mode }: ConfigEnv) => {
  return defineConfig({
    plugins: [
      react(),
      createSvgIconsPlugin({
        iconDirs: [resolve(process.cwd(), 'src/icons')],
        symbolId: 'icon-[dir]-[name]',
        customDomId: '__svg__icons__dom__'
      }),
      AutoImport({
        imports: ['react', 'react-router-dom'],
        dts: './src/auto-imports.d.ts',
        dirs: ['src/store'],
        eslintrc: {
          enabled: true,
          filepath: './.eslintrc-auto-import.json'
        }
      })
    ],
    mode: mode,
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@components': resolve(__dirname, './src/components'),
        '@store': resolve(__dirname, './src/store'),
        '@views': resolve(__dirname, './src/views'),
        '@assets': resolve(__dirname, './src/assets'),
        '@hooks': resolve(__dirname, './src/hooks')
      }
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://143.198.218.138:8887',
          changeOrigin: true
        }
      }
    },
    css: {
      preprocessorOptions: {
        sass: {
          javascriptEnabled: true
        }
      }
    },
    build: {
      sourcemap: mode != 'production'
    }
  })
}
