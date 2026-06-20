import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    open: true, // Automatically open browser when server starts
    host: true  // Expose to local network
  },
  plugins: [
    {
      name: 'html-clean-urls',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
          const pathname = url.pathname;
          
          if (!pathname.includes('.') && pathname !== '/') {
            if (pathname === '/login') {
              req.url = '/login.html' + url.search;
            } else if (pathname === '/signup') {
              req.url = '/signup.html' + url.search;
            } else if (pathname === '/forgot-password') {
              req.url = '/forgot-password.html' + url.search;
            } else if (pathname === '/download') {
              req.url = '/download.html' + url.search;
            } else if (pathname === '/thank-you') {
              req.url = '/thank-you.html' + url.search;
            }
          }
          next();
        });
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        download: resolve(__dirname, 'download.html'),
        login: resolve(__dirname, 'login.html'),
        signup: resolve(__dirname, 'signup.html'),
        forgot: resolve(__dirname, 'forgot-password.html')
      }
    }
  }
});
