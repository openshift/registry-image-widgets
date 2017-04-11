var webpack = require("webpack");
var extract = require("extract-text-webpack-plugin");
var path = require("path");

/* For node 0.10.x we need this defined */
if (typeof(global.Promise) == "undefined")
    global.Promise = require('promise');

/* These can be overridden, typically from the Makefile.am */
var srcdir = __dirname + path.sep;
var distdir = __dirname + path.sep + "dist" + path.sep;

module.exports = {
    entry: {
        "image-widgets": [
            srcdir + "images.js",
            srcdir + "client.js",
            srcdir + "date.js",
            srcdir + "layers.js",
            srcdir + "images.less",
            srcdir + "layers.less",
            srcdir + "views/image-body.html",
            srcdir + "views/image-config.html",
            srcdir + "views/image-meta.html",
            srcdir + "views/image-layers.html",
            srcdir + "views/image-pull.html",
            srcdir + "views/imagestream-body.html",
            srcdir + "views/imagestream-listing.html",
            srcdir + "views/imagestream-meta.html",
            srcdir + "views/imagestream-push.html",
        ]
    },
    externals: {
        "angular": "angular",
    },

    output: {
        path: distdir,
        filename: "[name].js",
        sourceMapFilename: "[file].map",
    },
    resolve: {
        modules: [
            "node_modules",
            srcdir + path.sep + "bower_components"
        ]
    },
    plugins: [
        new extract("[name].css")
    ],
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.js$/, // include .js files
                exclude: /node_modules\//, // exclude external dependencies
                use: [{
                    loader: "jshint-loader",
                    options: {
                        emitErrors: false,
                        failOnHint: true,
                        sub: true,
                        multistr: true,
                        undef: true,
                        predef: [ "window", "document", "console", "angular" ],
                        reporter: function (errors) {
                            var loader = this;
                            errors.forEach(function(err) {
                                if (err.line)
                                    console.log(loader.resource + ":" + err.line + ":" + err.character + ": " + err.reason);
                                else
                                    console.log(loader.resource + ":" + String(err));
                            });
                        }
                    }
                }]
            },
            {
                test: /\.css$/,
                loader: extract.extract({ fallback: 'style-loader', use: 'css-loader' })
            },
            {
                test: /\.less$/,
                use: extract.extract({
                    use: [{
                        loader: 'css-loader?sourceMap'
                    }, {
                        loader: 'less-loader?sourceMap'
                    }]
                })
            },
            {
                test: /\.html$/,
                loader: "ng-cache-loader?prefix=registry-image-widgets/[dir]"
            }
        ]
    },
};
