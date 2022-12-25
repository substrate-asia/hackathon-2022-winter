const { options } = require('less')

module.exports = {
    lintOnSave: false,
    configureWebpack: {
        // module: {
        //     rules: [{
        //         test: /\.js$/,
        //         loader: require.resolve('@open-wc/webpack-import-meta-loader'),
        //     }, {
        //         test: /\.js$/,
        //         loader: require.resolve('babel-loader'),
        //     }, ],

        // },
        plugins: [
            require('unplugin-element-plus/webpack')({
                // options
            }),
        ],
    },
    // configureWebpack: (config) => {
    //     config.module.rules.push({
    //         test: /\.js$/,
    //         use: [{
    //             loader: require.resolve('@open-wc/webpack-import-meta-loader'),
    //         }]
    //     });
    //     config.module.rules.push({
    //         test: /\.js$/,
    //         use: [{
    //             loader: require.resolve('babel-loader'),
    //         }]
    //     });
    // },
    css: {
        loaderOptions: {
            less: {
                modifyVars: {
                    'arcoblue-6': '#4318FF',
                },
                javascriptEnabled: true,
            },
        }
    },
    // chainWebpack: config => {
    //     const imagesRule = config.module.rule('less')
    //     imagesRule
    //         .use('less-loader')
    //         .tap(options => {
    //             options.lessOptions = {
    //                 modifyVars: {
    //                     'arcoblue-6': 'red',
    //                 },
    //                 javascriptEnabled: true,
    //             }
    //             return options;
    //         })

    // }

}