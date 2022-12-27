const {createProxyMiddleware } = require('http-proxy-middleware')
 
module.exports = function(app) {
 app.use(createProxyMiddleware('/api', { 
     target: 'http://api.web3box.cc:9001',
     pathRewrite: {
       '^/api': '',
     },
     changeOrigin: true,
     secure: false
   }));
}