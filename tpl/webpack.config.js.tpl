// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');<% if (htmlWebpackPlugin) { %>
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');<% } %><% if (extractPlugin) { %>
const MiniCssExtractPlugin = require('mini-css-extract-plugin');<% } %><% if (webpackBundleAnalyzer) { %>
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");<% } %><% if (workboxWebpackPlugin) { %>
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');<% } %><% if (technology == "vue") { %>
const VueLoaderPlugin = require('vue-loader/lib/plugin');<% } %>

const isProduction = process.env.NODE_ENV == 'production';

module.exports = (env, options) => {<%  if (isCSS) { %>
    const stylesHandler = isProduction ? MiniCssExtractPlugin.loader : 'style-loader';<% } %>
    return {
        entry: '<%= entry %>',
        mode: isProduction ? "production" : "development",
        output: {
            path: path.resolve(__dirname, 'dist'),
            clean: true,
            filename: isProduction
                ? "static/js/[name].[contenthash:8].js"
                : "static/js/[name].js",
            chunkFilename: isProduction
                ? "static/js/[name].[contenthash:8].js"
                : "static/js/[name].js",
        },<% if (devServer) { %>
        devServer: {
            open: true,
            compress: true,
            host: 'localhost',
        },<% } %>
        plugins: [ <% if (technology == "vue") {%>
            new VueLoaderPlugin(),<% } %>
            <% if (htmlWebpackPlugin) { %>
            isProduction && new CopyWebpackPlugin({
                patterns: [
                    {
                    from: "./public",
                    noErrorOnMissing: true,
                    filter: (filename) =>
                        filename !== path.resolve(__dirname, "public/index.html"),
                    },
                ],
            }),
            new HtmlWebpackPlugin({
                template: 'public/index.html',
            }),<% } %><% if (webpackBundleAnalyzer) { %>
            options.analyze && new BundleAnalyzerPlugin(),
            <% } %><% if (extractPlugin) { %>
            isProduction && new MiniCssExtractPlugin(),
            <% } %><% if (workboxWebpackPlugin) { %>
            isProduction && new WorkboxWebpackPlugin.GenerateSW(),
            <% } %>
            // Add your plugins here
            // Learn more about plugins from https://webpack.js.org/configuration/plugins/
        ].filter(Boolean),
        module: {
            rules: [<% if (langType == "ES6") { %>
                {
                    test: /\.(js|jsx)$/i,
                    loader: 'babel-loader',
                    exclude: ['/node_modules/'],
                },<% } %><% if (technology == "vue") { %>
                {
                    test: /\.vue$/i,
                    loader: 'vue-loader',
                },<% } %><% if (technology == "svelte") { %>
                {
                    test: /\.svelte$/,
                    loader: 'svelte-loader',
                    options: {
                        preprocess:  require('svelte-preprocess')({})
                    }
                },<% } %><% if (langType == "Typescript") { %>
                {
                    test: /\.(ts|tsx)$/i,
                    loader: 'ts-loader',
                    exclude: ['/node_modules/'],
                },<% } %><%  if (isCSS && !isPostCSS) { %>
                {
                    test: /\.css$/i,
                    use: [stylesHandler,'css-loader'],
                },<% } %><%  if (cssType == 'sass') { %>
                {
                    test: /\.s[ac]ss$/i,
                    use: [stylesHandler, 'css-loader', <% if (isPostCSS) { %>'postcss-loader', <% } %>'sass-loader'],
                },<% } %><%  if (cssType == 'less') { %>
                {
                    test: /\.less$/i,
                    use: [<% if (isPostCSS) { %>stylesHandler, 'css-loader', 'postcss-loader', <% } %>'less-loader'],
                },<% } %><%  if (cssType == 'stylus') { %>
                {
                    test: /\.styl$/i,
                    use: [<% if (isPostCSS) { %>stylesHandler, 'css-loader', 'postcss-loader', <% } %>'stylus-loader'],
                },<% } %><%  if (isPostCSS && isCSS && !isCSSModules) { %>
                {
                    test: /\.css$/i,
                    use: [stylesHandler, 'css-loader', 'postcss-loader'],
                },
                <% } %><%  if (isPostCSS && isCSS && isCSSModules) { %>
                {
                    test: /\.css$/i,
                    use: [stylesHandler, 'css-loader', 'postcss-loader'],
                    exclude: /\.module\.css$/,
                },
                {
                    test: /\.module\.css$/,
                    use: [stylesHandler, {
                            loader:'css-loader',
                            options:{ importLoaders: 1,modules: { mode: "local"}},
                        }, 'postcss-loader'],
                },
                <% } %>{
                    test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                    type: 'asset',
                },

                // Add your rules for custom modules here
                // Learn more about loaders from https://webpack.js.org/loaders/
            ],
        },<% if (technology == "vue") {%>
        resolve: {
            extensions: ['.js', '.vue',<% if (langType == "Typescript") {%>'.ts',<% } %>]
        },<% } %><% if (technology == "react") {%>
        resolve: {
            extensions: ['.js', '.jsx',<% if (langType == "Typescript") {%>'.ts', '.tsx'<% } %>]
        },<% } %><% if (technology == "svelte") {%>
        resolve: {
            extensions: ['.js', '.mjs','.svelte',<% if (langType == "Typescript") {%>'.ts'<% } %>]
        },<% } %>
    };
};