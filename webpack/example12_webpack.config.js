
var path = require('path');

module.exports = {
    mode: 'development',
    // context: path.resolve('js/mlj/'),
    context: path.resolve('js/examples/example12/'),
    // entry: ['./main.js'],
    entry: ['./example12_main.v2.js'],
    output: {
        // the output file bundle.js is placed in the path "build/mlj/"
        // path: path.resolve('build/mlj'),
        path: path.resolve('js/examples/example12/build'),
        publicPath: 'build',
        filename: 'bundle.js'
    },
    devServer: {
        contentBase: 'public'
    },
    watch: true,
    externals: {
        threeModuleJs: 'https://cdn.jsdelivr.net/npm/three@0.120/build/three.module.js'
    },
    module: {
        rules: [
            {
                test: /examples\/example12\/example12_main\.v2\.js$/,
                loader: 'babel-loader',
                // exclude: /\.three\.module\.js$/,
                // exclude: "https://cdn.jsdelivr.net/npm/three@0.120/build/three.module.js",
                options: {
                    presets: ["@babel/preset-env"]
                }                
            }
        ]    
    }
};

