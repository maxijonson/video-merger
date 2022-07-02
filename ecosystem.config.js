module.exports = {
  apps : [{
    name: "video-merger",
    script: "./dist/cjs/index.js",
    // instances: "max", TODO: When application is stateless
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
}
