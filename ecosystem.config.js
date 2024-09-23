module.exports = {
  apps: [
    {
      name: "backend-api1",
      script: "node_modules/env-cmd/bin/env-cmd.js",
      args: "-f .env.local node build/index.js",
      watch: true,
      instances: 1,
      watch: ["src"],
      ignore_watch: ["node_modules", "build"],
    },
    {
      name: "meilisearch",
      script: "meilisearch",
      args: "--master-key=mcdvlEauFkYz4rAQk9Cttf2dTfHdnBe8", // Sử dụng biến môi trường ở đây
      instances: 1,
      exec_mode: "fork",
    },
  ],
};
