const {createProxyMiddleware } = require('http-proxy-middleware')
 
module.exports = function(app) {
 app.use(createProxyMiddleware('/api', { 
     target: 'http://18.191.17.148:9001',
     pathRewrite: {
       '^/api': '',
     },
     changeOrigin: true,
     secure: false
   }));
}