import { defineConfig, type Plugin, type PreviewServer, type ViteDevServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'

// 独立试玩游戏的唯一代码源（与官网工程并列的 game-lingxiyunjing-game 目录）
const gameRoot = fileURLToPath(new URL('../game-lingxiyunjing-game', import.meta.url))
const gameMount = '/game-play'

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
}

/**
 * 将 /game-play 下的请求映射到独立游戏目录，
 * 游戏代码只在 game-lingxiyunjing-game 中维护一份，dev / preview 均生效。
 */
function serveLingxiGame(): Plugin {
  function handle(req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void) {
    try {
      if (!req.url || !req.url.startsWith(gameMount)) return next()
      let rel = decodeURIComponent(req.url.slice(gameMount.length).split('?')[0])
      if (rel === '' || rel === '/') rel = '/index.html'
      const file = path.normalize(path.join(gameRoot, rel))
      if (!file.startsWith(gameRoot)) return next()
      if (fs.existsSync(file) && fs.statSync(file).isFile()) {
        res.statusCode = 200
        res.setHeader('Content-Type', MIME[path.extname(file).toLowerCase()] || 'application/octet-stream')
        res.setHeader('Cache-Control', 'no-cache')
        fs.createReadStream(file).pipe(res)
        return
      }
      next()
    } catch (err) {
      next(err)
    }
  }

  return {
    name: 'serve-lingxi-game',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(handle)
    },
    configurePreviewServer(server: PreviewServer) {
      server.middlewares.use(handle)
    }
  }
}

export default defineConfig({
  plugins: [vue(), serveLingxiGame()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5177,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8084',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2015',
    chunkSizeWarningLimit: 1500
  }
})
