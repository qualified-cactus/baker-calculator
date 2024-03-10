const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")


module.exports = {
    entry: {
        main: './src/index.tsx',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[fullhash].bundle.js',
        publicPath: "/",
        clean: true,
        assetModuleFilename: "assets/[name][hash][ext]",
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            },
            {
                test: [/\.css$/i, /\.s[ac]ss$/i],
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    "sass-loader",
                ]
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
            }
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].[fullhash].css"
        }),
        new HtmlWebpackPlugin({
            title: "Baker's Calculator",
            favicon: "src/favicon.svg",
            filename: "index.html",
            meta: {
                "Content-Security-Policy": {
                    "http-equiv": "Content-Security-Policy",
                    "content": "default-src 'self' ; img-src 'self' blob: ; style-src 'self' 'unsafe-inline'"
                },
            },
            chunks: ["main"],
        }),
    ]
}

