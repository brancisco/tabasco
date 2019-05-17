module.exports = {
  apps: [{
    name: "tabasco",
    script: "./bin/www",
    watch: true,
    error_file: "./.log/tabasco_error.log",
    out_file: "./.log/tabasco_out.log",
    pid_file: "./.log/tabasco_pid.log",
    env: {
      "PORT": 3000,
      "NODE_ENV": "development"
    },
    env_staging: {
      "PORT": 3000,
      "NODE_ENV": "staging"
    },
    env_production: {
      "PORT": 80,
      "NODE_ENV": "production"
    }
  }]
}
