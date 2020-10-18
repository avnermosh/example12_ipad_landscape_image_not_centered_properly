
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
    module: {
        rules: [
            {
                test: /examples\/example12\/example12_main\.v2\.js$/,
                loader: 'babel-loader',
                exclude: /\.three\.module\.js$/,
                options: {
                    presets: ["@babel/preset-env"]
                }                
            }
        ]    
    }
};

