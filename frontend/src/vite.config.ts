import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // '/api': 'http://localhost:8000',
      // '/auth': 'http://localhost:8000',
      '/api': 'https://backend-multi-agent-chatbot.nbjfit.easypanel.host',
      '/auth': 'https://backend-multi-agent-chatbot.nbjfit.easypanel.host',
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
}));
