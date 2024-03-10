const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CopyPlugin = require("copy-webpack-plugin")

const commonConfig = require("./webpack.config.common")



module.exports = {
    ...commonConfig,
    mode: "production",
    entry: {
        ...commonConfig.entry,
        ghNotfound: './ghpage-src/gh404.ts',
    },
    output: {
        ...commonConfig.output,
        path: path.resolve(__dirname, 'gh-dist'),
    },
    plugins: [
        ...commonConfig.plugins,
        new HtmlWebpackPlugin({
            filename: "404.html",
            meta: {
                "Content-Security-Policy": {
                    "http-equiv": "Content-Security-Policy",
                    "content": "default-src 'self'"
                },
            },
            chunks: ["ghNotfound"],
        }),
    ]
}