const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CopyPlugin = require("copy-webpack-plugin")

const commonConfig = require("./webpack.config.common")



const pluginsToUse = commonConfig.plugins.filter((plugin)=> !(plugin instanceof HtmlWebpackPlugin))

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
        publicPath: "/baker-calculator/"
    },
    plugins: [
        ...pluginsToUse,
        new HtmlWebpackPlugin({
            title: "Baker's Calculator",
            filename: "index.html",
            favicon: "src/favicon.svg",
            template: "./ghpage-src/ghpage-index.ejs",
            meta: {
                "Content-Security-Policy": {
                    "http-equiv": "Content-Security-Policy",
                    "content": "default-src 'self' ; img-src 'self' blob: ; style-src 'self' 'unsafe-inline'"
                },
            },
            chunks: ["main"],
        }),
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
        new CopyPlugin({
            patterns: [
                {from: "ghpage-src/ghpage-manifest.json"}
            ]
        })
    ]
}