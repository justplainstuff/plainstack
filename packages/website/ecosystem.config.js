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
      "pre-setup": `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - \&& 
                    sudo apt install -y nodejs \&&
                    npm install -g pnpm@9.5.0`,
      "post-deploy": "pm2 reload ecosystem.config.js --env production",
    },
  },
};
