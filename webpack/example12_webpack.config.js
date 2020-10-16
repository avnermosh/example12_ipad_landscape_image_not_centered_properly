
var path = require('path');

module.exports = {
    mode: 'development',
    // context: path.resolve('js/mlj/'),
    context: path.resolve('js/examples/example12/'),
    // entry: ['./main.js'],
    entry: ['./example12_main.js'],
    output: {
        // the output file bundle.js is placed in the path "build/mlj/"
        // path: path.resolve('build/mlj'),
        path: path.resolve('build/example12'),
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
                test: /\.js$/,
                loader: 'babel-loader',
                options: {
                    presets: ["@babel/preset-env"]
                }                
            }
        ]    
    }
};
