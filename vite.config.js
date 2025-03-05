import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "react-router-dom": "/node_modules/react-router-dom",
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      preserveEntrySignatures: "strict",
      input: {
        AIsearch: "src/AISearch.jsx",
        App: "src/App.jsx",
        main: "src/main.jsx",
        QuestionList: "src/QuestionList.jsx",
        SearchAI: "src/SearchAI.jsx",
        SearchContext: "src/SearchContext.jsx",
        SearchResult: "src/SearchResult.jsx",
      },
      output: {
        format: "es",
        entryFileNames: "[name].js",
      },
    },
  },
});
