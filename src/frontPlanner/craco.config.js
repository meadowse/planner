const path = require('path');

module.exports = {
    webpack: {
        alias: {
            '@components': path.resolve(__dirname, './src/components'),
            '@generic': path.resolve(__dirname, './src/components/generic'),
            '@helpers': path.resolve(__dirname, './src/helpers'),
            '@config': path.resolve(__dirname, './src/config'),
            '@contexts': path.resolve(__dirname, './src/contexts'),
            '@services': path.resolve(__dirname, './src/services'),
            '@hooks': path.resolve(__dirname, './src/hooks'),
            '@data': path.resolve(__dirname, './src/data')
        }
    }
};
