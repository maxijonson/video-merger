const DB_ADAPTER = process.env.DB_ADAPTER || "fs";
const CLUSTER_MODE = process.env.CLUSTER_MODE || "true";

// Even if CLUSTER_MODE is "true", we can't use it with DB_ADAPTER "fs"
const enableClusterMode = CLUSTER_MODE === "true" && DB_ADAPTER !== "fs";

module.exports = {
    apps: [
        {
            name: "video-merger",
            script: "./dist/esm/index.js",
            node_args: "--experimental-specifier-resolution=node",
            exec_mode: enableClusterMode ? "cluster" : "fork",
            instances: enableClusterMode ? "max" : 1,
            env: {
                NODE_ENV: "development",
            },
            env_production: {
                NODE_ENV: "production",
            },
        },
    ],
};
