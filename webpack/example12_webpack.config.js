
var path = require('path');

module.exports = {
    mode: 'development',
    context: path.resolve('js/examples/example12/'),
    entry: ['./example12_main.v2.js'],
    output: {
        // the path for the output file bundle.js
        path: path.resolve('js/examples/example12/build'),
        publicPath: 'build',
        filename: 'bundle.js'
    },
    devServer: {
        contentBase: 'public'
    },
    watch: true,
    // externals: {
        // // prevent webpack from including the external file three.module.js in bundle.js
        // threeModuleJs: 'https://cdn.jsdelivr.net/npm/three@0.120/build/three.module.js'
    // },
    module: {
        rules: [
            {
                test: /examples\/example12\/example12_main\.v2\.js$/,
                loader: 'babel-loader',
                options: {
                    presets: ["@babel/preset-env"]
                }                
            }
        ]    
    }
};

