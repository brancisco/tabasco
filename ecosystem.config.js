module.exports = {
  apps: [{
    name: "tabasco",
    script: "./bin/www",
    watch: true,
    append_env_to_name: true,
    env: {
      "PORT": 3000,
      "NODE_ENV": "development"
    },
    env_staging: {
      "PORT": 8000,
      "NODE_ENV": "staging"
    },
    env_production: {
      "PORT": 8080,
      "NODE_ENV": "production"
    }
  }]
}
