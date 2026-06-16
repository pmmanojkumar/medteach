import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    open: true, // Automatically open browser when server starts
    host: true  // Expose to local network
  }
});
