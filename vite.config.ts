import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { sentryVitePlugin } from '@sentry/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  css: {
    devSourcemap: true
  },
  plugins: [
    vue(),
    AutoImport({
      dts: true, // 会在根目录生成auto-imports.d.ts，里面可以看到自动导入的api
      include: [/\.[tj]sx?$/, /\.vue$/], // 匹配的文件，也就是哪些后缀的文件需要自动引入
      imports: [
        'vue',
        'vue-router',
        {
          axios: [
            // default imports
            ['default', 'axios'] // import { default as axios } from 'axios',
          ]
        }
      ],
      // 根据项目情况配置eslintrc，默认是不开启的
      eslintrc: {
        enabled: true // @default false
        // 下面两个是其他配置，默认即可
        // 输出一份json文件，默认输出路径为./.eslintrc-auto-import.json
        // filepath: './.eslintrc-auto-import.json', // @default './.eslintrc-auto-import.json'
        // globalsPropValue: true, // @default true 可设置 boolean | 'readonly' | 'readable' | 'writable' | 'writeable'
      }
    }),
    Components({
      dirs: ['src/components'],
      dts: true,
      resolvers: [
        AntDesignVueResolver({
          importStyle: false
        })
      ]
    }),
    createSvgIconsPlugin({
      // 指定需要缓存的图标文件夹
      iconDirs: [resolve(process.cwd(), 'src/assets/icons')],
      // 指定symbolId格式
      symbolId: 'icon-[dir]-[name]'
    }),
    nodePolyfills({
      include: ['events']
    }),
    sentryVitePlugin({
      org: 'rinku-uw',
      project: 'gamerboom-web',
      authToken: loadEnv(mode, process.cwd()).VITE_APP_SENTRY_AUTH_TOKEN,
      telemetry: false,
      sourcemaps: {
        ignore: ['node_modules'],
        filesToDeleteAfterUpload: './dist/**/*.map'
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    sourcemap: true
  },
  server: {
    proxy: {
      '/api': {
        target: loadEnv(mode, process.cwd()).VITE_APP_API_ORIGIN,
        changeOrigin: true
        // rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/media': {
        target: loadEnv(mode, process.cwd()).VITE_APP_API_ORIGIN,
        changeOrigin: true
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
}))
