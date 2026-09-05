const path = require("path");

module.exports = {
  apps: [
    {
      name: "linkapp-backend",
      cwd: path.join(__dirname, "backend"),
      script: "dist/server.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
      },
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      out_file: path.join(__dirname, "logs", "backend-out.log"),
      error_file: path.join(__dirname, "logs", "backend-error.log"),
      time: true,
    },
    {
      name: "linkapp-frontend",
      cwd: path.join(__dirname, "frontend"),
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
      },
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      out_file: path.join(__dirname, "logs", "frontend-out.log"),
      error_file: path.join(__dirname, "logs", "frontend-error.log"),
      time: true,
    },
  ],
};
