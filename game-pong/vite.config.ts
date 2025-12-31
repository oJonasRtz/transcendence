import { defineConfig } from "vite";

// export default defineConfig({
//   base: "/pong/",
// });

export default defineConfig({
  server: {
    host: true,
    port: 5173,
  }
});