const commonConfig = require("./webpack.config.common")

module.exports = {
    ...commonConfig,
    mode: "development",
    devtool: "source-map",
    devServer: {
        server: "https",
        port: 8060,
        historyApiFallback: true,
        // devMiddleware: {
        //     writeToDisk: true
        // }
    },
}
