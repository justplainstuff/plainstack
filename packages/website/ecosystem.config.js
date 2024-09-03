module.exports = {
  apps: [
    {
      name: "web",
      script: "app/cli/serve.ts",
      exec_mode: "cluster",
      instances: 1,
      interpreter: "node",
      interpreter_args: "--import tsx",
      watch: false,
    },
    {
      name: "worker",
      script: "app/cli/work.ts",
      exec_mode: "cluster",
      instances: 1,
      interpreter: "node",
      interpreter_args: "--import tsx",
      watch: false,
    },
  ],

  deploy: {
    production: {
      user: "root",
      host: "135.181.33.132",
      ref: "origin/feat/plainstack",
      repo: "git@github.com:joseferben/plainweb.git",
      path: "/var/www/plainweb",
      "pre-deploy-local": "",
      "post-deploy": "pm2 reload ecosystem.config.js --env production",
      "pre-setup": "",
    },
  },
};
