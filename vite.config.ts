import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const projectRoot = dirname(fileURLToPath(import.meta.url));
function publicSeed() {
  const publicCatalog = JSON.parse(readFileSync(resolve(projectRoot, 'seedData/seed.json'), 'utf8'));
  delete publicCatalog.studioAccount;
  return publicCatalog;
}

export default defineConfig(() => ({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'obsura-strip-private-seed-fields',
      resolveId(source, importer) {
        if (importer && resolve(importer.split('?')[0]) === resolve(projectRoot, 'src/demo-data/store.ts') && source === '../../seedData/seed.json') return '\0obsura-public-seed';
        return null;
      },
      load(id) {
        if (id === '\0obsura-public-seed') return { code: `export default ${JSON.stringify(publicSeed())};`, map: null };
        return null;
      },
      transform(_code, id) {
        const normalizedId = id.replace(/\\/g, '/').split('?')[0];
        if (normalizedId.endsWith('/seedData/seed.json')) return { code: `export default ${JSON.stringify(publicSeed())};`, map: null };
        return null;
      }
    },
    {
      name: 'obsura-hide-private-public-files',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const pathname = new URL(req.url || '/', 'http://localhost').pathname;
          if (pathname === '/seed/seed.json' || pathname.startsWith('/assets/aistudio/')) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Not found.' } }));
            return;
          }
          next();
        });
      }
    }
  ],
  resolve: { alias: { '@': resolve(projectRoot, '.') } },
  server: {
    host: '0.0.0.0',
    port: 3000,
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
    proxy: { '/api': { target: process.env.API_PROXY_TARGET || 'http://127.0.0.1:4000', changeOrigin: false } }
  }
}));
