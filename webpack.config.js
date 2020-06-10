const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const autoprefixer = require("autoprefixer");
const webpack = require('webpack');

module.exports = (env, argv) => ({
    entry: {
        'componentes-sat.angular': './src/main/resources/META-INF/componentes-sat/lib/componentes-sat-angular.js'
    },
    output: {
        path: path.resolve(__dirname, 'src/main/resources/META-INF/componentes-sat/lib/dist'),
        filename: '[name].bundle.js'
    },
    devtool: argv.mode === 'production' ? 'source-map': 'cheap-module-eval-source-map',
    module: {
        rules: [{
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: ['angularjs-annotate']
                    }
                }
            },
            {
                test: /\.s?css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            hmr: argv.mode === "development",
                            reloadAll: true
                        }
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                            url: false
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: [
                                autoprefixer({
                                    browsers: ['ie >= 11', 'Firefox >= 26', 'Chrome >= 31']
                                })
                            ]
                        }
                    },{
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true,
                        }
                    }
                ]
            },
            {
                test: /\.html$/,
                use: {
                    loader: 'html-loader',
                    options: {
                        minimize: argv.mode === 'production' ? true: false,
                        removeComments: argv.mode === 'production' ? true: false,
                        collapseWhitespace: argv.mode === 'production' ? true: false
                    }
                }
            }
        ]
    },
    resolve: {
        alias: {
            angular: 'angular'
        },
        extensions: [".js"]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].bundle.css"
        }),
        new webpack.LoaderOptionsPlugin({
            debug: argv.mode === "production" ? false: true
        })
    ]
});