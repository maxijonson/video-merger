module.exports = {
    apps: [
        {
            name: "video-merger",
            script: "./dist/esm/index.js",
            node_args: "--experimental-specifier-resolution=node",
            // instances: "max", TODO: When application is stateless
            env: {
                NODE_ENV: "development",
            },
            env_production: {
                NODE_ENV: "production",
            },
        },
    ],
};
